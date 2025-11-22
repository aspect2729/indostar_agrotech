/**
 * ProductGrid Component
 * 
 * Responsive grid layout for displaying product cards with loading, empty, and error states.
 * Implements requirements: 8.5, 12.3, 6.3, 13.1, 13.2, 13.3, 13.5
 */

import React from 'react';
import ProductCard, { ProductCardProps } from './ProductCard';
import { EmptyState, RetryButton } from '../common';
import './ProductGrid.css';

export interface ProductGridProps {
  products: ProductCardProps['product'][];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onSubscribe?: (productId: string) => void;
  onBuyOnce?: (productId: string) => void;
  onShare?: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error = null,
  onRetry,
  onSubscribe,
  onBuyOnce,
  onShare,
}) => {
  // Loading state - skeleton screens
  if (loading) {
    return (
      <div className="product-grid" role="status" aria-label="Loading products">
        {[...Array(6)].map((_, index) => (
          <div key={`skeleton-${index}`} className="product-grid__skeleton">
            <div className="product-grid__skeleton-image" />
            <div className="product-grid__skeleton-body">
              <div className="product-grid__skeleton-brand" />
              <div className="product-grid__skeleton-name" />
              <div className="product-grid__skeleton-volume" />
              <div className="product-grid__skeleton-pricing">
                <div className="product-grid__skeleton-price" />
              </div>
              <div className="product-grid__skeleton-actions">
                <div className="product-grid__skeleton-button" />
                <div className="product-grid__skeleton-button" />
                <div className="product-grid__skeleton-button-small" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-grid__error" role="alert">
        <div className="product-grid__error-icon">⚠️</div>
        <h3 className="product-grid__error-title">Oops! Something went wrong</h3>
        <p className="product-grid__error-message">
          {error.message || 'Failed to load products. Please try again.'}
        </p>
        {onRetry && (
          <RetryButton onRetry={onRetry} />
        )}
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <EmptyState
        illustration="no-products"
        message="Check back later for new products or try adjusting your filters."
      />
    );
  }

  // Products grid with fade-in animation
  return (
    <div className="product-grid product-grid--loaded">
      {products.map((product, index) => (
        <div
          key={`product-${product._id}-${index}`}
          className="product-grid__item"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <ProductCard
            product={product}
            onSubscribe={onSubscribe}
            onBuyOnce={onBuyOnce}
            onShare={onShare}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
