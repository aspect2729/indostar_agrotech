/**
 * Login Page Component
 * 
 * Provides two authentication paths:
 * 1. Login as Customer
 * 2. Login as Owner/Distributor
 * 
 * Integrates Google OAuth and redirects based on user role.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initiateGoogleAuth, loginWithEmail, registerWithEmail } from '../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, isLoading, error } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'consumer' as 'consumer' | 'distributor' | 'owner'
  });

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      await login(code, state);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(errorMessage);
      setIsAuthenticating(false);
    }
  }, [login]);

  /**
   * Redirect user based on role
   */
  const redirectBasedOnRole = useCallback((role: string) => {
    switch (role) {
      case 'consumer':
        navigate('/consumer/home');
        break;
      case 'distributor':
        navigate('/distributor/dashboard');
        break;
      case 'owner':
        navigate('/owner/dashboard');
        break;
      default:
        navigate('/');
    }
  }, [navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state && !isAuthenticating) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams, handleOAuthCallback, isAuthenticating]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user, redirectBasedOnRole]);

  /**
   * Initiate Google OAuth flow
   */
  const handleGoogleLogin = async (userType: 'customer' | 'business') => {
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const redirectUri = `${window.location.origin}/login`;
      const { authUrl } = await initiateGoogleAuth(redirectUri);
      
      // Store user type preference in session storage
      sessionStorage.setItem('indostar_login_type', userType);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate login';
      setAuthError(errorMessage);
      setIsAuthenticating(false);
    }
  };

  /**
   * Handle email/password login
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validate required fields
    if (!formData.email || !formData.password) {
      setAuthError('Please enter email and password');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAuthError('Please enter a valid email address');
      return;
    }

    setIsAuthenticating(true);

    try {
      const response = await loginWithEmail(formData.email, formData.password);
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.user_id,
        email: response.email,
        name: response.name,
        role: response.role
      }));
      
      // Hard redirect to force page reload and pick up auth state
      const redirectPath = response.role === 'consumer' ? '/consumer/home' :
                          response.role === 'distributor' ? '/distributor/dashboard' :
                          response.role === 'owner' ? '/owner/dashboard' : '/';
      window.location.href = redirectPath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setAuthError(errorMessage);
      setIsAuthenticating(false);
    }
  };

  /**
   * Handle email/password registration
   */
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validate required fields
    if (!formData.email || !formData.password || !formData.name) {
      setAuthError('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAuthError('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setAuthError('Password must be at least 8 characters long');
      return;
    }

    setIsAuthenticating(true);

    try {
      const response = await registerWithEmail({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined
      });
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.user_id,
        email: response.email,
        name: response.name,
        role: response.role
      }));
      
      // Hard redirect to force page reload and pick up auth state
      const redirectPath = response.role === 'consumer' ? '/consumer/home' :
                          response.role === 'distributor' ? '/distributor/dashboard' :
                          response.role === 'owner' ? '/owner/dashboard' : '/';
      window.location.href = redirectPath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(errorMessage);
      setIsAuthenticating(false);
    }
  };

  if (isLoading || isAuthenticating) {
    return (
      <div className="login-page">
        <div className="login-loading">
          <div className="spinner"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Company Branding */}
        <div className="login-header fade-in">
          <div className="company-logo">
            <div className="logo-icon">🌾</div>
          </div>
          <h1 className="company-name">Indostar Agrotech</h1>
          <p className="company-tagline">Pure. Organic. Authentic.</p>
        </div>

        {/* Login Options */}
        <div className="login-content">
          <h2 className="login-title slide-in">Welcome Back</h2>
          <p className="login-subtitle slide-in-delay">Choose how you'd like to continue</p>

          {/* Auth Mode Toggle */}
          <div className="auth-mode-toggle">
            <button
              className={`mode-button ${authMode === 'google' ? 'active' : ''}`}
              onClick={() => setAuthMode('google')}
            >
              Google
            </button>
            <button
              className={`mode-button ${authMode === 'email' ? 'active' : ''}`}
              onClick={() => setAuthMode('email')}
            >
              Email/Phone
            </button>
          </div>

          {/* Error Message */}
          {(authError || error) && (
            <div className="error-message fade-in">
              <span className="error-icon">⚠️</span>
              <span>{authError || error}</span>
            </div>
          )}

          {authMode === 'google' ? (
            /* Google Login Cards */
            <div className="login-options">
              <div className="login-card slide-up">
                <div className="card-icon">🛒</div>
                <h3 className="card-title">Shop as Customer</h3>
                <p className="card-description">
                  Browse our organic products and place orders for home delivery
                </p>
                <button
                  className="login-button customer-button"
                  onClick={() => handleGoogleLogin('customer')}
                  disabled={isAuthenticating}
                >
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="login-card slide-up-delay">
                <div className="card-icon">💼</div>
                <h3 className="card-title">Business Portal</h3>
                <p className="card-description">
                  Access distributor orders or manage inventory as owner
                </p>
                <button
                  className="login-button business-button"
                  onClick={() => handleGoogleLogin('business')}
                  disabled={isAuthenticating}
                >
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          ) : (
            /* Email/Password Form */
            <div className="email-auth-form">
              <div className="form-toggle">
                <button
                  className={!isRegisterMode ? 'active' : ''}
                  onClick={() => setIsRegisterMode(false)}
                >
                  Login
                </button>
                <button
                  className={isRegisterMode ? 'active' : ''}
                  onClick={() => setIsRegisterMode(true)}
                >
                  Register
                </button>
              </div>

              <form onSubmit={isRegisterMode ? handleEmailRegister : handleEmailLogin}>
                {isRegisterMode && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                      required
                    >
                      <option value="consumer">Consumer</option>
                      <option value="distributor">Distributor</option>
                      <option value="owner">Owner</option>
                    </select>
                  </>
                )}
                
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                
                {isRegisterMode && (
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                )}
                
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={8}
                />
                
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Please wait...' : (isRegisterMode ? 'Register' : 'Login')}
                </button>
              </form>
            </div>
          )}

          {/* Features */}
          <div className="login-features fade-in-slow">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure Authentication</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>100% Organic Products</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer fade-in-slow">
          <p>© 2024 Indostar Agrotech Private Limited. All rights reserved.</p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="login-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
};

export default LoginPage;
