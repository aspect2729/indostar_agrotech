# Indostar Frontend - Project Structure

## Overview

This document provides a complete overview of the React TypeScript project structure for the Indostar E-commerce Application.

## Directory Structure

```
frontend/
│
├── public/                          # Static files served directly
│   ├── index.html                   # HTML template
│   ├── manifest.json                # PWA manifest
│   └── robots.txt                   # SEO robots configuration
│
├── src/                             # Source code
│   │
│   ├── components/                  # Reusable React components
│   │   ├── common/                  # Shared components (buttons, inputs, cards, modals)
│   │   ├── consumer/                # Consumer portal specific components
│   │   ├── distributor/             # Distributor portal specific components
│   │   ├── owner/                   # Owner dashboard specific components
│   │   ├── layout/                  # Layout components (header, footer, sidebar, nav)
│   │   └── README.md                # Component guidelines
│   │
│   ├── pages/                       # Page-level components (routes)
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── LoginPage/           # Login page with Google OAuth
│   │   │   └── CallbackPage/        # OAuth callback handler
│   │   ├── consumer/                # Consumer portal pages
│   │   │   ├── HomePage/            # Landing page with featured products
│   │   │   ├── ProductCatalog/      # Product listing with filters
│   │   │   ├── ProductDetail/       # Individual product details
│   │   │   ├── Cart/                # Shopping cart
│   │   │   └── OrderHistory/        # Past orders
│   │   ├── distributor/             # Distributor portal pages
│   │   │   ├── Dashboard/           # Distributor dashboard
│   │   │   ├── BulkOrder/           # Bulk order form
│   │   │   └── OrderHistory/        # Distributor order history
│   │   ├── owner/                   # Owner dashboard pages
│   │   │   ├── Inventory/           # Inventory management
│   │   │   ├── OrderManagement/     # Order management
│   │   │   └── Analytics/           # Sales analytics
│   │   ├── common/                  # Shared pages
│   │   │   ├── NotFound/            # 404 page
│   │   │   └── Unauthorized/        # 403 page
│   │   └── README.md                # Page guidelines
│   │
│   ├── services/                    # API service layer
│   │   ├── api.ts                   # Axios instance with interceptors
│   │   ├── authService.ts           # Authentication API calls
│   │   ├── productService.ts        # Product API calls
│   │   ├── orderService.ts          # Order API calls
│   │   ├── inventoryService.ts      # Inventory API calls
│   │   ├── userService.ts           # User profile API calls
│   │   └── README.md                # Service layer guidelines
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── CartContext.tsx          # Shopping cart state
│   │   └── README.md                # Context guidelines
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── index.ts                 # All type definitions
│   │   └── README.md                # Type documentation
│   │
│   ├── styles/                      # Global styles
│   │   ├── index.css                # Global styles and CSS variables
│   │   ├── App.css                  # App component styles
│   │   └── animations.css           # Reusable animations
│   │
│   ├── utils/                       # Utility functions
│   │   ├── config.ts                # Environment configuration
│   │   ├── helpers.ts               # Helper functions
│   │   └── storage.ts               # localStorage utilities
│   │
│   ├── App.tsx                      # Main application component
│   ├── index.tsx                    # Application entry point
│   ├── react-app-env.d.ts           # React types
│   └── reportWebVitals.ts           # Performance monitoring
│
├── .env                             # Environment variables (not in git)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── README.md                        # Project documentation
├── SETUP.md                         # Setup instructions
└── PROJECT_STRUCTURE.md             # This file
```

## Key Files

### Configuration Files

- **tsconfig.json**: TypeScript configuration with strict mode enabled
- **package.json**: Project dependencies and npm scripts
- **.env**: Environment variables (API URL, Google Client ID)
- **.gitignore**: Files to exclude from version control

### Entry Points

- **public/index.html**: HTML template with root div
- **src/index.tsx**: React application entry point
- **src/App.tsx**: Main application component

### Type Definitions

- **src/types/index.ts**: All TypeScript interfaces and types
  - User, Product, Order, Inventory types
  - API request/response types
  - Form and filter types

### Utilities

- **src/utils/config.ts**: Centralized configuration
- **src/utils/helpers.ts**: Common utility functions
- **src/utils/storage.ts**: localStorage wrapper

### Styles

- **src/styles/index.css**: Global styles and CSS variables
- **src/styles/animations.css**: Reusable animations
- **src/styles/App.css**: App component styles

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | React DOM rendering |
| typescript | ^4.9.5 | Type-safe JavaScript |
| react-scripts | 5.0.1 | Build tooling |

### Routing & State

| Package | Version | Purpose |
|---------|---------|---------|
| react-router-dom | ^6.20.0 | Client-side routing |

### API & Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.6.0 | HTTP client |
| react-google-login | ^5.2.2 | Google OAuth |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| @testing-library/react | ^13.4.0 | React testing |
| @testing-library/jest-dom | ^5.17.0 | Jest matchers |
| @testing-library/user-event | ^13.5.0 | User interaction testing |

### Type Definitions

| Package | Version | Purpose |
|---------|---------|---------|
| @types/react | ^18.2.0 | React types |
| @types/react-dom | ^18.2.0 | React DOM types |
| @types/node | ^16.18.0 | Node.js types |
| @types/jest | ^27.5.2 | Jest types |

## TypeScript Configuration

The project uses **strict mode** with the following settings:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true
}
```

## Environment Variables

Required environment variables:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## CSS Architecture

### CSS Variables

Global CSS variables defined in `src/styles/index.css`:

- **Colors**: Primary, secondary, neutral, status colors
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **Typography**: Font sizes and families
- **Border Radius**: Consistent border radius values
- **Shadows**: Box shadow utilities
- **Transitions**: Animation timing values

### Animation Guidelines

All animations in `src/styles/animations.css`:

- Fade animations (in/out)
- Slide animations (left/right/up/down)
- Scale animations
- Hover effects (lift, scale)
- Loading animations (spinner, pulse, skeleton)
- Scroll reveal animations

**Accessibility**: All animations respect `prefers-reduced-motion`

## Development Workflow

### 1. Start Development Server

```bash
npm start
```

Runs on http://localhost:3000 with hot reloading

### 2. Run Tests

```bash
npm test
```

Launches test runner in watch mode

### 3. Build for Production

```bash
npm run build
```

Creates optimized build in `build/` folder

### 4. Type Checking

```bash
npx tsc --noEmit
```

Checks for TypeScript errors

## Next Steps

After project setup, implement features in this order:

1. **API Service Layer** (Task 14)
   - Configure axios instance
   - Implement service functions
   - Add error handling

2. **Authentication** (Task 15)
   - Create AuthContext
   - Implement LoginPage
   - Set up Google OAuth

3. **Routing** (Task 16)
   - Configure React Router
   - Create ProtectedRoute component
   - Define route structure

4. **Consumer Portal** (Task 17)
   - HomePage
   - ProductCatalog
   - ProductDetail
   - Cart
   - OrderHistory

5. **Distributor Portal** (Task 18)
   - Dashboard
   - BulkOrderForm
   - OrderHistory

6. **Owner Dashboard** (Task 19)
   - InventoryManagement
   - OrderManagement
   - Analytics

7. **Styling & Animations** (Task 20)
   - Apply CSS animations
   - Implement transitions
   - Add loading states

8. **Form Validation** (Task 21)
   - Client-side validation
   - Error handling
   - User feedback

9. **Testing** (Task 22)
   - Component tests
   - Integration tests
   - E2E tests

## Best Practices

### Component Structure

```typescript
import React from 'react';
import './ComponentName.css';

interface ComponentNameProps {
  // Props with types
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### API Service Pattern

```typescript
import api from './api';
import { Product } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};
```

### Context Pattern

```typescript
import React, { createContext, useContext, useState } from 'react';

interface ContextState {
  // State shape
}

const Context = createContext<ContextState | undefined>(undefined);

export const useContextName = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContextName must be used within Provider');
  }
  return context;
};

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Provider implementation
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
```

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router Docs](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- Design Document: `.kiro/specs/indostar-ecommerce-app/design.md`
- Requirements: `.kiro/specs/indostar-ecommerce-app/requirements.md`
- Tasks: `.kiro/specs/indostar-ecommerce-app/tasks.md`
