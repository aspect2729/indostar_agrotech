/**
 * Subscription Service
 * API calls for milk subscription management
 */

import api from './api';

export interface Subscription {
  _id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  default_quantity_liters: number;
  price_per_liter: number;
  status: 'active' | 'paused' | 'cancelled';
  start_date: string;
  end_date?: string;
  delivery_address: any;
  delivery_time_preference: 'morning' | 'evening';
  skip_days: string[];
  total_delivered_liters: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  product_id: string;
  default_quantity_liters: number;
  delivery_address: any;
  delivery_time_preference: 'morning' | 'evening';
  skip_days: string[];
}

export interface UpdateSubscriptionData {
  default_quantity_liters?: number;
  delivery_address?: any;
  delivery_time_preference?: 'morning' | 'evening';
  skip_days?: string[];
  status?: 'active' | 'paused' | 'cancelled';
}

export interface DailyQuantityAdjustment {
  date: string; // YYYY-MM-DD
  quantity_liters: number;
  notes?: string;
}

export interface MonthlyBill {
  subscription_id: string;
  month: string;
  product_name: string;
  deliveries: Array<{
    date: string;
    day: string;
    quantity_liters: number;
    price_per_liter: number;
    amount: number;
    status: string;
  }>;
  total_liters: number;
  total_amount: number;
  price_per_liter: number;
  start_date: string;
  end_date: string;
}

/**
 * Create a new milk subscription
 */
export const createSubscription = async (data: CreateSubscriptionData): Promise<Subscription> => {
  const response = await api.post('/api/subscriptions', data);
  return response.data;
};

/**
 * Get all subscriptions for current user
 */
export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const response = await api.get('/api/subscriptions');
  return response.data;
};

/**
 * Get a specific subscription
 */
export const getSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const response = await api.get(`/api/subscriptions/${subscriptionId}`);
  return response.data;
};

/**
 * Update subscription details
 */
export const updateSubscription = async (
  subscriptionId: string,
  data: UpdateSubscriptionData
): Promise<Subscription> => {
  const response = await api.put(`/api/subscriptions/${subscriptionId}`, data);
  return response.data;
};

/**
 * Adjust daily quantity (must be at least 1 day in advance)
 */
export const adjustDailyQuantity = async (
  subscriptionId: string,
  adjustment: DailyQuantityAdjustment
): Promise<Subscription> => {
  const response = await api.post(`/api/subscriptions/${subscriptionId}/adjust`, adjustment);
  return response.data;
};

/**
 * Get monthly bill for a subscription
 */
export const getMonthlyBill = async (
  subscriptionId: string,
  month: string // YYYY-MM
): Promise<MonthlyBill> => {
  const response = await api.get(`/api/subscriptions/${subscriptionId}/bill/${month}`);
  return response.data;
};

/**
 * Pause a subscription
 */
export const pauseSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const response = await api.post(`/api/subscriptions/${subscriptionId}/pause`);
  return response.data;
};

/**
 * Resume a paused subscription
 */
export const resumeSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const response = await api.post(`/api/subscriptions/${subscriptionId}/resume`);
  return response.data;
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const response = await api.delete(`/api/subscriptions/${subscriptionId}`);
  return response.data;
};

// Owner methods
/**
 * Get all subscriptions (owner only)
 */
export const getAllSubscriptions = async (status?: string): Promise<Subscription[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/api/subscriptions/admin/all', { params });
  return response.data;
};

/**
 * Mark delivery as completed (owner only)
 */
export const markDeliveryCompleted = async (
  subscriptionId: string,
  date: string
): Promise<any> => {
  const response = await api.post(`/api/subscriptions/admin/${subscriptionId}/deliver/${date}`);
  return response.data;
};
