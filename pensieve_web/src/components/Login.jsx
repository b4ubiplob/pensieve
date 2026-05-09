import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import './Login.css';

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const isFormValid = () => {
    return formData.username.trim() !== '' && formData.password.trim() !== '';
  };

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }

    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'oauth_failed') {
      setError('Google sign-in failed. Please try again.');
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Wrong credentials, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8083/oauth2/authorization/google';
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="login-container">
      {/* Theme Toggle */}
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <main className="main-content">
        {/* Background Elements */}
        <div className="background-elements">
          <div className="blur-orb blur-orb-1"></div>
          <div className="blur-orb blur-orb-2"></div>
          <div className="blur-gradient"></div>
        </div>

        {/* Layout Container */}
        <div className="layout-container">
          {/* Branding/Visual Side */}
          <div className="branding-side">
            <div className="branding-content">
              <div className="brand-logo">PENSIEVE</div>
              <h1 className="brand-headline">
                The <span className="brand-highlight">Architectural</span> Void of Thought.
              </h1>
              <p className="brand-description">
                Enter a space designed for clarity, structural precision, and the quiet authority of focused intent.
              </p>
            </div>
            <div className="status-indicator">
              <span className="status-pulse"></span>
              <span className="status-text">System Status: Optimal</span>
            </div>
            <div className="decorative-image">
              <img
                alt="Abstract architectural curves and shadows"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg-KWpBgmS1S3VyKMc-my1N7w0WkNA6VImf-sSALhLux_63T-nXwvIJHgynqR1G6Fj5OX8BnaS5b2Ve34BZKYQGBSP8npGv8dckrsD62SjxYD7KbSZRCnCmMSeu9WrwzBNhahP3bT8cBBoGFhwPlG5TQfYqOIMkaeo7qMKfJ0nRx1ZvuMLeeIAz1Pkz9KFDdt5PNhZ8ConAo-DGBlwXkVthNVZ3wj8gLskth_SB_FA0UMsRDQZg1DA-XCFeaZv9sBwKeLolElOWi0"
              />
            </div>
          </div>

          {/* Login Form Side */}
          <div className="form-side">
            <div className="form-side-mobile-header">
              <div className="brand-logo-mobile">PENSIEVE</div>
            </div>

            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">Welcome back</h2>
                <p className="form-subtitle">Continue your journey into the void.</p>
              </div>

              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              {/* Google Login */}
              <button
                type="button"
                className="google-button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.184l-3.57-2.258c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                <span className="google-text">Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">or</span>
                <div className="divider-line"></div>
              </div>

              {/* Form */}
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="username" className="input-label">Email Address</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="input-field"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <div className="password-header">
                    <label htmlFor="password" className="input-label">Password</label>
                    <a href="#" className="forgot-link">Forgot?</a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="submit-container">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>

              {error && <div className="error-message">{error}</div>}

              <div className="signup-link">
                <p>
                  New to the architecture? <Link to="/register" className="signup-link-anchor">Join the Beta</Link>
                </p>
              </div>
            </div>

            <div className="mobile-status">
              <div className="mobile-status-badge">
                <span className="status-pulse"></span>
                <span className="mobile-status-text">System Status: Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">Pensieve.</div>
        <div className="footer-links">
          <a href="#">Philosophy</a>
          <a href="#">Manifesto</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
        <div className="footer-copyright">
          © 2024 Pensieve. The Architectural Void.
        </div>
      </footer>
    </div>
  );
}

export default Login;
