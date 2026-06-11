import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import loginBg from '/image/login-bg.png';
import bannerImg from '/image/login-right.png'; // The neon cart image
import './Login.css';

const Login = ({ setUserdet }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
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