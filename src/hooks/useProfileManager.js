import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../Login/supabaseClient';

/**
 * Helper to run any promise with a timeout.
 * Prevents Supabase requests from hanging indefinitely.
 */
const runWithTimeout = async (promise, timeoutMs = 30000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Supabase request timed out")), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

const getDisplayAvatarUrl = (url) => {
  return url || '';
};

/**
 * Parses raw addresses database row into structured UI array.
 */
const parseAddressRow = (dbAddr) => {
  if (!dbAddr) return [];
  
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
    } catch {
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

  const uiAddrs = [];
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

  return uiAddrs;
};

/**
 * Bulletproof hook for managing Supabase Profile and Addresses.
 * Handles fetching, upserting, and state management.
 * Initializes from and synchronizes with App's userdet state.
 */
export const useProfileManager = (userdet, setUserdet) => {
  const userId = userdet?.id;

  const [profile, setProfile] = useState(() => {
    if (userdet && userdet.id) {
      return {
        id: userdet.id,
        name: userdet.username || '',
        email: userdet.email || '',
        phone: userdet.phone || '',
        location: userdet.location || '',
        Location: userdet.location || '',
        avatar_url: userdet.image || '',
      };
    }
    return null;
  });

  const [addresses, setAddresses] = useState(() => {
    return userdet?.addresses || [];
  });

  const [loading, setLoading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [error, setError] = useState(null);

  // Sync state whenever the userId changes (e.g. login / logout / reload)
  useEffect(() => {
    if (userdet && userdet.id) {
      setProfile({
        id: userdet.id,
        name: userdet.username || '',
        email: userdet.email || '',
        phone: userdet.phone || '',
        location: userdet.location || '',
        Location: userdet.location || '',
        avatar_url: userdet.image || '',
      });
      setAddresses(userdet.addresses || []);
      setLoading(false);
    } else {
      setProfile(null);
      setAddresses([]);
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch profile and addresses with timeout.
   */
  const fetchProfileData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      if (!userId) {
        setProfile(null);
        setAddresses([]);
        return;
      }

      console.log("[useProfileManager] Background fetching profile row for id:", userId);
      const { data: profileData, error: profileError } = await runWithTimeout(
        supabase
          .from('Profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        90000
      );

      if (profileError) throw profileError;

      console.log("[useProfileManager] Background fetching addresses for profile_id:", userId);
      const { data: addressData, error: addressError } = await runWithTimeout(
        supabase
          .from('addresses')
          .select('*')
          .eq('profile_id', userId),
        90000
      );

      if (addressError) {
        console.warn("Addresses fetch warning:", addressError.message);
      }

      const uiAddrs = parseAddressRow(addressData && addressData.length > 0 ? addressData[0] : null);

      if (profileData) {
        const displayAvatarUrl = getDisplayAvatarUrl(profileData.avatar_url);
        const mergedProfile = { ...profileData, location: profileData.Location || '', avatar_url: displayAvatarUrl };
        setProfile(mergedProfile);
        setAddresses(uiAddrs);

        if (setUserdet) {
          setUserdet(prev => {
            if (
              prev.username === mergedProfile.name &&
              prev.phone === mergedProfile.phone &&
              prev.location === mergedProfile.location &&
              prev.image === displayAvatarUrl &&
              JSON.stringify(prev.addresses) === JSON.stringify(uiAddrs)
            ) {
              return prev;
            }
            return {
              ...prev,
              username: mergedProfile.name,
              phone: mergedProfile.phone,
              location: mergedProfile.location,
              image: displayAvatarUrl || '',
              addresses: uiAddrs
            };
          });
        }
      }
    } catch (err) {
      console.error("[useProfileManager] Background Fetch Error:", err.message);
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userId, setUserdet]);

  /**
   * Update Profile Information (Name, Phone, Location)
   */
  const updateProfile = async (updates) => {
    try {
      setIsUpdatingProfile(true);
      setError(null);
      if (!userId) throw new Error("No authenticated user ID");
      
      const { location, name, phone } = updates;

      const { data, error: upsertError } = await runWithTimeout(
        supabase
          .from('Profiles')
          .upsert({
            id: userId,
            email: profile?.email || userdet?.email || '',
            name: name,
            phone: phone,
            Location: location,
          })
          .select()
          .single(),
        30000
      );

      if (upsertError) throw upsertError;
      
      const updatedProfile = { ...data, location: data.Location || '' };
      setProfile(updatedProfile);

      if (setUserdet) {
        setUserdet(prev => ({
          ...prev,
          username: updatedProfile.name,
          phone: updatedProfile.phone,
          location: updatedProfile.location
        }));
      }
      
      return { success: true, data: updatedProfile };
    } catch (err) {
      console.error("[useProfileManager] Profile Update Error:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Sync/Upsert Addresses (Single or Multiple)
   */
  const upsertAddresses = async (addressList) => {
    try {
      setIsUpdatingAddress(true);
      setError(null);
      if (!userId) throw new Error("No authenticated user ID");

      const { data: currentRows } = await runWithTimeout(
        supabase
          .from('addresses')
          .select('*')
          .eq('profile_id', userId),
        30000
      );
        
      const currentDb = currentRows && currentRows.length > 0 ? currentRows[0] : null;

      const payload = {
        profile_id: userId,
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

      const { data, error: addrError } = await runWithTimeout(
        supabase
          .from('addresses')
          .upsert(payload)
          .select(),
        30000
      );

      if (addrError) throw addrError;

      const uiAddrs = parseAddressRow(data && data.length > 0 ? data[0] : null);
      setAddresses(uiAddrs);

      if (setUserdet) {
        setUserdet(prev => ({
          ...prev,
          addresses: uiAddrs
        }));
      }

      return { success: true, data };
    } catch (err) {
      console.error("[useProfileManager] Address Sync Error:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  /**
   * Delete an Address
   */
  const deleteAddress = async (id) => {
    try {
      setIsUpdatingAddress(true);
      setError(null);
      if (!userId) throw new Error("No authenticated user ID");

      const { data: currentRows } = await runWithTimeout(
        supabase
          .from('addresses')
          .select('*')
          .eq('profile_id', userId),
        30000
      );

      const currentDb = currentRows && currentRows.length > 0 ? currentRows[0] : null;

      if (currentDb) {
        const payload = {
          id: currentDb.id,
          profile_id: userId,
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

        const { data, error } = await runWithTimeout(
          supabase
            .from('addresses')
            .upsert(payload)
            .select(),
          30000
        );

        if (error) throw error;

        const uiAddrs = parseAddressRow(data && data.length > 0 ? data[0] : null);
        setAddresses(uiAddrs);

        if (setUserdet) {
          setUserdet(prev => ({
            ...prev,
            addresses: uiAddrs
          }));
        }
      }

      return { success: true };
    } catch (err) {
      console.error("[useProfileManager] Delete Address Error:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  /**
   * Upload Avatar to Supabase Storage and update Profile
   */
  const uploadAvatar = async (file) => {
    try {
      setIsUpdatingAvatar(true);
      setError(null);
      if (!userId) throw new Error("No authenticated user ID");

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data: { session } } = await supabase.auth.getSession();
      console.log("[useProfileManager] Current Supabase Session in browser:", session);
      if (!session) {
         console.warn("[useProfileManager] Warning: No active session found! Request will go as anonymous.");
      } else {
         console.log("[useProfileManager] Authenticated user role:", session.user?.role);
      }

      console.log("[useProfileManager] Uploading avatar to storage...");
      
      let bucketName = 'avatar';
      let uploadResult;

      try {
        uploadResult = await runWithTimeout(
          supabase.storage
            .from(bucketName)
            .upload(filePath, file, { upsert: true }),
          30000
        );
      } catch (err) {
        if (err.message.includes("timed out")) throw err;
        uploadResult = { error: err };
      }

      // Fallback: If upload failed and error indicates bucket issue, retry with 'avatars' (plural)
      if (uploadResult.error) {
        console.warn("[useProfileManager] Primary upload error details:", uploadResult.error);
        const errMsg = uploadResult.error.message || "";
        const errStatus = uploadResult.error.status;
        if (
          errMsg.toLowerCase().includes("bucket") ||
          errMsg.toLowerCase().includes("not found") ||
          errStatus === 404 ||
          errStatus === 400
        ) {
          console.warn(`[useProfileManager] Upload to bucket '${bucketName}' failed. Retrying with 'avatars'...`);
          bucketName = 'avatars';
          const retryRes = await runWithTimeout(
            supabase.storage
              .from(bucketName)
              .upload(filePath, file, { upsert: true }),
            30000
          );
          if (retryRes.error) {
            console.error("[useProfileManager] Retry upload error details:", retryRes.error);
            throw retryRes.error;
          }
        } else {
          throw uploadResult.error;
        }
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      let avatarUrl = publicUrlData.publicUrl;
      
      // If we are in dev using proxy, convert the relative proxy URL back to absolute for saving in DB
      if (avatarUrl.startsWith('/api/supabase')) {
         avatarUrl = avatarUrl.replace('/api/supabase', 'https://ypvzlwkmdoueswvcagkq.supabase.co');
      } else if (avatarUrl.startsWith('http://localhost') || avatarUrl.startsWith('http://127.0.0.1')) {
         // Fallback if it included the localhost origin
         const urlObj = new URL(avatarUrl);
         avatarUrl = avatarUrl.replace(urlObj.origin + '/api/supabase', 'https://ypvzlwkmdoueswvcagkq.supabase.co');
      }

      console.log("[useProfileManager] Upserting avatar URL in profiles table...");
      // Upsert to Profiles table directly to handle both existing and new users
      const { error: profileUpdateError } = await runWithTimeout(
        supabase
          .from('Profiles')
          .upsert({
            id: userId,
            email: profile?.email || userdet?.email || '',
            avatar_url: avatarUrl
          }),
        30000
      );

      if (profileUpdateError) throw profileUpdateError;

      const displayAvatarUrl = getDisplayAvatarUrl(avatarUrl);
      setProfile(prev => prev ? { ...prev, avatar_url: displayAvatarUrl } : { id: userId, avatar_url: displayAvatarUrl });
      
      if (setUserdet) {
        setUserdet(prev => ({
          ...prev,
          image: displayAvatarUrl
        }));
      }

      return { success: true, url: displayAvatarUrl };
    } catch (err) {
      console.error("[useProfileManager] Avatar Upload Error:", err);
      if (err.status) console.error("[useProfileManager] Error Status:", err.status);
      if (err.statusCode) console.error("[useProfileManager] Error StatusCode:", err.statusCode);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  /**
   * Delete Avatar from Storage and remove URL from Profile
   */
  const removeAvatar = async () => {
    try {
      setIsUpdatingAvatar(true);
      setError(null);
      if (!userId) throw new Error("No authenticated user ID");

      // Extract filePath and bucketName dynamically from current avatar_url if possible
      if (!profile?.avatar_url) throw new Error("No avatar to remove");
      
      let bucketName = 'avatar';
      let filePath = '';
      
      if (profile.avatar_url.includes('/storage/v1/object/public/')) {
        const urlParts = profile.avatar_url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const pathAndBucket = urlParts[1];
          const components = pathAndBucket.split('/');
          if (components.length > 1) {
            bucketName = components[0];
            filePath = components.slice(1).join('/');
          }
        }
      }
      
      // Fallback for legacy split
      if (!filePath) {
        const urlParts = profile.avatar_url.split('/avatar/');
        if (urlParts.length > 1) {
          bucketName = 'avatar';
          filePath = urlParts[1];
        } else {
          const urlPartsPlural = profile.avatar_url.split('/avatars/');
          if (urlPartsPlural.length > 1) {
            bucketName = 'avatars';
            filePath = urlPartsPlural[1];
          }
        }
      }

      if (filePath) {
        console.log(`[useProfileManager] Removing avatar from bucket '${bucketName}' at path '${filePath}'...`);
        try {
          await runWithTimeout(
            supabase.storage.from(bucketName).remove([filePath]),
            30000
          );
        } catch (storageErr) {
          console.warn("Could not delete file from storage bucket:", storageErr.message);
        }
      }

      // Upsert to Profiles table to clear avatar_url
      const { error } = await runWithTimeout(
        supabase
          .from('Profiles')
          .upsert({
            id: userId,
            email: profile?.email || userdet?.email || '',
            avatar_url: null
          }),
        30000
      );

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: null } : { id: userId, avatar_url: null });
      
      if (setUserdet) {
        const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userdet.emailPrefix || 'U')}&background=0f172a&color=fff`;
        setUserdet(prev => ({
          ...prev,
          image: prev.username ? `https://ui-avatars.com/api/?name=${encodeURIComponent(prev.username)}&background=0f172a&color=fff` : defaultImage
        }));
      }

      return { success: true };
    } catch (err) {
      console.error("[useProfileManager] Avatar Remove Error:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // Perform background sync on mount
  useEffect(() => {
    if (userId) {
      fetchProfileData(false);
    }
  }, [userId, fetchProfileData]);

  return {
    profile,
    addresses,
    loading,
    isUpdatingProfile,
    isUpdatingAddress,
    isUpdatingAvatar,
    error,
    refresh: () => fetchProfileData(true),
    updateProfile,
    upsertAddresses,
    deleteAddress,
    uploadAvatar,
    removeAvatar
  };
};
