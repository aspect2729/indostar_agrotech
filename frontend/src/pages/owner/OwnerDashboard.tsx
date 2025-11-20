/**
 * Owner Dashboard Page
 * 
 * Main dashboard for business owner with inventory management, order management, and analytics.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import Analytics from './Analytics';
import './OwnerDashboard.css';

type DashboardView = 'overview' | 'inventory' | 'orders' | 'analytics';

const OwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const renderView = () => {
    switch (currentView) {
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return (
          <div className="overview-content">
            <section className="welcome-section">
              <h2>Welcome to Your Dashboard</h2>
              <p>Manage your business operations from one central location</p>
            </section>

            <div className="dashboard-cards">
              <div className="dashboard-card" onClick={() => setCurrentView('inventory')}>
                <div className="card-icon">📦</div>
                <h3>Inventory Management</h3>
                <p>Manage stock levels and track inventory</p>
                <button className="card-button">Open →</button>
              </div>

              <div className="dashboard-card" onClick={() => setCurrentView('orders')}>
                <div className="card-icon">🛒</div>
                <h3>Order Management</h3>
                <p>View and manage all customer orders</p>
                <button className="card-button">Open →</button>
              </div>

              <div className="dashboard-card" onClick={() => setCurrentView('analytics')}>
                <div className="card-icon">📊</div>
                <h3>Analytics</h3>
                <p>View sales trends and business insights</p>
                <button className="card-button">Open →</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Indostar E-commerce - Owner Portal</h1>
          <nav className="dashboard-nav">
            <button
              className={currentView === 'overview' ? 'active' : ''}
              onClick={() => setCurrentView('overview')}
            >
              Overview
            </button>
            <button
              className={currentView === 'inventory' ? 'active' : ''}
              onClick={() => setCurrentView('inventory')}
            >
              Inventory
            </button>
            <button
              className={currentView === 'orders' ? 'active' : ''}
              onClick={() => setCurrentView('orders')}
            >
              Orders
            </button>
            <button
              className={currentView === 'analytics' ? 'active' : ''}
              onClick={() => setCurrentView('analytics')}
            >
              Analytics
            </button>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {renderView()}
      </main>
    </div>
  );
};

export default OwnerDashboard;
