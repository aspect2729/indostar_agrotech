/**
 * Empty State Component
 * 
 * Displays an empty state with illustration and message.
 * Implements requirement: 13.2
 */

import React from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  title?: string;
  message: string;
  illustration?: 'empty-box' | 'no-products' | 'no-orders' | 'no-notifications' | 'search';
  action?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  illustration = 'empty-box',
  action,
  className = '',
}) => {
  const getIllustration = () => {
    switch (illustration) {
      case 'empty-box':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="60" width="100" height="80" rx="4" stroke="currentColor" strokeWidth="3" fill="none"/>
            <path d="M50 80 L100 100 L150 80" stroke="currentColor" strokeWidth="3" fill="none"/>
            <line x1="100" y1="100" x2="100" y2="140" stroke="currentColor" strokeWidth="3"/>
            <circle cx="100" cy="40" r="8" fill="currentColor" opacity="0.3"/>
            <circle cx="130" cy="50" r="6" fill="currentColor" opacity="0.2"/>
            <circle cx="70" cy="45" r="5" fill="currentColor" opacity="0.25"/>
          </svg>
        );
      case 'no-products':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="60" y="70" width="80" height="90" rx="8" stroke="currentColor" strokeWidth="3" fill="none"/>
            <circle cx="100" cy="100" r="15" stroke="currentColor" strokeWidth="3" fill="none"/>
            <line x1="100" y1="85" x2="100" y2="115" stroke="currentColor" strokeWidth="3"/>
            <line x1="85" y1="100" x2="115" y2="100" stroke="currentColor" strokeWidth="3"/>
            <path d="M70 70 L80 50 L120 50 L130 70" stroke="currentColor" strokeWidth="3" fill="none"/>
          </svg>
        );
      case 'no-orders':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="60" width="100" height="100" rx="4" stroke="currentColor" strokeWidth="3" fill="none"/>
            <line x1="70" y1="85" x2="130" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <line x1="70" y1="105" x2="130" y2="105" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <line x1="70" y1="125" x2="110" y2="125" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <circle cx="100" cy="40" r="12" stroke="currentColor" strokeWidth="3" fill="none"/>
            <path d="M95 40 L98 43 L105 36" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'no-notifications':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50 C100 50 80 70 80 100 L80 120 L70 130 L130 130 L120 120 L120 100 C120 70 100 50 100 50 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
            <path d="M90 130 Q100 145 110 130" stroke="currentColor" strokeWidth="3" fill="none"/>
            <line x1="60" y1="60" x2="140" y2="140" stroke="currentColor" strokeWidth="3" opacity="0.5"/>
          </svg>
        );
      case 'search':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="85" cy="85" r="35" stroke="currentColor" strokeWidth="3" fill="none"/>
            <line x1="112" y1="112" x2="140" y2="140" stroke="currentColor" strokeWidth="3"/>
            <line x1="70" y1="85" x2="100" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
            <line x1="85" y1="70" x2="85" y2="100" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-illustration-container">
        {getIllustration()}
      </div>
      {title && <h3 className="empty-title">{title}</h3>}
      <p className="empty-message">{message}</p>
      {action && (
        <button
          className="empty-action-button"
          onClick={action.onClick}
        >
          {action.text}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
