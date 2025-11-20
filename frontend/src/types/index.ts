/**
 * Type definitions for the Indostar E-commerce Application
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types should match the backend data models and API contracts.
 */

// User Types
export type UserRole = 'consumer' | 'distributor' | 'owner';

export interface Address {
  type: 'billing' | 'shipping';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

// Product Types
export type ProductCategory = 'jaggery' | 'oil' | 'chutney_powder' | 'pickles' | 'milk';

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  [key: string]: number;
}

export interface ProductPrice {
  consumer: number;
  distributor: number;
}

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  price: ProductPrice;
  unit: string;
  nutritionalInfo?: NutritionalInfo;
  interStateDelivery: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface Inventory {
  _id: string;
  productId: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastRestocked: string;
  updatedAt: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userType: 'consumer' | 'distributor';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  deliveryAddress: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface GoogleAuthRequest {
  redirect_uri: string;
}

export interface GoogleAuthCallbackRequest {
  code: string;
  state: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (code: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// API Response Types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Product API Types
export interface CreateProductRequest {
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  price: ProductPrice;
  unit: string;
  nutritionalInfo?: NutritionalInfo;
  interStateDelivery: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

export interface ProductQueryParams {
  category?: ProductCategory;
  search?: string;
  limit?: number;
  offset?: number;
  isActive?: boolean;
}

export interface ProductResponse extends Product {}

export interface ProductListResponse extends PaginatedResponse<Product> {}

// Order API Types
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: Address;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderQueryParams {
  status?: OrderStatus;
  userType?: 'consumer' | 'distributor';
  limit?: number;
  offset?: number;
}

export interface OrderResponse extends Order {}

export interface OrderListResponse extends PaginatedResponse<Order> {}

// Inventory API Types
export interface UpdateInventoryRequest {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

export interface InventoryResponse extends Inventory {
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface InventoryListResponse {
  data: InventoryResponse[];
}

export interface LowStockAlert {
  product: Product;
  inventory: InventoryResponse;
}

export interface LowStockAlertsResponse {
  data: LowStockAlert[];
}

// User API Types
export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  addresses?: Address[];
}

export interface UserProfileResponse extends User {}

// Cart API Types (for order creation)
export interface CartItemRequest {
  productId: string;
  quantity: number;
}

// Cart Types (Frontend only)
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
}

// Form Types
export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  userType?: 'consumer' | 'distributor';
  startDate?: string;
  endDate?: string;
}
