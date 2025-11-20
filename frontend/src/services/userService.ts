/**
 * User Service
 * 
 * Handles all user profile-related API calls.
 */

import api, { handleApiError, retryRequest } from './api';
import {
  UserProfileResponse,
  UpdateUserProfileRequest,
} from '../types';

/**
 * Get current user profile
 */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<UserProfileResponse>('/api/users/profile')
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  profileData: UpdateUserProfileRequest
): Promise<UserProfileResponse> => {
  try {
    const response = await api.put<UserProfileResponse>('/api/users/profile', profileData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Add address to user profile
 */
export const addAddress = async (
  address: UpdateUserProfileRequest['addresses']
): Promise<UserProfileResponse> => {
  try {
    const currentProfile = await getUserProfile();
    const updatedAddresses = [...(currentProfile.addresses || []), ...(address || [])];
    
    const response = await api.put<UserProfileResponse>('/api/users/profile', {
      addresses: updatedAddresses,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update phone number
 */
export const updatePhoneNumber = async (phone: string): Promise<UserProfileResponse> => {
  try {
    const response = await api.put<UserProfileResponse>('/api/users/profile', {
      phone,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update user name
 */
export const updateUserName = async (name: string): Promise<UserProfileResponse> => {
  try {
    const response = await api.put<UserProfileResponse>('/api/users/profile', {
      name,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
