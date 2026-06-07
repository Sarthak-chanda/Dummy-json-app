import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const demoUser = {
  name: "Tapojay Sardar",
  email: "tapojay@example.com",
  role: "Full-Stack Developer",
  location: "West Bengal, India",
  bio: "Building robust architecture, fast applications, and interactive web interfaces.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  stats: [
    { label: "Projects", value: "14" },
    { label: "Orders placed", value: "28" },
    { label: "Reviews left", value: "9" },
  ],
  details: [
    { label: "Username", value: "tapojay_dev" },
    { label: "Account Tier", value: "Premium Member" },
    { label: "Joined Date", value: "January 2026" }
  ],
  recentActivity: [
    "Optimized search layout performance",
    "Integrated core context state elements",
    "Updated user authentication profiles",
  ],
};

export default function Profile({ userdet }) {
  const navigate = useNavigate();
  
  // Resolve runtime profile data gracefully with fallback to demo user
  const user = userdet?.id
    ? {
        name: `${userdet.firstName || ""} ${userdet.lastName || ""}`.trim() || userdet.username || "User",
        email: userdet.email || "Not provided",
        role: "Customer Account",
        location: "India",
        bio: "Managing active storefront preferences, checkout routes, and shopping history.",
        avatar: userdet.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        stats: [
          { label: "Orders placed", value: "3" },
          { label: "Wishlist items", value: "12" },
          { label: "Active Cart", value: "2" },
        ],
        details: [
          { label: "Username", value: userdet.username || "N/A" },
          { label: "Account Tier", value: "Standard Member" },
          { label: "Joined Date", value: "Recent" }
        ],
        recentActivity: ["Logged in securely", "Added items to your cart"],
      }
    : demoUser;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Consistent Back Button Action */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

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
                <p className="user-location-text">{user.location}</p>
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

            {/* Live Operations Trace Log */}
            <section className="section-card">
              <h2>Recent Account Activity</h2>
              <div className="info-grid">
                {user.recentActivity.map((activity, idx) => (
                  <div key={idx} className="activity-log-item">
                    <h4>Operation #{idx + 1}</h4>
                    <p>{activity}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Dashboard Footer Control Group */}
            <div className="purchase-buttons">
              <button 
                className="add-cart-btn" 
                onClick={() => alert("Redirecting to Settings panel...")}
              >
                Modify Settings
              </button>
              <button 
                className="buy-now-btn" 
                onClick={() => navigate("/")}
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