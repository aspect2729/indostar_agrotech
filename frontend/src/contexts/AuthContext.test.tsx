/**
 * AuthContext Tests
 * 
 * Unit tests for authentication context and hooks.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';
import * as storage from '../utils/storage';

// Mock the services and storage
jest.mock('../services/authService');
jest.mock('../utils/storage');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('AuthContext', () => {
  const mockTokenResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    expires_in: 1800,
    user_id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'consumer' as const,
  };

  const mockUser = {
    _id: 'user123',
    googleId: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'consumer' as const,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockStorage.getAuthToken.mockReturnValue(null);
    mockStorage.getRefreshToken.mockReturnValue(null);
    mockStorage.getStoredUser.mockReturnValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initialization', () => {
    it('should initialize with no user when storage is empty', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should initialize with stored user data', async () => {
      mockStorage.getAuthToken.mockReturnValue('stored-token');
      mockStorage.getRefreshToken.mockReturnValue('stored-refresh');
      mockStorage.getStoredUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe('stored-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear storage on initialization error', () => {
      mockStorage.getAuthToken.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(mockStorage.clearStorage).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      mockAuthService.handleGoogleCallback.mockResolvedValue(mockTokenResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('auth-code', 'state');
      });

      expect(mockAuthService.handleGoogleCallback).toHaveBeenCalledWith('auth-code', 'state');
      expect(result.current.user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer',
      });
      expect(result.current.accessToken).toBe('mock-access-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockStorage.setAuthToken).toHaveBeenCalledWith('mock-access-token');
      expect(mockStorage.setRefreshToken).toHaveBeenCalledWith('mock-refresh-token');
      expect(mockStorage.setStoredUser).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      const error = new Error('Login failed');
      mockAuthService.handleGoogleCallback.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      try {
        await act(async () => {
          await result.current.login('auth-code', 'state');
        });
        fail('Should have thrown an error');
      } catch (err) {
        expect((err as Error).message).toBe('Login failed');
      }
      
      expect(result.current.user).toBeNull();
    });

    it('should set loading state during login', async () => {
      mockAuthService.handleGoogleCallback.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTokenResponse), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login('auth-code', 'state');
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      mockStorage.getAuthToken.mockReturnValue('stored-token');
      mockStorage.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.logout.mockResolvedValue({ message: 'Successfully logged out' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockStorage.clearStorage).toHaveBeenCalled();
    });

    it('should logout even if API call fails', async () => {
      mockStorage.getAuthToken.mockReturnValue('stored-token');
      mockStorage.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.logout.mockRejectedValue(new Error('API error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(mockStorage.clearStorage).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Refresh Token', () => {
    it('should refresh access token successfully', async () => {
      mockStorage.getRefreshToken.mockReturnValue('refresh-token');
      mockAuthService.refreshToken.mockResolvedValue(mockTokenResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshAccessToken();
      });

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('refresh-token');
      expect(result.current.accessToken).toBe('mock-access-token');
      expect(mockStorage.setAuthToken).toHaveBeenCalledWith('mock-access-token');
    });

    it('should throw error when no refresh token available', async () => {
      mockStorage.getRefreshToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.refreshAccessToken();
        })
      ).rejects.toThrow('No refresh token available');
    });

    it('should logout on refresh token failure', async () => {
      mockStorage.getAuthToken.mockReturnValue('token');
      mockStorage.getRefreshToken.mockReturnValue('refresh-token');
      mockStorage.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.refreshToken.mockRejectedValue(new Error('Token expired'));
      mockAuthService.logout.mockResolvedValue({ message: 'Successfully logged out' });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      try {
        await act(async () => {
          await result.current.refreshAccessToken();
        });
      } catch (error) {
        // Expected to throw
      }

      // Check that logout was called
      expect(mockStorage.clearStorage).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Update User', () => {
    it('should update user profile', async () => {
      mockStorage.getAuthToken.mockReturnValue('stored-token');
      mockStorage.getRefreshToken.mockReturnValue('stored-refresh');
      mockStorage.getStoredUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      act(() => {
        result.current.updateUser({ name: 'Updated Name' });
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(mockStorage.setStoredUser).toHaveBeenCalled();
    });

    it('should not update when no user is logged in', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.updateUser({ name: 'Updated Name' });
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Authentication State', () => {
    it('should report isAuthenticated correctly', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Not authenticated initially
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear error on successful login', async () => {
      mockAuthService.handleGoogleCallback.mockResolvedValue(mockTokenResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set an error manually
      act(() => {
        result.current.login('bad-code', 'state').catch(() => {});
      });

      // Login succeeds and clears error
      await act(async () => {
        await result.current.login('code', 'state');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
