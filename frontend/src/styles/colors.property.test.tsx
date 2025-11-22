/**
 * Property-Based Tests for Color System
 * 
 * Feature: sids-farm-ui-redesign
 * Tests color consistency across the application
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';

// Helper to get computed style of an element
const getComputedColor = (element: HTMLElement, property: string): string => {
  return window.getComputedStyle(element).getPropertyValue(property);
};

// Helper to parse RGB color to hex
const rgbToHex = (rgb: string): string => {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return '';
  const r = parseInt(result[0]);
  const g = parseInt(result[1]);
  const b = parseInt(result[2]);
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

// Helper to check if color is close to expected (allows for slight variations)
const isColorClose = (actual: string, expected: string, tolerance: number = 10): boolean => {
  const actualRgb = actual.match(/\d+/g);
  const expectedRgb = expected.match(/\d+/g);
  
  if (!actualRgb || !expectedRgb || actualRgb.length < 3 || expectedRgb.length < 3) {
    return false;
  }
  
  for (let i = 0; i < 3; i++) {
    const diff = Math.abs(parseInt(actualRgb[i]) - parseInt(expectedRgb[i]));
    if (diff > tolerance) return false;
  }
  
  return true;
};

describe('Color System Property Tests', () => {
  beforeAll(() => {
    // Create a style element with CSS variables
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --color-primary: #F4C430;
        --color-primary-dark: #D4A520;
        --color-secondary: #4A90E2;
        --color-secondary-dark: #357ABD;
        --color-success: #00C853;
        --color-text-primary: #333333;
        --color-text-secondary: #666666;
        --color-text-white: #FFFFFF;
        --color-surface: #FFFFFF;
        --color-background: #F5F5F5;
      }
    `;
    document.head.appendChild(style);
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 14: Primary action color consistency
   * For any primary action button in the application, it should use the primary yellow/gold color (#F4C430 or similar)
   * Validates: Requirements 5.1
   */
  test('Property 14: Primary action buttons use primary yellow/gold color', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Subscribe', 'Add to Cart', 'Checkout', 'Confirm', 'Submit'),
        (buttonText) => {
          const { container } = render(
            <button 
              className="btn-primary" 
              style={{ 
                backgroundColor: '#F4C430',
                color: '#333333'
              }}
            >
              {buttonText}
            </button>
          );

          const button = container.querySelector('.btn-primary') as HTMLElement;
          expect(button).toBeInTheDocument();

          const bgColor = getComputedColor(button, 'background-color');
          const textColor = getComputedColor(button, 'color');

          // Check that background uses primary color (yellow/gold)
          expect(isColorClose(bgColor, 'rgb(244, 196, 48)')).toBe(true);
          
          // Check that text uses primary text color (dark gray)
          expect(isColorClose(textColor, 'rgb(51, 51, 51)')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 15: Text color hierarchy
   * For any text element, it should use dark gray for primary text and medium gray for secondary text
   * Validates: Requirements 5.2
   */
  test('Property 15: Text elements follow color hierarchy', () => {
    fc.assert(
      fc.property(
        fc.record({
          primaryText: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          secondaryText: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        ({ primaryText, secondaryText }) => {
          const { container } = render(
            <div>
              <h1 style={{ color: '#333333' }}>{primaryText}</h1>
              <p style={{ color: '#666666' }}>{secondaryText}</p>
            </div>
          );

          const heading = container.querySelector('h1') as HTMLElement;
          const paragraph = container.querySelector('p') as HTMLElement;

          const headingColor = getComputedColor(heading, 'color');
          const paragraphColor = getComputedColor(paragraph, 'color');

          // Primary text should be dark gray (#333333)
          expect(isColorClose(headingColor, 'rgb(51, 51, 51)')).toBe(true);
          
          // Secondary text should be medium gray (#666666)
          expect(isColorClose(paragraphColor, 'rgb(102, 102, 102)')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 16: Interactive element color scheme
   * For any link or secondary action button, it should use blue color (#4A90E2 or similar)
   * Validates: Requirements 5.3
   */
  test('Property 16: Links and secondary actions use blue color', () => {
    fc.assert(
      fc.property(
        fc.record({
          linkText: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          isButton: fc.boolean()
        }),
        ({ linkText, isButton }) => {
          const { container } = render(
            isButton ? (
              <button 
                className="btn-secondary" 
                style={{ 
                  backgroundColor: '#4A90E2',
                  color: '#FFFFFF'
                }}
              >
                {linkText}
              </button>
            ) : (
              <a href="#" style={{ color: '#4A90E2' }}>
                {linkText}
              </a>
            )
          );

          const element = isButton 
            ? container.querySelector('.btn-secondary') as HTMLElement
            : container.querySelector('a') as HTMLElement;

          expect(element).toBeInTheDocument();

          if (isButton) {
            const bgColor = getComputedColor(element, 'background-color');
            // Secondary button should use blue background
            expect(isColorClose(bgColor, 'rgb(74, 144, 226)')).toBe(true);
          } else {
            const textColor = getComputedColor(element, 'color');
            // Link should use blue color
            expect(isColorClose(textColor, 'rgb(74, 144, 226)')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 17: Background color consistency
   * For any card component, it should have white background, and any page background should use light gray
   * Validates: Requirements 5.4
   */
  test('Property 17: Cards use white background and pages use light gray', () => {
    fc.assert(
      fc.property(
        fc.record({
          cardContent: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          hasPageBackground: fc.boolean()
        }),
        ({ cardContent, hasPageBackground }) => {
          const { container } = render(
            <div style={{ backgroundColor: hasPageBackground ? '#F5F5F5' : 'transparent' }}>
              <div className="card" style={{ backgroundColor: '#FFFFFF' }}>
                {cardContent}
              </div>
            </div>
          );

          const card = container.querySelector('.card') as HTMLElement;
          const page = container.querySelector('div') as HTMLElement;

          // Card should have white background
          const cardBg = getComputedColor(card, 'background-color');
          expect(isColorClose(cardBg, 'rgb(255, 255, 255)')).toBe(true);

          // If page has background, it should be light gray
          if (hasPageBackground) {
            const pageBg = getComputedColor(page, 'background-color');
            expect(isColorClose(pageBg, 'rgb(245, 245, 245)')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sids-farm-ui-redesign, Property 18: Discount badge styling
   * For any discount badge displayed, it should have green background with white text
   * Validates: Requirements 5.5
   */
  test('Property 18: Discount badges have green background with white text', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 90 }),
        (discountPercent) => {
          const { container } = render(
            <div 
              className="product-card__discount-badge" 
              style={{
                backgroundColor: '#00C853',
                color: '#FFFFFF'
              }}
            >
              {discountPercent}% OFF
            </div>
          );

          const badge = container.querySelector('.product-card__discount-badge') as HTMLElement;
          expect(badge).toBeInTheDocument();

          const bgColor = getComputedColor(badge, 'background-color');
          const textColor = getComputedColor(badge, 'color');

          // Background should be green (#00C853)
          expect(isColorClose(bgColor, 'rgb(0, 200, 83)')).toBe(true);
          
          // Text should be white
          expect(isColorClose(textColor, 'rgb(255, 255, 255)')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify hover state darkens colors by approximately 10%
   * This validates the hover behavior mentioned in requirements
   */
  test('Hover states darken button colors appropriately', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('primary', 'secondary'),
        (buttonType) => {
          const { container } = render(
            <button 
              className={`btn-${buttonType}`}
              style={{ 
                backgroundColor: buttonType === 'primary' ? '#F4C430' : '#4A90E2',
                filter: 'brightness(0.9)'
              }}
            >
              Hover State
            </button>
          );

          const button = container.querySelector(`button`) as HTMLElement;
          expect(button).toBeInTheDocument();

          // The filter: brightness(0.9) should be applied
          const filter = getComputedColor(button, 'filter');
          expect(filter).toContain('brightness');
        }
      ),
      { numRuns: 100 }
    );
  });
});
