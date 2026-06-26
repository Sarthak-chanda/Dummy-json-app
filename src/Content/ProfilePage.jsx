import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Login/supabaseClient";
import { useProfileManager } from "../hooks/useProfileManager";

// --- ICONS ---
const Icons = {
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  Camera: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  Pen: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
};

// --- SUB-COMPONENTS ---

const DetailCard = ({ label, value }) => (
  <div className="p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="font-medium text-slate-900">{value || "Not set"}</p>
  </div>
);

const EditField = ({ label, value, onChange, name, disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">{label}</label>
    <input 
      value={value} 
      onChange={onChange} 
      name={name} 
      disabled={disabled}
      className={`w-full p-3 rounded-xl outline-none transition-all font-medium text-sm md:text-base ${
        disabled 
        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
        : "bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
      }`}
    />
  </div>
);

const PlaceholderSection = ({ title, icon: Icon }) => (
  <div className="animate-fade-in py-4">
    <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-slate-400 mb-4">
        {Icon ? <Icon /> : <Icons.Settings />}
      </div>
      <p className="text-slate-800 font-semibold text-lg mb-2">{title} is Coming Soon</p>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">We're actively building the best experience for your {title.toLowerCase()} management.</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function ProfilePage({ userdet, setUserdet, cart = [], wishlist = [] }) {
  const navigate = useNavigate();
  const { profile, addresses, loading: profileLoading, updateProfile, upsertAddresses, deleteAddress, uploadAvatar, removeAvatar } = useProfileManager(userdet, setUserdet);
  
  const [activeSection, setActiveSection] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPenMenu, setShowPenMenu] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const fileInputRef = useRef(null);

  const [editedData, setEditedData] = useState({
    name: "",
    phone: "",
    location: ""
  });

  // Sync editedData when profile from Supabase loads
  useEffect(() => {
    if (profile) {
      setEditedData({
        name: profile.name || "",
        phone: profile.phone || "",
        location: profile.location || ""
      });
      
      // Update global App state if needed
      if (setUserdet) {
        setUserdet(prev => {
          if (
            prev.username === profile.name &&
            prev.phone === profile.phone &&
            prev.location === profile.location &&
            JSON.stringify(prev.addresses) === JSON.stringify(addresses)
          ) {
            return prev;
          }
          return {
            ...prev,
            username: profile.name,
            phone: profile.phone,
            location: profile.location,
            addresses: addresses
          };
        });
      }
    }
  }, [profile, addresses, setUserdet]);

  const handleLogout = async () => {
    try {
      // Fire signout in the background without awaiting it to avoid UI blocks
      supabase.auth.signOut().catch(err => console.warn("Supabase signOut error:", err));
    } catch (err) {
      console.warn("Logout exception:", err);
    }
    
    // Perform local cleanup immediately
    localStorage.removeItem('userdet');
    if (setUserdet) {
      const resetUser = { id: '', username: '', email: '', emailPrefix: '', image: '', accessToken: '', phone: '', location: '', addresses: [], firstName: '', lastName: '', gender: '' };
      setUserdet(resetUser);
    }
    navigate('/login');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage("Image must be smaller than 2MB");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setIsUploadingAvatar(true);
    const result = await uploadAvatar(file);
    if (result.success) {
      setSaveMessage("Avatar updated!");
      setTimeout(() => setSaveMessage(""), 3000);
      if (setUserdet) {
         setUserdet(prev => ({ ...prev, image: result.url }));
      }
    } else {
      setSaveMessage("Failed to upload: " + (result.error || "Unknown error"));
      setTimeout(() => setSaveMessage(""), 3000);
    }
    setIsUploadingAvatar(false);
  };

  const handleAvatarRemove = async () => {
    setIsUploadingAvatar(true);
    const result = await removeAvatar();
    if (result.success) {
      setSaveMessage("Avatar removed!");
      setTimeout(() => setSaveMessage(""), 3000);
      if (setUserdet) {
         const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userdet.emailPrefix)}&background=0f172a&color=fff`;
         setUserdet(prev => ({ ...prev, image: userdet.username ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userdet.username)}&background=0f172a&color=fff` : defaultImage }));
      }
    } else {
      setSaveMessage("Failed to remove avatar");
      setTimeout(() => setSaveMessage(""), 3000);
    }
    setIsUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile({
      name: editedData.name,
      phone: editedData.phone,
      location: editedData.location
    });

    if (result.success) {
      setIsEditing(false);
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      
      if (setUserdet) {
        setUserdet(prev => ({
          ...prev,
          username: editedData.name,
          phone: editedData.phone,
          location: editedData.location
        }));
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const updatedAddresses = addresses.map(a => ({
      ...a,
      is_default: a.id === id
    }));
    await upsertAddresses(updatedAddresses);
  };

  const handleSaveAddress = async (id, newAddressData) => {
    const addressToSave = {
      ...newAddressData,
      is_default: id === 'new' ? addresses.length === 0 : newAddressData.is_default,
      id: id
    };

    const result = await upsertAddresses(addressToSave);
    if (result.success) {
      setEditingAddressId(null);
      setSaveMessage("Address saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleDeleteAddress = async (id) => {
    const result = await deleteAddress(id);
    if (result.success) {
      setSaveMessage("Address removed");
      setTimeout(() => setSaveMessage(""), 3000);
      
      // If we deleted the default, we might need to set a new one
      const remaining = addresses.filter(a => a.id !== id);
      if (remaining.length > 0 && !remaining.some(a => a.is_default)) {
        await handleSetDefaultAddress(remaining[0].id);
      }
    }
  };

  const AddressEditForm = ({ address, onSave, onCancel }) => {
    const [formData, setFormData] = useState(address || { 
      address_line_1: "", 
      address_line_2: "", 
      city: "", 
      postal_code: "",
      address_type: "Home",
      availability: "All Day",
      is_default: false 
    });
    
    return (
      <div className="p-4 md:p-5 rounded-xl border bg-slate-50 border-slate-300 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <EditField label="Address Line 1" value={formData.address_line_1 || ""} onChange={e => setFormData({...formData, address_line_1: e.target.value})} />
          <EditField label="Address Line 2 (Optional)" value={formData.address_line_2 || ""} onChange={e => setFormData({...formData, address_line_2: e.target.value})} />
          <EditField label="City" value={formData.city || ""} onChange={e => setFormData({...formData, city: e.target.value})} />
          <EditField label="Postal Code" value={formData.postal_code || ""} onChange={e => setFormData({...formData, postal_code: e.target.value})} />
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">Address Type</label>
            <select 
              value={formData.address_type || "Home"} 
              onChange={e => setFormData({...formData, address_type: e.target.value})}
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">Availability</label>
            <select 
              value={formData.availability || "All Day"} 
              onChange={e => setFormData({...formData, availability: e.target.value})}
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option value="All Day">All Day (9 AM - 9 PM)</option>
              <option value="Morning">Morning (9 AM - 12 PM)</option>
              <option value="Night">Night (6 PM - 9 PM)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Save</button>
        </div>
      </div>
    );
  };

  const sections = [
    { id: "account", label: "Account Details", icon: <Icons.User /> },
    { id: "address", label: "Address Book", icon: <Icons.MapPin /> },
    { id: "cart", label: "My Cart", icon: <Icons.Cart />, badge: cart.length, route: `/${userdet.emailPrefix}/cart` },
    { id: "wishlist", label: "Wishlist", icon: <Icons.Heart />, badge: wishlist.length, route: `/${userdet.emailPrefix}/wishlist` },
    { id: "payment", label: "Payment Methods", icon: <Icons.CreditCard /> },
  ];

  const renderContent = (sectionId) => {
    if (profileLoading && sectionId !== "cart" && sectionId !== "wishlist") {
        return <div className="p-8 text-center text-slate-500">Loading your information...</div>;
    }

    switch (sectionId) {
      case "account":
        return (
          <div className="animate-fade-in p-2 md:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">Account Settings</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your personal details and preferences.</p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                  <button onClick={handleSaveProfile} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <EditField label="Display Name" value={editedData.name} onChange={(e) => setEditedData({...editedData, name: e.target.value})} />
                   <EditField label="Email Address" value={profile?.email || userdet.email || ""} disabled />
                  <EditField label="Phone Number" value={editedData.phone} onChange={(e) => setEditedData({...editedData, phone: e.target.value})} />
                  <EditField label="Default Location" value={editedData.location} onChange={(e) => setEditedData({...editedData, location: e.target.value})} />
                </>
              ) : (
                <>
                  <DetailCard label="Full Name" value={profile?.name} />
                  <DetailCard label="Registered Email" value={profile?.email || userdet.email} />
                  <DetailCard label="Contact Number" value={profile?.phone} />
                  <DetailCard label="Current Location" value={profile?.location} />
                </>
              )}
            </div>
          </div>
        );

      case "address":
        return (
          <div className="animate-fade-in p-2 md:p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Address Book</h2>
              {editingAddressId === null && addresses.length < 3 && (
                <button 
                  onClick={() => setEditingAddressId('new')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <span className="text-lg leading-none">+</span> Add New
                </button>
              )}
              {addresses.length >= 3 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  Maximum of 3 addresses reached
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              {editingAddressId === 'new' && (
                <AddressEditForm 
                  onSave={(data) => handleSaveAddress('new', data)} 
                  onCancel={() => setEditingAddressId(null)} 
                />
              )}
              
              {addresses.map(addr => (
                editingAddressId === addr.id ? (
                  <AddressEditForm 
                    key={addr.id}
                    address={addr} 
                    onSave={(data) => handleSaveAddress(addr.id, data)} 
                    onCancel={() => setEditingAddressId(null)} 
                  />
                ) : (
                  <div key={addr.id} className={`p-4 md:p-5 rounded-xl border transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 ${addr.is_default ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Icons.MapPin />
                        <span className="font-semibold text-slate-800">{addr.city}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${addr.address_type === 'Office' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                          {addr.address_type || 'Home'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {addr.availability || 'All Day'}
                        </span>
                        {addr.is_default && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Default</span>}
                      </div>
                      <p className="text-slate-600 text-sm font-medium">{addr.address_line_1}</p>
                      {addr.address_line_2 && <p className="text-slate-500 text-xs mt-0.5">{addr.address_line_2}</p>}
                      {addr.address_line_3 && <p className="text-slate-500 text-xs mt-0.5">{addr.address_line_3}</p>}
                      <p className="text-slate-600 text-sm mt-1">{addr.city}, {addr.postal_code}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                      {!addr.is_default && (
                        <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Set as Default</button>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAddressId(addr.id)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                )
              ))}
              
              {addresses.length === 0 && editingAddressId !== 'new' && (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <p>You have no addresses saved.</p>
                </div>
              )}
            </div>
          </div>
        );

      case "cart":
      case "wishlist":
        return null; 

      default:
        return <PlaceholderSection title={sections.find(s => s.id === sectionId)?.label} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-blue-100 pb-20 md:pb-10">
      {saveMessage && (
        <div className="fixed top-20 right-4 z-[100] animate-bounce-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {saveMessage}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-12 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative flex flex-col items-center">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp, image/gif" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={(e) => {
                  handleAvatarUpload(e);
                  setShowPenMenu(false);
                }} 
              />
              <div className="relative">
                {/* Clickable Profile Picture Container */}
                <div 
                  onClick={() => setShowImageLightbox(true)}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative cursor-pointer hover:brightness-95 group transition-all"
                  title="Click to view photo"
                >
                  <img 
                    src={userdet?.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userdet?.username || "U") + "&background=0f172a&color=fff"} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm shadow-sm">View</span>
                  </div>
                  
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 animate-fade-in">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Online Status Badge */}
                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm z-10"></div>

                {/* Tilted Pen Icon on Top-Right */}
                <div className="absolute -top-1 -right-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPenMenu(!showPenMenu);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-md border-2 border-white hover:scale-105 active:scale-95 transition-all duration-200 outline-none"
                    title="Edit profile picture"
                  >
                    <Icons.Pen className="w-3.5 h-3.5 rotate-[-15deg] hover:rotate-0 transition-transform duration-200" />
                  </button>

                  {/* Pen Dropdown Menu */}
                  {showPenMenu && (
                    <>
                      {/* Click-outside backdrop */}
                      <div 
                        className="fixed inset-0 z-20 bg-transparent" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPenMenu(false);
                        }}
                      />
                      <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 animate-scale-up origin-top-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPenMenu(false);
                            fileInputRef.current?.click();
                          }}
                          disabled={isUploadingAvatar}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 font-semibold text-xs md:text-sm text-slate-700 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                        >
                          <Icons.Camera className="w-4 h-4 text-slate-500" />
                          Upload Photo
                        </button>
                        {userdet?.image && !userdet.image.includes('ui-avatars.com') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPenMenu(false);
                              handleAvatarRemove();
                            }}
                            disabled={isUploadingAvatar}
                            className="w-full text-left px-4 py-2.5 hover:bg-rose-50 font-semibold text-xs md:text-sm text-rose-600 flex items-center gap-2.5 transition-colors border-t border-slate-100 disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fullscreen Lightbox Modal */}
          {showImageLightbox && (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in">
              {/* Click outside backdrop to close */}
              <div 
                className="absolute inset-0 cursor-pointer" 
                onClick={() => setShowImageLightbox(false)}
              />
              
              <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-6 z-10 animate-scale-up">
                {/* Close Button */}
                <button
                  onClick={() => setShowImageLightbox(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors outline-none"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <h3 className="text-md font-bold text-slate-900 mt-1">Profile Photo</h3>

                {/* Large Preview Circle */}
                <div className="w-56 h-56 md:w-60 md:h-60 rounded-full overflow-hidden border-4 border-slate-100 shadow-md relative bg-slate-50">
                  <img 
                    src={userdet?.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userdet?.username || "U") + "&background=0f172a&color=fff"} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover" 
                    alt="Avatar Large Preview" 
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Actions below */}
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowImageLightbox(false);
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingAvatar}
                      className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Icons.Camera className="w-4 h-4" />
                      Upload New
                    </button>
                    
                    {userdet?.image && !userdet.image.includes('ui-avatars.com') && (
                      <button
                        onClick={async () => {
                          await handleAvatarRemove();
                          // Keep preview open to show default avatar
                        }}
                        disabled={isUploadingAvatar}
                        className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs md:text-sm transition-all border border-rose-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col justify-center flex-1 h-full pt-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{profile?.name || userdet.username}</h1>
            <p className="text-slate-500 text-sm md:text-base font-medium mb-3">{profile?.email || userdet.email}</p>
            <div>
              <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full shadow-sm inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Verified Member
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col justify-center">
             <button 
                onClick={handleLogout}
                className="px-6 py-3 bg-white border border-rose-200 rounded-xl shadow-sm text-rose-600 font-semibold hover:bg-rose-50 transition-colors outline-none flex items-center gap-2"
              >
                <Icons.LogOut />
                <span>Sign Out</span>
              </button>
          </div>
        </div>

        <div className="lg:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-3 md:p-5 flex flex-col gap-2">
          {sections.map(section => (
            <div key={section.id} className="flex flex-col">
              <button
                onClick={() => {
                  if (section.route) {
                    navigate(section.route);
                  } else {
                    setActiveSection(activeSection === section.id ? null : section.id);
                  }
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all outline-none ${
                  activeSection === section.id && !section.route
                  ? "bg-slate-50 border border-slate-200 shadow-sm text-slate-900" 
                  : "bg-transparent border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={`text-lg transition-colors ${activeSection === section.id && !section.route ? "text-blue-600" : "text-slate-400"}`}>
                  {section.icon}
                </div>
                <span className={`font-semibold text-sm md:text-base transition-colors ${activeSection === section.id && !section.route ? "text-slate-900" : ""}`}>
                  {section.label}
                </span>
                {section.badge > 0 && (
                  <span className="ml-auto mr-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shadow-inner">
                    {section.badge}
                  </span>
                )}
                {!section.route && (
                  <div className={`ml-auto text-slate-400 transition-transform duration-300 ${activeSection === section.id ? "" : ""}`}>
                    {activeSection === section.id ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                  </div>
                )}
                {section.route && (
                  <div className="ml-auto text-slate-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </button>
              {!section.route && (
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    activeSection === section.id 
                    ? "grid-rows-[1fr] opacity-100 mt-2 mb-4 mx-2 border-t border-slate-100 pt-4" 
                    : "grid-rows-[0fr] opacity-0 m-0 border-transparent border-t"
                  }`}
                >
                  <div className="overflow-hidden">
                    {renderContent(section.id)}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="w-full flex justify-center items-center gap-2 p-4 bg-white border border-rose-200 rounded-xl shadow-sm text-rose-600 font-semibold hover:bg-rose-50 hover:border-rose-300 transition-colors outline-none"
            >
              <Icons.LogOut />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-8">
           <div className="col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2">
                 <h3 className="font-bold text-slate-800 mb-2 px-2">Quick Links</h3>
                 {sections.filter(s => s.route).map(section => (
                    <button
                      key={section.id}
                      onClick={() => navigate(section.route)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all outline-none"
                    >
                      <div className="text-lg text-slate-400">
                        {section.icon}
                      </div>
                      <span className="font-semibold text-sm">
                        {section.label}
                      </span>
                      {section.badge > 0 && (
                        <span className="ml-auto mr-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shadow-inner">
                          {section.badge}
                        </span>
                      )}
                      <div className="ml-auto text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </button>
                 ))}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                 {renderContent("payment")}
              </div>
           </div>
           <div className="col-span-8 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                 {renderContent("account")}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                 {renderContent("address")}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
