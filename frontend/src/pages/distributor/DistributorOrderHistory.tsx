/**
 * Distributor Order History Component
 * 
 * Displays distributor's order history with status tracking,
 * reorder functionality, and detailed order views.
 * 
 * Implements requirements: 2.3, 2.4, 9.4
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrders, getOrderById, createOrder } from '../../services';
import { Order, OrderStatus, CreateOrderRequest } from '../../types';
import NavigationDrawer from '../../components/layout/NavigationDrawer';
import TopHeader from '../../components/layout/TopHeader';
import './DistributorOrderHistory.css';

interface OrderDetailViewProps {
  order: Order;
  onClose: () => void;
  onReorder: (order: Order) => void;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onClose, onReorder }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Payment Status:</span>
              <span className={`payment-badge ${order.paymentStatus}`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="items-section">
            <h3>Order Items</h3>
            <div className="items-table">
              <div className="table-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Price/Unit</span>
                <span>Total</span>
              </div>
              {order.items.map((item, index) => (
                <div key={index} className="table-row">
                  <span className="item-name">{item.productName}</span>
                  <span className="item-quantity">{item.quantity} {item.unit}</span>
                  <span className="item-price">₹{item.pricePerUnit.toFixed(2)}</span>
                  <span className="item-total">₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="address-section">
            <h3>Delivery Address</h3>
            <div className="address-card">
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
              <p>Pincode: {order.deliveryAddress.pincode}</p>
            </div>
          </div>

          {order.notes && (
            <div className="notes-section">
              <h3>Order Notes</h3>
              <p className="notes-text">{order.notes}</p>
            </div>
          )}

          <div className="totals-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>GST (18%):</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>₹{order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total:</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="reorder-btn" onClick={() => onReorder(order)}>
              🔄 Reorder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DistributorOrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [reordering, setReordering] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deliveriesPaused, setDeliveriesPaused] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // If orderId is in URL, load and display that order
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
      } else {
        loadOrderById(orderId);
      }
    }
  }, [orderId, orders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderById = async (id: string) => {
    try {
      const order = await getOrderById(id);
      setSelectedOrder(order);
    } catch (error) {
      console.error('Failed to load order:', error);
    }
  };

  const handleReorder = async (order: Order) => {
    if (reordering) return;
    
    const confirmed = window.confirm(
      'This will create a new order with the same items and delivery address. Continue?'
    );
    
    if (!confirmed) return;

    setReordering(true);
    try {
      const orderData: CreateOrderRequest = {
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryAddress: order.deliveryAddress,
        notes: 'Reorder from ' + order.orderNumber
      };

      const newOrder = await createOrder(orderData);
      
      // Close modal and navigate to new order
      setSelectedOrder(null);
      navigate(`/distributor/orders/${newOrder._id}`, {
        state: { newOrder: true, reorder: true }
      });
    } catch (error) {
      console.error('Failed to reorder:', error);
      alert('Failed to create reorder. Please try again or place a new order manually.');
    } finally {
      setReordering(false);
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
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getTrackingProgress = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 40;
      case 'processing':
        return 60;
      case 'shipped':
        return 80;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="distributor-order-history">
      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        deliveriesPaused={deliveriesPaused}
        onTogglePause={setDeliveriesPaused}
        appVersion="1.0.0"
      />

      {/* Top Header */}
      <TopHeader
        title="Order History"
        onMenuClick={() => setDrawerOpen(true)}
        notificationCount={0}
        cartItemCount={0}
        isMenuOpen={drawerOpen}
      />

      <div className="history-container">
        <div className="page-header slide-in-down">
          <h1 className="page-title">Order History</h1>
          <button
            className="new-order-btn hover-scale"
            onClick={() => navigate('/distributor/bulk-order')}
          >
            + New Order
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="filter-section fade-in">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders ({orders.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('confirmed')}
          >
            Confirmed ({orders.filter(o => o.status === 'confirmed').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('processing')}
          >
            Processing ({orders.filter(o => o.status === 'processing').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
            onClick={() => setFilterStatus('shipped')}
          >
            Shipped ({orders.filter(o => o.status === 'shipped').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilterStatus('delivered')}
          >
            Delivered ({orders.filter(o => o.status === 'delivered').length})
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
                ? "You haven't placed any bulk orders yet"
                : `No ${filterStatus} orders found`}
            </p>
            <button
              className="shop-now-btn"
              onClick={() => navigate('/distributor/bulk-order')}
            >
              Place Bulk Order
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className="order-card scroll-reveal hover-lift"
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
                  <div className="order-info-grid">
                    <div className="info-item">
                      <span className="icon">📅</span>
                      <div className="info-content">
                        <span className="info-label">Order Date</span>
                        <span className="info-value">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="icon">📦</span>
                      <div className="info-content">
                        <span className="info-label">Items</span>
                        <span className="info-value">
                          {order.items?.length || 0} product{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="icon">📍</span>
                      <div className="info-content">
                        <span className="info-label">Destination</span>
                        <span className="info-value">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="icon">💰</span>
                      <div className="info-content">
                        <span className="info-label">Total Amount</span>
                        <span className="info-value amount">₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="item-tag">
                        {item.productName} ({item.quantity} {item.unit})
                      </span>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <span className="more-items">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="order-footer">
                  {/* Order Tracking Progress */}
                  <div className="tracking-progress">
                    <div className="progress-label">Order Progress</div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${getTrackingProgress(order.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                    <button
                      className="reorder-btn"
                      onClick={() => handleReorder(order)}
                      disabled={reordering}
                    >
                      🔄 Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailView
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            // Clear orderId from URL if present
            if (orderId) {
              navigate('/distributor/orders');
            }
          }}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
};

export default DistributorOrderHistory;
