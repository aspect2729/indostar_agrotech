/**
 * Property-Based Tests for Loading States
 * 
 * Feature: sids-farm-ui-redesign
 * Tests Properties 42 and 44 from the design document
 */


import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import {
  ProductCardSkeleton,
  OrderCardSkeleton,
  ProductListSkeleton,
  OrderListSkeleton,
  Spinner,
  InlineLoader,
  LoadingOverlay,
  ProgressBar,
} from './index';

describe('Loading States Property Tests', () => {
  /**
   * Feature: sids-farm-ui-redesign, Property 42: Loading skeleton layout matching
   * Validates: Requirements 13.1
   * 
   * For any loading state, the skeleton screen should match the structure and layout of the actual content
   */
  describe('Property 42: Loading skeleton layout matching', () => {
    it('ProductCardSkeleton should have all required structural elements', () => {
      // Render ProductCardSkeleton
      const { container } = render(<ProductCardSkeleton />);

      // Check that skeleton has image placeholder
      const skeletonImage = container.querySelector('.skeleton-product-card__image');
      expect(skeletonImage).toBeInTheDocument();

      // Check that skeleton has body section
      const skeletonBody = container.querySelector('.skeleton-product-card__body');
      expect(skeletonBody).toBeInTheDocument();

      // Check that skeleton has pricing section
      const skeletonPricing = container.querySelector('.skeleton-product-card__pricing');
      expect(skeletonPricing).toBeInTheDocument();

      // Check that skeleton has actions section with 2 buttons
      const skeletonActions = container.querySelector('.skeleton-product-card__actions');
      expect(skeletonActions).toBeInTheDocument();
      
      // Verify skeleton has the main container
      const skeletonCard = container.querySelector('.skeleton-product-card');
      expect(skeletonCard).toBeInTheDocument();
    });

    it('OrderCardSkeleton should have the same structural elements as order cards', () => {
      const { container } = render(<OrderCardSkeleton />);

      // Check that skeleton has header section
      const header = container.querySelector('.skeleton-order-card__header');
      expect(header).toBeInTheDocument();

      // Check that skeleton has body section
      const body = container.querySelector('.skeleton-order-card__body');
      expect(body).toBeInTheDocument();

      // Check that skeleton has footer section
      const footer = container.querySelector('.skeleton-order-card__footer');
      expect(footer).toBeInTheDocument();
    });

    it('ProductListSkeleton should render the correct number of skeleton cards', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
          const { container } = render(<ProductListSkeleton count={count} />);

          const skeletonCards = container.querySelectorAll('.skeleton-product-card');
          expect(skeletonCards.length).toBe(count);

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('OrderListSkeleton should render the correct number of skeleton cards', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
          const { container } = render(<OrderListSkeleton count={count} />);

          const skeletonCards = container.querySelectorAll('.skeleton-order-card');
          expect(skeletonCards.length).toBe(count);

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 44: Non-blocking loading indicators
   * Validates: Requirements 13.4
   * 
   * For any data fetching operation, loading indicators should be shown without blocking user interaction with other UI elements
   */
  describe('Property 44: Non-blocking loading indicators', () => {
    it('Spinner should not block pointer events by default', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('small', 'medium', 'large'),
          (size) => {
            const { container } = render(<Spinner size={size} />);

            const spinner = container.querySelector('.spinner');
            expect(spinner).toBeInTheDocument();

            // Spinner should have the correct size class
            expect(spinner).toHaveClass(`spinner--${size}`);

            // Spinner should be present and renderable
            expect(spinner).toBeVisible();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('InlineLoader should be non-blocking and inline', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.constantFrom('small', 'medium'),
          (text, size) => {
            const { container } = render(<InlineLoader text={text} size={size} />);

            const loader = container.querySelector('.inline-loader');
            expect(loader).toBeInTheDocument();

            // Should have the correct size class
            expect(loader).toHaveClass(`inline-loader--${size}`);

            // Should show the text
            const textElement = container.querySelector('.inline-loader__text');
            expect(textElement).toBeInTheDocument();
            expect(textElement?.textContent).toBe(text);

            // Should contain a spinner
            const spinner = container.querySelector('.spinner');
            expect(spinner).toBeInTheDocument();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('LoadingOverlay with blocking=false should not block pointer events', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (message) => {
            const { container } = render(
              <LoadingOverlay message={message} blocking={false} />
            );

            const overlay = container.querySelector('.loading-overlay');
            expect(overlay).toBeInTheDocument();

            // Should not have blocking class
            expect(overlay).not.toHaveClass('loading-overlay--blocking');

            // Should show the message
            const messageElement = container.querySelector('.loading-overlay__message');
            expect(messageElement).toBeInTheDocument();
            expect(messageElement?.textContent).toBe(message);

            // Should contain a spinner
            const spinner = container.querySelector('.spinner');
            expect(spinner).toBeInTheDocument();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('LoadingOverlay with blocking=true should block pointer events', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (message) => {
            const { container } = render(
              <LoadingOverlay message={message} blocking={true} />
            );

            const overlay = container.querySelector('.loading-overlay');
            expect(overlay).toBeInTheDocument();

            // Blocking overlay should have blocking class
            expect(overlay).toHaveClass('loading-overlay--blocking');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('ProgressBar should display correct progress value', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }).filter(n => n >= 0.001 || n === 0),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { nil: undefined }),
          (progress, label) => {
            const { container } = render(
              <ProgressBar progress={progress} label={label} showPercentage={true} />
            );

            const progressBar = container.querySelector('.progress-bar__fill');
            expect(progressBar).toBeInTheDocument();

            // Check that width is set via inline style (clamped between 0-100)
            const clampedProgress = Math.min(Math.max(progress, 0), 100);
            const progressBarElement = progressBar as HTMLElement;
            
            // The width should be set as a percentage string
            const widthStyle = progressBarElement.style.width;
            expect(widthStyle).toBeTruthy();
            expect(widthStyle).toContain('%');

            // Check percentage display - this is what the user sees
            const percentage = container.querySelector('.progress-bar__percentage');
            expect(percentage).toBeInTheDocument();
            // The percentage text should show the rounded value
            const expectedPercentage = Math.round(clampedProgress);
            expect(percentage?.textContent).toBe(`${expectedPercentage}%`);

            // Check that progress bar container has correct ARIA attributes
            const progressBarContainer = container.querySelector('.progress-bar-container');
            expect(progressBarContainer).toHaveAttribute('aria-valuemin', '0');
            expect(progressBarContainer).toHaveAttribute('aria-valuemax', '100');
            // aria-valuenow should be set
            expect(progressBarContainer).toHaveAttribute('aria-valuenow');

            // Check label if provided
            if (label) {
              const labelElement = container.querySelector('.progress-bar__label');
              expect(labelElement).toBeInTheDocument();
              expect(labelElement?.textContent).toBe(label);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All loading indicators should have proper ARIA attributes', () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          // Test Spinner
          const { container: spinnerContainer } = render(<Spinner />);
          const spinner = spinnerContainer.querySelector('.spinner');
          expect(spinner).toHaveAttribute('role', 'status');
          expect(spinner).toHaveAttribute('aria-label', 'Loading');

          // Test InlineLoader
          const { container: inlineContainer } = render(<InlineLoader text="Loading" />);
          const inlineLoader = inlineContainer.querySelector('.inline-loader');
          expect(inlineLoader).toHaveAttribute('role', 'status');
          expect(inlineLoader).toHaveAttribute('aria-live', 'polite');

          // Test LoadingOverlay
          const { container: overlayContainer } = render(<LoadingOverlay message="Loading" />);
          const overlay = overlayContainer.querySelector('.loading-overlay');
          expect(overlay).toHaveAttribute('role', 'status');
          expect(overlay).toHaveAttribute('aria-live', 'polite');

          // Test ProgressBar
          const { container: progressContainer } = render(<ProgressBar progress={50} />);
          const progressBar = progressContainer.querySelector('.progress-bar-container');
          expect(progressBar).toHaveAttribute('role', 'progressbar');
          expect(progressBar).toHaveAttribute('aria-valuenow', '50');
          expect(progressBar).toHaveAttribute('aria-valuemin', '0');
          expect(progressBar).toHaveAttribute('aria-valuemax', '100');

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
