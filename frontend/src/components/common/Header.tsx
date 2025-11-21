/**
 * Unified Header Component
 * Amazon-style header with Consumer and Business portal dropdowns
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showConsumerMenu, setShowConsumerMenu] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="unified-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <h1>Indostar</h1>
          <span className="header-tagline">Agrotech</span>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <input 
            type="text" 
            placeholder="Search for products..." 
            className="search-input"
          />
          <button className="search-button">
            <span>🔍</span>
          </button>
        </div>

        {/* Right Side Navigation */}
        <div className="header-nav">
          {/* Consumer Portal Dropdown */}
          <div 
            className="nav-item dropdown"
            onMouseEnter={() => setShowConsumerMenu(true)}
            onMouseLeave={() => setShowConsumerMenu(false)}
          >
            <button className="nav-button">
              <span className="nav-label">Consumer Portal</span>
              <span className="nav-arrow">▼</span>
            </button>
            {showConsumerMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate('/consumer/home')}>
                  🏠 Home
                </div>
                <div className="dropdown-item" onClick={() => navigate('/consumer/products')}>
                  🛍️ Products
                </div>
                <div className="dropdown-item" onClick={() => navigate('/consumer/cart')}>
                  🛒 Cart
                </div>
                <div className="dropdown-item" onClick={() => navigate('/consumer/orders')}>
                  📦 Orders
                </div>
                <div className="dropdown-item" onClick={() => navigate('/consumer/subscriptions')}>
                  🥛 Milk Subscriptions
                </div>
              </div>
            )}
          </div>

          {/* Business Portal Dropdown */}
          <div 
            className="nav-item dropdown"
            onMouseEnter={() => setShowBusinessMenu(true)}
            onMouseLeave={() => setShowBusinessMenu(false)}
          >
            <button className="nav-button">
              <span className="nav-label">Business Portal</span>
              <span className="nav-arrow">▼</span>
            </button>
            {showBusinessMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-section-title">Distributor</div>
                <div className="dropdown-item" onClick={() => navigate('/distributor/dashboard')}>
                  📊 Dashboard
                </div>
                <div className="dropdown-item" onClick={() => navigate('/distributor/bulk-order')}>
                  📦 Bulk Orders
                </div>
                <div className="dropdown-item" onClick={() => navigate('/distributor/order-history')}>
                  📋 Order History
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-section-title">Owner</div>
                <div className="dropdown-item" onClick={() => navigate('/owner/dashboard')}>
                  🏢 Dashboard
                </div>
                <div className="dropdown-item" onClick={() => navigate('/owner/products')}>
                  📦 Products
                </div>
                <div className="dropdown-item" onClick={() => navigate('/owner/inventory')}>
                  📊 Inventory
                </div>
                <div className="dropdown-item" onClick={() => navigate('/owner/orders')}>
                  📋 Orders
                </div>
                <div className="dropdown-item" onClick={() => navigate('/owner/analytics')}>
                  📈 Analytics
                </div>
              </div>
            )}
          </div>

          {/* Account Menu */}
          <div 
            className="nav-item dropdown"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <button className="nav-button">
              <span className="nav-label">
                {user ? `Hello, ${user.name.split(' ')[0]}` : 'Sign In'}
              </span>
              <span className="nav-arrow">▼</span>
            </button>
            {showAccountMenu && (
              <div className="dropdown-menu">
                {user ? (
                  <>
                    <div className="dropdown-item">
                      <strong>{user.email}</strong>
                    </div>
                    <div className="dropdown-item">
                      Role: {user.role}
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={handleLogout}>
                      🚪 Sign Out
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dropdown-item" onClick={() => navigate('/login')}>
                      🔐 Sign In
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/login')}>
                      ✍️ Register
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
