/**
 * TopHeader Component
 * 
 * Fixed header with hamburger menu, page title, and action icons.
 * Implements requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopHeader.css';

export interface TopHeaderProps {
  title: string;
  onMenuClick: () => void;
  notificationCount?: number;
  cartItemCount?: number;
  isMenuOpen?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  onMenuClick,
  notificationCount = 0,
  cartItemCount = 0,
  isMenuOpen = false,
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleCartClick = () => {
    navigate('/consumer/cart');
  };

  return (
    <header className="top-header" role="banner">
      <div className="top-header__container">
        {/* Hamburger Menu Button */}
        <button
          className="top-header__hamburger"
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="navigation-drawer"
        >
          <span className="top-header__hamburger-line" aria-hidden="true"></span>
          <span className="top-header__hamburger-line" aria-hidden="true"></span>
          <span className="top-header__hamburger-line" aria-hidden="true"></span>
        </button>

        {/* Page Title */}
        <h1 className="top-header__title">{title}</h1>

        {/* Action Icons */}
        <div className="top-header__actions">
          {/* Notification Icon */}
          <button
            className="top-header__icon-button"
            onClick={handleNotificationClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <svg
              className="top-header__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="top-header__badge" aria-hidden="true">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            className="top-header__icon-button"
            onClick={handleCartClick}
            aria-label={`Shopping cart${cartItemCount > 0 ? ` (${cartItemCount} items)` : ''}`}
          >
            <svg
              className="top-header__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartItemCount > 0 && (
              <span className="top-header__badge" aria-hidden="true">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
