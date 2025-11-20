/**
 * Inventory Service
 * 
 * Handles all inventory-related API calls (Owner only).
 */

import api, { handleApiError, retryRequest } from './api';
import {
  InventoryResponse,
  InventoryListResponse,
  UpdateInventoryRequest,
  LowStockAlertsResponse,
} from '../types';

/**
 * Get all inventory levels (Owner only)
 */
export const getAllInventory = async (): Promise<InventoryListResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<InventoryListResponse>('/api/inventory')
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get inventory for a specific product
 */
export const getInventoryByProductId = async (productId: string): Promise<InventoryResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<InventoryResponse>(`/api/inventory/${productId}`)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update inventory quantity (Owner only)
 */
export const updateInventory = async (
  productId: string,
  inventoryData: UpdateInventoryRequest
): Promise<InventoryResponse> => {
  try {
    const response = await api.put<InventoryResponse>(
      `/api/inventory/${productId}`,
      inventoryData
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get low stock alerts (Owner only)
 */
export const getLowStockAlerts = async (): Promise<LowStockAlertsResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<LowStockAlertsResponse>('/api/inventory/alerts')
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Set inventory quantity (Owner only)
 */
export const setInventoryQuantity = async (
  productId: string,
  quantity: number
): Promise<InventoryResponse> => {
  try {
    const response = await api.put<InventoryResponse>(`/api/inventory/${productId}`, {
      quantity,
      operation: 'set',
    } as UpdateInventoryRequest);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Add to inventory quantity (Owner only)
 */
export const addInventoryQuantity = async (
  productId: string,
  quantity: number
): Promise<InventoryResponse> => {
  try {
    const response = await api.put<InventoryResponse>(`/api/inventory/${productId}`, {
      quantity,
      operation: 'add',
    } as UpdateInventoryRequest);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Subtract from inventory quantity (Owner only)
 */
export const subtractInventoryQuantity = async (
  productId: string,
  quantity: number
): Promise<InventoryResponse> => {
  try {
    const response = await api.put<InventoryResponse>(`/api/inventory/${productId}`, {
      quantity,
      operation: 'subtract',
    } as UpdateInventoryRequest);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
