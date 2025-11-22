/**
 * LoadingIndicator Component
 * 
 * Reusable loading indicators for various loading states.
 * Implements requirement: 13.4
 */

import React from 'react';
import './LoadingIndicator.css';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

/**
 * Spinner component for short operations
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color,
  className = '',
}) => {
  return (
    <div
      className={`spinner spinner--${size} ${className}`}
      role="status"
      aria-label="Loading"
      style={color ? { borderTopColor: color } : undefined}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export interface LoadingOverlayProps {
  message?: string;
  blocking?: boolean;
}

/**
 * Loading overlay for blocking operations
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  blocking = false,
}) => {
  return (
    <div
      className={`loading-overlay ${blocking ? 'loading-overlay--blocking' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="loading-overlay__content">
        <Spinner size="large" />
        {message && <p className="loading-overlay__message">{message}</p>}
      </div>
    </div>
  );
};

export interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

/**
 * Progress bar for long operations
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color,
  className = '',
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`progress-bar-container ${className}`} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
      {label && <div className="progress-bar__label">{label}</div>}
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showPercentage && (
        <div className="progress-bar__percentage">{Math.round(clampedProgress)}%</div>
      )}
    </div>
  );
};

export interface InlineLoaderProps {
  text?: string;
  size?: 'small' | 'medium';
}

/**
 * Inline loader for non-blocking operations
 */
export const InlineLoader: React.FC<InlineLoaderProps> = ({
  text = 'Loading',
  size = 'small',
}) => {
  return (
    <div className={`inline-loader inline-loader--${size}`} role="status" aria-live="polite">
      <Spinner size={size} />
      <span className="inline-loader__text">{text}</span>
    </div>
  );
};

export interface DotsLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

/**
 * Dots loader animation
 */
export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = 'medium',
  color,
}) => {
  return (
    <div className={`dots-loader dots-loader--${size}`} role="status" aria-label="Loading">
      <div className="dots-loader__dot" style={color ? { backgroundColor: color } : undefined} />
      <div className="dots-loader__dot" style={color ? { backgroundColor: color } : undefined} />
      <div className="dots-loader__dot" style={color ? { backgroundColor: color } : undefined} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export interface ButtonLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

/**
 * Button with integrated loading state
 */
export const ButtonLoader: React.FC<ButtonLoaderProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  loading,
  children,
  loadingText,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`button-loader ${loading ? 'button-loader--loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="small" />
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Spinner;
