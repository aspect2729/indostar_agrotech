/**
 * Distributor Dashboard Component
 * 
 * Main dashboard for distributors with bulk ordering capabilities.
 * Displays bulk product catalog with wholesale pricing, quick order functionality,
 * and order history summary.
 * 
 * Implements requirements: 2.1, 2.4
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { getProducts, getOrders } from '../../services';
import { Product, Order } from '../../types';
import './DistributorDashboard.css';

const DistributorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load bulk products (jaggery and oil with inter-state delivery)
      const productsResponse = await getProducts({
        limit: 8,
        isActive: true
      });
      
      // Filter for bulk products (jaggery and oil)
      const bulkProducts = productsResponse.data.filter(
        p => p.category === 'jaggery' || p.category === 'oil'
      );
      setProducts(bulkProducts);

      // Load recent orders
      const ordersResponse = await getOrders({
        limit: 5
      });
      setRecentOrders(ordersResponse.data);

      // Calculate stats
      const allOrders = ordersResponse.data;
      setStats({
        totalOrders: ordersResponse.total,
        pendingOrders: allOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
        completedOrders: allOrders.filter(o => o.status === 'delivered').length
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOrder = () => {
    navigate('/distributor/bulk-order');
  };

  const handleViewAllProducts = () => {
    navigate('/distributor/products');
  };

  const handleViewOrderHistory = () => {
    navigate('/distributor/orders');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/distributor/bulk-order?product=${productId}`);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/distributor/orders/${orderId}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#3498db';
      case 'processing':
        return '#9b59b6';
      case 'shipped':
        return '#1abc9c';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="distributor-dashboard">
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="brand-name">Indostar Agrotech</h1>
            <p className="portal-label">Distributor Portal</p>
          </div>
          <nav className="header-nav">
            <button className="nav-link active">
              Dashboard
            </button>
            <button className="nav-link" onClick={handleViewAllProducts}>
              Products
            </button>
            <button className="nav-link" onClick={handleViewOrderHistory}>
              Orders
            </button>
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Welcome Section */}
        <section className="welcome-section slide-in-up">
          <h2>Welcome back, {user?.name}!</h2>
          <p>Manage your bulk orders and track deliveries</p>
        </section>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card hover-lift" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card hover-lift" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pendingOrders}</h3>
                <p>Pending Orders</p>
              </div>
            </div>
            <div className="stat-card hover-lift" style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.completedOrders}</h3>
                <p>Completed Orders</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Order Button */}
        <section className="quick-order-section">
          <button className="quick-order-btn hover-scale" onClick={handleQuickOrder}>
            <span className="btn-icon">⚡</span>
            <span className="btn-text">Place Quick Order</span>
          </button>
        </section>

        {/* Bulk Products Catalog */}
        <section className="products-section">
          <div className="section-header">
            <h2>Bulk Products - Wholesale Pricing</h2>
            <button className="view-all-btn" onClick={handleViewAllProducts}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="product-card skeleton-card">
                  <div className="skeleton skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-price"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <p>No bulk products available at the moment</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="product-card hover-lift scroll-reveal"
                  onClick={() => handleProductClick(product._id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="product-image-placeholder">📦</div>
                    )}
                    {product.interStateDelivery && (
                      <span className="delivery-badge">🚚 Inter-state</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">
                      {product.category.replace('_', ' ').toUpperCase()}
                    </p>
                    <div className="product-pricing">
                      <div className="price-row">
                        <span className="price-label">Wholesale:</span>
                        <span className="wholesale-price">
                          ₹{product.price.distributor}/{product.unit}
                        </span>
                      </div>
                      <div className="price-row retail-price">
                        <span className="price-label">Retail:</span>
                        <span className="retail-price">
                          ₹{product.price.consumer}/{product.unit}
                        </span>
                      </div>
                    </div>
                    <button
                      className="order-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product._id);
                      }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order History Summary */}
        <section className="orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <button className="view-all-btn" onClick={handleViewOrderHistory}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="orders-list">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="order-card skeleton-card">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📋</div>
              <p>No orders yet. Place your first bulk order!</p>
              <button className="cta-btn" onClick={handleQuickOrder}>
                Place Order
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {recentOrders.map((order, index) => (
                <div
                  key={order._id}
                  className="order-card hover-lift"
                  onClick={() => handleOrderClick(order._id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="order-header">
                    <div className="order-number">
                      <span className="label">Order #</span>
                      <span className="value">{order.orderNumber}</span>
                    </div>
                    <div
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="order-details">
                    <div className="order-info">
                      <span className="info-label">Items:</span>
                      <span className="info-value">{order.items?.length || 0}</span>
                    </div>
                    <div className="order-info">
                      <span className="info-label">Total:</span>
                      <span className="info-value">₹{order.total.toFixed(2)}</span>
                    </div>
                    <div className="order-info">
                      <span className="info-label">Date:</span>
                      <span className="info-value">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="order-items-preview">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="item-preview">
                        {item.productName} ({item.quantity} {item.unit})
                      </span>
                    ))}
                    {order.items && order.items.length > 2 && (
                      <span className="more-items">+{order.items.length - 2} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DistributorDashboard;
