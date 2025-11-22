/**
 * NavigationDrawer Component
 * 
 * Slide-out navigation menu providing access to all application sections.
 * Implements requirements: 1.2, 1.3, 1.4, 6.1, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import DrawerHeader from './DrawerHeader';
import DrawerMenu from './DrawerMenu';
import DrawerFooter from './DrawerFooter';
import './NavigationDrawer.css';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  badge?: number;
}

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deliveriesPaused: boolean;
  onTogglePause: (paused: boolean) => void;
  appVersion: string;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  deliveriesPaused,
  onTogglePause,
  appVersion,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the drawer
      if (drawerRef.current) {
        drawerRef.current.focus();
      }

      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus trap - keep focus within drawer when open
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Prevent drawer content clicks from closing
  const handleDrawerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle navigation item click
  const handleNavigate = useCallback((route: string) => {
    navigate(route);
    onClose();
  }, [navigate, onClose]);

  // Handle pause toggle
  const handlePauseToggle = useCallback(() => {
    onTogglePause(!deliveriesPaused);
  }, [deliveriesPaused, onTogglePause]);

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'drawer-overlay--visible' : ''}`}
        onClick={handleOverlayClick}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <nav
        id="navigation-drawer"
        ref={drawerRef}
        className={`navigation-drawer ${isOpen ? 'navigation-drawer--open' : ''}`}
        onClick={handleDrawerClick}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Drawer Header */}
        <DrawerHeader />

        {/* Drawer Menu */}
        <DrawerMenu
          userRole={user.role}
          currentPath={location.pathname}
          onNavigate={handleNavigate}
        />

        {/* Drawer Footer */}
        <DrawerFooter
          deliveriesPaused={deliveriesPaused}
          onTogglePause={handlePauseToggle}
          appVersion={appVersion}
        />
      </nav>
    </>
  );
};

export default NavigationDrawer;
