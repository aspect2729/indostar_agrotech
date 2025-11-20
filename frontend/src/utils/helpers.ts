/**
 * Helper Utilities
 * 
 * Common utility functions used throughout the application.
 */

import { config } from './config';

/**
 * Format currency value to Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Calculate tax amount
 */
export const calculateTax = (subtotal: number): number => {
  return subtotal * config.taxRate;
};

/**
 * Calculate shipping cost based on subtotal and delivery state
 */
export const calculateShipping = (
  subtotal: number,
  isInterState: boolean = false
): number => {
  if (subtotal >= config.freeShippingThreshold) {
    return 0;
  }
  
  const baseCost = config.defaultShippingCost;
  return isInterState ? baseCost * 2 : baseCost;
};

/**
 * Calculate order total
 */
export const calculateTotal = (
  subtotal: number,
  tax: number,
  shipping: number
): number => {
  return subtotal + tax + shipping;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if a product is low in stock
 */
export const isLowStock = (quantity: number, threshold?: number): boolean => {
  return quantity <= (threshold || config.lowStockThreshold);
};

/**
 * Get status color for order status
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'var(--warning)',
    confirmed: 'var(--info)',
    processing: 'var(--info)',
    shipped: 'var(--primary-color)',
    delivered: 'var(--success)',
    cancelled: 'var(--error)',
  };
  
  return statusColors[status] || 'var(--text-secondary)';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate pincode (Indian format)
 */
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Get category display name
 */
export const getCategoryDisplayName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    jaggery: 'Jaggery',
    oil: 'Oil',
    chutney_powder: 'Chutney Powder',
    pickles: 'Pickles',
    milk: 'Milk Products',
  };
  
  return categoryNames[category] || category;
};

/**
 * Generate order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

/**
 * Check if user has required role
 */
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

/**
 * Sleep utility for testing/delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
