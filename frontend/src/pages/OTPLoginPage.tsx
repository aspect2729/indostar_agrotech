/**
 * OTP Login Page
 * Mobile number + OTP authentication
 */

import React, { useState, useEffect } from 'react';
import { sendOTP, verifyOTP, resendOTP } from '../services/otpAuthService';
import './OTPLoginPage.css';

type LoginStep = 'phone' | 'otp' | 'name';

const OTPLoginPage: React.FC = () => {
  
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'consumer' | 'distributor' | 'owner'>('consumer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOTP, setDevOTP] = useState<string | null>(null); // For development
  const [timer, setTimer] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendOTP(phone);
      
      if (response.success) {
        setStep('otp');
        setTimer(60); // 60 seconds before resend
        
        // In development, show OTP
        if (response.otp) {
          setDevOTP(response.otp);
        }
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate OTP
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP({
        phone,
        otp,
        name: name || undefined,
        role
      });

      // If new user and name not provided, ask for name
      if (response.is_new_user && !name) {
        setStep('name');
        setIsLoading(false);
        return;
      }

      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.user_id,
        phone: response.phone,
        name: response.name,
        role: response.role,
        email: `${response.phone}@indostar.app`
      }));

      // Redirect based on role
      const redirectPath = response.role === 'consumer' ? '/consumer/home' :
                          response.role === 'distributor' ? '/distributor/dashboard' :
                          response.role === 'owner' ? '/owner/dashboard' : '/';
      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify OTP');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await resendOTP(phone);
      
      if (response.success) {
        setTimer(60);
        if (response.otp) {
          setDevOTP(response.otp);
        }
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || name.length < 2) {
      setError('Please enter your full name');
      return;
    }

    // Retry verification with name
    await handleVerifyOTP(e);
  };

  return (
    <div className="otp-login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header fade-in">
          <div className="company-logo">
            <div className="logo-icon">🌾</div>
          </div>
          <h1 className="company-name">Indostar Agrotech</h1>
          <p className="company-tagline">Pure. Organic. Authentic.</p>
        </div>

        {/* Content */}
        <div className="login-content">
          <h2 className="login-title">Welcome</h2>
          <p className="login-subtitle">Login with your mobile number</p>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Development OTP Display */}
          {devOTP && (
            <div className="dev-otp-display">
              <strong>Development Mode - Your OTP:</strong> {devOTP}
            </div>
          )}

          {/* Step 1: Enter Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="auth-form slide-in">
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="phone-input">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                    autoFocus
                  />
                </div>
                <small>We'll send you a 6-digit OTP</small>
              </div>

              <div className="form-group">
                <label>I am a</label>
                <div className="role-selector">
                  <label className={`role-option ${role === 'consumer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="consumer"
                      checked={role === 'consumer'}
                      onChange={(e) => setRole(e.target.value as any)}
                    />
                    <div className="role-card">
                      <span className="role-icon">🛒</span>
                      <span className="role-label">Customer</span>
                    </div>
                  </label>
                  <label className={`role-option ${role === 'distributor' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="distributor"
                      checked={role === 'distributor'}
                      onChange={(e) => setRole(e.target.value as any)}
                    />
                    <div className="role-card">
                      <span className="role-icon">💼</span>
                      <span className="role-label">Distributor</span>
                    </div>
                  </label>
                  <label className={`role-option ${role === 'owner' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="owner"
                      checked={role === 'owner'}
                      onChange={(e) => setRole(e.target.value as any)}
                    />
                    <div className="role-card">
                      <span className="role-icon">👑</span>
                      <span className="role-label">Owner</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || phone.length !== 10}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="auth-form slide-in">
              <div className="step-info">
                <p>OTP sent to <strong>+91 {phone}</strong></p>
                <button
                  type="button"
                  className="change-number-btn"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setDevOTP(null);
                  }}
                >
                  Change number
                </button>
              </div>

              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="otp-input"
                  required
                  autoFocus
                />
                <small>Valid for 10 minutes</small>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="resend-section">
                {timer > 0 ? (
                  <p>Resend OTP in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Step 3: Enter Name (for new users) */}
          {step === 'name' && (
            <form onSubmit={handleSubmitName} className="auth-form slide-in">
              <div className="step-info">
                <p>Welcome! Please tell us your name</p>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || !name}
              >
                {isLoading ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Features */}
          <div className="login-features fade-in-slow">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure OTP Login</span>
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

      {/* Background */}
      <div className="login-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
};

export default OTPLoginPage;
