import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import loginBg from '/image/login-bg.webp';
import logo from '/image/logo.webp'; 
import './WelcomePage.css';

const WelcomePage = ({ userdet, setUserdet, onContinue, authLoading }) => {
  const navigate = useNavigate();
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!userdet?.id) {
        navigate('/login', { replace: true });
      } else {
        setTimeout(() => setAnimationStarted(true), 150);
      }
    }
  }, [userdet, navigate, authLoading]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // App.jsx onAuthStateChange will handle state and localStorage clearing
    } catch (err) {
      console.error('Logout error context:', err);
    }
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Shopper';
    return fullName.trim().split(' ')[0];
  };

  return (
    <div 
      className={`welcome-page-wrapper ${animationStarted ? 'active' : ''}`}
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Background Dimmer to make the white line-art sketch softer */}
      <div className="welcome-bg-overlay"></div>

      <div className="welcome-glass-card">
        
        <header className="welcome-header">
          <div className="logo-center-frame">
            <img src={logo} alt="e CART logo" className="welcome-logo" />
          </div>
          
          <div className="session-badge">
            <span className="dot"></span> Active Connection
          </div>
          
          <h1>Welcome back, <span>{getFirstName(userdet.username)}</span>!</h1>
          <p>Your personalized shopping dashboard and cart are ready.</p>
        </header>
        
        <div className="user-details-box">
          <div className="detail-row">
            <span className="label">Account</span>
            <span className="value">{userdet.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status</span>
            <span className="value success-text">Verified</span>
          </div>
        </div>

        <div className="welcome-actions">
          <button className="primary-btn" onClick={() => {
            onContinue();
            navigate('/');
          }}>
            Enter E-Cart →
          </button>
          <button className="logout-link" onClick={handleLogout}>
            Log Out 
          </button>
        </div>

      </div>
    </div>
  );
};

export default WelcomePage;