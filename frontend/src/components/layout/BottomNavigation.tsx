/**
 * BottomNavigation Component
 * 
 * Fixed bottom navigation bar for primary app sections (mobile only).
 * Implements requirements: 1.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

export interface BottomNavigationProps {
  userRole: 'consumer' | 'distributor' | 'owner';
}

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: React.ReactNode;
  elevated?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const baseRoute = `/${userRole}`;
    
    return [
      {
        id: 'home',
        label: 'Home',
        route: `${baseRoute}/home`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        route: `${baseRoute}/subscriptions`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
      },
      {
        id: 'products',
        label: 'Products',
        route: `${baseRoute}/products`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        ),
        elevated: true, // Center item is elevated
      },
      {
        id: 'wallet',
        label: 'Wallet',
        route: `${baseRoute}/wallet`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      },
      {
        id: 'account',
        label: 'Account',
        route: `${baseRoute}/account`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
    ];
  };

  const navItems = getNavItems();

  const isActive = (route: string): boolean => {
    return location.pathname === route || location.pathname.startsWith(route + '/');
  };

  const handleNavClick = (route: string) => {
    navigate(route);
  };

  return (
    <nav className="bottom-navigation" role="navigation" aria-label="Main navigation">
      <div className="bottom-navigation__container">
        {navItems.map((item) => {
          const active = isActive(item.route);
          const itemClasses = [
            'bottom-navigation__item',
            active ? 'bottom-navigation__item--active' : '',
            item.elevated ? 'bottom-navigation__item--elevated' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={item.id}
              className={itemClasses}
              onClick={() => handleNavClick(item.route)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="bottom-navigation__icon">{item.icon}</span>
              <span className="bottom-navigation__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
