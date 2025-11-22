/**
 * Skeleton Component
 * 
 * Reusable skeleton loading components for various content types.
 * Implements requirement: 13.1
 */

import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

/**
 * Base Skeleton component for creating custom skeleton shapes
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton for ProductCard - matches ProductCard layout
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-product-card" role="status" aria-label="Loading product">
      <Skeleton className="skeleton-product-card__image" height="200px" borderRadius="8px" />
      <div className="skeleton-product-card__body">
        <Skeleton width="60%" height="14px" />
        <Skeleton width="90%" height="18px" />
        <Skeleton width="40%" height="14px" />
        <div className="skeleton-product-card__pricing">
          <Skeleton width="80px" height="24px" />
        </div>
        <div className="skeleton-product-card__actions">
          <Skeleton width="48%" height="40px" borderRadius="20px" />
          <Skeleton width="48%" height="40px" borderRadius="20px" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Order Card - matches order card layout
 */
export const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-order-card" role="status" aria-label="Loading order">
      <div className="skeleton-order-card__header">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="100px" height="28px" borderRadius="14px" />
      </div>
      <div className="skeleton-order-card__body">
        <Skeleton width="150px" height="16px" />
        <Skeleton width="100px" height="16px" />
        <Skeleton width="120px" height="20px" />
      </div>
      <div className="skeleton-order-card__footer">
        <Skeleton width="120px" height="36px" borderRadius="18px" />
        <Skeleton width="100px" height="36px" borderRadius="18px" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Product List - displays multiple product card skeletons
 */
export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="skeleton-product-list">
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={`product-skeleton-${index}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Order List - displays multiple order card skeletons
 */
export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="skeleton-order-list">
      {[...Array(count)].map((_, index) => (
        <OrderCardSkeleton key={`order-skeleton-${index}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Table Row
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <div className="skeleton-table-row">
      {[...Array(columns)].map((_, index) => (
        <Skeleton key={`col-${index}`} height="16px" />
      ))}
    </div>
  );
};

/**
 * Skeleton for Table - displays multiple table row skeletons
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="skeleton-table" role="status" aria-label="Loading table">
      {[...Array(rows)].map((_, index) => (
        <TableRowSkeleton key={`row-${index}`} columns={columns} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Text Block
 */
export const TextBlockSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="skeleton-text-block" role="status" aria-label="Loading text">
      {[...Array(lines)].map((_, index) => (
        <Skeleton
          key={`line-${index}`}
          width={index === lines - 1 ? '70%' : '100%'}
          height="16px"
        />
      ))}
    </div>
  );
};

export default Skeleton;
