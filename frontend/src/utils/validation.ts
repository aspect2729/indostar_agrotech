/**
 * Form Validation Utilities
 * 
 * Reusable validation functions for form inputs.
 * Implements requirement: 6.4
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Phone number validation (Indian format: 10 digits starting with 6-9)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Pincode validation (Indian format: 6 digits)
 */
export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode.trim());
};

/**
 * Required field validation
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Minimum length validation
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Maximum length validation
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

/**
 * Number range validation
 */
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

/**
 * Positive number validation
 */
export const validatePositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * URL validation
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Address validation
 */
export interface AddressValidation {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export const validateAddress = (address: AddressValidation): ValidationResult => {
  const errors: { [key: string]: string } = {};

  if (!validateRequired(address.street)) {
    errors.street = 'Street address is required';
  } else if (!validateMinLength(address.street, 5)) {
    errors.street = 'Street address must be at least 5 characters';
  }

  if (!validateRequired(address.city)) {
    errors.city = 'City is required';
  } else if (!validateMinLength(address.city, 2)) {
    errors.city = 'City name must be at least 2 characters';
  }

  if (!validateRequired(address.state)) {
    errors.state = 'State is required';
  }

  if (!validateRequired(address.pincode)) {
    errors.pincode = 'Pincode is required';
  } else if (!validatePincode(address.pincode)) {
    errors.pincode = 'Please enter a valid 6-digit pincode';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Product form validation
 */
export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  consumerPrice: number;
  distributorPrice: number;
  unit: string;
}

export const validateProductForm = (data: ProductFormData): ValidationResult => {
  const errors: { [key: string]: string } = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Product name is required';
  } else if (!validateMinLength(data.name, 3)) {
    errors.name = 'Product name must be at least 3 characters';
  } else if (!validateMaxLength(data.name, 100)) {
    errors.name = 'Product name must not exceed 100 characters';
  }

  if (!validateRequired(data.category)) {
    errors.category = 'Category is required';
  }

  if (!validateRequired(data.description)) {
    errors.description = 'Description is required';
  } else if (!validateMinLength(data.description, 10)) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!validatePositiveNumber(data.consumerPrice)) {
    errors.consumerPrice = 'Consumer price must be a positive number';
  }

  if (!validatePositiveNumber(data.distributorPrice)) {
    errors.distributorPrice = 'Distributor price must be a positive number';
  }

  if (data.distributorPrice > data.consumerPrice) {
    errors.distributorPrice = 'Distributor price cannot exceed consumer price';
  }

  if (!validateRequired(data.unit)) {
    errors.unit = 'Unit is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Order validation
 */
export interface OrderValidation {
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: AddressValidation;
}

export const validateOrder = (order: OrderValidation): ValidationResult => {
  const errors: { [key: string]: string } = {};

  if (!order.items || order.items.length === 0) {
    errors.items = 'Order must contain at least one item';
  } else {
    // Validate each item
    order.items.forEach((item, index) => {
      if (!validateRequired(item.productId)) {
        errors[`item_${index}_product`] = 'Product is required';
      }
      if (!validatePositiveNumber(item.quantity)) {
        errors[`item_${index}_quantity`] = 'Quantity must be a positive number';
      }
    });
  }

  // Validate address
  const addressValidation = validateAddress(order.deliveryAddress);
  if (!addressValidation.isValid) {
    Object.assign(errors, addressValidation.errors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Inventory update validation
 */
export interface InventoryUpdateData {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

export const validateInventoryUpdate = (
  data: InventoryUpdateData
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  if (!validateNumberRange(data.quantity, 0)) {
    errors.quantity = 'Quantity must be a non-negative number';
  }

  if (!['set', 'add', 'subtract'].includes(data.operation)) {
    errors.operation = 'Invalid operation';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * User profile validation
 */
export interface UserProfileData {
  name: string;
  phone?: string;
}

export const validateUserProfile = (data: UserProfileData): ValidationResult => {
  const errors: { [key: string]: string } = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  } else if (!validateMinLength(data.name, 2)) {
    errors.name = 'Name must be at least 2 characters';
  } else if (!validateMaxLength(data.name, 100)) {
    errors.name = 'Name must not exceed 100 characters';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generic form validator
 */
export const createValidator = (
  rules: { [key: string]: ValidationRule[] }
) => {
  return (data: { [key: string]: any }): ValidationResult => {
    const errors: { [key: string]: string } = {};

    Object.keys(rules).forEach((field) => {
      const fieldRules = rules[field];
      const value = data[field];

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          errors[field] = rule.message;
          break; // Stop at first error for this field
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validate: validateRequired,
    message,
  }),

  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    validate: validateEmail,
    message,
  }),

  phone: (message: string = 'Please enter a valid phone number'): ValidationRule => ({
    validate: validatePhone,
    message,
  }),

  pincode: (message: string = 'Please enter a valid 6-digit pincode'): ValidationRule => ({
    validate: validatePincode,
    message,
  }),

  minLength: (
    length: number,
    message?: string
  ): ValidationRule => ({
    validate: (value: string) => validateMinLength(value, length),
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (
    length: number,
    message?: string
  ): ValidationRule => ({
    validate: (value: string) => validateMaxLength(value, length),
    message: message || `Must not exceed ${length} characters`,
  }),

  positiveNumber: (
    message: string = 'Must be a positive number'
  ): ValidationRule => ({
    validate: validatePositiveNumber,
    message,
  }),

  numberRange: (
    min?: number,
    max?: number,
    message?: string
  ): ValidationRule => ({
    validate: (value: number) => validateNumberRange(value, min, max),
    message: message || `Must be between ${min} and ${max}`,
  }),
};
