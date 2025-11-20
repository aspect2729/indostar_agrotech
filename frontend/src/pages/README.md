# Pages

This directory contains top-level page components for the application.

## LoginPage

The `LoginPage` component provides the authentication interface for the Indostar E-commerce Application.

### Features

- **Dual Login Paths**: Separate login options for customers and business users (distributors/owners)
- **Google OAuth Integration**: Secure authentication using Google accounts
- **Attractive Design**: Modern UI with company branding and animations
- **Role-Based Redirect**: Automatically redirects users to appropriate portal based on their role
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **CSS Animations**: Smooth transitions and engaging visual effects

### User Flows

#### Customer Login
1. User clicks "Shop as Customer" button
2. Redirected to Google OAuth
3. After authentication, redirected to Consumer Portal (`/consumer/home`)

#### Business Login
1. User clicks "Business Portal" button
2. Redirected to Google OAuth
3. After authentication, redirected based on role:
   - Distributor → `/distributor/dashboard`
   - Owner → `/owner/dashboard`

### OAuth Callback Handling

The LoginPage automatically handles OAuth callbacks when the URL contains `code` and `state` parameters:

```
/login?code=OAUTH_CODE&state=OAUTH_STATE
```

The component will:
1. Extract the code and state from URL
2. Call the authentication API
3. Store tokens and user information
4. Redirect to appropriate portal

### Styling

The component uses `LoginPage.css` which includes:
- Gradient backgrounds
- Floating animations
- Hover effects
- Loading states
- Responsive breakpoints
- Reduced motion support

### Error Handling

The component displays user-friendly error messages for:
- Failed authentication
- Network errors
- Invalid OAuth responses
- Expired sessions
