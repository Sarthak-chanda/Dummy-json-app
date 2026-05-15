import { useState } from "react";
import "./Login.css";
import { supabase } from './supabaseClient'; //

const Login = ({ setUserdet = () => {} }) => {
  const [isRegister, setIsRegister] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const passwordsMatch = registerData.password === registerData.confirmPassword;

  const isRegisterValid =
    registerData.name.trim() &&
    registerData.email.trim() &&
    registerData.password.trim() &&
    registerData.confirmPassword.trim() &&
    passwordsMatch;

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (loginError) setLoginError("");
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerError) setRegisterError("");
    if (registerSuccess) setRegisterSuccess("");
  };

  // --- SUPABASE LOGIN LOGIC ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      // Use Supabase signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        setPopup({
          show: true,
          type: "error",
          message: error.message,
        });
        return;
      }

      setPopup({
        show: true,
        type: "success",
        message: "Login successful",
      });

      // Update App.jsx state with user data
      setTimeout(() => {
        setUserdet({
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.full_name || "",
          accessToken: data.session.access_token,
        });
      }, 1200);

    } catch (err) {
      setPopup({ show: true, type: "error", message: "Something went wrong" });
    }
  };

  // --- SUPABASE REGISTER LOGIC ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    if (!passwordsMatch) {
      setRegisterError("Passwords do not match");
      return;
    }

    try {
      // Use Supabase signUp with metadata for the name
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.name,
          }
        }
      });

      if (error) {
        setRegisterError(error.message);
        return;
      }

      setRegisterSuccess("Registration successful! Check your email for confirmation.");
      setPopup({
        show: true,
        type: "success",
        message: "Check your email!",
      });

      setIsRegister(false);
      setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setRegisterError("Something went wrong");
    }
  };

  const handleForgotPassword = () => {
    setPopup({
      show: true,
      type: "error",
      message: "Forgot password is not connected yet",
    });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 1800);
  };

  return (
    <div className="auth-page">
      {popup.show && (
        <div className={`auth-popup ${popup.type === "success" ? "auth-popup-success" : "auth-popup-error"}`}>
          <div className="auth-popup-icon">{popup.type === "success" ? "✓" : "✕"}</div>
          <p className="auth-popup-text">{popup.message}</p>
        </div>
      )}

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">{isRegister ? "Create Account" : "Welcome Back"}</h1>
            <p className="auth-subtitle">
              {isRegister ? "Register your account to continue." : "Login with your email and password."}
            </p>
          </div>

          <div className="auth-social-login">
            <button type="button" className="auth-social-btn auth-google-btn">Continue with Google</button>
            <button type="button" className="auth-social-btn auth-facebook-btn">Continue with Facebook</button>
          </div>

          <div className="auth-divider">
            <span className="auth-divider-text">or continue with email</span>
          </div>

          {!isRegister ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="login-email">Email</label>
                <input
                  className="auth-input"
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  id="login-password"
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              {loginError ? <p className="auth-error-text">{loginError}</p> : null}

              <div className="auth-actions">
                <label className="auth-remember">
                  <input className="auth-checkbox" type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="auth-forgot-btn" onClick={handleForgotPassword}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="auth-submit-btn">Login</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="register-name">Full Name</label>
                <input
                  className="auth-input"
                  type="text"
                  id="register-name"
                  name="name"
                  placeholder="Enter your full name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label" htmlFor="register-email">Email</label>
                <input
                  className="auth-input"
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label" htmlFor="register-password">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  id="register-password"
                  name="password"
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label" htmlFor="register-confirm-password">Confirm Password</label>
                <input
                  className={`auth-input ${!passwordsMatch && registerData.confirmPassword ? "auth-input-error" : ""}`}
                  type="password"
                  id="register-confirm-password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              {!passwordsMatch && registerData.confirmPassword ? <p className="auth-error-text">Passwords do not match</p> : null}
              {registerError ? <p className="auth-error-text">{registerError}</p> : null}
              {registerSuccess ? <p className="auth-success-text">{registerSuccess}</p> : null}

              <button type="submit" className="auth-submit-btn" disabled={!isRegisterValid}>
                Register
              </button>
            </form>
          )}

          <div className="auth-toggle">
            <p className="auth-toggle-text">
              {isRegister ? "Already have an account?" : "New user?"}{" "}
              <button type="button" className="auth-toggle-btn" onClick={() => setIsRegister((prev) => !prev)}>
                {isRegister ? "Login" : "Register"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;