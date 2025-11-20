/**
 * Order Service
 * 
 * Handles all order-related API calls.
 */

import api, { handleApiError, retryRequest } from './api';
import {
  OrderListResponse,
  OrderResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderQueryParams,
} from '../types';

/**
 * Create a new order
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  try {
    const response = await api.post<OrderResponse>('/api/orders', orderData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get all orders for the current user (or all orders for owner)
 */
export const getOrders = async (params?: OrderQueryParams): Promise<OrderListResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<OrderListResponse>('/api/orders', { params })
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<OrderResponse>(`/api/orders/${orderId}`)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update order status (Owner only)
 */
export const updateOrderStatus = async (
  orderId: string,
  statusData: UpdateOrderStatusRequest
): Promise<OrderResponse> => {
  try {
    const response = await api.put<OrderResponse>(`/api/orders/${orderId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get order history for current user
 */
export const getOrderHistory = async (params?: OrderQueryParams): Promise<OrderListResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<OrderListResponse>('/api/orders', { params })
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string): Promise<OrderResponse> => {
  try {
    const response = await api.put<OrderResponse>(`/api/orders/${orderId}/status`, {
      status: 'cancelled',
    } as UpdateOrderStatusRequest);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
