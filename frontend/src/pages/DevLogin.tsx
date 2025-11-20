/**
 * Development Login Page (BYPASS GOOGLE OAUTH)
 * 
 * WARNING: This is for development only! Remove in production.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './LoginPage.css';

const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'consumer' | 'distributor' | 'owner'>('consumer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/dev-login', {
        email: email || `${role}@test.com`,
        role
      });

      const { access_token, refresh_token, user_id, email: userEmail, name, role: userRole } = response.data;

      // Store tokens
      localStorage.setItem('indostar_auth_token', access_token);
      localStorage.setItem('indostar_refresh_token', refresh_token);

      // Store user
      const user = {
        _id: user_id,
        googleId: user_id,
        email: userEmail,
        name,
        role: userRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('indostar_user', JSON.stringify(user));

      // Update auth context
      updateUser(user);

      // Redirect based on role
      switch (userRole) {
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (quickRole: 'consumer' | 'distributor' | 'owner') => {
    setRole(quickRole);
    setEmail(`${quickRole}@test.com`);
    
    // Trigger form submission
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header fade-in">
          <div className="company-logo">
            <div className="logo-icon">🌾</div>
          </div>
          <h1 className="company-name">Indostar Agrotech</h1>
          <p className="company-tagline">Development Mode</p>
        </div>

        <div className="login-content">
          <h2 className="login-title slide-in">Dev Login (OAuth Bypass)</h2>
          <p className="login-subtitle slide-in-delay" style={{ color: '#e74c3c' }}>
            ⚠️ For Development Only
          </p>

          {error && (
            <div className="error-message fade-in">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleDevLogin} style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`${role}@test.com`}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              >
                <option value="consumer">Consumer</option>
                <option value="distributor">Distributor</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Logging in...' : 'Dev Login'}
            </button>
          </form>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Quick Login:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => quickLogin('consumer')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🛒 Consumer
              </button>
              <button
                onClick={() => quickLogin('distributor')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                💼 Distributor
              </button>
              <button
                onClick={() => quickLogin('owner')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                👑 Owner
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              <strong>Note:</strong> This bypasses Google OAuth for development. 
              Remove this route before deploying to production!
            </p>
          </div>
        </div>

        <div className="login-footer fade-in-slow">
          <p>© 2024 Indostar Agrotech Private Limited. Development Mode</p>
        </div>
      </div>

      <div className="login-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
};

export default DevLogin;
