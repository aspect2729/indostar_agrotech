/**
 * Error Message Component
 * 
 * Displays error messages with consistent styling.
 * Implements requirement: 6.4
 */

import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`error-message ${type} ${className} fade-in`} role="alert">
      <span className="error-icon">{getIcon()}</span>
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
