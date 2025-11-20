# Services Directory

This directory contains API service modules for communicating with the backend.

## Structure

- **api.ts**: Axios instance configuration with interceptors
- **authService.ts**: Authentication API calls
- **productService.ts**: Product API calls
- **orderService.ts**: Order API calls
- **inventoryService.ts**: Inventory API calls
- **userService.ts**: User profile API calls

## Guidelines

- All API calls should go through the configured axios instance
- Services should handle request/response transformation
- Error handling should be consistent across all services
- Use TypeScript types for all request/response data
