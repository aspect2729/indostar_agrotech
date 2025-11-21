/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Manages JWT tokens, user profile, and authentication flows.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, TokenResponse } from '../types';
import {
  handleGoogleCallback,
  refreshToken as refreshTokenApi,
  logout as logoutApi,
} from '../services/authService';
import {
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  setAuthToken,
  setRefreshToken,
  setStoredUser,
  clearStorage,
} from '../utils/storage';
import { logger } from '../utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = getAuthToken();
        const storedRefreshToken = getRefreshToken();
        const storedUser = getStoredUser();

        logger.info('Initializing auth', {
          hasToken: !!storedToken,
          hasRefreshToken: !!storedRefreshToken,
          hasUser: !!storedUser
        }, 'Auth');

        if (storedToken && storedRefreshToken && storedUser) {
          setAccessTokenState(storedToken);
          setRefreshTokenState(storedRefreshToken);
          setUser(storedUser);
          logger.info('User authenticated from storage', {
            userId: storedUser._id,
            role: storedUser.role,
            email: storedUser.email
          }, 'Auth');
        }
      } catch (err) {
        logger.error('Error initializing auth', err, 'Auth');
        clearStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = useCallback((tokenResponse: TokenResponse) => {
    const { access_token, refresh_token, user_id, email, name, role } = tokenResponse;

    // Create user object
    const userObj: User = {
      _id: user_id,
      googleId: user_id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update state
    setAccessTokenState(access_token);
    setRefreshTokenState(refresh_token);
    setUser(userObj);

    // Persist to localStorage
    setAuthToken(access_token);
    setRefreshToken(refresh_token);
    setStoredUser(userObj);

    setError(null);
  }, []);

  /**
   * Login with Google OAuth callback
   */
  const login = useCallback(async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    logger.info('Login attempt', { hasCode: !!code, hasState: !!state }, 'Auth');

    try {
      const tokenResponse = await handleGoogleCallback(code, state);
      handleAuthSuccess(tokenResponse);
      logger.info('Login successful', {
        userId: tokenResponse.user_id,
        role: tokenResponse.role,
        email: tokenResponse.email
      }, 'Auth');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      logger.error('Login failed', err, 'Auth');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    logger.info('User logging out', { userId: user?._id }, 'Auth');

    try {
      // Call logout API
      await logoutApi();
    } catch (err) {
      logger.error('Logout API error', err, 'Auth');
      // Continue with logout even if API call fails
    } finally {
      // Clear state
      setAccessTokenState(null);
      setRefreshTokenState(null);
      setUser(null);

      // Clear localStorage
      clearStorage();

      logger.info('Logout complete', null, 'Auth');
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    const currentRefreshToken = refreshTokenState || getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const tokenResponse = await refreshTokenApi(currentRefreshToken);
      handleAuthSuccess(tokenResponse);
    } catch (err) {
      // If refresh fails, logout user
      console.error('Token refresh failed:', err);
      await logout();
      throw err;
    }
  }, [refreshTokenState, handleAuthSuccess, logout]);

  /**
   * Update user profile
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    // If updates is a complete user object (has _id), use it directly
    const updatedUser = updates._id ? {
      ...updates,
      updatedAt: new Date().toISOString(),
    } as User : {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as User;

    // Update state immediately
    setUser(updatedUser);

    // Persist to localStorage
    setStoredUser(updatedUser);

    // Also ensure tokens are in state if they exist in localStorage
    const token = getAuthToken();
    const refresh = getRefreshToken();
    if (token) {
      setAccessTokenState(token);
    }
    if (refresh) {
      setRefreshTokenState(refresh);
    }

    // Ensure loading is false
    setIsLoading(false);

    logger.info('User updated', {
      userId: updatedUser._id,
      role: updatedUser.role,
      email: updatedUser.email
    }, 'Auth');
  }, [user]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken: refreshTokenState,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    error,
    login,
    logout,
    refreshAccessToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
