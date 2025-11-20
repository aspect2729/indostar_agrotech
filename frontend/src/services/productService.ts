/**
 * Product Service
 * 
 * Handles all product-related API calls.
 */

import api, { handleApiError, retryRequest } from './api';
import {
  ProductListResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from '../types';

/**
 * Get all products with optional filters
 */
export const getProducts = async (params?: ProductQueryParams): Promise<ProductListResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<ProductListResponse>('/api/products', { params })
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (productId: string): Promise<ProductResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<ProductResponse>(`/api/products/${productId}`)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new product (Owner only)
 */
export const createProduct = async (productData: CreateProductRequest): Promise<ProductResponse> => {
  try {
    const response = await api.post<ProductResponse>('/api/products', productData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing product (Owner only)
 */
export const updateProduct = async (
  productId: string,
  productData: UpdateProductRequest
): Promise<ProductResponse> => {
  try {
    const response = await api.put<ProductResponse>(`/api/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a product (Owner only)
 */
export const deleteProduct = async (productId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Search products by name or description
 */
export const searchProducts = async (
  searchQuery: string,
  params?: Omit<ProductQueryParams, 'search'>
): Promise<ProductListResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<ProductListResponse>('/api/products', {
        params: {
          ...params,
          search: searchQuery,
        },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string,
  params?: Omit<ProductQueryParams, 'category'>
): Promise<ProductListResponse> => {
  try {
    const response = await retryRequest(() =>
      api.get<ProductListResponse>('/api/products', {
        params: {
          ...params,
          category,
        },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
