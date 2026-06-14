import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import loginBg from '/image/login-bg.png';
import bannerImg from '/image/login-right.png'; // The neon cart image
import './Login.css';

const Login = ({ setUserdet, authLoading }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (!authLoading && setUserdet && typeof setUserdet === 'function') {
      const savedUser = localStorage.getItem('userdet');
      if (savedUser) {
        navigate('/welcome', { replace: true });
      }
    }
  }, [authLoading, navigate]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/welcome'
        }
      });
      if (error) throw error;
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      setSuccessMessage('Logged in successfully!');

      const emailPrefix = data.user.email ? data.user.email.split('@')[0] : '';

      const mappedData = {
        id: data.user.id,
        username: data.user.user_metadata?.full_name || 'Marketplace User',
        email: data.user.email,
        emailPrefix: emailPrefix,
        image: data.user.user_metadata?.avatar_url || '',
        accessToken: data.session.access_token,
      };

      localStorage.setItem('userdet', JSON.stringify(mappedData));
      setUserdet(mappedData);
      navigate('/welcome');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: { data: { full_name: registerData.name } },
      });

      if (error) throw error;
      setSuccessMessage('Registration successful! Please check your email to verify.');
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => setIsRegister(false), 3000); // Slide back to login on success
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-page-wrapper" 
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className={`auth-sliding-container ${isRegister ? 'right-panel-active' : ''}`}>
        
        {/* SIGN UP FORM (Hidden initially, slides to right) */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            <span className="subtitle">Register to explore the marketplace</span>
            
            {errorMessage && <div className="status-msg error">{errorMessage}</div>}
            {successMessage && <div className="status-msg success">{successMessage}</div>}

            <div className="input-group">
              <input type="text" name="name" value={registerData.name} onChange={handleRegisterChange} required placeholder=" " />
              <label>Full Name</label>
            </div>
            <div className="input-group">
              <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} required placeholder=" " />
              <label>Email Address</label>
            </div>
            <div className="input-group">
              <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} required placeholder=" " />
              <label>Password</label>
            </div>
            <div className="input-group">
              <input type="password" name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} required placeholder=" " />
              <label>Confirm Password</label>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>

            {/* Mobile Only Toggle */}
            <p className="mobile-toggle-text">
              Already have an account? <span onClick={() => setIsRegister(false)}>Sign In</span>
            </p>
          </form>
        </div>

        {/* SIGN IN FORM (Visible initially on left) */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            <span className="subtitle">Welcome back to e CART</span>

            {errorMessage && <div className="status-msg error">{errorMessage}</div>}
            {successMessage && <div className="status-msg success">{successMessage}</div>}

            <div className="input-group">
              <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} required placeholder=" " />
              <label>Email Address</label>
            </div>
            <div className="input-group">
              <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required placeholder=" " />
              <label>Password</label>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* OR Divider */}
            <div className="social-divider">OR</div>

            {/* Social Buttons Container */}
            <div className="social-buttons-container">
              <button 
                type="button" 
                className="primary-btn" 
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: '#111', 
                  border: '1px solid #e5e7eb', 
                  marginTop: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  textTransform: 'none' 
                }}
                onClick={() => handleSocialLogin('google')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.707a5.41 5.41 0 010-3.414V4.961H.957a8.992 8.992 0 000 8.078l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 3.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
              
              <button 
                type="button" 
                className="primary-btn" 
                style={{ 
                  backgroundColor: '#1877F2', 
                  marginTop: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  textTransform: 'none'
                }}
                onClick={() => handleSocialLogin('facebook')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M18 9.011c0-4.97-4.03-9.011-9-9.011s-9 4.041-9 9.011c0 4.491 3.285 8.219 7.594 8.894v-6.292h-2.285v-2.602h2.285v-1.983c0-2.255 1.343-3.501 3.398-3.501.984 0 2.013.175 2.013.175v2.213h-1.134c-1.118 0-1.467.694-1.467 1.406v1.69h2.494l-.398 2.602h-2.096v6.292c4.309-.675 7.594-4.403 7.594-8.894z"/></svg>
                Sign in with Facebook
              </button>
            </div>

            {/* Mobile Only Toggle */}
            <p className="mobile-toggle-text">
              New to our marketplace? <span onClick={() => setIsRegister(true)}>Sign Up</span>
            </p>
          </form>
        </div>

        {/* THE SLIDING BANNER OVERLAY */}
        <div className="overlay-container">
          <div 
            className="overlay" 
            style={{ 
              backgroundImage: `url(${bannerImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark gradient to ensure text is readable over the banner image */}
            <div className="overlay-dark-fade"></div>

            {/* This panel is visible when the user is on the Sign UP form, offering them a way back to Sign IN */}
            <div className="overlay-panel overlay-left">
              <h1>Already registered?</h1>
              <p>Welcome back! Please sign in with your details to access your account.</p>
              <button className="ghost-btn" onClick={() => setIsRegister(false)}>Sign In</button>
            </div>
            
            {/* This panel is visible when the user is on the Sign IN form, offering them a way to Sign UP */}
            <div className="overlay-panel overlay-right">
              <h1>New to e CART?</h1>
              <p>Hello there! Create an account today to start your shopping journey.</p>
              <button className="ghost-btn" onClick={() => setIsRegister(true)}>Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;