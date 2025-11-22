/**
 * Product Detail Component
 * 
 * Displays detailed product information with add to cart functionality.
 * Implements requirements: 2.3, 2.4, 2.5, 6.2, 11.1, 11.2, 11.4
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../contexts';
import { getProductById } from '../../services';
import { Product } from '../../types';
import Layout from '../../components/common/Layout';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on IndoStar Agrotech`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleSubscribe = () => {
    if (!product) return;
    navigate(`/consumer/subscribe/${product._id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="product-detail-loading">
          <div className="skeleton-detail">
            <div className="skeleton-image"></div>
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-price"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="product-detail-error">
          <div className="error-content">
            <div className="error-icon">📦</div>
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <button className="btn-primary" onClick={() => navigate('/consumer/products')}>
              Browse Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="product-detail">
        {/* Success Message */}
        {showSuccess && (
          <div className="success-toast">
            <span className="success-icon">✓</span>
            Added to cart successfully!
          </div>
        )}

        {/* Product Content */}
        <div className="detail-container">
          <div className="detail-content">
            {/* Image Gallery */}
            <div className="image-gallery">
              <div className={`main-image ${isZoomed ? 'zoomed' : ''}`} onClick={handleImageClick}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                  />
                ) : (
                  <div className="image-placeholder">📦</div>
                )}
                {!isZoomed && (
                  <div className="zoom-hint">
                    <span className="zoom-icon">🔍</span>
                    Click to zoom
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="thumbnail-carousel">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <div>
                  <div className="product-brand">{product.category.replace('_', ' ')}</div>
                  <h1 className="product-name">{product.name}</h1>
                  <div className="product-volume">{product.unit}</div>
                </div>
                <button 
                  className="share-button" 
                  onClick={handleShare}
                  aria-label="Share product"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>

              <div className="price-section">
                <span className="price-current">₹{product.price.consumer}</span>
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-selector">
                <label className="quantity-label">Quantity</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn-subscribe"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
                <button
                  className="btn-buy-once"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Adding...' : 'Buy Once'}
                </button>
              </div>

              {/* Delivery Info */}
              {product.interStateDelivery !== undefined && (
                <div className="delivery-info">
                  <div className="delivery-icon">
                    {product.interStateDelivery ? '🚚' : '📍'}
                  </div>
                  <div className="delivery-text">
                    <strong>
                      {product.interStateDelivery 
                        ? 'Inter-state delivery available' 
                        : 'In-state delivery only'}
                    </strong>
                    <p>
                      {product.interStateDelivery 
                        ? 'We deliver across India' 
                        : 'Available within Karnataka'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nutritional Information */}
          {product.nutritionalInfo && (
            <div className="nutritional-section">
              <h2 className="section-title">Nutritional Information</h2>
              <div className="nutritional-grid">
                {product.nutritionalInfo.calories && (
                  <div className="nutritional-item">
                    <span className="nutritional-label">Calories</span>
                    <span className="nutritional-value">{product.nutritionalInfo.calories} kcal</span>
                  </div>
                )}
                {product.nutritionalInfo.protein && (
                  <div className="nutritional-item">
                    <span className="nutritional-label">Protein</span>
                    <span className="nutritional-value">{product.nutritionalInfo.protein}g</span>
                  </div>
                )}
                {product.nutritionalInfo.carbohydrates && (
                  <div className="nutritional-item">
                    <span className="nutritional-label">Carbohydrates</span>
                    <span className="nutritional-value">{product.nutritionalInfo.carbohydrates}g</span>
                  </div>
                )}
                {product.nutritionalInfo.fat && (
                  <div className="nutritional-item">
                    <span className="nutritional-label">Fat</span>
                    <span className="nutritional-value">{product.nutritionalInfo.fat}g</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
