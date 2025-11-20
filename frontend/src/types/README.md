# TypeScript Types

This directory contains all TypeScript type definitions for the application.

## Main Types File

All types are exported from `index.ts` for easy importing:

```typescript
import { User, Product, Order, Cart } from '../types';
```

## Type Categories

### User Types
- `User`: User account information
- `UserRole`: Role enum ('consumer' | 'distributor' | 'owner')
- `Address`: Delivery/billing address structure
- `AuthState`: Authentication state for context
- `AuthContextType`: Authentication context interface with methods
- `UpdateUserProfileRequest`: Request type for updating user profile
- `UserProfileResponse`: Response type for user profile

### Product Types
- `Product`: Product information
- `ProductCategory`: Category enum
- `ProductPrice`: Consumer and distributor pricing
- `NutritionalInfo`: Nutritional facts
- `ProductFilters`: Filter parameters for product queries
- `CreateProductRequest`: Request type for creating products
- `UpdateProductRequest`: Request type for updating products
- `ProductQueryParams`: Query parameters for product listing
- `ProductResponse`: Response type for single product
- `ProductListResponse`: Response type for product list

### Order Types
- `Order`: Complete order information
- `OrderItem`: Individual items in an order
- `OrderStatus`: Order status enum
- `PaymentStatus`: Payment status enum
- `OrderFilters`: Filter parameters for order queries
- `CreateOrderRequest`: Request type for creating orders
- `UpdateOrderStatusRequest`: Request type for updating order status
- `OrderQueryParams`: Query parameters for order listing
- `OrderResponse`: Response type for single order
- `OrderListResponse`: Response type for order list

### Inventory Types
- `Inventory`: Stock level information
- `UpdateInventoryRequest`: Request type for updating inventory
- `InventoryResponse`: Response type with stock status flags
- `InventoryListResponse`: Response type for inventory list
- `LowStockAlert`: Low stock alert information
- `LowStockAlertsResponse`: Response type for low stock alerts

### Cart Types (Frontend Only)
- `Cart`: Shopping cart state
- `CartItem`: Product with quantity in cart

### Authentication API Types
- `GoogleAuthRequest`: Request for initiating Google OAuth
- `GoogleAuthCallbackRequest`: Request for OAuth callback
- `TokenResponse`: Authentication token response
- `RefreshTokenRequest`: Request for refreshing tokens
- `LogoutResponse`: Logout response

### Generic API Types
- `ApiError`: Error response structure
- `ApiResponse<T>`: Generic API response wrapper
- `PaginatedResponse<T>`: Generic paginated response

## Usage Examples

### Component Props

```typescript
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Component implementation
};
```

### API Service

```typescript
import { 
  Product, 
  ProductListResponse, 
  ProductQueryParams,
  CreateProductRequest,
  ProductResponse 
} from '../types';

export const getProducts = async (
  params?: ProductQueryParams
): Promise<ProductListResponse> => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const createProduct = async (
  data: CreateProductRequest
): Promise<ProductResponse> => {
  const response = await api.post('/products', data);
  return response.data;
};
```

### Context

```typescript
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usage in component
const { user, isAuthenticated, login, logout } = useAuth();
```

## Type Safety Guidelines

1. **Never use `any`**: Always define proper types
2. **Use interfaces for objects**: Prefer interfaces over type aliases for object shapes
3. **Use type aliases for unions**: Use `type` for union types and primitives
4. **Make optional properties explicit**: Use `?` for optional properties
5. **Use readonly when appropriate**: Mark properties that shouldn't change as `readonly`
6. **Export all types**: All types should be exported from index.ts

## Adding New Types

When adding new types:

1. Add the type definition to `index.ts`
2. Export it from the file
3. Document it in this README
4. Use it consistently throughout the application

## Type Matching with Backend

These types should match the backend data models defined in:
- `backend/app/models/user.py`
- `backend/app/models/product.py`
- `backend/app/models/order.py`
- `backend/app/models/inventory.py`

When the backend models change, update these types accordingly.
