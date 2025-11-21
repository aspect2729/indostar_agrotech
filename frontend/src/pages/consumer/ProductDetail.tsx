/**
 * Product Detail Component
 * 
 * Displays detailed product information with add to cart functionality.
 * Implements requirements: 1.2, 8.4, 9.5, 7.2
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useCart } from '../../contexts';
import { getProductById } from '../../services';
import { Product } from '../../types';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId, loadProduct]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      addToCart(product, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/consumer/cart');
  };

  if (loading) {
    return (
      <div className="product-detail">
        <header className="detail-header fade-in">
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
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <header className="detail-header fade-in">
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
        <div className="error-container">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/consumer/products')}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      {/* Header */}
      <header className="detail-header fade-in">
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

      {/* Success Message */}
      {showSuccess && (
        <div className="success-message slide-in-down">
          ✓ Added to cart successfully!
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb fade-in">
        <button onClick={() => navigate('/consumer/home')}>Home</button>
        <span>/</span>
        <button onClick={() => navigate('/consumer/products')}>Products</button>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      {/* Product Content */}
      <div className="detail-container">
        <div className="detail-content slide-in-up">
          {/* Image Gallery */}
          <div className="image-gallery">
            <div className="main-image">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="fade-in"
                />
              ) : (
                <div className="image-placeholder">📦</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-details">
            <div className="product-category-badge">
              {product.category.replace('_', ' ').toUpperCase()}
            </div>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price-section">
              <span className="price">₹{product.price.consumer}</span>
              <span className="unit">per {product.unit}</span>
            </div>

            {/* Delivery Info */}
            <div className="delivery-info">
              {product.interStateDelivery ? (
                <div className="delivery-badge available">
                  <span className="icon">🚚</span>
                  <div>
                    <strong>Inter-state delivery available</strong>
                    <p>We deliver across India</p>
                  </div>
                </div>
              ) : (
                <div className="delivery-badge limited">
                  <span className="icon">📍</span>
                  <div>
                    <strong>In-state delivery only</strong>
                    <p>Available within Karnataka</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="product-description">
              <h3>About this product</h3>
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="add-to-cart-btn hover-lift"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                className="buy-now-btn hover-lift"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional Information */}
        {product.nutritionalInfo && (
          <div className="nutritional-section scroll-reveal">
            <h2>Nutritional Information</h2>
            <div className="nutritional-grid">
              <div className="nutritional-item">
                <span className="label">Calories</span>
                <span className="value">{product.nutritionalInfo.calories} kcal</span>
              </div>
              <div className="nutritional-item">
                <span className="label">Protein</span>
                <span className="value">{product.nutritionalInfo.protein}g</span>
              </div>
              <div className="nutritional-item">
                <span className="label">Carbohydrates</span>
                <span className="value">{product.nutritionalInfo.carbohydrates}g</span>
              </div>
              <div className="nutritional-item">
                <span className="label">Fat</span>
                <span className="value">{product.nutritionalInfo.fat}g</span>
              </div>
              {Object.entries(product.nutritionalInfo).map(([key, value]) => {
                if (!['calories', 'protein', 'carbohydrates', 'fat'].includes(key)) {
                  return (
                    <div key={key} className="nutritional-item">
                      <span className="label">{key}</span>
                      <span className="value">{value}g</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
