/**
 * Theme Configuration
 * 
 * Central theme configuration for the Sid's Farm UI redesign.
 * Implements requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5
 */

export const theme = {
  colors: {
    // Primary Colors - Yellow/Gold theme
    primary: '#F4C430',           // Yellow/Gold for primary actions
    primaryDark: '#D4A520',       // Darker gold for hover states
    primaryLight: '#FFD700',      // Lighter gold for highlights
    
    // Secondary Colors - Blue theme
    secondary: '#4A90E2',         // Blue for links and secondary actions
    secondaryDark: '#357ABD',     // Darker blue for hover
    secondaryLight: '#6BA3E8',    // Lighter blue
    
    // Status Colors
    success: '#00C853',           // Green for success/discount badges
    successDark: '#00A344',       // Darker green
    warning: '#FF9800',           // Orange for warnings
    error: '#E53935',             // Red for errors
    info: '#2196F3',              // Blue for info
    
    // Text Colors
    textPrimary: '#333333',       // Dark gray for primary text
    textSecondary: '#666666',     // Medium gray for secondary text
    textDisabled: '#999999',      // Light gray for disabled text
    textWhite: '#FFFFFF',         // White text
    
    // Background Colors
    background: '#F5F5F5',        // Light gray for page backgrounds
    surface: '#FFFFFF',           // White for cards and surfaces
    overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    
    // Border Colors
    border: '#E0E0E0',            // Light gray for borders
    borderDark: '#CCCCCC',        // Darker border
    borderLight: '#F0F0F0',       // Lighter border
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
    full: '9999px',
  },
  
  typography: {
    fontFamily: {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      ios: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
      android: 'Roboto, "Noto Sans", sans-serif',
    },
    
    // Product name typography (16-18px medium)
    productName: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
      '@media (min-width: 768px)': {
        fontSize: '18px',
      },
    },
    
    // Price typography (20-24px bold)
    price: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (min-width: 768px)': {
        fontSize: '24px',
      },
    },
    
    // Page title typography (20-22px semi-bold)
    pageTitle: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (min-width: 768px)': {
        fontSize: '22px',
      },
    },
    
    // Body text typography (14-16px regular)
    body: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
      '@media (min-width: 768px)': {
        fontSize: '16px',
      },
    },
    
    // Additional typography scales
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    
    button: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '0.5px',
    },
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    header: '0 2px 4px rgba(0, 0, 0, 0.05)',
    drawer: '0 0 20px rgba(0, 0, 0, 0.1)',
    bottomNav: '0 -2px 10px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-out',
    drawer: '300ms ease-out',
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    header: 100,
    drawer: 1000,
    bottomNav: 90,
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
  
  // Touch target sizes for accessibility
  touchTarget: {
    min: '44px',
    comfortable: '48px',
  },
  
  // Animation timings
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      medium: '300ms',
      slow: '400ms',
      slower: '600ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

export type Theme = typeof theme;

export default theme;
