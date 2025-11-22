/**
 * Utilities Index
 * 
 * Exports all utility functions and helpers.
 */

// Configuration
export { config } from './config';

// Storage utilities
export { getToken, setToken, removeToken, getRefreshToken, clearStorage } from './storage';

// Helper utilities
export * from './helpers';

// Validation utilities
export * from './validation';

// Error handling utilities
export * from './errorHandling';

// Scroll animations
export { initAllScrollAnimations } from './scrollAnimations';

// Image optimization utilities
export * from './imageOptimization';

// Animation performance utilities
export * from './animationPerformance';
