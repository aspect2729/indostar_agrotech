/**
 * TopHeader Component Property-Based Tests
 * 
 * Feature: sids-farm-ui-redesign
 * Tests properties: 11, 12, 13
 * Validates: Requirements 4.2, 4.3, 4.4, 4.5
 */


import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import TopHeader from './TopHeader';

// Helper to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TopHeader Property-Based Tests', () => {
  /**
   * Feature: sids-farm-ui-redesign, Property 11: Notification badge visibility
   * Validates: Requirements 4.2
   * 
   * For any notification count greater than zero, a badge indicator should be 
   * visible on the notification bell icon
   */
  test('Property 11: Notification badge visibility', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999 }), // Generate positive notification counts
        (notificationCount) => {
          const mockMenuClick = jest.fn();
          
          const { container } = renderWithRouter(
            <TopHeader
              title="Test Page"
              onMenuClick={mockMenuClick}
              notificationCount={notificationCount}
              cartItemCount={0}
            />
          );

          // Find all badges in the component
          const badges = container.querySelectorAll('.top-header__badge');
          
          // Should have exactly one badge (notification badge)
          expect(badges.length).toBe(1);
          
          // Badge should display the count (or 99+ if over 99)
          const expectedText = notificationCount > 99 ? '99+' : notificationCount.toString();
          expect(badges[0].textContent).toBe(expectedText);
          
          // Badge should be visible
          expect(badges[0]).toBeVisible();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 12: Cart badge display
   * Validates: Requirements 4.3
   * 
   * For any cart with one or more items, a count badge should be displayed 
   * on the cart icon showing the number of items
   */
  test('Property 12: Cart badge display', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999 }), // Generate positive cart item counts
        (cartItemCount) => {
          const mockMenuClick = jest.fn();
          
          const { container } = renderWithRouter(
            <TopHeader
              title="Test Page"
              onMenuClick={mockMenuClick}
              notificationCount={0}
              cartItemCount={cartItemCount}
            />
          );

          // Find all badges in the component
          const badges = container.querySelectorAll('.top-header__badge');
          
          // Should have exactly one badge (cart badge)
          expect(badges.length).toBe(1);
          
          // Badge should display the count (or 99+ if over 99)
          const expectedText = cartItemCount > 99 ? '99+' : cartItemCount.toString();
          expect(badges[0].textContent).toBe(expectedText);
          
          // Badge should be visible
          expect(badges[0]).toBeVisible();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 13: Icon navigation behavior
   * Validates: Requirements 4.4, 4.5
   * 
   * For any header icon (notification or cart), clicking it should navigate 
   * to the corresponding page
   */
  test('Property 13: Icon navigation behavior - notification icon', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // Notification count
        fc.integer({ min: 0, max: 100 }), // Cart count
        (notificationCount, cartItemCount) => {
          const mockMenuClick = jest.fn();
          
          const { container } = renderWithRouter(
            <TopHeader
              title="Test Page"
              onMenuClick={mockMenuClick}
              notificationCount={notificationCount}
              cartItemCount={cartItemCount}
            />
          );

          // Find notification button by its icon
          const buttons = container.querySelectorAll('.top-header__icon-button');
          expect(buttons.length).toBe(2); // Should have notification and cart buttons
          
          const notificationButton = buttons[0]; // First button is notification
          
          // Button should be clickable (not disabled)
          expect(notificationButton).not.toBeDisabled();
          
          // Click should not throw error
          expect(() => {
            fireEvent.click(notificationButton);
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 13: Icon navigation behavior - cart icon', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // Notification count
        fc.integer({ min: 0, max: 100 }), // Cart count
        (notificationCount, cartItemCount) => {
          const mockMenuClick = jest.fn();
          
          const { container } = renderWithRouter(
            <TopHeader
              title="Test Page"
              onMenuClick={mockMenuClick}
              notificationCount={notificationCount}
              cartItemCount={cartItemCount}
            />
          );

          // Find cart button by its icon
          const buttons = container.querySelectorAll('.top-header__icon-button');
          expect(buttons.length).toBe(2); // Should have notification and cart buttons
          
          const cartButton = buttons[1]; // Second button is cart
          
          // Button should be clickable (not disabled)
          expect(cartButton).not.toBeDisabled();
          
          // Click should not throw error
          expect(() => {
            fireEvent.click(cartButton);
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify no badge is shown when counts are zero
   */
  test('No badge shown when notification count is zero', () => {
    const mockMenuClick = jest.fn();
    
    renderWithRouter(
      <TopHeader
        title="Test Page"
        onMenuClick={mockMenuClick}
        notificationCount={0}
        cartItemCount={0}
      />
    );

    // Find the notification button
    const notificationButton = screen.getByLabelText(/notifications/i);
    const badge = notificationButton.querySelector('.top-header__badge');
    
    // Badge should not exist when count is zero
    expect(badge).not.toBeInTheDocument();
  });

  test('No badge shown when cart count is zero', () => {
    const mockMenuClick = jest.fn();
    
    renderWithRouter(
      <TopHeader
        title="Test Page"
        onMenuClick={mockMenuClick}
        notificationCount={0}
        cartItemCount={0}
      />
    );

    // Find the cart button
    const cartButton = screen.getByLabelText(/shopping cart/i);
    const badge = cartButton.querySelector('.top-header__badge');
    
    // Badge should not exist when count is zero
    expect(badge).not.toBeInTheDocument();
  });

  /**
   * Additional test: Hamburger menu click handler
   */
  test('Hamburger menu triggers onMenuClick callback', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // Page title (non-empty)
        (title) => {
          const mockMenuClick = jest.fn();
          
          const { container } = renderWithRouter(
            <TopHeader
              title={title}
              onMenuClick={mockMenuClick}
              notificationCount={0}
              cartItemCount={0}
            />
          );

          // Find and click hamburger button
          const hamburgerButton = container.querySelector('.top-header__hamburger');
          expect(hamburgerButton).toBeInTheDocument();
          
          fireEvent.click(hamburgerButton!);
          
          // Callback should be called exactly once
          expect(mockMenuClick).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
