import { useState, useEffect, useCallback } from 'react';
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

  /**
   * Fetch profile and addresses in a single relational query.
   */
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setProfile(null);
        setAddresses([]);
        return;
      }

      // Single query using foreign key relationship (Profiles -> addresses)
      const { data, error: fetchError } = await supabase
        .from('Profiles')
        .select(`
          *,
          addresses (*)
        `)
        .eq('id', user.id)
        .maybeSingle(); // Better than .single() as it won't throw error if missing

      if (fetchError) throw fetchError;

      if (data) {
        const { addresses: addr, ...prof } = data;
        setProfile(prof);
        setAddresses(addr || []);
      } else {
        // Fallback if trigger hasn't finished: profile is null
        setProfile(null);
        setAddresses([]);
      }
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
      
      const { data, error: upsertError } = await supabase
        .from('Profiles')
        .upsert({
          id: user.id,
          ...updates,
          email: user.email,
        })
        .select()
        .single();

      if (upsertError) throw upsertError;
      setProfile(data);
      return { success: true, data };
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

      const formattedAddresses = (Array.isArray(addressList) ? addressList : [addressList]).map(addr => ({
        ...addr,
        profile_id: user.id
      }));

      const { data, error: addrError } = await supabase
        .from('addresses')
        .upsert(formattedAddresses, { onConflict: 'id' })
        .select();

      if (addrError) throw addrError;
      
      // Update local state by merging or replacing
      setAddresses(prev => {
        const newAddrs = [...prev];
        data.forEach(updated => {
            const idx = newAddrs.findIndex(a => a.id === updated.id);
            if (idx > -1) newAddrs[idx] = updated;
            else newAddrs.push(updated);
        });
        return newAddrs;
      });
      
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
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAddresses(prev => prev.filter(a => a.id !== id));
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
          if (payload.eventType === 'INSERT') {
            setAddresses(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setAddresses(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
          } else if (payload.eventType === 'DELETE') {
            setAddresses(prev => prev.filter(a => a.id === payload.old.id));
          }
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
