/**
 * Form Validation Hook Tests
 * 
 * Unit tests for useFormValidation custom hook.
 */

import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';
import { ValidationResult } from '../utils/validation';

describe('useFormValidation', () => {
  const mockValidate = (values: any): ValidationResult => {
    const errors: { [key: string]: string } = {};
    
    if (!values.email || values.email.length === 0) {
      errors.email = 'Email is required';
    }
    
    if (!values.name || values.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const initialValues = {
    email: '',
    name: '',
  };

  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle field changes', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should clear errors when field changes', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    // Set an error
    act(() => {
      result.current.setFieldError('email', 'Email is required');
    });

    expect(result.current.errors.email).toBe('Email is required');

    // Change field value
    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('should mark field as touched on blur', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.touched.email).toBe(true);
  });

  it('should validate form on submit', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should not call onSubmit with invalid data
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.name).toBe('Name must be at least 3 characters');
  });

  it('should call onSubmit with valid data', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit,
      })
    );

    // Set valid values
    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleChange('name', 'John Doe');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'John Doe',
    });
  });

  it('should set isSubmitting during submission', async () => {
    const onSubmit = jest.fn<Promise<void>, [{ email: string; name: string }]>(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { email: 'test@example.com', name: 'John' },
        validate: mockValidate,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Check if isSubmitting is false after submission
    expect(result.current.isSubmitting).toBe(false);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should mark all fields as touched on submit', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.name).toBe(true);
  });

  it('should set field value programmatically', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'new@example.com');
    });

    expect(result.current.values.email).toBe('new@example.com');
  });

  it('should set field error programmatically', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.setFieldError('email', 'Custom error');
    });

    expect(result.current.errors.email).toBe('Custom error');
  });

  it('should set field touched programmatically', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.setFieldTouched('email', true);
    });

    expect(result.current.touched.email).toBe(true);
  });

  it('should reset form to initial values', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    // Make changes
    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.setFieldError('name', 'Error');
      result.current.setFieldTouched('email', true);
    });

    // Reset
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should validate single field', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('email', '');
      const isValid = result.current.validateField('email');
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.email).toBe('Email is required');
  });

  it('should validate entire form', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      const isValid = result.current.validateForm();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.name).toBeDefined();
  });

  it('should report isValid correctly', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validate: mockValidate,
        onSubmit: jest.fn(),
      })
    );

    // Initially valid (no errors)
    expect(result.current.isValid).toBe(true);

    // Add error
    act(() => {
      result.current.setFieldError('email', 'Error');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('should handle async onSubmit errors', async () => {
    const onSubmit = jest.fn(() => Promise.reject(new Error('Submit failed')));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { email: 'test@example.com', name: 'John' },
        validate: mockValidate,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
    
    consoleErrorSpy.mockRestore();
  });
});
