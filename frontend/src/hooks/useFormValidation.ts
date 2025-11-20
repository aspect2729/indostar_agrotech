/**
 * Form Validation Hook
 * 
 * Custom React hook for managing form validation state.
 * Implements requirement: 6.4
 */

import { useState, useCallback } from 'react';
import { ValidationResult } from '../utils/validation';

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validate: (values: T) => ValidationResult;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export const useFormValidation = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Handle field change
  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field as string]: true }));
    validateField(field);
  }, [values]);

  // Validate single field
  const validateField = useCallback((field: keyof T): boolean => {
    const validationResult = validate(values);
    
    if (validationResult.errors[field as string]) {
      setErrors((prev) => ({
        ...prev,
        [field as string]: validationResult.errors[field as string],
      }));
      return false;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      return true;
    }
  }, [values, validate]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const validationResult = validate(values);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [values, validate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validate form
    const isFormValid = validateForm();

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field as string]: error }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field as string]: isTouched }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm,
  };
};
