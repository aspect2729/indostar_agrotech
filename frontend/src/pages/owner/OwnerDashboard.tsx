/**
 * Owner Dashboard Page
 * 
 * Main dashboard for business owner with inventory management, order management, and analytics.
 * Updated with new design system: NavigationDrawer, TopHeader, and card-based layout.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts';
import './OwnerDashboard.css';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      id: 'products',
      icon: '🛍️',
      title: 'Product Management',
      description: 'Add and manage your product catalog',
      route: '/owner/products',
    },
    {
      id: 'inventory',
      icon: '📦',
      title: 'Inventory Management',
      description: 'Manage stock levels and track inventory',
      route: '/owner/inventory',
    },
    {
      id: 'orders',
      icon: '🛒',
      title: 'Order Management',
      description: 'View and manage all customer orders',
      route: '/owner/orders',
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Analytics',
      description: 'View sales trends and business insights',
      route: '/owner/analytics',
    },
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <Layout>
      <div className="owner-dashboard">
        <section className="welcome-section">
          <h2>Welcome, {user?.name}</h2>
          <p>Manage your business operations from one central location</p>
        </section>

        <div className="dashboard-cards">
          {dashboardCards.map((card) => (
            <article
              key={card.id}
              className="dashboard-card"
              onClick={() => handleCardClick(card.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card.route);
                }
              }}
            >
              <div className="dashboard-card__icon">{card.icon}</div>
              <h3 className="dashboard-card__title">{card.title}</h3>
              <p className="dashboard-card__description">{card.description}</p>
              <button className="dashboard-card__button" aria-hidden="true">
                Open →
              </button>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
