/**
 * Order Management Component
 * 
 * Allows owner to view and manage all orders from consumers and distributors.
 * Features:
 * - Display all orders from consumers and distributors
 * - Implement order filtering and sorting
 * - Create order status update controls
 * - Show order fulfillment workflow
 */

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getOrderById } from '../../services/orderService';
import {
  Order,
  OrderStatus,
  OrderQueryParams,
} from '../../types';
import './OrderManagement.css';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [userTypeFilter, setUserTypeFilter] = useState<'consumer' | 'distributor' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: OrderQueryParams = {};
      if (statusFilter) params.status = statusFilter;
      if (userTypeFilter) params.userType = userTypeFilter;

      const response = await getOrders(params);
      setOrders(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      setError(null);

      await updateOrderStatus(orderId, { status: newStatus });
      
      // Reload orders
      await loadOrders();
      
      // Update selected order if it's open
      if (selectedOrder && selectedOrder._id === orderId) {
        const updatedOrder = await getOrderById(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const openOrderDetails = async (order: Order) => {
    try {
      const fullOrder = await getOrderById(order._id);
      setSelectedOrder(fullOrder);
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      processing: '#9c27b0',
      shipped: '#00bcd4',
      delivered: '#4caf50',
      cancelled: '#f44336',
    };
    return colors[status];
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const workflow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return workflow[currentStatus];
  };

  // Filter and sort orders
  const filteredOrders = (orders || [])
    .filter(order => {
      const matchesSearch = !searchTerm || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'total') {
        comparison = a.total - b.total;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate statistics
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    processing: orders?.filter(o => o.status === 'processing' || o.status === 'confirmed').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
    totalRevenue: (orders || [])
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
  };

  if (loading) {
    return (
      <div className="order-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="order-header">
        <h2>Order Management</h2>
        <button onClick={loadOrders} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="order-stats">
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card pending">
          <h4>Pending</h4>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card processing">
          <h4>Processing</h4>
          <p className="stat-value">{stats.processing}</p>
        </div>
        <div className="stat-card shipped">
          <h4>Shipped</h4>
          <p className="stat-value">{stats.shipped}</p>
        </div>
        <div className="stat-card delivered">
          <h4>Delivered</h4>
          <p className="stat-value">{stats.delivered}</p>
        </div>
        <div className="stat-card revenue">
          <h4>Total Revenue</h4>
          <p className="stat-value">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="order-filters">
        <input
          type="text"
          placeholder="Search by order number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={userTypeFilter}
          onChange={(e) => setUserTypeFilter(e.target.value as any)}
          className="filter-select"
        >
          <option value="">All User Types</option>
          <option value="consumer">Consumer</option>
          <option value="distributor">Distributor</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="filter-select"
        >
          <option value="date">Sort by Date</option>
          <option value="total">Sort by Total</option>
          <option value="status">Sort by Status</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="sort-btn"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer Type</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-number">{order.orderNumber}</td>
                  <td className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="user-type">
                    <span className={`type-badge ${order.userType}`}>
                      {order.userType}
                    </span>
                  </td>
                  <td className="items-count">{order.items?.length || 0} items</td>
                  <td className="order-total">₹{order.total.toFixed(2)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="view-btn"
                    >
                      View
                    </button>
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status)!)}
                        disabled={updating}
                        className="next-status-btn"
                      >
                        → {getNextStatus(order.status)}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - {selectedOrder.orderNumber}</h3>
              <button onClick={closeModal} className="close-btn">✕</button>
            </div>

            <div className="modal-body">
              {/* Order Info */}
              <div className="order-info-section">
                <div className="info-row">
                  <span className="label">Order Date:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">Customer Type:</span>
                  <span className={`type-badge ${selectedOrder.userType}`}>
                    {selectedOrder.userType}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Current Status:</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Payment Status:</span>
                  <span className={`payment-badge ${selectedOrder.paymentStatus}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="address-section">
                <h4>Delivery Address</h4>
                <p>{selectedOrder.deliveryAddress.street}</p>
                <p>
                  {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                </p>
              </div>

              {/* Order Items */}
              <div className="items-section">
                <h4>Order Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>₹{item.pricePerUnit.toFixed(2)}</td>
                        <td>₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="summary-section">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>₹{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>₹{selectedOrder.shippingCost.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="status-controls">
                <h4>Update Order Status</h4>
                <div className="status-buttons">
                  {ORDER_STATUSES.filter(s => s !== selectedOrder.status).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                      disabled={updating}
                      className="status-update-btn"
                      style={{ borderColor: getStatusColor(status) }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="notes-section">
                  <h4>Notes</h4>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
