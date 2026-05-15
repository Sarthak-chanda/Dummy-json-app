
import './WelcomePage.css';
import { supabase } from './supabaseClient'; // Adjusted path based on your folder structure

const WelcomePage = ({ userdet, setUserdet, onContinue }) => {
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      // Clear user state to return to Login screen
      setUserdet({
        id: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        gender: '',
        image: '',
        accessToken: '',
        refreshToken: ''
      });
    }
  };

  return (
    <div className="welcome-wrapper">
      <div className="welcome-glass-card">
        <div className="welcome-badge">New Session</div>
        
        <h1 className="welcome-greeting">
          Hello, <span className="user-name">{userdet.username || 'Developer'}</span>!
        </h1>
        
        <p className="welcome-info">
          Your account (<strong>{userdet.email}</strong>) is now active. 
          Ready to explore the store?
        </p>

        <div className="welcome-actions">
          <button className="btn-primary" onClick={onContinue}>
            Enter Store
          </button>
          
          <button className="btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;