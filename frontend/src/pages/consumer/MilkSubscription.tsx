/**
 * Milk Subscription Management Page
 * Allows consumers to manage their milk subscriptions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMySubscriptions,
  adjustDailyQuantity,
  getMonthlyBill,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  Subscription,
  MonthlyBill
} from '../../services/subscriptionService';
import './MilkSubscription.css';

const MilkSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [monthlyBill, setMonthlyBill] = useState<MonthlyBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [adjustmentDate, setAdjustmentDate] = useState('');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [billMonth, setBillMonth] = useState('');

  useEffect(() => {
    loadSubscriptions();
    
    // Set default bill month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setBillMonth(currentMonth);
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await getMySubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustQuantity = async () => {
    if (!selectedSubscription || !adjustmentDate || adjustmentQuantity === '') {
      setError('Please fill in all fields');
      return;
    }

    try {
      await adjustDailyQuantity(selectedSubscription._id, {
        date: adjustmentDate,
        quantity_liters: parseFloat(adjustmentQuantity),
        notes: adjustmentNotes || undefined
      });
      
      setShowAdjustModal(false);
      setAdjustmentDate('');
      setAdjustmentQuantity('');
      setAdjustmentNotes('');
      loadSubscriptions();
      alert('Quantity adjusted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to adjust quantity');
    }
  };

  const handleViewBill = async (subscription: Subscription) => {
    try {
      const bill = await getMonthlyBill(subscription._id, billMonth);
      setMonthlyBill(bill);
      setShowBillModal(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load monthly bill');
    }
  };

  const handlePause = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to pause this subscription?')) return;
    
    try {
      await pauseSubscription(subscriptionId);
      loadSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to pause subscription');
    }
  };

  const handleResume = async (subscriptionId: string) => {
    try {
      await resumeSubscription(subscriptionId);
      loadSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resume subscription');
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) return;
    
    try {
      await cancelSubscription(subscriptionId);
      loadSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel subscription');
    }
  };

  const getMinAdjustmentDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="milk-subscription-page">
        <div className="loading">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="milk-subscription-page">
      <div className="page-header">
        <h1>🥛 My Milk Subscriptions</h1>
        <button className="btn-primary" onClick={() => navigate('/consumer/products?category=milk')}>
          + New Subscription
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🥛</div>
          <h2>No Active Subscriptions</h2>
          <p>Start a milk subscription for daily fresh delivery</p>
          <button className="btn-primary" onClick={() => navigate('/consumer/products?category=milk')}>
            Browse Milk Products
          </button>
        </div>
      ) : (
        <div className="subscriptions-grid">
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className={`subscription-card ${subscription.status}`}>
              <div className="subscription-header">
                <h3>{subscription.product_name}</h3>
                <span className={`status-badge ${subscription.status}`}>
                  {subscription.status}
                </span>
              </div>

              <div className="subscription-details">
                <div className="detail-row">
                  <span className="label">Daily Quantity:</span>
                  <span className="value">{subscription.default_quantity_liters}L</span>
                </div>
                <div className="detail-row">
                  <span className="label">Price per Liter:</span>
                  <span className="value">₹{subscription.price_per_liter}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Delivery Time:</span>
                  <span className="value">{subscription.delivery_time_preference}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Start Date:</span>
                  <span className="value">{subscription.start_date}</span>
                </div>
                {subscription.skip_days.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Skip Days:</span>
                    <span className="value">{subscription.skip_days.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="subscription-stats">
                <div className="stat">
                  <div className="stat-value">{subscription.total_delivered_liters}L</div>
                  <div className="stat-label">Total Delivered</div>
                </div>
                <div className="stat">
                  <div className="stat-value">₹{subscription.total_amount.toFixed(2)}</div>
                  <div className="stat-label">Total Amount</div>
                </div>
              </div>

              <div className="subscription-actions">
                {subscription.status === 'active' && (
                  <>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setShowAdjustModal(true);
                      }}
                    >
                      Adjust Quantity
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        handleViewBill(subscription);
                      }}
                    >
                      View Bill
                    </button>
                    <button
                      className="btn-warning"
                      onClick={() => handlePause(subscription._id)}
                    >
                      Pause
                    </button>
                  </>
                )}
                {subscription.status === 'paused' && (
                  <>
                    <button
                      className="btn-success"
                      onClick={() => handleResume(subscription._id)}
                    >
                      Resume
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        handleViewBill(subscription);
                      }}
                    >
                      View Bill
                    </button>
                  </>
                )}
                {subscription.status !== 'cancelled' && (
                  <button
                    className="btn-danger"
                    onClick={() => handleCancel(subscription._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjust Quantity Modal */}
      {showAdjustModal && selectedSubscription && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust Daily Quantity</h2>
              <button className="close-btn" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="info-text">
                ⚠️ Adjustments must be made at least 1 day in advance
              </p>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={adjustmentDate}
                  onChange={(e) => setAdjustmentDate(e.target.value)}
                  min={getMinAdjustmentDate()}
                />
              </div>
              <div className="form-group">
                <label>Quantity (Liters)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder="Enter 0 to skip delivery"
                />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAdjustModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAdjustQuantity}>
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Bill Modal */}
      {showBillModal && monthlyBill && (
        <div className="modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="modal-content bill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Monthly Bill - {monthlyBill.month}</h2>
              <button className="close-btn" onClick={() => setShowBillModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="bill-header">
                <h3>{monthlyBill.product_name}</h3>
                <p>Period: {monthlyBill.start_date} to {monthlyBill.end_date}</p>
              </div>

              <div className="bill-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Quantity</th>
                      <th>Price/L</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBill.deliveries.map((delivery, index) => (
                      <tr key={index}>
                        <td>{delivery.date}</td>
                        <td>{delivery.day}</td>
                        <td>{delivery.quantity_liters}L</td>
                        <td>₹{delivery.price_per_liter}</td>
                        <td>₹{delivery.amount.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${delivery.status}`}>
                            {delivery.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={2}><strong>Total</strong></td>
                      <td><strong>{monthlyBill.total_liters}L</strong></td>
                      <td></td>
                      <td><strong>₹{monthlyBill.total_amount.toFixed(2)}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bill-summary">
                <div className="summary-item">
                  <span>Total Deliveries:</span>
                  <span>{monthlyBill.deliveries.length}</span>
                </div>
                <div className="summary-item">
                  <span>Total Liters:</span>
                  <span>{monthlyBill.total_liters}L</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>₹{monthlyBill.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bill-note">
                <p>📝 Note: This is a summary for your records. No payment is required at this time.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBillModal(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilkSubscription;
