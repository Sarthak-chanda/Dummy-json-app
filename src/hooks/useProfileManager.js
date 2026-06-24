import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../Login/supabaseClient';

/**
 * Bulletproof hook for managing Supabase Profile and Addresses.
 * Handles fetching, upserting, and state management.
 */
export const useProfileManager = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  /**
   * Fetch profile and addresses in a single relational query.
   */
  const fetchProfileData = useCallback(async () => {
    try {
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setProfile(null);
        setAddresses([]);
        return;
      }

      // Query profile and addresses separately to avoid PostgREST relationship errors
      const { data: profileData, error: profileError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', user.id);
        
      if (addressError) {
        console.warn("Addresses fetch warning:", addressError.message);
      }

      const uiAddrs = [];
      if (addressData && addressData.length > 0) {
        const dbAddr = addressData[0];
        
        const parseLine = (lineStr, idVal) => {
          if (!lineStr) return null;
          try {
            const obj = JSON.parse(lineStr);
            return {
              id: idVal,
              address_line_1: obj.address_line_1 || '',
              address_line_2: obj.address_line_2 || '',
              city: obj.city || '',
              postal_code: obj.postal_code || '',
              address_type: obj.address_type || 'Home',
              availability: obj.availability || 'All Day',
              is_default: obj.is_default || false
            };
          } catch (e) {
            // Fallback for legacy plain text rows
            return {
              id: idVal,
              address_line_1: lineStr,
              address_line_2: '',
              city: '',
              postal_code: '',
              address_type: 'Home',
              availability: 'All Day',
              is_default: false
            };
          }
        };

        const addr1 = parseLine(dbAddr.address_line_1, 'line1');
        const addr2 = parseLine(dbAddr.address_line_2, 'line2');
        const addr3 = parseLine(dbAddr.address_line_3, 'line3');

        if (addr1) uiAddrs.push(addr1);
        if (addr2) uiAddrs.push(addr2);
        if (addr3) uiAddrs.push(addr3);

        const defaultLineNum = dbAddr.default_add || 1;
        const defaultLineId = `line${defaultLineNum}`;
        uiAddrs.forEach(addr => {
          addr.is_default = addr.id === defaultLineId;
        });
      }

      if (profileData) {
        const savedLocation = localStorage.getItem(`userid_${user.id}_location`) || '';
        setProfile({ ...profileData, location: savedLocation });
        setAddresses(uiAddrs);
      } else {
        // Fallback if trigger hasn't finished: profile is null
        setProfile(null);
        setAddresses(uiAddrs);
      }
      hasLoadedOnce.current = true;
    } catch (err) {
      console.error("[useProfileManager] Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update Profile Information (Name, Phone, Location)
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const { location, ...dbUpdates } = updates;
      if (location !== undefined) {
        localStorage.setItem(`userid_${user.id}_location`, location);
      }

      const { data, error: upsertError } = await supabase
        .from('Profiles')
        .upsert({
          id: user.id,
          ...dbUpdates,
          email: user.email,
        })
        .select()
        .single();

      if (upsertError) throw upsertError;
      
      const savedLocation = localStorage.getItem(`userid_${user.id}_location`) || '';
      const updatedProfile = { ...data, location: savedLocation };
      setProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (err) {
      console.error("[useProfileManager] Profile Update Error:", err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync/Upsert Addresses (Single or Multiple)
   */
  const upsertAddresses = async (addressList) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: currentRows } = await supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', user.id);
        
      const currentDb = currentRows && currentRows.length > 0 ? currentRows[0] : null;

      const payload = {
        profile_id: user.id,
      };

      if (currentDb) {
        payload.id = currentDb.id;
        payload.address_line_1 = currentDb.address_line_1;
        payload.address_line_2 = currentDb.address_line_2;
        payload.address_line_3 = currentDb.address_line_3;
        payload.default_add = currentDb.default_add || 1;
      } else {
        payload.default_add = 1;
      }

      const toObj = (str) => {
        if (!str) return null;
        try { return JSON.parse(str); } catch { return { address_line_1: str }; }
      };

      let obj1 = toObj(payload.address_line_1);
      let obj2 = toObj(payload.address_line_2);
      let obj3 = toObj(payload.address_line_3);

      const list = Array.isArray(addressList) ? addressList : [addressList];
      
      list.forEach(addr => {
        if (addr.is_default) {
          if (addr.id === 'line1') payload.default_add = 1;
          if (addr.id === 'line2') payload.default_add = 2;
          if (addr.id === 'line3') payload.default_add = 3;
        }

        const newObj = {
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2 || '',
          city: addr.city || '',
          postal_code: addr.postal_code || '',
          address_type: addr.address_type || 'Home',
          availability: addr.availability || 'All Day',
        };

        if (addr.id === 'new' || !addr.id) {
          if (!obj1) {
            obj1 = newObj;
            payload.default_add = 1;
          } else if (!obj2) {
            obj2 = newObj;
          } else if (!obj3) {
            obj3 = newObj;
          }
        } else {
          if (addr.id === 'line1') obj1 = { ...obj1, ...newObj };
          if (addr.id === 'line2') obj2 = { ...obj2, ...newObj };
          if (addr.id === 'line3') obj3 = { ...obj3, ...newObj };
        }
      });

      if (obj1) obj1.is_default = (payload.default_add === 1);
      if (obj2) obj2.is_default = (payload.default_add === 2);
      if (obj3) obj3.is_default = (payload.default_add === 3);

      payload.address_line_1 = obj1 ? JSON.stringify(obj1) : null;
      payload.address_line_2 = obj2 ? JSON.stringify(obj2) : null;
      payload.address_line_3 = obj3 ? JSON.stringify(obj3) : null;

      const { data, error: addrError } = await supabase
        .from('addresses')
        .upsert(payload)
        .select();

      if (addrError) throw addrError;

      await fetchProfileData();
      return { success: true, data };
    } catch (err) {
      console.error("[useProfileManager] Address Sync Error:", err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete an Address
   */
  const deleteAddress = async (id) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: currentRows } = await supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', user.id);

      const currentDb = currentRows && currentRows.length > 0 ? currentRows[0] : null;

      if (currentDb) {
        const payload = {
          id: currentDb.id,
          profile_id: user.id,
          address_line_1: currentDb.address_line_1,
          address_line_2: currentDb.address_line_2,
          address_line_3: currentDb.address_line_3,
          default_add: currentDb.default_add || 1,
        };

        const toObj = (str) => {
          if (!str) return null;
          try { return JSON.parse(str); } catch { return { address_line_1: str }; }
        };

        let obj1 = toObj(payload.address_line_1);
        let obj2 = toObj(payload.address_line_2);
        let obj3 = toObj(payload.address_line_3);

        let wasDefault = false;
        if (id === 'line1') {
          wasDefault = (payload.default_add === 1);
          obj1 = null;
        }
        if (id === 'line2') {
          wasDefault = (payload.default_add === 2);
          obj2 = null;
        }
        if (id === 'line3') {
          wasDefault = (payload.default_add === 3);
          obj3 = null;
        }

        if (wasDefault) {
          if (obj1) payload.default_add = 1;
          else if (obj2) payload.default_add = 2;
          else if (obj3) payload.default_add = 3;
          else payload.default_add = null;
        }

        if (obj1) obj1.is_default = (payload.default_add === 1);
        if (obj2) obj2.is_default = (payload.default_add === 2);
        if (obj3) obj3.is_default = (payload.default_add === 3);

        payload.address_line_1 = obj1 ? JSON.stringify(obj1) : null;
        payload.address_line_2 = obj2 ? JSON.stringify(obj2) : null;
        payload.address_line_3 = obj3 ? JSON.stringify(obj3) : null;

        const { error } = await supabase
          .from('addresses')
          .upsert(payload);

        if (error) throw error;
      }

      await fetchProfileData();
      return { success: true };
    } catch (err) {
      console.error("[useProfileManager] Delete Address Error:", err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    
    // 1. Listen for Auth Changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') fetchProfileData();
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setAddresses([]);
      }
    });

    // 2. Realtime Database Subscription
    // This creates a "Channel" to listen for any changes in the DB
    const profileChannel = supabase
      .channel('profile_realtime_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public', 
          table: 'Profiles' 
        },
        (payload) => {
          console.log('Realtime Profile Update:', payload);
          // Update local state with the new data from DB
          if (payload.eventType === 'DELETE') {
            setProfile(null);
          } else {
            setProfile(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'addresses' 
        },
        (payload) => {
          console.log('Realtime Address Update:', payload);
          fetchProfileData();
        }
      )
      .subscribe();

    return () => {
      authSub.unsubscribe();
      supabase.removeChannel(profileChannel);
    };
  }, [fetchProfileData]);

  return {
    profile,
    addresses,
    loading,
    error,
    refresh: fetchProfileData,
    updateProfile,
    upsertAddresses,
    deleteAddress
  };
};
