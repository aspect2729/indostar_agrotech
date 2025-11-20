/**
 * Form Field Component
 * 
 * Reusable form field with validation and error display.
 * Implements requirement: 6.4
 */

import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import './FormField.css';

interface BaseFormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
}

interface InputFieldProps
  extends BaseFormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
  as?: 'input';
}

interface TextareaFieldProps
  extends BaseFormFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  as: 'textarea';
}

interface SelectFieldProps
  extends BaseFormFieldProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  as: 'select';
  options: Array<{ value: string; label: string }>;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

const FormField: React.FC<FormFieldProps> = (props) => {
  const {
    label,
    error,
    success,
    required,
    helpText,
    className = '',
    as = 'input',
    ...fieldProps
  } = props;

  const fieldId = fieldProps.id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;
  const fieldClassName = `form-field-input ${hasError ? 'error' : ''} ${
    success ? 'success' : ''
  }`;

  const renderField = () => {
    if (as === 'textarea') {
      const textareaProps = fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>;
      return (
        <textarea
          id={fieldId}
          className={fieldClassName}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...textareaProps}
        />
      );
    }

    if (as === 'select') {
      const selectProps = props as SelectFieldProps;
      return (
        <select
          id={fieldId}
          className={fieldClassName}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...(fieldProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {selectProps.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    const inputProps = fieldProps as InputHTMLAttributes<HTMLInputElement>;
    return (
      <div className="input-wrapper">
        <input
          id={fieldId}
          type={(props as InputFieldProps).type || 'text'}
          className={fieldClassName}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...inputProps}
        />
        {(hasError || success) && (
          <span className={`validation-icon ${hasError ? 'error' : 'success'}`}>
            {hasError ? '✕' : '✓'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={fieldId} className="form-field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      {renderField()}
      {helpText && !error && <span className="help-text">{helpText}</span>}
      {error && (
        <span id={`${fieldId}-error`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
