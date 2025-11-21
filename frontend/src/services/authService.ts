/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls.
 */

import api, { handleApiError, retryRequest } from './api';
import {
  GoogleAuthRequest,
  GoogleAuthCallbackRequest,
  TokenResponse,
  RefreshTokenRequest,
  LogoutResponse,
} from '../types';

/**
 * Initiate Google OAuth flow
 */
export const initiateGoogleAuth = async (redirectUri: string): Promise<{ authUrl: string }> => {
  try {
    const response = await retryRequest(() =>
      api.post<{ authorization_url: string; state: string }>('/api/auth/google', {
        redirect_uri: redirectUri,
      } as GoogleAuthRequest)
    );
    // Map backend response to expected format
    return { authUrl: response.data.authorization_url };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = async (
  code: string,
  state: string
): Promise<TokenResponse> => {
  try {
    const response = await retryRequest(() =>
      api.post<TokenResponse>('/api/auth/callback', {
        code,
        state,
      } as GoogleAuthCallbackRequest)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    const response = await api.post<TokenResponse>('/api/auth/refresh', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await api.post<LogoutResponse>('/api/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


/**
 * Register with email and password
 */
export const registerWithEmail = async (data: {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
}): Promise<any> => {
  const response = await api.post('/api/auth/register/email', data);
  return response.data;
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<any> => {
  const response = await api.post('/api/auth/login/email', { email, password });
  return response.data;
};

/**
 * Login with phone and password
 */
export const loginWithPhone = async (phone: string, password: string): Promise<any> => {
  const response = await api.post('/api/auth/login/phone', { phone, password });
  return response.data;
};
