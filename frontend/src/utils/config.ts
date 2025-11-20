/**
 * Application Configuration
 * 
 * Centralized configuration for environment variables and app settings.
 */

export const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  
  // Google OAuth Configuration
  googleClientId: '355932236944-k5bubv3d2gu0p92bdk3kj4k6ngr0duli.apps.googleusercontent.com',
  
  // App Settings
  appName: 'Indostar Agrotech',
  appVersion: '1.0.0',
  
  // Pagination
  defaultPageSize: 12,
  maxPageSize: 100,
  
  // Timeouts (in milliseconds)
  apiTimeout: 30000,
  tokenRefreshInterval: 840000, // 14 minutes (tokens expire in 15 minutes)
  
  // Tax and Shipping
  taxRate: 0.18, // 18% GST
  defaultShippingCost: 50,
  freeShippingThreshold: 500,
  
  // Inventory
  lowStockThreshold: 10,
  
  // Validation
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Feature Flags
  features: {
    paymentGateway: false, // Razorpay integration (future version)
    productReviews: false,
    wishlist: false,
    emailNotifications: false,
  },
} as const;

// Validate required environment variables
export const validateConfig = (): void => {
  const requiredVars = {
    REACT_APP_API_URL: config.apiUrl,
    REACT_APP_GOOGLE_CLIENT_ID: config.googleClientId,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
};

// Run validation on import
validateConfig();
