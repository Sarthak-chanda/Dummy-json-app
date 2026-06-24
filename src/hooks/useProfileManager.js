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
        if (dbAddr.address_line_1) {
          uiAddrs.push({
            id: 'line1',
            address_line_1: dbAddr.address_line_1,
            city: dbAddr.city || '',
            postal_code: dbAddr.postal_code || '',
            address_type: dbAddr.address_type || 'Home',
            availability: dbAddr.availability || 'All Day',
            is_default: false
          });
        }
        if (dbAddr.address_line_2) {
          uiAddrs.push({
            id: 'line2',
            address_line_1: dbAddr.address_line_2,
            city: dbAddr.city || '',
            postal_code: dbAddr.postal_code || '',
            address_type: dbAddr.address_type || 'Home',
            availability: dbAddr.availability || 'All Day',
            is_default: false
          });
        }
        if (dbAddr.address_line_3) {
          uiAddrs.push({
            id: 'line3',
            address_line_1: dbAddr.address_line_3,
            city: dbAddr.city || '',
            postal_code: dbAddr.postal_code || '',
            address_type: dbAddr.address_type || 'Home',
            availability: dbAddr.availability || 'All Day',
            is_default: false
          });
        }

        const defaultLine = localStorage.getItem(`userid_${user.id}_default_line`) || 'line1';
        uiAddrs.forEach(addr => {
          addr.is_default = addr.id === defaultLine;
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
        city: currentDb?.city || '',
        postal_code: currentDb?.postal_code || '',
        address_type: currentDb?.address_type || 'Home',
        availability: currentDb?.availability || 'All Day',
      };

      if (currentDb) {
        payload.id = currentDb.id;
        payload.address_line_1 = currentDb.address_line_1;
        payload.address_line_2 = currentDb.address_line_2;
        payload.address_line_3 = currentDb.address_line_3;
      }

      const list = Array.isArray(addressList) ? addressList : [addressList];
      
      list.forEach(addr => {
        if (addr.is_default) {
          localStorage.setItem(`userid_${user.id}_default_line`, addr.id);
        }

        if (addr.id === 'new') {
          if (!payload.address_line_1) {
            payload.address_line_1 = addr.address_line_1;
          } else if (!payload.address_line_2) {
            payload.address_line_2 = addr.address_line_1;
          } else if (!payload.address_line_3) {
            payload.address_line_3 = addr.address_line_1;
          }
        } else {
          if (addr.id === 'line1') payload.address_line_1 = addr.address_line_1;
          if (addr.id === 'line2') payload.address_line_2 = addr.address_line_1;
          if (addr.id === 'line3') payload.address_line_3 = addr.address_line_1;
        }

        // Update shared fields
        payload.city = addr.city;
        payload.postal_code = addr.postal_code;
        payload.address_type = addr.address_type;
        payload.availability = addr.availability;
      });

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
          city: currentDb.city,
          postal_code: currentDb.postal_code,
          address_type: currentDb.address_type,
          availability: currentDb.availability,
        };

        if (id === 'line1') payload.address_line_1 = null;
        if (id === 'line2') payload.address_line_2 = null;
        if (id === 'line3') payload.address_line_3 = null;

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
