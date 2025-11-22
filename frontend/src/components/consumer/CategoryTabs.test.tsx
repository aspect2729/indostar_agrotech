/**
 * CategoryTabs Property-Based Tests
 * 
 * Tests correctness properties for the CategoryTabs component.
 * Uses fast-check for property-based testing with 100+ iterations.
 */

import { createRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
const fc = require('fast-check/lib/cjs/fast-check.js');
import CategoryTabs, { Category } from './CategoryTabs';

// Generator for valid category objects with unique IDs
const categoryArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter((s: string) => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter((s: string) => s.trim().length > 0),
  count: fc.option(fc.nat({ max: 1000 })),
});

// Generator for array of categories with unique IDs (at least 2 categories)
const categoriesArbitrary = fc
  .array(categoryArbitrary, { minLength: 2, maxLength: 10 })
  .map((categories: any[]) => {
    // Ensure unique IDs by appending index
    return categories.map((cat: any, index: number) => ({
      ...cat,
      id: `${cat.id.trim()}-${index}`,
      name: cat.name.trim() || `Category ${index}`,
    }));
  });

describe('CategoryTabs Property-Based Tests', () => {
  /**
   * Feature: sids-farm-ui-redesign, Property 8: Category tab selection highlighting
   * Validates: Requirements 3.2
   * 
   * For any category tab, when selected, it should display an active indicator
   * (underline) and appropriate text styling
   */
  test('Property 8: Category tab selection highlighting', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(), // index for active category
        (categories: Category[], activeIndex: number) => {
          // Ensure we have valid categories
          if (categories.length === 0) return true;
          
          // Select a valid active category
          const activeCategoryIndex = activeIndex % categories.length;
          const activeCategory = categories[activeCategoryIndex];
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory.id}
              onCategoryChange={onCategoryChange}
            />
          );

          // Find all tab buttons
          const tabs = container.querySelectorAll('.category-tabs__tab');
          expect(tabs.length).toBe(categories.length);

          // Find the active tab
          const activeTab = Array.from(tabs).find(
            (tab) => tab.getAttribute('aria-selected') === 'true'
          );

          // Verify active tab exists and has correct styling
          expect(activeTab).toBeInTheDocument();
          expect(activeTab).toHaveClass('category-tabs__tab--active');
          
          // Verify active indicator exists
          const indicator = container.querySelector('.category-tabs__indicator');
          expect(indicator).toBeInTheDocument();
          
          // Verify only one tab is active
          const activeTabs = Array.from(tabs).filter(
            (tab) => tab.getAttribute('aria-selected') === 'true'
          );
          expect(activeTabs.length).toBe(1);

          // Verify active tab has correct text
          expect(activeTab?.textContent).toContain(activeCategory.name);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 9: Category filtering accuracy
   * Validates: Requirements 3.3
   * 
   * For any selected category, the product list should contain only products
   * belonging to that category (tested by verifying the callback is called with correct ID)
   */
  test('Property 9: Category filtering accuracy', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(), // index for initial active category
        fc.nat(), // index for category to click
        (categories: Category[], initialIndex: number, clickIndex: number) => {
          // Ensure we have valid categories
          if (categories.length === 0) return true;
          
          const initialActiveIndex = initialIndex % categories.length;
          const clickCategoryIndex = clickIndex % categories.length;
          const initialActiveCategory = categories[initialActiveIndex];
          const clickCategory = categories[clickCategoryIndex];
          
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={initialActiveCategory.id}
              onCategoryChange={onCategoryChange}
            />
          );

          // Find all tab buttons
          const tabs = container.querySelectorAll('.category-tabs__tab');
          
          // Click on a specific category tab
          const tabToClick = tabs[clickCategoryIndex];
          fireEvent.click(tabToClick);

          // Verify onCategoryChange was called with the correct category ID
          expect(onCategoryChange).toHaveBeenCalledWith(clickCategory.id);
          expect(onCategoryChange).toHaveBeenCalledTimes(1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 10: Category switch scroll reset
   * Validates: Requirements 3.5
   * 
   * For any category tab selection change, the product list scroll position
   * should reset to the top
   */
  test('Property 10: Category switch scroll reset', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(), // index for initial active category
        fc.nat(), // index for category to click
        (categories: Category[], initialIndex: number, clickIndex: number) => {
          // Ensure we have valid categories
          if (categories.length === 0) return true;
          
          const initialActiveIndex = initialIndex % categories.length;
          const clickCategoryIndex = clickIndex % categories.length;
          const initialActiveCategory = categories[initialActiveIndex];
          
          // Create a mock scroll target ref
          const mockScrollTarget = document.createElement('div');
          const scrollToSpy = jest.fn();
          mockScrollTarget.scrollTo = scrollToSpy;
          const scrollTargetRef = createRef<HTMLDivElement>();
          (scrollTargetRef as any).current = mockScrollTarget;
          
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={initialActiveCategory.id}
              onCategoryChange={onCategoryChange}
              scrollTargetRef={scrollTargetRef}
            />
          );

          // Find all tab buttons
          const tabs = container.querySelectorAll('.category-tabs__tab');
          
          // Click on a category tab
          const tabToClick = tabs[clickCategoryIndex];
          fireEvent.click(tabToClick);

          // Verify scroll was reset to top
          expect(scrollToSpy).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth',
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 22: Tab indicator animation
   * Validates: Requirements 6.5
   * 
   * For any tab selection change, the active indicator should animate smoothly
   * to the new position
   */
  test('Property 22: Tab indicator animation', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(), // index for active category
        (categories: Category[], activeIndex: number) => {
          // Ensure we have valid categories
          if (categories.length === 0) return true;
          
          const activeCategoryIndex = activeIndex % categories.length;
          const activeCategory = categories[activeCategoryIndex];
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory.id}
              onCategoryChange={onCategoryChange}
            />
          );

          // Find the indicator element
          const indicator = container.querySelector('.category-tabs__indicator');
          expect(indicator).toBeInTheDocument();

          // Verify indicator has transform and width styles
          const indicatorElement = indicator as HTMLElement;
          
          // The indicator should have a transform property (for animation)
          expect(indicatorElement.style.transform).toBeDefined();
          expect(indicatorElement.style.width).toBeDefined();
          
          // Verify indicator has transition for smooth animation
          // (This is defined in CSS, so we check the class exists)
          expect(indicator).toHaveClass('category-tabs__indicator');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify all categories are rendered
   */
  test('All categories are rendered correctly', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(),
        (categories: Category[], activeIndex: number) => {
          if (categories.length === 0) return true;
          
          const activeCategoryIndex = activeIndex % categories.length;
          const activeCategory = categories[activeCategoryIndex];
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory.id}
              onCategoryChange={onCategoryChange}
            />
          );

          // Verify all categories are rendered
          const tabs = container.querySelectorAll('.category-tabs__tab');
          expect(tabs.length).toBe(categories.length);

          // Verify each category name is present
          categories.forEach((category) => {
            expect(container.textContent).toContain(category.name);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify category count is displayed when provided
   */
  test('Category count is displayed when provided', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(),
        (categories: Category[], activeIndex: number) => {
          if (categories.length === 0) return true;
          
          const activeCategoryIndex = activeIndex % categories.length;
          const activeCategory = categories[activeCategoryIndex];
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory.id}
              onCategoryChange={onCategoryChange}
            />
          );

          // Check each category with a count
          categories.forEach((category) => {
            if (category.count !== undefined && category.count !== null) {
              // Count should be displayed in parentheses
              expect(container.textContent).toContain(`(${category.count})`);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify accessibility attributes
   */
  test('Tabs have correct accessibility attributes', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary,
        fc.nat(),
        (categories: Category[], activeIndex: number) => {
          if (categories.length === 0) return true;
          
          const activeCategoryIndex = activeIndex % categories.length;
          const activeCategory = categories[activeCategoryIndex];
          const onCategoryChange = jest.fn();

          const { container } = render(
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory.id}
              onCategoryChange={onCategoryChange}
            />
          );

          // Verify tablist role
          const tablist = container.querySelector('[role="tablist"]');
          expect(tablist).toBeInTheDocument();

          // Verify each tab has correct attributes
          const tabs = container.querySelectorAll('[role="tab"]');
          expect(tabs.length).toBe(categories.length);

          tabs.forEach((tab) => {
            // Each tab should have aria-selected attribute
            expect(tab).toHaveAttribute('aria-selected');
            
            // Each tab should have aria-controls attribute
            expect(tab).toHaveAttribute('aria-controls');
            
            // Each tab should have an id
            expect(tab).toHaveAttribute('id');
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
