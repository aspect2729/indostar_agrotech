/**
 * Services Index
 * 
 * Central export point for all API services.
 */

// Export API instance and utilities
export { default as api, handleApiError, retryRequest } from './api';

// Export authentication service
export * from './authService';

// Export product service
export * from './productService';

// Export order service
export * from './orderService';

// Export inventory service
export * from './inventoryService';

// Export user service
export * from './userService';
