/**
 * NavigationDrawer Property-Based Tests
 * 
 * Tests correctness properties for the NavigationDrawer component.
 * Uses fast-check for property-based testing with 100+ iterations.
 */


import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
const fc = require('fast-check/lib/cjs/fast-check.js');
import NavigationDrawer from './NavigationDrawer';
import { UserRole } from '../../types';

// Mock user for testing
const mockUser = {
  _id: 'test-user-id',
  googleId: 'test-google-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'consumer' as UserRole,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    user: mockUser,
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
    updateUser: jest.fn(),
  }),
}));

// Helper to render component with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('NavigationDrawer Property-Based Tests', () => {
  /**
   * Feature: sids-farm-ui-redesign, Property 1: Navigation drawer toggle behavior
   * Validates: Requirements 1.2
   * 
   * For any application state, when the hamburger menu is clicked,
   * the navigation drawer should transition from closed to open or open to closed
   */
  test('Property 1: Navigation drawer toggle behavior', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isOpen state
        fc.boolean(), // deliveriesPaused state
        fc.string({ minLength: 1, maxLength: 20 }), // appVersion
        (isOpen: boolean, deliveriesPaused: boolean, appVersion: string) => {
          const onClose = jest.fn();
          const onTogglePause = jest.fn();

          const { container, rerender } = renderWithRouter(
            <NavigationDrawer
              isOpen={isOpen}
              onClose={onClose}
              deliveriesPaused={deliveriesPaused}
              onTogglePause={onTogglePause}
              appVersion={appVersion}
            />
          );

          // Check drawer visibility based on isOpen prop
          const drawer = container.querySelector('.navigation-drawer');
          const overlay = container.querySelector('.drawer-overlay');

          expect(drawer).toBeInTheDocument();
          expect(overlay).toBeInTheDocument();

          if (isOpen) {
            expect(drawer).toHaveClass('navigation-drawer--open');
            expect(overlay).toHaveClass('drawer-overlay--visible');
          } else {
            expect(drawer).not.toHaveClass('navigation-drawer--open');
            expect(overlay).not.toHaveClass('drawer-overlay--visible');
          }

          // Test toggle behavior - clicking overlay should call onClose
          if (isOpen && overlay) {
            fireEvent.click(overlay);
            expect(onClose).toHaveBeenCalled();
          }

          // Test that drawer state changes when isOpen prop changes
          const newIsOpen = !isOpen;
          rerender(
            <BrowserRouter>
              <NavigationDrawer
                isOpen={newIsOpen}
                onClose={onClose}
                deliveriesPaused={deliveriesPaused}
                onTogglePause={onTogglePause}
                appVersion={appVersion}
              />
            </BrowserRouter>
          );

          if (newIsOpen) {
            expect(drawer).toHaveClass('navigation-drawer--open');
            expect(overlay).toHaveClass('drawer-overlay--visible');
          } else {
            expect(drawer).not.toHaveClass('navigation-drawer--open');
            expect(overlay).not.toHaveClass('drawer-overlay--visible');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 2: Navigation item routing
   * Validates: Requirements 1.4
   * 
   * For any navigation menu item, clicking it should navigate to its
   * corresponding route and close the drawer
   */
  test('Property 2: Navigation item routing', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // deliveriesPaused state
        fc.string({ minLength: 1, maxLength: 20 }), // appVersion
        (deliveriesPaused: boolean, appVersion: string) => {
          const onClose = jest.fn();
          const onTogglePause = jest.fn();

          const { container } = renderWithRouter(
            <NavigationDrawer
              isOpen={true}
              onClose={onClose}
              deliveriesPaused={deliveriesPaused}
              onTogglePause={onTogglePause}
              appVersion={appVersion}
            />
          );

          // Get all menu items
          const menuItems = container.querySelectorAll('.drawer-menu__item');
          
          // Verify menu items exist
          expect(menuItems.length).toBeGreaterThan(0);

          // Test clicking each menu item
          menuItems.forEach((item) => {
            onClose.mockClear();
            
            // Click the menu item
            fireEvent.click(item);
            
            // Verify onClose was called (drawer should close after navigation)
            expect(onClose).toHaveBeenCalledTimes(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify drawer closes on Escape key
   */
  test('Drawer closes on Escape key press', () => {
    const onClose = jest.fn();
    const onTogglePause = jest.fn();

    renderWithRouter(
      <NavigationDrawer
        isOpen={true}
        onClose={onClose}
        deliveriesPaused={false}
        onTogglePause={onTogglePause}
        appVersion="1.0.0"
      />
    );

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Verify onClose was called
    expect(onClose).toHaveBeenCalled();
  });

  /**
   * Additional test: Verify pause toggle functionality
   */
  test('Pause deliveries toggle works correctly', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // initial deliveriesPaused state
        fc.string({ minLength: 1, maxLength: 20 }), // appVersion
        (deliveriesPaused: boolean, appVersion: string) => {
          const onClose = jest.fn();
          const onTogglePause = jest.fn();

          const { container } = renderWithRouter(
            <NavigationDrawer
              isOpen={true}
              onClose={onClose}
              deliveriesPaused={deliveriesPaused}
              onTogglePause={onTogglePause}
              appVersion={appVersion}
            />
          );

          // Find the toggle switch
          const toggleSwitch = container.querySelector('.toggle-switch');
          expect(toggleSwitch).toBeInTheDocument();

          // Verify initial state
          if (deliveriesPaused) {
            expect(toggleSwitch).toHaveClass('toggle-switch--active');
          } else {
            expect(toggleSwitch).not.toHaveClass('toggle-switch--active');
          }

          // Click the toggle
          if (toggleSwitch) {
            fireEvent.click(toggleSwitch);
            expect(onTogglePause).toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify version number is displayed
   */
  test('Version number is displayed correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }), // appVersion
        (appVersion: string) => {
          const onClose = jest.fn();
          const onTogglePause = jest.fn();

          const { container } = renderWithRouter(
            <NavigationDrawer
              isOpen={true}
              onClose={onClose}
              deliveriesPaused={false}
              onTogglePause={onTogglePause}
              appVersion={appVersion}
            />
          );

          // Find version text
          const versionElement = container.querySelector('.drawer-footer__version');
          expect(versionElement).toBeInTheDocument();
          expect(versionElement?.textContent).toContain(appVersion);
        }
      ),
      { numRuns: 100 }
    );
  });
});
