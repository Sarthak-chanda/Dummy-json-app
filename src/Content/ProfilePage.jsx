import { useNavigate } from "react-router-dom";
import { supabase } from "../Login/supabaseClient";
import "./ProfilePage.css";

export default function Profile({ userdet, cart = [], wishlist = [] }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userdet');
      localStorage.removeItem('cart');
      window.location.href = "/"; // Force reload to clear all states
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Resolve runtime profile data gracefully
  const user = {
    name: `${userdet.firstName || ""} ${userdet.lastName || ""}`.trim() || userdet.username || "Marketplace User",
    email: userdet.email || "Not provided",
    role: "Verified Member",
    location: "India",
    bio: "Manage your shopping experience, track orders, and update your preferences.",
    avatar: userdet.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    stats: [
      { label: "Active Cart", value: cart.length },
      { label: "Wishlist", value: wishlist.length },
      { label: "Joined", value: "2026" },
    ],
    details: [
      { label: "Full Name", value: `${userdet.firstName || ""} ${userdet.lastName || ""}`.trim() || userdet.username },
      { label: "Email", value: userdet.email },
      { label: "User ID", value: userdet.id.slice(0, 8) + '...' }
    ],
    recentActivity: [
      "Secured session established",
      "Synced cart with cloud storage",
      "Profile information updated",
    ],
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Dashboard Grid Layout */}
        <div className="profile-grid">
          
          {/* LEFT PANEL: Identity Summary */}
          <section className="section-card identity-card">
            <div className="profile-card-top">
              <img 
                className="profile-card-avatar" 
                src={user.avatar} 
                alt={`${user.name}'s avatar`} 
              />
              <div className="profile-card-meta-info">
                <span className="category-tag">{user.role}</span>
                <h2>{user.name}</h2>
                <p className="user-email-text">{user.email}</p>
              </div>
            </div>
            
            <p className="description">{user.bio}</p>
            
            {/* Metric Counters Block */}
            <div className="spec-grid">
              {user.stats.map((stat, idx) => (
                <div key={idx} className="metric-box">
                  <span>{stat.label}</span>
                  <p>{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT PANEL: Meta Logs & Configurations */}
          <div className="profile-side-column">
            
            {/* Account Metrics Sheet */}
            <section className="section-card">
              <h2>Account Information</h2>
              <div className="profile-details-list">
                {user.details.map((detail, idx) => (
                  <div key={idx} className="profile-detail-row">
                    <span className="detail-label">{detail.label}</span>
                    <span className="detail-value">{detail.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Dashboard Footer Control Group */}
            <div className="profile-actions">
              <button 
                className="edit-profile-btn" 
                onClick={() => alert("Profile editing will be available soon!")}
              >
                Edit Profile
              </button>
              <button 
                className="logout-btn" 
                onClick={handleLogout}
              >
                Logout Account
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}