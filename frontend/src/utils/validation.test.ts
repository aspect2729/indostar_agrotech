/**
 * Validation Utilities Tests
 * 
 * Unit tests for form validation functions.
 */

import {
  validateEmail,
  validatePhone,
  validatePincode,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumberRange,
  validatePositiveNumber,
  validateUrl,
  validateAddress,
  validateProductForm,
  validateOrder,
  validateInventoryUpdate,
  validateUserProfile,
  createValidator,
  ValidationRules,
} from './validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.in')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct Indian phone numbers', () => {
      expect(validatePhone('9876543210')).toBe(true);
      expect(validatePhone('8123456789')).toBe(true);
      expect(validatePhone('7000000000')).toBe(true);
      expect(validatePhone('6999999999')).toBe(true);
    });

    it('should handle phone numbers with formatting', () => {
      expect(validatePhone('987-654-3210')).toBe(true);
      expect(validatePhone('(987) 654-3210')).toBe(true);
      expect(validatePhone('987 654 3210')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(false); // starts with 1
      expect(validatePhone('5876543210')).toBe(false); // starts with 5
      expect(validatePhone('98765432')).toBe(false); // too short
      expect(validatePhone('98765432101')).toBe(false); // too long
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validatePincode', () => {
    it('should validate correct Indian pincodes', () => {
      expect(validatePincode('560001')).toBe(true);
      expect(validatePincode('110001')).toBe(true);
      expect(validatePincode('400001')).toBe(true);
    });

    it('should reject invalid pincodes', () => {
      expect(validatePincode('056001')).toBe(false); // starts with 0
      expect(validatePincode('56001')).toBe(false); // too short
      expect(validatePincode('5600011')).toBe(false); // too long
      expect(validatePincode('')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('text')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired([1, 2, 3])).toBe(true);
      expect(validateRequired(true)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
      expect(validateRequired([])).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('should validate strings meeting minimum length', () => {
      expect(validateMinLength('hello', 3)).toBe(true);
      expect(validateMinLength('hello', 5)).toBe(true);
    });

    it('should reject strings below minimum length', () => {
      expect(validateMinLength('hi', 3)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('should validate strings within maximum length', () => {
      expect(validateMaxLength('hello', 10)).toBe(true);
      expect(validateMaxLength('hello', 5)).toBe(true);
    });

    it('should reject strings exceeding maximum length', () => {
      expect(validateMaxLength('hello world', 5)).toBe(false);
    });
  });

  describe('validateNumberRange', () => {
    it('should validate numbers within range', () => {
      expect(validateNumberRange(5, 1, 10)).toBe(true);
      expect(validateNumberRange(1, 1, 10)).toBe(true);
      expect(validateNumberRange(10, 1, 10)).toBe(true);
    });

    it('should validate numbers with only min', () => {
      expect(validateNumberRange(5, 1)).toBe(true);
      expect(validateNumberRange(1, 1)).toBe(true);
    });

    it('should validate numbers with only max', () => {
      expect(validateNumberRange(5, undefined, 10)).toBe(true);
      expect(validateNumberRange(10, undefined, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(validateNumberRange(0, 1, 10)).toBe(false);
      expect(validateNumberRange(11, 1, 10)).toBe(false);
      expect(validateNumberRange(NaN, 1, 10)).toBe(false);
    });
  });

  describe('validatePositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(validatePositiveNumber(1)).toBe(true);
      expect(validatePositiveNumber(0.1)).toBe(true);
      expect(validatePositiveNumber(1000)).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(validatePositiveNumber(0)).toBe(false);
      expect(validatePositiveNumber(-1)).toBe(false);
      expect(validatePositiveNumber(NaN)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validateAddress', () => {
    it('should validate correct address', () => {
      const address = {
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
      };
      const result = validateAddress(address);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject address with missing fields', () => {
      const address = {
        street: '',
        city: '',
        state: '',
        pincode: '',
      };
      const result = validateAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.street).toBeDefined();
      expect(result.errors.city).toBeDefined();
      expect(result.errors.state).toBeDefined();
      expect(result.errors.pincode).toBeDefined();
    });

    it('should reject address with invalid pincode', () => {
      const address = {
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '12345',
      };
      const result = validateAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.pincode).toBeDefined();
    });
  });

  describe('validateProductForm', () => {
    it('should validate correct product form', () => {
      const product = {
        name: 'Organic Jaggery',
        category: 'jaggery',
        description: 'Pure organic jaggery from Karnataka',
        consumerPrice: 100,
        distributorPrice: 80,
        unit: 'kg',
      };
      const result = validateProductForm(product);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject product with invalid prices', () => {
      const product = {
        name: 'Organic Jaggery',
        category: 'jaggery',
        description: 'Pure organic jaggery',
        consumerPrice: 80,
        distributorPrice: 100, // distributor price higher than consumer
        unit: 'kg',
      };
      const result = validateProductForm(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.distributorPrice).toBeDefined();
    });

    it('should reject product with missing required fields', () => {
      const product = {
        name: '',
        category: '',
        description: '',
        consumerPrice: 0,
        distributorPrice: 0,
        unit: '',
      };
      const result = validateProductForm(product);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('validateOrder', () => {
    it('should validate correct order', () => {
      const order = {
        items: [
          { productId: 'prod1', quantity: 2 },
          { productId: 'prod2', quantity: 1 },
        ],
        deliveryAddress: {
          street: '123 Main Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
      };
      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject order with no items', () => {
      const order = {
        items: [],
        deliveryAddress: {
          street: '123 Main Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
      };
      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors.items).toBeDefined();
    });

    it('should reject order with invalid address', () => {
      const order = {
        items: [{ productId: 'prod1', quantity: 2 }],
        deliveryAddress: {
          street: '',
          city: '',
          state: '',
          pincode: '',
        },
      };
      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors.street).toBeDefined();
    });
  });

  describe('validateInventoryUpdate', () => {
    it('should validate correct inventory update', () => {
      const update = { quantity: 100, operation: 'set' as const };
      const result = validateInventoryUpdate(update);
      expect(result.isValid).toBe(true);
    });

    it('should reject negative quantity', () => {
      const update = { quantity: -10, operation: 'set' as const };
      const result = validateInventoryUpdate(update);
      expect(result.isValid).toBe(false);
      expect(result.errors.quantity).toBeDefined();
    });

    it('should reject invalid operation', () => {
      const update = { quantity: 100, operation: 'invalid' as any };
      const result = validateInventoryUpdate(update);
      expect(result.isValid).toBe(false);
      expect(result.errors.operation).toBeDefined();
    });
  });

  describe('validateUserProfile', () => {
    it('should validate correct user profile', () => {
      const profile = {
        name: 'John Doe',
        phone: '9876543210',
      };
      const result = validateUserProfile(profile);
      expect(result.isValid).toBe(true);
    });

    it('should validate profile without phone', () => {
      const profile = {
        name: 'John Doe',
      };
      const result = validateUserProfile(profile);
      expect(result.isValid).toBe(true);
    });

    it('should reject profile with invalid phone', () => {
      const profile = {
        name: 'John Doe',
        phone: '123456',
      };
      const result = validateUserProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('should reject profile with missing name', () => {
      const profile = {
        name: '',
      };
      const result = validateUserProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });
  });

  describe('createValidator', () => {
    it('should create custom validator', () => {
      const validator = createValidator({
        username: [
          ValidationRules.required(),
          ValidationRules.minLength(3),
        ],
        email: [
          ValidationRules.required(),
          ValidationRules.email(),
        ],
      });

      const validData = {
        username: 'john',
        email: 'john@example.com',
      };
      const result = validator(validData);
      expect(result.isValid).toBe(true);
    });

    it('should validate with custom rules', () => {
      const validator = createValidator({
        age: [
          ValidationRules.required(),
          ValidationRules.numberRange(18, 100),
        ],
      });

      const invalidData = { age: 15 };
      const result = validator(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBeDefined();
    });
  });

  describe('ValidationRules', () => {
    it('should create required rule', () => {
      const rule = ValidationRules.required('Custom message');
      expect(rule.validate('value')).toBe(true);
      expect(rule.validate('')).toBe(false);
      expect(rule.message).toBe('Custom message');
    });

    it('should create email rule', () => {
      const rule = ValidationRules.email();
      expect(rule.validate('test@example.com')).toBe(true);
      expect(rule.validate('invalid')).toBe(false);
    });

    it('should create phone rule', () => {
      const rule = ValidationRules.phone();
      expect(rule.validate('9876543210')).toBe(true);
      expect(rule.validate('123456')).toBe(false);
    });

    it('should create minLength rule', () => {
      const rule = ValidationRules.minLength(5);
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('hi')).toBe(false);
    });

    it('should create positiveNumber rule', () => {
      const rule = ValidationRules.positiveNumber();
      expect(rule.validate(10)).toBe(true);
      expect(rule.validate(0)).toBe(false);
      expect(rule.validate(-5)).toBe(false);
    });
  });
});
