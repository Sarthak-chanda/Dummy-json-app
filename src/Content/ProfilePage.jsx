import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Login/supabaseClient";

// --- SUB-COMPONENTS ---

/**
 * Renders an individual profile detail item in "view" mode.
 */
const DetailCard = ({ label, value }) => (
  <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="font-bold text-slate-800 tracking-tight">{value}</p>
  </div>
);

/**
 * Renders an input field for profile editing.
 */
const EditField = ({ label, value, onChange, name, disabled = false }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{label}</label>
    <input 
      value={value} 
      onChange={onChange} 
      name={name} 
      disabled={disabled}
      className={`w-full p-4 rounded-2xl outline-none transition-all font-bold ${
        disabled 
        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
        : "bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
      }`}
    />
  </div>
);

/**
 * Placeholder for non-implemented sections to maintain professional look.
 */
const PlaceholderSection = ({ title, icon: Icon }) => (
  <div className="animate-slide-in-bottom">
    <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
    <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
        {Icon ? <Icon className="w-8 h-8" /> : "🛠️"}
      </div>
      <p className="text-slate-900 font-bold text-lg mb-1">Coming Soon</p>
      <p className="text-slate-500 text-sm max-w-xs mx-auto">We're building the best experience for your {title.toLowerCase()} management.</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function ProfilePage({ userdet, cart = [], wishlist = [] }) {
  const navigate = useNavigate();
  
  // Logic state
  const [activeSection, setActiveSection] = useState("account");
  const [isEditing, setIsEditing] = useState(false);

  // Address Book State (Mock)
  const [addresses, setAddresses] = useState([
    { id: 1, type: "Home", street: "123 Market St", city: "Mumbai", state: "MH", zip: "400001", isDefault: true },
    { id: 2, type: "Office", street: "Tech Park, Hitech City", city: "Hyderabad", state: "TS", zip: "500081", isDefault: false }
  ]);

  // Unified Profile Data
  const initialData = {
    name: userdet.username || userdet.firstName || "Marketplace User",
    email: userdet.email || "not-provided@example.com",
    phone: userdet.phone || "+91 98765 43210",
    location: userdet.location || "Mumbai, India",
    avatar: userdet.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    status: "Verified Member"
  };

  const [editedData, setEditedData] = useState({ ...initialData });

  // --- ACTIONS ---

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSaveProfile = () => {
    // API Call would happen here
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  // --- CONFIGURATION ---

  const sections = [
    { id: "account", label: "Account Settings", icon: "👤" },
    { id: "address", label: "Address Book", icon: "📍" },
    { id: "cart", label: "My Cart", icon: "🛒", badge: cart.length, route: `/${userdet.emailPrefix}/cart` },
    { id: "wishlist", label: "Wishlist", icon: "❤️", badge: wishlist.length, route: `/${userdet.emailPrefix}/wishlist` },
    { id: "payment", label: "Payment Methods", icon: "💳" },
  ];

  // --- RENDER LOGIC ---

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="animate-slide-in-bottom">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
                <p className="text-slate-400 font-medium">Manage your personal identity and reachability.</p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={handleSaveProfile} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Save Changes</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <EditField label="Display Name" value={editedData.name} onChange={(e) => setEditedData({...editedData, name: e.target.value})} />
                  <EditField label="Email Address" value={initialData.email} disabled />
                  <EditField label="Phone Number" value={editedData.phone} onChange={(e) => setEditedData({...editedData, phone: e.target.value})} />
                  <EditField label="Default Location" value={editedData.location} onChange={(e) => setEditedData({...editedData, location: e.target.value})} />
                </>
              ) : (
                <>
                  <DetailCard label="Full Name" value={editedData.name} />
                  <DetailCard label="Registered Email" value={initialData.email} />
                  <DetailCard label="Contact Number" value={editedData.phone} />
                  <DetailCard label="Current Location" value={editedData.location} />
                </>
              )}
            </div>
          </div>
        );

      case "address":
        return (
          <div className="animate-slide-in-bottom">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Address Book</h2>
              <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all">+</button>
            </div>
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr.id} className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${addr.isDefault ? 'bg-blue-50/50 border-blue-100 ring-2 ring-blue-500/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-slate-900 text-lg">{addr.type}</span>
                        {addr.isDefault && <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest">DEFAULT</span>}
                      </div>
                      <p className="text-slate-500 font-medium">{addr.street}, {addr.city}</p>
                      <p className="text-slate-400 text-xs mt-1">{addr.state} • {addr.zip}</p>
                    </div>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs font-black text-blue-600 uppercase tracking-wider hover:underline">Set Default</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "cart":
        return (
          <div className="animate-slide-in-bottom text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart ({cart.length} items)</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">Ready to complete your purchase? Check your selected items now.</p>
            <button onClick={() => navigate(`/${userdet.emailPrefix}/cart`)} className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95">Go to Checkout</button>
          </div>
        );

      case "wishlist":
        return (
          <div className="animate-slide-in-bottom text-center py-16">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">My Wishlist ({wishlist.length} items)</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">Your saved treasures are waiting for you right here.</p>
            <button onClick={() => navigate(`/${userdet.emailPrefix}/wishlist`)} className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95">Open Wishlist</button>
          </div>
        );

      default:
        return <PlaceholderSection title={sections.find(s => s.id === activeSection)?.label} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-20 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* ASIDE: Sidebar (Desktop) / Vertical List Header (Mobile) */}
        <aside className="w-full lg:w-96 shrink-0 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          
          {/* MOBILE-ONLY HEADER (The Design Style requested) */}
          <div className="lg:hidden flex flex-col items-center text-center pb-8 border-b border-slate-100">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-full blur-md opacity-20"></div>
              <img 
                src={initialData.avatar} 
                referrerPolicy="no-referrer" 
                className="relative w-36 h-32 rounded-full object-cover border-4 border-white shadow-2xl" 
                alt="Avatar" 
              />
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tighter text-slate-900">{initialData.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100/50">{initialData.status}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 text-sm font-medium">{initialData.location}</span>
            </div>
          </div>

          {/* DESKTOP-ONLY CARD (Modern Expansive UI) */}
          <div className="hidden lg:block bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/40 text-center">
            <div className="relative inline-block mb-6">
              <img 
                src={initialData.avatar} 
                referrerPolicy="no-referrer" 
                className="w-24 h-24 rounded-3xl object-cover border border-slate-100 shadow-inner" 
                alt="Avatar" 
              />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-1">{initialData.name}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-4">{initialData.email}</p>
            <div className="bg-slate-50 py-3 px-4 rounded-2xl border border-slate-100/50 inline-block">
               <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">{initialData.status}</span>
            </div>
          </div>

          {/* NAVIGATION LIST (Dual-Mode) */}
          <nav className="bg-white rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/40 p-4 md:p-6 space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => section.route ? navigate(section.route) : setActiveSection(section.id)}
                className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-500 group ${
                  activeSection === section.id 
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-400 scale-[1.02]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all ${
                  activeSection === section.id ? "bg-white/10 rotate-6" : "bg-slate-100 group-hover:bg-white"
                }`}>
                  {section.icon}
                </div>
                <span className="font-black text-[0.95rem] tracking-tight">{section.label}</span>
                {section.badge > 0 && (
                  <span className={`ml-auto px-3 py-0.5 rounded-full text-[10px] font-black ${
                    activeSection === section.id ? "bg-blue-500" : "bg-blue-100 text-blue-600"
                  }`}>
                    {section.badge}
                  </span>
                )}
                <div className={`ml-auto transition-all ${activeSection === section.id ? 'opacity-100' : 'opacity-0'}`}>→</div>
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-5 p-5 rounded-[2rem] text-rose-500 font-black hover:bg-rose-50 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-lg">🚪</div>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT AREA (Desktop Expansive) */}
        <main className="w-full lg:flex-1 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm shadow-slate-200/40 p-8 md:p-16 min-h-[650px] animate-in slide-in-from-right-12 duration-1000">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}
