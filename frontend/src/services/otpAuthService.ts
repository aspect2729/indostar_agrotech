/**
 * OTP Authentication Service
 */

import api from './api';

export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development
  expires_in?: number;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
  name?: string; // Required for new users
  role?: 'consumer' | 'distributor' | 'owner';
}

export interface VerifyOTPResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  phone: string;
  name: string;
  role: string;
  is_new_user: boolean;
}

/**
 * Send OTP to mobile number
 */
export const sendOTP = async (phone: string): Promise<SendOTPResponse> => {
  const response = await api.post('/api/auth/otp/send', { phone });
  return response.data;
};

/**
 * Verify OTP and login/register
 */
export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  const response = await api.post('/api/auth/otp/verify', data);
  return response.data;
};

/**
 * Resend OTP
 */
export const resendOTP = async (phone: string): Promise<SendOTPResponse> => {
  const response = await api.post('/api/auth/otp/resend', { phone });
  return response.data;
};
