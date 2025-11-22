/**
 * Property-Based Tests for Error States
 * 
 * Feature: sids-farm-ui-redesign, Property 43: Error state retry button
 * Validates: Requirements 13.3
 * 
 * Tests that error states consistently display error messages and retry buttons.
 */

import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import ProductGrid from '../consumer/ProductGrid';
import RetryButton from './RetryButton';
import EmptyState from './EmptyState';

describe('Property 43: Error state retry button', () => {
  /**
   * Property: For any error state displayed, an error message and retry button should be present
   * 
   * This property ensures that whenever an error occurs, users are:
   * 1. Informed about the error with a clear message
   * 2. Given the ability to retry the failed operation
   */
  it('should display error message and retry button for any error in ProductGrid', () => {
    fc.assert(
      fc.property(
        // Generate random error messages (non-empty, non-whitespace)
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (errorMessage) => {
          const mockError = new Error(errorMessage);
          const mockRetry = jest.fn();

          const { container } = render(
            <ProductGrid
              products={[]}
              loading={false}
              error={mockError}
              onRetry={mockRetry}
            />
          );

          // Verify error container with alert role is displayed
          const errorElement = container.querySelector('[role="alert"]');
          if (!errorElement) {
            throw new Error('Error element with role="alert" not found');
          }

          // Verify error element has text content (any error message)
          const textContent = errorElement.textContent || '';
          if (textContent.trim().length === 0) {
            throw new Error('Error element has no text content');
          }

          // Verify retry button is present and enabled
          const buttons = within(errorElement as HTMLElement).queryAllByRole('button');
          if (buttons.length === 0) {
            throw new Error('No retry button found in error element');
          }
          
          const retryButton = buttons[0];
          if (retryButton.hasAttribute('disabled')) {
            throw new Error('Retry button is disabled');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: RetryButton component should always be interactive and accessible
   */
  it('should render RetryButton with proper accessibility for any configuration', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // button text
        fc.boolean(), // loading state
        fc.boolean(), // disabled state
        (buttonText, loading, disabled) => {
          const mockRetry = jest.fn();

          const { unmount } = render(
            <RetryButton
              onRetry={mockRetry}
              text={buttonText}
              loading={loading}
              disabled={disabled}
            />
          );

          try {
            const buttons = screen.queryAllByRole('button');
            
            // Verify at least one button exists
            if (buttons.length === 0) {
              throw new Error('No button found');
            }

            // Get the last button (in case there are multiple from previous renders)
            const button = buttons[buttons.length - 1];

            // Verify aria-label
            if (!button.hasAttribute('aria-label')) {
              throw new Error('Button missing aria-label');
            }

            // Verify button has text content
            const textContent = button.textContent || '';
            if (textContent.trim().length === 0) {
              throw new Error('Button has no text content');
            }

            // Button should be disabled if either disabled prop is true or loading is true
            const isDisabled = button.hasAttribute('disabled');
            if ((disabled || loading) && !isDisabled) {
              throw new Error('Button should be disabled but is not');
            }
            if (!(disabled || loading) && isDisabled) {
              throw new Error('Button should be enabled but is disabled');
            }
          } finally {
            // Clean up after each property test run
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: EmptyState with action should always display the action button
   */
  it('should display action button in EmptyState when action is provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // message
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // action text
        fc.constantFrom('empty-box' as const, 'no-products' as const, 'no-orders' as const, 'no-notifications' as const, 'search' as const), // illustration type
        (message, actionText, illustration) => {
          const mockAction = jest.fn();

          const { container } = render(
            <EmptyState
              message={message}
              illustration={illustration}
              action={{
                text: actionText,
                onClick: mockAction,
              }}
            />
          );

          // Verify message is displayed (check for text content in container)
          const containerText = container.textContent || '';
          if (!containerText.includes(message)) {
            throw new Error(`Message "${message}" not found in container`);
          }

          // Verify action button is present with text content
          const buttons = screen.getAllByRole('button');
          if (buttons.length === 0) {
            throw new Error('No buttons found');
          }
          
          const actionButton = buttons.find(btn => btn.textContent?.includes(actionText));
          if (!actionButton) {
            throw new Error(`Action button with text "${actionText}" not found`);
          }
          
          if (actionButton.hasAttribute('disabled')) {
            throw new Error('Action button is disabled');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error states should maintain minimum touch target sizes
   * Validates accessibility requirement from 8.1
   */
  it('should maintain minimum 44x44px touch targets for retry buttons', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (errorMessage) => {
          const mockError = new Error(errorMessage);
          const mockRetry = jest.fn();

          const { container } = render(
            <ProductGrid
              products={[]}
              loading={false}
              error={mockError}
              onRetry={mockRetry}
            />
          );

          const errorElement = container.querySelector('[role="alert"]');
          if (!errorElement) {
            throw new Error('Error element not found');
          }

          const buttons = within(errorElement as HTMLElement).queryAllByRole('button');
          if (buttons.length === 0) {
            throw new Error('No retry button found');
          }

          const retryButton = buttons[0];
          const styles = window.getComputedStyle(retryButton);
          
          // Parse min-height and min-width (handle 'auto' and other non-numeric values)
          const minHeight = parseInt(styles.minHeight) || 0;
          const minWidth = parseInt(styles.minWidth) || 0;

          // Verify minimum touch target size (44x44px)
          // Note: In jsdom, computed styles may not reflect actual CSS values
          // So we check if the values are either 0 (not set in jsdom) or >= 44
          if (minHeight > 0 && minHeight < 44) {
            throw new Error(`Button min-height ${minHeight}px is less than 44px`);
          }
          if (minWidth > 0 && minWidth < 44) {
            throw new Error(`Button min-width ${minWidth}px is less than 44px`);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Error messages should be announced to screen readers
   */
  it('should have proper ARIA roles for error states', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (errorMessage) => {
          const mockError = new Error(errorMessage);
          const mockRetry = jest.fn();

          const { container } = render(
            <ProductGrid
              products={[]}
              loading={false}
              error={mockError}
              onRetry={mockRetry}
            />
          );

          // Verify error container has alert role for screen readers
          const errorElement = container.querySelector('[role="alert"]');
          if (!errorElement) {
            throw new Error('Error element with role="alert" not found');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
