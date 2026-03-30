import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
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
    return (
      formData.name.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      setFormData({
        ...formData,
        profilePicture: file
      });
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const requestBody = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      // Convert profile picture to base64 if exists
      if (formData.profilePicture) {
        const base64 = await convertToBase64(formData.profilePicture);
        requestBody.profilePicture = base64;
      }

      const response = await userAPI.register(requestBody);

      if (response.status === 201) {
        // Success - redirect to login with success message
        navigate('/login', {
          state: {
            message: 'User created successfully! Please login.'
          }
        });
      } else {
        // Handle other status codes
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Registration failed with status ${response.status}`);
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="register-container">
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

      {/* Navigation Header */}
      <header className="register-header">
        <div className="header-content">
          <div className="brand-logo-header">
            <span className="logo-icon">P</span>
            <span className="logo-text">Pensieve</span>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-link">Explore</a>
            <a href="#" className="nav-link">Architects</a>
            <Link to="/login" className="nav-link-accent">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="register-main">
        <div className="register-content">
          {/* Header Text */}
          <div className="register-header-text">
            <h1 className="register-title">
              Begin Your <span className="title-accent">Curation</span>
            </h1>
            <p className="register-subtitle">
              Join an exclusive studio for digital structural clarity.
            </p>
          </div>

          {/* Registration Card */}
          <div className="register-card">
            <form onSubmit={handleSubmit} className="register-form">
              {/* Avatar Upload */}
              <div className="avatar-upload">
                <div className="avatar-upload-wrapper">
                  <div className="avatar-circle">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile preview" className="avatar-preview" />
                    ) : (
                      <svg className="avatar-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      onChange={handleFileChange}
                      accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                      className="avatar-input"
                      aria-label="Upload Profile Picture"
                    />
                  </div>
                  <div className="avatar-upload-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                    </svg>
                  </div>
                </div>
                <div className="avatar-text">
                  <p className="avatar-label">UPLOAD PROFILE PICTURE</p>
                  <p className="avatar-hint">SVG, PNG, or JPG (max. 2MB)</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="form-fields">
                <div className="input-group">
                  <label htmlFor="name" className="input-label">FULL NAME</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    placeholder="Julianne Moore"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="username" className="input-label">USERNAME</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="input-field"
                    placeholder="j.moore_studio"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email" className="input-label">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input-field"
                    placeholder="julianne@pensieve.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="password-row">
                  <div className="input-group">
                    <label htmlFor="password" className="input-label">PASSWORD</label>
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
                  <div className="input-group">
                    <label htmlFor="confirmPassword" className="input-label">CONFIRM</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="input-field"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <span className="validation-error">Passwords do not match</span>
                )}
              </div>

              {/* CTA Button */}
              <div className="submit-container">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              {/* Error Message */}
              {error && <div className="error-message">{error}</div>}

              {/* Footer Link */}
              <div className="signin-link">
                <p>
                  Already have an account?
                  <Link to="/login" className="signin-link-anchor">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="register-footer">
        <div className="footer-content">
          <div className="footer-copyright">
            © 2024 PENSIEVE ARCHITECTURAL CURATOR.
          </div>
          <div className="footer-links">
            <a href="#">PRIVACY</a>
            <a href="#">TERMS</a>
            <a href="#">SUPPORT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Register;
