/**
 * ProductCard Component
 * 
 * Displays product information in a card layout with action buttons.
 * Implements requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.2, 8.2, 8.3, 8.4, 11.1, 11.2, 11.3, 11.4
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    brand?: string;
    images: string[];
    volume?: string;
    price: {
      consumer: number;
    };
    originalPrice?: number;
    discount?: number;
    category: string;
  };
  onSubscribe?: (productId: string) => void;
  onBuyOnce?: (productId: string) => void;
  onShare?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSubscribe,
  onBuyOnce,
  onShare,
}) => {
  const navigate = useNavigate();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate discount if originalPrice is provided
  const hasDiscount = product.originalPrice && product.originalPrice > product.price.consumer;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price.consumer) / product.originalPrice!) * 100)
    : product.discount || 0;

  // Handle card click - navigate to product detail
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    navigate(`/products/${product._id}`);
  };

  // Handle Subscribe button click
  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSubscribe) {
      onSubscribe(product._id);
    }
  };

  // Handle Buy Once button click
  const handleBuyOnce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyOnce) {
      onBuyOnce(product._id);
    }
  };

  // Handle Share button click
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onShare) {
      onShare(product._id);
    }

    // Use native share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: window.location.origin + `/products/${product._id}`,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy link to clipboard
      const url = window.location.origin + `/products/${product._id}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Handle long press for quick actions
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowQuickActions(true);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickActions]);

  // Handle keyboard navigation for card
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/products/${product._id}`);
    }
  };

  return (
    <article
      ref={cardRef}
      className="product-card"
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${product.name}${product.brand ? ` by ${product.brand}` : ''}${hasDiscount ? `, ${discountPercentage}% off` : ''}`}
    >
      {/* Product Image */}
      <div className="product-card__image-container">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.png'}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {hasDiscount && discountPercentage > 0 && (
          <div className="product-card__discount-badge">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-card__body">
        {/* Brand */}
        {product.brand && (
          <p className="product-card__brand">{product.brand}</p>
        )}

        {/* Product Name */}
        <h3 className="product-card__name">{product.name}</h3>

        {/* Volume */}
        {product.volume && (
          <p className="product-card__volume">{product.volume}</p>
        )}

        {/* Pricing */}
        <div className="product-card__pricing">
          {hasDiscount && (
            <span className="product-card__original-price">
              ₹{product.originalPrice?.toFixed(2)}
            </span>
          )}
          <span className="product-card__price">
            ₹{product.price.consumer.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="product-card__actions">
          <button
            className="product-card__btn product-card__btn--subscribe"
            onClick={handleSubscribe}
            aria-label={`Subscribe to ${product.name}`}
          >
            Subscribe
          </button>
          <button
            className="product-card__btn product-card__btn--buy-once"
            onClick={handleBuyOnce}
            aria-label={`Buy ${product.name} once`}
          >
            Buy Once
          </button>
          <button
            className="product-card__btn product-card__btn--share"
            onClick={handleShare}
            aria-label={`Share ${product.name}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Actions Menu (Long Press) */}
      {showQuickActions && (
        <div className="product-card__quick-actions">
          <button onClick={handleSubscribe}>Subscribe</button>
          <button onClick={handleBuyOnce}>Buy Once</button>
          <button onClick={handleShare}>Share</button>
          <button onClick={() => setShowQuickActions(false)}>Close</button>
        </div>
      )}
    </article>
  );
};

export default ProductCard;
