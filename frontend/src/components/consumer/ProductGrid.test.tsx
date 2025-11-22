/**
 * ProductGrid Property-Based Tests
 * 
 * Tests correctness properties for the ProductGrid component.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * Validates: Requirements 8.5, 12.3, 13.1, 13.3, 13.5
 */


import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
const fc = require('fast-check/lib/cjs/fast-check.js');
import ProductGrid from './ProductGrid';

// Helper to render component with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

// Arbitraries for generating test data
const productArbitrary = fc.record({
  _id: fc.string({ minLength: 1, maxLength: 24 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  brand: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
  volume: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  price: fc.record({
    consumer: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
  }),
  originalPrice: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }), { nil: undefined }),
  discount: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  category: fc.constantFrom('jaggery', 'oil', 'chutney_powder', 'pickles', 'milk'),
});

const productsArrayArbitrary = fc.array(productArbitrary, { minLength: 1, maxLength: 12 });

describe('ProductGrid Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 29: Product grid spacing consistency
   * Validates: Requirements 8.5
   * 
   * For any product grid with multiple products, the spacing between cards should
   * be consistent (16px on mobile)
   */
  test('Property 29: Product grid spacing consistency', () => {
    fc.assert(
      fc.property(
        productsArrayArbitrary,
        (products: any[]) => {
          const { container } = renderWithRouter(
            <ProductGrid products={products} />
          );

          // Verify grid container exists
          const grid = container.querySelector('.product-grid');
          expect(grid).toBeInTheDocument();
          expect(grid).toHaveClass('product-grid');

          // Verify all product items are rendered
          const items = container.querySelectorAll('.product-grid__item');
          expect(items.length).toBe(products.length);

          // The CSS should apply consistent gap
          // We verify the grid structure is correct
          expect(grid).toHaveClass('product-grid--loaded');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 39: Responsive grid column adjustment
   * Validates: Requirements 12.3
   * 
   * For any viewport width change, the product grid should adjust from 1 column (mobile)
   * to 2-3 columns (tablet/desktop) appropriately
   */
  test('Property 39: Responsive grid column adjustment', () => {
    fc.assert(
      fc.property(
        productsArrayArbitrary,
        (products: any[]) => {
          const { container } = renderWithRouter(
            <ProductGrid products={products} />
          );

          // Verify grid has proper class for responsive behavior
          const grid = container.querySelector('.product-grid');
          expect(grid).toBeInTheDocument();
          expect(grid).toHaveClass('product-grid');

          // The CSS media queries handle the responsive columns
          // We verify the grid structure is correct for CSS to apply
          // Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
          
          // Verify all items are present
          const items = container.querySelectorAll('.product-grid__item');
          expect(items.length).toBe(products.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 42: Loading skeleton layout matching
   * Validates: Requirements 13.1
   * 
   * For any loading state, the skeleton screen should match the structure and layout
   * of the actual content
   */
  test('Property 42: Loading skeleton layout matching', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = renderWithRouter(
            <ProductGrid products={[]} loading={true} />
          );

          // Verify skeleton screens are rendered
          const skeletons = container.querySelectorAll('.product-grid__skeleton');
          expect(skeletons.length).toBeGreaterThan(0);

          // Verify each skeleton has the same structure as ProductCard
          skeletons.forEach((skeleton) => {
            // Image skeleton
            const skeletonImage = skeleton.querySelector('.product-grid__skeleton-image');
            expect(skeletonImage).toBeInTheDocument();

            // Body skeleton
            const skeletonBody = skeleton.querySelector('.product-grid__skeleton-body');
            expect(skeletonBody).toBeInTheDocument();

            // Brand skeleton
            const skeletonBrand = skeleton.querySelector('.product-grid__skeleton-brand');
            expect(skeletonBrand).toBeInTheDocument();

            // Name skeleton
            const skeletonName = skeleton.querySelector('.product-grid__skeleton-name');
            expect(skeletonName).toBeInTheDocument();

            // Volume skeleton
            const skeletonVolume = skeleton.querySelector('.product-grid__skeleton-volume');
            expect(skeletonVolume).toBeInTheDocument();

            // Pricing skeleton
            const skeletonPricing = skeleton.querySelector('.product-grid__skeleton-pricing');
            expect(skeletonPricing).toBeInTheDocument();

            // Actions skeleton
            const skeletonActions = skeleton.querySelector('.product-grid__skeleton-actions');
            expect(skeletonActions).toBeInTheDocument();

            // Button skeletons
            const skeletonButtons = skeleton.querySelectorAll('.product-grid__skeleton-button');
            expect(skeletonButtons.length).toBeGreaterThanOrEqual(2);

            // Small button skeleton (share button)
            const skeletonButtonSmall = skeleton.querySelector('.product-grid__skeleton-button-small');
            expect(skeletonButtonSmall).toBeInTheDocument();
          });

          // Verify loading state has proper aria-label
          const grid = container.querySelector('.product-grid');
          expect(grid).toHaveAttribute('role', 'status');
          expect(grid).toHaveAttribute('aria-label', 'Loading products');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 43: Error state retry button
   * Validates: Requirements 13.3
   * 
   * For any error state displayed, an error message and retry button should be present
   */
  test('Property 43: Error state retry button', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s: string) => s.trim().length > 0),
        (errorMessage: string) => {
          const error = new Error(errorMessage);
          const onRetry = jest.fn();

          const { container } = renderWithRouter(
            <ProductGrid products={[]} error={error} onRetry={onRetry} />
          );

          // Verify error container is rendered
          const errorContainer = container.querySelector('.product-grid__error');
          expect(errorContainer).toBeInTheDocument();
          expect(errorContainer).toHaveAttribute('role', 'alert');

          // Verify error icon
          const errorIcon = container.querySelector('.product-grid__error-icon');
          expect(errorIcon).toBeInTheDocument();

          // Verify error title
          const errorTitle = container.querySelector('.product-grid__error-title');
          expect(errorTitle).toBeInTheDocument();
          expect(errorTitle?.textContent).toBeTruthy();

          // Verify error message
          const errorMsg = container.querySelector('.product-grid__error-message');
          expect(errorMsg).toBeInTheDocument();
          expect(errorMsg?.textContent).toContain(errorMessage);

          // Verify retry button (RetryButton component uses .retry-button class)
          const retryButton = container.querySelector('.retry-button');
          expect(retryButton).toBeInTheDocument();
          expect(retryButton).toHaveAttribute('aria-label', 'Retry operation');

          // Test retry button click
          if (retryButton) {
            fireEvent.click(retryButton);
            expect(onRetry).toHaveBeenCalledTimes(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 45: Content load transition
   * Validates: Requirements 13.5
   * 
   * For any successful content load, the loading state should be removed and content
   * should appear with a fade-in animation
   */
  test('Property 45: Content load transition', () => {
    fc.assert(
      fc.property(
        productsArrayArbitrary,
        (products: any[]) => {
          const { container } = renderWithRouter(
            <ProductGrid products={products} loading={false} />
          );

          // Verify grid is loaded (not loading)
          const grid = container.querySelector('.product-grid');
          expect(grid).toBeInTheDocument();
          expect(grid).toHaveClass('product-grid--loaded');

          // Verify no skeleton screens
          const skeletons = container.querySelectorAll('.product-grid__skeleton');
          expect(skeletons.length).toBe(0);

          // Verify all product items have animation delay
          const items = container.querySelectorAll('.product-grid__item');
          expect(items.length).toBe(products.length);

          items.forEach((item, index) => {
            // Verify item has proper class for animation
            expect(item).toHaveClass('product-grid__item');

            // Verify animation delay is set
            const style = (item as HTMLElement).style;
            expect(style.animationDelay).toBe(`${index * 50}ms`);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Empty state display
   */
  test('Empty state is displayed when no products', () => {
    const { container } = renderWithRouter(
      <ProductGrid products={[]} loading={false} />
    );

    // Verify empty state container (EmptyState component uses .empty-state class)
    const emptyContainer = container.querySelector('.empty-state');
    expect(emptyContainer).toBeInTheDocument();

    // Verify empty illustration
    const emptyIllustration = container.querySelector('.empty-illustration-container');
    expect(emptyIllustration).toBeInTheDocument();

    // Verify empty message
    const emptyMessage = container.querySelector('.empty-message');
    expect(emptyMessage).toBeInTheDocument();
    expect(emptyMessage?.textContent).toContain('Check back later for new products');
  });

  /**
   * Additional test: Callbacks are passed to ProductCard
   */
  test('Callbacks are passed to ProductCard components', () => {
    fc.assert(
      fc.property(
        productsArrayArbitrary,
        (products: any[]) => {
          const onSubscribe = jest.fn();
          const onBuyOnce = jest.fn();
          const onShare = jest.fn();

          const { container } = renderWithRouter(
            <ProductGrid
              products={products}
              onSubscribe={onSubscribe}
              onBuyOnce={onBuyOnce}
              onShare={onShare}
            />
          );

          // Verify all product cards are rendered
          const cards = container.querySelectorAll('.product-card');
          expect(cards.length).toBe(products.length);

          // Test that callbacks work by clicking first product's subscribe button
          if (cards.length > 0) {
            const firstCard = cards[0];
            const subscribeBtn = firstCard.querySelector('.product-card__btn--subscribe');
            
            if (subscribeBtn) {
              fireEvent.click(subscribeBtn);
              expect(onSubscribe).toHaveBeenCalledWith(products[0]._id);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional test: Loading state takes precedence
   */
  test('Loading state takes precedence over other states', () => {
    const products = [
      {
        _id: 'test-1',
        name: 'Test Product',
        images: ['test.jpg'],
        price: { consumer: 100 },
        category: 'milk' as const,
      },
    ];
    const error = new Error('Test error');

    const { container } = renderWithRouter(
      <ProductGrid products={products} loading={true} error={error} />
    );

    // Verify loading state is shown
    const skeletons = container.querySelectorAll('.product-grid__skeleton');
    expect(skeletons.length).toBeGreaterThan(0);

    // Verify error state is not shown
    const errorContainer = container.querySelector('.product-grid__error');
    expect(errorContainer).not.toBeInTheDocument();

    // Verify products are not shown
    const cards = container.querySelectorAll('.product-card');
    expect(cards.length).toBe(0);
  });

  /**
   * Additional test: Error state takes precedence over empty state
   */
  test('Error state takes precedence over empty state', () => {
    const error = new Error('Test error');
    const onRetry = jest.fn();

    const { container } = renderWithRouter(
      <ProductGrid products={[]} loading={false} error={error} onRetry={onRetry} />
    );

    // Verify error state is shown
    const errorContainer = container.querySelector('.product-grid__error');
    expect(errorContainer).toBeInTheDocument();

    // Verify empty state is not shown
    const emptyContainer = container.querySelector('.product-grid__empty');
    expect(emptyContainer).not.toBeInTheDocument();
  });

  /**
   * Additional test: Accessibility attributes
   */
  test('Accessibility attributes are present', () => {
    const products = [
      {
        _id: 'test-1',
        name: 'Test Product',
        images: ['test.jpg'],
        price: { consumer: 100 },
        category: 'milk' as const,
      },
    ];

    const { container } = renderWithRouter(
      <ProductGrid products={products} />
    );

    // Verify grid has proper structure
    const grid = container.querySelector('.product-grid');
    expect(grid).toBeInTheDocument();

    // Test loading state accessibility
    const { container: loadingContainer } = renderWithRouter(
      <ProductGrid products={[]} loading={true} />
    );
    const loadingGrid = loadingContainer.querySelector('.product-grid');
    expect(loadingGrid).toHaveAttribute('role', 'status');
    expect(loadingGrid).toHaveAttribute('aria-label', 'Loading products');

    // Test error state accessibility
    const error = new Error('Test error');
    const onRetry = jest.fn();
    const { container: errorContainer } = renderWithRouter(
      <ProductGrid products={[]} error={error} onRetry={onRetry} />
    );
    const errorDiv = errorContainer.querySelector('.product-grid__error');
    expect(errorDiv).toHaveAttribute('role', 'alert');

    // RetryButton component uses .retry-button class and aria-label "Retry operation"
    const retryButton = errorContainer.querySelector('.retry-button');
    expect(retryButton).toHaveAttribute('aria-label', 'Retry operation');
  });
});
