# Contexts

This directory contains React Context providers for global state management.

## AuthContext

The `AuthContext` provides authentication state and methods throughout the application.

### Features

- **JWT Token Management**: Stores and manages access and refresh tokens in localStorage
- **User Profile**: Maintains current user information and role
- **Authentication Methods**: Login, logout, and token refresh functionality
- **Automatic Token Refresh**: Integrates with API service for seamless token renewal

### Usage

```typescript
import { useAuth } from '../contexts';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  // Access user information
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Provider Setup

The `AuthProvider` should wrap your entire application (or at least the parts that need authentication):

```typescript
import { AuthProvider } from './contexts';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### State Properties

- `user`: Current user object or null
- `accessToken`: JWT access token or null
- `refreshToken`: JWT refresh token or null
- `isAuthenticated`: Boolean indicating if user is logged in
- `isLoading`: Boolean indicating if auth state is being initialized
- `error`: Error message or null

### Methods

- `login(code, state)`: Handles Google OAuth callback and logs in user
- `logout()`: Logs out user and clears all auth data
- `refreshAccessToken()`: Manually refreshes the access token
- `updateUser(updates)`: Updates user profile information
