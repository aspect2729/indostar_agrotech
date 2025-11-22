/**
 * Retry Button Component
 * 
 * A button component for retrying failed operations.
 * Implements requirement: 13.3
 */

import React from 'react';
import './RetryButton.css';

export interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  disabled = false,
  text = 'Retry',
  className = '',
}) => {
  return (
    <button
      className={`retry-button ${loading ? 'loading' : ''} ${className}`}
      onClick={onRetry}
      disabled={disabled || loading}
      aria-label="Retry operation"
    >
      {loading ? (
        <>
          <span className="retry-spinner" aria-hidden="true"></span>
          <span>Retrying...</span>
        </>
      ) : (
        <>
          <span className="retry-icon" aria-hidden="true">↻</span>
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default RetryButton;
