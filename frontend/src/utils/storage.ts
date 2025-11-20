/**
 * Local Storage Utilities
 * 
 * Type-safe wrapper for localStorage operations.
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'indostar_auth_token',
  REFRESH_TOKEN: 'indostar_refresh_token',
  USER: 'indostar_user',
  CART: 'indostar_cart',
} as const;

/**
 * Get item from localStorage
 */
export const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Set item in localStorage
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Auth Token Management (tokens are stored as plain strings, not JSON)
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error reading auth token:', error);
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const removeAuthToken = (): void => {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Refresh Token Management (tokens are stored as plain strings, not JSON)
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error reading refresh token:', error);
    return null;
  }
};

export const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

export const removeRefreshToken = (): void => {
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// Combined Token Management (for API service)
export const getToken = (): string | null => {
  return getAuthToken();
};

export const setToken = (accessToken: string, refreshToken: string): void => {
  setAuthToken(accessToken);
  setRefreshToken(refreshToken);
};

export const removeToken = (): void => {
  removeAuthToken();
  removeRefreshToken();
  removeStoredUser();
};

// User Management
export const getStoredUser = (): any | null => {
  return getStorageItem(STORAGE_KEYS.USER);
};

export const setStoredUser = (user: any): void => {
  setStorageItem(STORAGE_KEYS.USER, user);
};

export const removeStoredUser = (): void => {
  removeStorageItem(STORAGE_KEYS.USER);
};

// Cart Management
export const getStoredCart = (): any | null => {
  return getStorageItem(STORAGE_KEYS.CART);
};

export const setStoredCart = (cart: any): void => {
  setStorageItem(STORAGE_KEYS.CART, cart);
};

export const removeStoredCart = (): void => {
  removeStorageItem(STORAGE_KEYS.CART);
};
