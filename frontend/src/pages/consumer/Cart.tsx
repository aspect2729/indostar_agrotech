/**
 * Cart Component
 * 
 * Shopping cart with checkout functionality.
 * Implements requirements: 1.3, 1.4, 9.2
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../../contexts';
import { createOrder } from '../../services';
import { Address } from '../../types';
import './Cart.css';

const TAX_RATE = 0.05; // 5% tax
const BASE_SHIPPING_COST = 50;
const INTER_STATE_SHIPPING_MULTIPLIER = 3;

const Cart: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address form state
  const [address, setAddress] = useState<Address>({
    type: 'shipping',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [notes, setNotes] = useState('');

  // Calculate totals
  const hasInterStateDelivery = items.some(item => item.product.interStateDelivery);
  const isInterState = address.state && address.state.toLowerCase() !== 'karnataka';
  const shippingCost = isInterState && hasInterStateDelivery
    ? BASE_SHIPPING_COST * INTER_STATE_SHIPPING_MULTIPLIER
    : BASE_SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shippingCost;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleAddressChange = (field: keyof Address, value: string | boolean) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      setError('Please fill in all address fields');
      return false;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateAddress()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        deliveryAddress: address,
        notes: notes || undefined
      };

      const order = await createOrder(orderData);
      clearCart();
      navigate(`/consumer/orders/${order._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        {/* Header */}
        <header className="cart-header fade-in">
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
              <button className="nav-link active">
                Cart
              </button>
              <button className="nav-link" onClick={() => navigate('/consumer/orders')}>
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

        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started</p>
          <button
            className="shop-now-btn"
            onClick={() => navigate('/consumer/products')}
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <header className="cart-header fade-in">
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
            <button className="nav-link active">
              Cart ({itemCount})
            </button>
            <button className="nav-link" onClick={() => navigate('/consumer/orders')}>
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

      <div className="cart-container">
        <h1 className="page-title slide-in-down">Shopping Cart</h1>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            {items.map((item, index) => (
              <div
                key={item.product._id}
                className="cart-item scroll-reveal"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className="item-image"
                  onClick={() => navigate(`/consumer/products/${item.product._id}`)}
                >
                  {item.product.images && item.product.images.length > 0 ? (
                    <img src={item.product.images[0]} alt={item.product.name} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                </div>

                <div className="item-details">
                  <h3
                    className="item-name"
                    onClick={() => navigate(`/consumer/products/${item.product._id}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="item-category">
                    {item.product.category.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="item-price">
                    ₹{item.product.price.consumer}/{item.product.unit}
                  </p>
                  {item.product.interStateDelivery && (
                    <span className="delivery-badge">🚚 Inter-state delivery</span>
                  )}
                </div>

                <div className="item-actions">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    ₹{(item.product.price.consumer * item.quantity).toFixed(2)}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{shippingCost.toFixed(2)}</span>
              </div>

              {isInterState && hasInterStateDelivery && (
                <div className="shipping-note">
                  Inter-state delivery charges applied
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {!showCheckout ? (
                <button
                  className="checkout-btn hover-lift"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="checkout-form slide-in-up">
                  <h3>Delivery Address</h3>

                  {error && <div className="error-message">{error}</div>}

                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Order Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions?"
                      rows={3}
                    />
                  </div>

                  <button
                    className="place-order-btn hover-lift"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowCheckout(false);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
