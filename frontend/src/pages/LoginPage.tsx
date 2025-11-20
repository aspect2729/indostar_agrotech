/**
 * Login Page Component
 * 
 * Provides two authentication paths:
 * 1. Login as Customer
 * 2. Login as Owner/Distributor
 * 
 * Integrates Google OAuth and redirects based on user role.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initiateGoogleAuth } from '../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, isLoading, error } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state && !isAuthenticating) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = async (code: string, state: string) => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      await login(code, state);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(errorMessage);
      setIsAuthenticating(false);
    }
  };

  /**
   * Redirect user based on role
   */
  const redirectBasedOnRole = (role: string) => {
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
  };

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

          {/* Error Message */}
          {(authError || error) && (
            <div className="error-message fade-in">
              <span className="error-icon">⚠️</span>
              <span>{authError || error}</span>
            </div>
          )}

          {/* Login Cards */}
          <div className="login-options">
            {/* Customer Login */}
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
                <span className="button-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </span>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Business Login */}
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
                <span className="button-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </span>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="login-features fade-in-slow">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure Google Authentication</span>
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
