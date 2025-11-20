# Form Validation and Error Handling

This document describes the form validation and error handling utilities implemented for the Indostar E-commerce Application.

## Overview

The validation and error handling system provides:
- Reusable validation functions
- Form validation hook
- Error message components
- Network error detection and retry logic
- User-friendly error messages

## Validation Utilities

### Basic Validation Functions

Located in `utils/validation.ts`:

```typescript
import {
  validateEmail,
  validatePhone,
  validatePincode,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePositiveNumber,
  validateNumberRange,
} from '../utils/validation';

// Example usage
const isValid = validateEmail('user@example.com'); // true
const isValidPhone = validatePhone('9876543210'); // true
const isValidPincode = validatePincode('560001'); // true
```

### Pre-built Validators

```typescript
import {
  validateAddress,
  validateProductForm,
  validateOrder,
  validateInventoryUpdate,
  validateUserProfile,
} from '../utils/validation';

// Address validation
const addressResult = validateAddress({
  street: '123 Main St',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
});

if (!addressResult.isValid) {
  console.log(addressResult.errors); // { field: 'error message' }
}
```

### Custom Validators

Create custom validators using the `createValidator` function:

```typescript
import { createValidator, ValidationRules } from '../utils/validation';

const loginValidator = createValidator({
  email: [
    ValidationRules.required('Email is required'),
    ValidationRules.email(),
  ],
  password: [
    ValidationRules.required('Password is required'),
    ValidationRules.minLength(8, 'Password must be at least 8 characters'),
  ],
});

const result = loginValidator({ email: 'test@example.com', password: '12345' });
// result.isValid = false
// result.errors = { password: 'Password must be at least 8 characters' }
```

## Form Validation Hook

The `useFormValidation` hook manages form state and validation:

```typescript
import { useFormValidation } from '../hooks/useFormValidation';
import { validateAddress } from '../utils/validation';

const MyForm = () => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    initialValues: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    validate: validateAddress,
    onSubmit: async (values) => {
      // Submit form
      await saveAddress(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.street}
        onChange={(e) => handleChange('street', e.target.value)}
        onBlur={() => handleBlur('street')}
      />
      {touched.street && errors.street && (
        <span className="error">{errors.street}</span>
      )}
      
      <button type="submit" disabled={isSubmitting || !isValid}>
        Submit
      </button>
    </form>
  );
};
```

## Form Components

### FormField Component

Reusable form field with built-in validation display:

```typescript
import { FormField } from '../components/common';

<FormField
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
  helpText="We'll never share your email"
/>

// Textarea
<FormField
  as="textarea"
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  error={errors.description}
  rows={5}
/>

// Select
<FormField
  as="select"
  label="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={[
    { value: 'jaggery', label: 'Jaggery' },
    { value: 'oil', label: 'Oil' },
  ]}
/>
```

### ErrorMessage Component

Display error messages with consistent styling:

```typescript
import { ErrorMessage } from '../components/common';

<ErrorMessage
  message="Failed to save. Please try again."
  type="error"
  onDismiss={() => setError(null)}
/>

<ErrorMessage
  message="Your changes have been saved."
  type="success"
/>

<ErrorMessage
  message="Please review the form for errors."
  type="warning"
/>
```

## Error Handling

### Parse API Errors

```typescript
import { parseApiError, getUserFriendlyErrorMessage } from '../utils/errorHandling';

try {
  await createOrder(orderData);
} catch (error) {
  const appError = parseApiError(error);
  console.log(appError.type); // ErrorType.NETWORK, VALIDATION, etc.
  console.log(appError.message); // User-friendly message
  
  // Or get just the message
  const message = getUserFriendlyErrorMessage(error);
  setError(message);
}
```

### Retry with Backoff

Automatically retry failed requests:

```typescript
import { retryWithBackoff } from '../utils/errorHandling';

const data = await retryWithBackoff(
  () => fetchProducts(),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }
);
```

### Network Status Monitoring

Monitor network connectivity:

```typescript
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const MyComponent = () => {
  const { isOnline, isOffline } = useNetworkStatus();
  
  return (
    <div>
      {isOffline && <p>You are offline</p>}
      <button disabled={isOffline}>Submit</button>
    </div>
  );
};
```

The `OfflineIndicator` component is automatically included in the app and shows a banner when offline.

## Error Types

The system recognizes these error types:

- `NETWORK` - Network connectivity issues
- `TIMEOUT` - Request timeout
- `AUTHENTICATION` - 401 errors (session expired)
- `AUTHORIZATION` - 403 errors (insufficient permissions)
- `VALIDATION` - 400/422 errors (invalid input)
- `NOT_FOUND` - 404 errors
- `SERVER` - 5xx errors
- `UNKNOWN` - Other errors

## Best Practices

1. **Always validate on blur**: Use `handleBlur` to validate fields when users leave them
2. **Show errors only after touch**: Check `touched[field]` before showing errors
3. **Disable submit when invalid**: Use `isValid` to disable submit buttons
4. **Use user-friendly messages**: Always use `getUserFriendlyErrorMessage` for API errors
5. **Retry network errors**: Use `retryWithBackoff` for operations that can fail due to network issues
6. **Monitor network status**: Use `useNetworkStatus` to disable features when offline

## Example: Complete Form with Validation

```typescript
import React, { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { FormField, ErrorMessage } from '../components/common';
import { validateAddress } from '../utils/validation';
import { getUserFriendlyErrorMessage } from '../utils/errorHandling';
import { createOrder } from '../services';

const CheckoutForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    initialValues: {
      street: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
    },
    validate: validateAddress,
    onSubmit: async (values) => {
      try {
        setApiError(null);
        await createOrder({ deliveryAddress: values, items: [] });
        // Success!
      } catch (error) {
        setApiError(getUserFriendlyErrorMessage(error));
      }
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {apiError && <ErrorMessage message={apiError} type="error" />}
      
      <FormField
        label="Street Address"
        value={values.street}
        onChange={(e) => handleChange('street', e.target.value)}
        onBlur={() => handleBlur('street')}
        error={touched.street ? errors.street : undefined}
        required
      />
      
      <FormField
        label="City"
        value={values.city}
        onChange={(e) => handleChange('city', e.target.value)}
        onBlur={() => handleBlur('city')}
        error={touched.city ? errors.city : undefined}
        required
      />
      
      <FormField
        label="Pincode"
        value={values.pincode}
        onChange={(e) => handleChange('pincode', e.target.value)}
        onBlur={() => handleBlur('pincode')}
        error={touched.pincode ? errors.pincode : undefined}
        required
        maxLength={6}
      />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

## Testing

All validation functions are pure and easy to test:

```typescript
import { validateEmail, validatePhone } from '../utils/validation';

describe('Validation', () => {
  it('validates email correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });
  
  it('validates phone correctly', () => {
    expect(validatePhone('9876543210')).toBe(true);
    expect(validatePhone('1234567890')).toBe(false);
  });
});
```
