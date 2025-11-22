/**
 * Order History Component
 * 
 * Displays user's order history with status tracking.
 * Implements requirements: 2.4, 9.4
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { getOrders } from '../../services';
import { Order, OrderStatus } from '../../types';
import './OrderHistory.css';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Trigger expansion animation after mount
    setTimeout(() => setIsExpanded(true), 10);
  }, []);

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(onClose, 200);
  };

  return (
    <div className={`modal-overlay ${isExpanded ? 'expanded' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isExpanded ? 'expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="order-info-section">
            <div className="info-row">
              <span className="label">Order Number:</span>
              <span className="value">{order.orderNumber}</span>
            </div>
            <div className="info-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${order.status}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Order Date:</span>
              <span className="value">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="items-section">
            <h3>Items</h3>
            {order.items && order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.productName}</span>
                  <span className="item-quantity">Qty: {item.quantity} {item.unit}</span>
                </div>
                <span className="item-price">₹{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="address-section">
            <h3>Delivery Address</h3>
            <p>{order.deliveryAddress.street}</p>
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
            <p>Pincode: {order.deliveryAddress.pincode}</p>
          </div>

          {order.notes && (
            <div className="notes-section">
              <h3>Order Notes</h3>
              <p>{order.notes}</p>
            </div>
          )}

          <div className="totals-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>₹{order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderHistory: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✓';
      case 'processing':
        return '📦';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
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
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const handleReorder = async (order: Order) => {
    // Add items from the order to cart and navigate to cart
    setReorderingOrderId(order._id);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would add items to cart via CartContext
      // For now, we'll just navigate to the product catalog
      navigate('/consumer/products');
    } catch (error) {
      console.error('Failed to reorder:', error);
    } finally {
      setReorderingOrderId(null);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="order-history">
      {/* Header */}
      <header className="history-header fade-in">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="brand-name" onClick={() => navigate('/consumer/home')}>
              Indostar Agrotech
            </h1>
          </div>
          <nav className="header-nav">
            <button className="nav-link" onClick={() => navigate('/consumer/home')}>
              Home
            </button>
            <button className="nav-link" onClick={() => navigate('/consumer/products')}>
              Products
            </button>
            <button className="nav-link" onClick={() => navigate('/consumer/cart')}>
              Cart
            </button>
            <button className="nav-link active">
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

      <div className="history-container">
        <h1 className="page-title slide-in-down">Order History</h1>

        {/* Filter Buttons */}
        <div className="filter-section fade-in">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('processing')}
          >
            Processing
          </button>
          <button
            className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
            onClick={() => setFilterStatus('shipped')}
          >
            Shipped
          </button>
          <button
            className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilterStatus('delivered')}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {filterStatus === 'all'
                ? "You haven't placed any orders yet"
                : `No ${filterStatus} orders found`}
            </p>
            <button
              className="shop-now-btn"
              onClick={() => navigate('/consumer/products')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className="order-card scroll-reveal"
                style={{ animationDelay: `${index * 0.05}s` }}
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
                    <span className="status-icon">{getStatusIcon(order.status)}</span>
                    <span className="status-text">{order.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-date">
                    <span className="icon">📅</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="order-items-preview">
                    <span className="icon">📦</span>
                    <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="order-total">
                    <span className="label">Total:</span>
                    <span className="amount">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-actions">
                    <button
                      className="view-details-btn hover-lift"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        className="reorder-btn hover-lift"
                        onClick={() => handleReorder(order)}
                        disabled={reorderingOrderId === order._id}
                      >
                        {reorderingOrderId === order._id ? (
                          <>
                            <span className="spinner-small"></span>
                            Reordering...
                          </>
                        ) : (
                          'Reorder'
                        )}
                      </button>
                    )}
                  </div>

                  {/* Order Tracking Progress */}
                  <div className="tracking-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          order.status === 'pending' ? 20 :
                          order.status === 'confirmed' ? 40 :
                          order.status === 'processing' ? 60 :
                          order.status === 'shipped' ? 80 :
                          order.status === 'delivered' ? 100 :
                          0
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderHistory;
