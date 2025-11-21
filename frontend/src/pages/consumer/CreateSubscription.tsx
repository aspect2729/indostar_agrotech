/**
 * Create Subscription Page
 * Allows consumers to create a new milk subscription
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { createSubscription } from '../../services/subscriptionService';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import './CreateSubscription.css';

const CreateSubscription: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    default_quantity_liters: 1,
    delivery_time_preference: 'morning' as 'morning' | 'evening',
    skip_days: [] as string[],
    delivery_address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    }
  });

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  useEffect(() => {
    loadProduct();
    // Pre-fill address if user has one
    if (user?.addresses && user.addresses.length > 0) {
      setFormData(prev => ({
        ...prev,
        delivery_address: user.addresses[0]
      }));
    }
  }, [productId, user]);

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      const data = await getProductById(productId);
      
      if (data.category !== 'milk') {
        setError('Subscriptions are only available for milk products');
        return;
      }
      
      setProduct(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      skip_days: prev.skip_days.includes(day)
        ? prev.skip_days.filter(d => d !== day)
        : [...prev.skip_days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;
    
    // Validation
    if (formData.default_quantity_liters <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    if (!formData.delivery_address.street || !formData.delivery_address.city || 
        !formData.delivery_address.state || !formData.delivery_address.pincode) {
      setError('Please fill in all address fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createSubscription({
        product_id: productId,
        default_quantity_liters: formData.default_quantity_liters,
        delivery_address: formData.delivery_address,
        delivery_time_preference: formData.delivery_time_preference,
        skip_days: formData.skip_days
      });
      
      alert('Subscription created successfully!');
      navigate('/consumer/subscriptions');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="create-subscription-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="create-subscription-page">
        <div className="error-state">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/consumer/products')}>Back to Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-subscription-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Create Milk Subscription</h1>
      </div>

      <div className="subscription-form-container">
        <div className="product-summary">
          <div className="product-icon">🥛</div>
          <div className="product-info">
            <h2>{product.name}</h2>
            <p className="price">₹{product.price.consumer} per {product.unit}</p>
            <p className="description">{product.description}</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="subscription-form">
          <div className="form-section">
            <h3>Subscription Details</h3>
            
            <div className="form-group">
              <label>Daily Quantity (Liters) *</label>
              <div className="quantity-input">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    default_quantity_liters: Math.max(0.5, prev.default_quantity_liters - 0.5)
                  }))}
                >
                  −
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.default_quantity_liters}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    default_quantity_liters: parseFloat(e.target.value) || 0
                  }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    default_quantity_liters: prev.default_quantity_liters + 0.5
                  }))}
                >
                  +
                </button>
              </div>
              <small>You can adjust this quantity for specific dates later</small>
            </div>

            <div className="form-group">
              <label>Delivery Time Preference *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="morning"
                    checked={formData.delivery_time_preference === 'morning'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      delivery_time_preference: e.target.value as 'morning' | 'evening'
                    }))}
                  />
                  <span>Morning (6 AM - 9 AM)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="evening"
                    checked={formData.delivery_time_preference === 'evening'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      delivery_time_preference: e.target.value as 'morning' | 'evening'
                    }))}
                  />
                  <span>Evening (5 PM - 8 PM)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Skip Days (Optional)</label>
              <div className="days-grid">
                {daysOfWeek.map(day => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.skip_days.includes(day)}
                      onChange={() => handleSkipDayToggle(day)}
                    />
                    <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  </label>
                ))}
              </div>
              <small>Select days when you don't want delivery</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Delivery Address</h3>
            
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                value={formData.delivery_address.street}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  delivery_address: { ...prev.delivery_address, street: e.target.value }
                }))}
                placeholder="House/Flat No., Street Name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.delivery_address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery_address: { ...prev.delivery_address, city: e.target.value }
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={formData.delivery_address.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery_address: { ...prev.delivery_address, state: e.target.value }
                  }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  value={formData.delivery_address.pincode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery_address: { ...prev.delivery_address, pincode: e.target.value }
                  }))}
                  pattern="[0-9]{6}"
                  placeholder="6-digit pincode"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.delivery_address.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery_address: { ...prev.delivery_address, phone: e.target.value }
                  }))}
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="subscription-summary">
            <h3>Subscription Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Daily Quantity:</span>
                <span>{formData.default_quantity_liters}L</span>
              </div>
              <div className="summary-row">
                <span>Price per Liter:</span>
                <span>₹{product.price.consumer}</span>
              </div>
              <div className="summary-row">
                <span>Daily Cost:</span>
                <span>₹{(formData.default_quantity_liters * product.price.consumer).toFixed(2)}</span>
              </div>
              <div className="summary-row estimated">
                <span>Estimated Monthly Cost:</span>
                <span>₹{(formData.default_quantity_liters * product.price.consumer * (30 - formData.skip_days.length * 4)).toFixed(2)}</span>
              </div>
            </div>
            <p className="summary-note">
              📝 Note: You can adjust quantities for specific dates at least 1 day in advance. 
              Monthly billing will be generated based on actual deliveries.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubscription;
