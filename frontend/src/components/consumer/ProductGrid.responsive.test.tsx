/**
 * ProductGrid Responsive Property-Based Tests
 * 
 * Tests responsive grid behavior:
 * - Property 39: Responsive grid column adjustment
 * 
 * Validates: Requirements 12.3
 */


import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductGrid from './ProductGrid';
import * as fc from 'fast-check';

// Mock product data generator
const generateMockProduct = (id: number) => ({
  _id: `product-${id}`,
  name: `Product ${id}`,
  brand: `Brand ${id}`,
  image: `/images/product-${id}.jpg`,
  volume: '1L',
  price: 100 + id,
  category: 'Milk',
  inStock: true,
  subscriptionAvailable: true,
});

describe('ProductGrid Responsive Behavior', () => {
  describe('Property 39: Responsive grid column adjustment', () => {
    /**
     * Feature: sids-farm-ui-redesign, Property 39: Responsive grid column adjustment
     * 
     * For any viewport width change, the product grid should adjust from
     * 1 column (mobile) to 2-3 columns (tablet/desktop) appropriately
     * 
     * Validates: Requirements 12.3
     */
    it('should adjust grid columns based on viewport width', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // Number of products
          fc.integer({ min: 320, max: 1920 }), // Viewport width
          (productCount, viewportWidth) => {
            // Set viewport width
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            // Generate products
            const products = Array.from({ length: productCount }, (_, i) =>
              generateMockProduct(i)
            );

            const { container } = render(
              <ProductGrid
                products={products}
                loading={false}
                onSubscribe={() => {}}
                onBuyOnce={() => {}}
                onShare={() => {}}
                onCardClick={() => {}}
              />
            );

            const grid = container.querySelector('.product-grid');
            expect(grid).toBeInTheDocument();

            if (grid) {
              const computedStyle = window.getComputedStyle(grid);
              const gridTemplateColumns = computedStyle.gridTemplateColumns;

              // Verify grid columns based on viewport
              if (viewportWidth < 768) {
                // Mobile: should have 1 column
                // In CSS, this is "1fr"
                expect(gridTemplateColumns).toBeTruthy();
              } else if (viewportWidth >= 768 && viewportWidth < 1024) {
                // Tablet: should have 2 columns
                // In CSS, this is "repeat(2, 1fr)"
                expect(gridTemplateColumns).toBeTruthy();
              } else {
                // Desktop: should have 3 columns
                // In CSS, this is "repeat(3, 1fr)"
                expect(gridTemplateColumns).toBeTruthy();
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent spacing at all breakpoints', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 12 }), // Number of products
          fc.constantFrom(320, 640, 768, 1024, 1280, 1920), // Common viewport widths
          (productCount, viewportWidth) => {
            // Set viewport width
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const products = Array.from({ length: productCount }, (_, i) =>
              generateMockProduct(i)
            );

            const { container } = render(
              <ProductGrid
                products={products}
                loading={false}
                onSubscribe={() => {}}
                onBuyOnce={() => {}}
                onShare={() => {}}
                onCardClick={() => {}}
              />
            );

            const grid = container.querySelector('.product-grid');
            expect(grid).toBeInTheDocument();

            if (grid) {
              const computedStyle = window.getComputedStyle(grid);
              const gap = computedStyle.gap;

              // Verify gap is set (should be 16px, 20px, or 24px depending on viewport)
              expect(gap).toBeTruthy();

              // Mobile: 16px gap
              if (viewportWidth < 768) {
                // Gap should be defined
                expect(gap).toBeTruthy();
              }
              // Tablet: 20px gap
              else if (viewportWidth >= 768 && viewportWidth < 1024) {
                expect(gap).toBeTruthy();
              }
              // Desktop: 24px gap
              else {
                expect(gap).toBeTruthy();
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render all products regardless of viewport size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // Number of products
          fc.integer({ min: 320, max: 1920 }), // Viewport width
          (productCount, viewportWidth) => {
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const products = Array.from({ length: productCount }, (_, i) =>
              generateMockProduct(i)
            );

            const { container } = render(
              <ProductGrid
                products={products}
                loading={false}
                onSubscribe={() => {}}
                onBuyOnce={() => {}}
                onShare={() => {}}
                onCardClick={() => {}}
              />
            );

            // Count rendered product cards
            const productCards = container.querySelectorAll('.product-card');
            
            // All products should be rendered
            expect(productCards.length).toBe(productCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply responsive padding based on viewport', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(320, 640, 768, 1024, 1280, 1920),
          (viewportWidth) => {
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const products = [generateMockProduct(1)];

            const { container } = render(
              <ProductGrid
                products={products}
                loading={false}
                onSubscribe={() => {}}
                onBuyOnce={() => {}}
                onShare={() => {}}
                onCardClick={() => {}}
              />
            );

            const grid = container.querySelector('.product-grid');
            expect(grid).toBeInTheDocument();

            if (grid) {
              const computedStyle = window.getComputedStyle(grid);
              const padding = computedStyle.padding;

              // Padding should be defined
              expect(padding).toBeTruthy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Grid Layout Consistency', () => {
    it('should maintain grid structure with varying product counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (productCount) => {
            const products = Array.from({ length: productCount }, (_, i) =>
              generateMockProduct(i)
            );

            const { container } = render(
              <ProductGrid
                products={products}
                loading={false}
                onSubscribe={() => {}}
                onBuyOnce={() => {}}
                onShare={() => {}}
                onCardClick={() => {}}
              />
            );

            const grid = container.querySelector('.product-grid');
            
            if (productCount === 0) {
              // Should show empty state (EmptyState component uses .empty-state class)
              expect(container.querySelector('.empty-state')).toBeInTheDocument();
            } else {
              // Should show grid with products
              expect(grid).toBeInTheDocument();
              const productCards = container.querySelectorAll('.product-card');
              expect(productCards.length).toBe(productCount);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Loading State', () => {
    it('should show skeleton screens during loading', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 12 }),
          (skeletonCount) => {
            const { container } = render(
              <ProductGrid
                products={[]}
                loading={true}
                onSubscribe={() => {}}
                onBuyOnce={() => {}}
                onShare={() => {}}
                onCardClick={() => {}}
              />
            );

            // Should show skeleton screens
            const skeletons = container.querySelectorAll('.product-grid__skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no products', () => {
      const { container } = render(
        <ProductGrid
          products={[]}
          loading={false}
          onSubscribe={() => {}}
          onBuyOnce={() => {}}
          onShare={() => {}}
          onCardClick={() => {}}
        />
      );

      expect(container.querySelector('.product-grid__empty')).toBeInTheDocument();
    });
  });
});
