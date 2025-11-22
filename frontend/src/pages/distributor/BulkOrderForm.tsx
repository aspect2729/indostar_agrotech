/**
 * Bulk Order Form Component
 * 
 * Allows distributors to place bulk orders with product selection,
 * quantity input, inter-state delivery options, and shipping cost calculation.
 * 
 * Implements requirements: 2.1, 2.2, 2.5, 9.1, 9.2
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, createOrder } from '../../services';
import { Product, Address, CreateOrderRequest } from '../../types';
import NavigationDrawer from '../../components/layout/NavigationDrawer';
import TopHeader from '../../components/layout/TopHeader';
import './BulkOrderForm.css';

interface OrderItem {
  product: Product;
  quantity: number;
}

// Inter-state shipping rates (per kg)
const SHIPPING_RATES: { [key: string]: number } = {
  'Karnataka': 0, // Local state - free shipping
  'Tamil Nadu': 15,
  'Kerala': 18,
  'Andhra Pradesh': 20,
  'Telangana': 22,
  'Maharashtra': 25,
  'Goa': 20,
  'Other': 30
};

const INDIAN_STATES = [
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Goa',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Bihar',
  'West Bengal',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Punjab',
  'Haryana',
  'Delhi',
  'Himachal Pradesh',
  'Uttarakhand',
  'Assam',
  'Meghalaya',
  'Manipur',
  'Nagaland',
  'Tripura',
  'Mizoram',
  'Arunachal Pradesh',
  'Sikkim',
  'Jammu and Kashmir',
  'Ladakh'
];

const BulkOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deliveriesPaused, setDeliveriesPaused] = useState(false);
  
  // Delivery address form
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    type: 'shipping',
    street: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    isDefault: false
  });
  
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const addProductToOrder = useCallback((product: Product) => {
    setOrderItems(prevItems => {
      if (!prevItems.find(item => item.product._id === product._id)) {
        return [...prevItems, { product, quantity: 10 }]; // Default bulk quantity
      }
      return prevItems;
    });
  }, []);

  useEffect(() => {
    // Pre-select product if provided in URL
    const productId = searchParams.get('product');
    if (productId && products.length > 0) {
      const product = products.find(p => p._id === productId);
      if (product && !orderItems.find(item => item.product._id === productId)) {
        addProductToOrder(product);
      }
    }
  }, [searchParams, products, addProductToOrder, orderItems]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Load bulk products (jaggery and oil)
      const response = await getProducts({
        isActive: true,
        limit: 100
      });
      
      // Backend returns {products: [...]} not {data: [...]}
      const allProducts = (response as any).products || (response as any).data || [];
      const bulkProducts = allProducts.filter(
        (p: any) => p.category === 'jaggery' || p.category === 'oil'
      );
      setProducts(bulkProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeProductFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setOrderItems(
      orderItems.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateSubtotal = (): number => {
    return orderItems.reduce(
      (sum, item) => sum + item.product.price.distributor * item.quantity,
      0
    );
  };

  const calculateTax = (subtotal: number): number => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateShippingCost = (): number => {
    if (!deliveryAddress.state) return 0;
    
    // Calculate total weight (assuming 1 unit = 1 kg for simplicity)
    const totalWeight = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Get shipping rate for state
    const rate = SHIPPING_RATES[deliveryAddress.state] || SHIPPING_RATES['Other'];
    
    return totalWeight * rate;
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShippingCost();
    return subtotal + tax + shipping;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (orderItems.length === 0) {
      newErrors.items = 'Please add at least one product to your order';
    }

    if (!deliveryAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!deliveryAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!deliveryAddress.state) {
      newErrors.state = 'State is required';
    }

    if (!deliveryAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    setSubmitting(true);
    try {
      const orderData: CreateOrderRequest = {
        items: orderItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        deliveryAddress,
        notes: notes.trim() || undefined
      };

      const order = await createOrder(orderData);
      
      // Navigate to order confirmation
      navigate(`/distributor/orders/${order._id}`, {
        state: { newOrder: true }
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shippingCost = calculateShippingCost();
  const total = calculateTotal();

  return (
    <div className="bulk-order-form">
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
        title="Bulk Order"
        onMenuClick={() => setDrawerOpen(true)}
        notificationCount={0}
        cartItemCount={0}
        isMenuOpen={drawerOpen}
      />

      <div className="form-container">
        <div className="form-layout">
          {/* Product Selection */}
          <section className="product-selection slide-in-left">
            <h2>Select Products</h2>
            
            {errors.items && (
              <div className="error-message">{errors.items}</div>
            )}

            {loading ? (
              <div className="products-list">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="product-item skeleton-card">
                    <div className="skeleton skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-text"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="products-list">
                {products.map(product => {
                  const isSelected = orderItems.find(item => item.product._id === product._id);
                  return (
                    <div
                      key={product._id}
                      className={`product-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="product-image">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <div className="product-image-placeholder">📦</div>
                        )}
                      </div>
                      <div className="product-details">
                        <h3>{product.name}</h3>
                        <p className="product-category">
                          {product.category.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="wholesale-price">
                          ₹{product.price.distributor}/{product.unit}
                        </p>
                        {product.interStateDelivery && (
                          <span className="delivery-badge">🚚 Inter-state available</span>
                        )}
                      </div>
                      <button
                        className={`select-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() =>
                          isSelected
                            ? removeProductFromOrder(product._id)
                            : addProductToOrder(product)
                        }
                      >
                        {isSelected ? '✓ Selected' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Items */}
            {orderItems.length > 0 && (
              <div className="selected-items">
                <h3>Order Items</h3>
                {orderItems.map(item => (
                  <div key={item.product._id} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-price">
                        ₹{item.product.price.distributor}/{item.product.unit}
                      </span>
                    </div>
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 10)}
                        disabled={item.quantity <= 10}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product._id, parseInt(e.target.value) || 1)
                        }
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 10)}>
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ₹{(item.product.price.distributor * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeProductFromOrder(item.product._id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delivery Details & Summary */}
          <section className="order-details slide-in-right">
            {/* Delivery Address */}
            <div className="delivery-section">
              <h2>Delivery Address</h2>
              
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={deliveryAddress.street}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                  }
                  placeholder="Enter street address"
                  className={errors.street ? 'error' : ''}
                />
                {errors.street && <span className="field-error">{errors.street}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                    }
                    placeholder="Enter city"
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })
                    }
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={errors.pincode ? 'error' : ''}
                  />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>State *</label>
                <select
                  value={deliveryAddress.state}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, state: e.target.value })
                  }
                  className={errors.state ? 'error' : ''}
                >
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>
            </div>

            {/* Shipping Calculator */}
            <div className="shipping-calculator">
              <h3>Shipping Cost Calculator</h3>
              <div className="calculator-info">
                <div className="info-row">
                  <span>Destination:</span>
                  <span className="value">{deliveryAddress.state}</span>
                </div>
                <div className="info-row">
                  <span>Total Weight:</span>
                  <span className="value">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)} kg (approx)
                  </span>
                </div>
                <div className="info-row">
                  <span>Rate:</span>
                  <span className="value">
                    ₹{SHIPPING_RATES[deliveryAddress.state] || SHIPPING_RATES['Other']}/kg
                  </span>
                </div>
                <div className="info-row highlight">
                  <span>Shipping Cost:</span>
                  <span className="value">₹{shippingCost.toFixed(2)}</span>
                </div>
              </div>
              {deliveryAddress.state !== 'Karnataka' && (
                <p className="shipping-note">
                  ℹ️ Inter-state delivery charges apply
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₹{shippingCost.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <button
                className="place-order-btn"
                onClick={handleSubmit}
                disabled={orderItems.length === 0 || submitting}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay" onClick={cancelConfirmation}>
          <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Your Order</h2>
            <div className="confirmation-content">
              <div className="confirm-section">
                <h4>Order Items ({orderItems.length})</h4>
                {orderItems.map(item => (
                  <div key={item.product._id} className="confirm-item">
                    <span>{item.product.name}</span>
                    <span>{item.quantity} {item.product.unit}</span>
                    <span>₹{(item.product.price.distributor * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="confirm-section">
                <h4>Delivery Address</h4>
                <p>
                  {deliveryAddress.street}<br />
                  {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                </p>
              </div>

              <div className="confirm-section">
                <h4>Payment Summary</h4>
                <div className="confirm-summary">
                  <div className="confirm-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="confirm-row">
                    <span>GST (18%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="confirm-row">
                    <span>Shipping:</span>
                    <span>₹{shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="confirm-row total">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="cancel-btn" onClick={cancelConfirmation} disabled={submitting}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmOrder} disabled={submitting}>
                {submitting ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOrderForm;
