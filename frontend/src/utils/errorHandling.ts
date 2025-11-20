/**
 * Error Handling Utilities
 * 
 * Utilities for handling API errors, network errors, and user-friendly error messages.
 * Implements requirement: 6.4
 */

import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured error object
 */
export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: any;
  originalError?: any;
}

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    return (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      !error.response
    );
  }
  return false;
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  }
  return false;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    // Retry on 5xx errors and 429 (Too Many Requests)
    return status ? status >= 500 || status === 429 : false;
  }

  return false;
};

/**
 * Parse API error response
 */
export const parseApiError = (error: unknown): AppError => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Network error
    if (isNetworkError(error)) {
      return {
        type: ErrorType.NETWORK,
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error,
      };
    }

    // Timeout error
    if (isTimeoutError(error)) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Request timed out. Please try again.',
        originalError: error,
      };
    }

    // HTTP errors with response
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      // Extract error message from API response
      const apiMessage = data?.error?.message || axiosError.message;

      switch (status) {
        case 400:
          return {
            type: ErrorType.VALIDATION,
            message: apiMessage || 'Invalid request. Please check your input.',
            statusCode: status,
            details: data?.error?.details,
            originalError: error,
          };

        case 401:
          return {
            type: ErrorType.AUTHENTICATION,
            message: 'Your session has expired. Please log in again.',
            statusCode: status,
            originalError: error,
          };

        case 403:
          return {
            type: ErrorType.AUTHORIZATION,
            message: 'You do not have permission to perform this action.',
            statusCode: status,
            originalError: error,
          };

        case 404:
          return {
            type: ErrorType.NOT_FOUND,
            message: apiMessage || 'The requested resource was not found.',
            statusCode: status,
            originalError: error,
          };

        case 422:
          return {
            type: ErrorType.VALIDATION,
            message: apiMessage || 'Validation failed. Please check your input.',
            statusCode: status,
            details: data?.error?.details,
            originalError: error,
          };

        case 429:
          return {
            type: ErrorType.SERVER,
            message: 'Too many requests. Please try again later.',
            statusCode: status,
            originalError: error,
          };

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ErrorType.SERVER,
            message: 'Server error. Please try again later.',
            statusCode: status,
            originalError: error,
          };

        default:
          return {
            type: ErrorType.UNKNOWN,
            message: apiMessage || 'An unexpected error occurred.',
            statusCode: status,
            originalError: error,
          };
      }
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred.',
      originalError: error,
    };
  }

  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred.',
    originalError: error,
  };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  const appError = parseApiError(error);
  return appError.message;
};

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Calculate retry delay with exponential backoff
 */
const calculateRetryDelay = (
  attempt: number,
  config: RetryConfig
): number => {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = retryConfig.shouldRetry
        ? retryConfig.shouldRetry(error, attempt)
        : isRetryableError(error);

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === retryConfig.maxRetries - 1 || !shouldRetry) {
        throw error;
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, retryConfig);
      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Network status detection
 */
export class NetworkStatusMonitor {
  private listeners: Array<(isOnline: boolean) => void> = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners(false);
  };

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach((listener) => listener(isOnline));
  }

  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners = [];
  }
}

// Singleton instance
export const networkMonitor = new NetworkStatusMonitor();

/**
 * Error boundary helper
 */
export const logError = (error: Error, errorInfo?: any) => {
  // In production, send to error tracking service (e.g., Sentry)
  console.error('Error caught:', error);
  if (errorInfo) {
    console.error('Error info:', errorInfo);
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (
  errors: { [key: string]: string }
): string => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 0) return '';
  if (errorMessages.length === 1) return errorMessages[0];
  return errorMessages.join(', ');
};

/**
 * Create error toast message
 */
export interface ToastMessage {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  duration?: number;
}

export const createErrorToast = (error: unknown): ToastMessage => {
  const appError = parseApiError(error);
  
  let type: ToastMessage['type'] = 'error';
  if (appError.type === ErrorType.NETWORK || appError.type === ErrorType.TIMEOUT) {
    type = 'warning';
  }

  return {
    type,
    message: appError.message,
    duration: 5000,
  };
};
