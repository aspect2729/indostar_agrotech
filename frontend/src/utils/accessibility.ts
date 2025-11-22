/**
 * Accessibility Utilities
 * 
 * Helper functions for ensuring accessibility compliance.
 * Implements requirements: 5.2, 8.1
 */

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format (e.g., #FFFFFF)');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 7;
}

/**
 * Check if contrast ratio meets WCAG AA standard for large text (3:1)
 */
export function meetsWCAGAALargeText(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 3;
}

/**
 * Verify touch target size meets minimum requirements (44x44px)
 */
export function isTouchTargetAccessible(width: number, height: number): boolean {
  const MIN_SIZE = 44;
  return width >= MIN_SIZE && height >= MIN_SIZE;
}

/**
 * Get element dimensions
 */
export function getElementDimensions(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Verify all interactive elements have accessible touch targets
 */
export function verifyTouchTargets(container: HTMLElement): {
  passed: boolean;
  failures: Array<{ element: HTMLElement; width: number; height: number }>;
} {
  const interactiveElements = container.querySelectorAll<HTMLElement>(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
  );

  const failures: Array<{ element: HTMLElement; width: number; height: number }> = [];

  interactiveElements.forEach((element) => {
    const { width, height } = getElementDimensions(element);
    if (!isTouchTargetAccessible(width, height)) {
      failures.push({ element, width, height });
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Color contrast verification for the design system
 * Documents all color combinations and their contrast ratios
 */
export const colorContrastAudit = {
  // Primary text on white background
  primaryTextOnWhite: {
    foreground: '#333333',
    background: '#FFFFFF',
    ratio: getContrastRatio('#333333', '#FFFFFF'),
    meetsAA: meetsWCAGAA('#333333', '#FFFFFF'),
    meetsAAA: meetsWCAGAAA('#333333', '#FFFFFF'),
  },
  // Secondary text on white background
  secondaryTextOnWhite: {
    foreground: '#666666',
    background: '#FFFFFF',
    ratio: getContrastRatio('#666666', '#FFFFFF'),
    meetsAA: meetsWCAGAA('#666666', '#FFFFFF'),
    meetsAAA: meetsWCAGAAA('#666666', '#FFFFFF'),
  },
  // Primary text on light gray background
  primaryTextOnLightGray: {
    foreground: '#333333',
    background: '#F5F5F5',
    ratio: getContrastRatio('#333333', '#F5F5F5'),
    meetsAA: meetsWCAGAA('#333333', '#F5F5F5'),
    meetsAAA: meetsWCAGAAA('#333333', '#F5F5F5'),
  },
  // Primary button (dark text on yellow)
  primaryButton: {
    foreground: '#333333',
    background: '#F4C430',
    ratio: getContrastRatio('#333333', '#F4C430'),
    meetsAA: meetsWCAGAA('#333333', '#F4C430'),
    meetsAAA: meetsWCAGAAA('#333333', '#F4C430'),
  },
  // Secondary button (blue text on white)
  secondaryButton: {
    foreground: '#4A90E2',
    background: '#FFFFFF',
    ratio: getContrastRatio('#4A90E2', '#FFFFFF'),
    meetsAA: meetsWCAGAA('#4A90E2', '#FFFFFF'),
    meetsAAA: meetsWCAGAAA('#4A90E2', '#FFFFFF'),
  },
  // Discount badge (white text on green)
  discountBadge: {
    foreground: '#FFFFFF',
    background: '#00C853',
    ratio: getContrastRatio('#FFFFFF', '#00C853'),
    meetsAA: meetsWCAGAA('#FFFFFF', '#00C853'),
    meetsAAA: meetsWCAGAAA('#FFFFFF', '#00C853'),
  },
  // Notification badge (white text on red)
  notificationBadge: {
    foreground: '#FFFFFF',
    background: '#E53935',
    ratio: getContrastRatio('#FFFFFF', '#E53935'),
    meetsAA: meetsWCAGAA('#FFFFFF', '#E53935'),
    meetsAAA: meetsWCAGAAA('#FFFFFF', '#E53935'),
  },
  // Link color on white
  linkOnWhite: {
    foreground: '#4A90E2',
    background: '#FFFFFF',
    ratio: getContrastRatio('#4A90E2', '#FFFFFF'),
    meetsAA: meetsWCAGAA('#4A90E2', '#FFFFFF'),
    meetsAAA: meetsWCAGAAA('#4A90E2', '#FFFFFF'),
  },
};

/**
 * Log color contrast audit results to console
 */
export function logColorContrastAudit(): void {
  console.group('🎨 Color Contrast Audit');
  Object.entries(colorContrastAudit).forEach(([key, value]) => {
    const status = value.meetsAA ? '✅' : '❌';
    console.log(
      `${status} ${key}: ${value.ratio.toFixed(2)}:1 (AA: ${value.meetsAA}, AAA: ${value.meetsAAA})`
    );
  });
  console.groupEnd();
}

/**
 * Trap focus within a container (for modals, drawers, etc.)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

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

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
