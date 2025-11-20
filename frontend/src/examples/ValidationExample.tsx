/**
 * Validation Example Component
 * 
 * Demonstrates the usage of form validation utilities.
 * This file is for reference only and should not be imported in production.
 */

import React, { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { FormField, ErrorMessage } from '../components/common';
import { validateAddress, AddressValidation } from '../utils/validation';
import { getUserFriendlyErrorMessage } from '../utils/errorHandling';

const ValidationExample: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation<AddressValidation>({
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
        setSuccessMessage(null);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        console.log('Form submitted:', values);
        setSuccessMessage('Address saved successfully!');
      } catch (error) {
        setApiError(getUserFriendlyErrorMessage(error));
      }
    },
  });

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h1>Form Validation Example</h1>
      
      {apiError && (
        <ErrorMessage
          message={apiError}
          type="error"
          onDismiss={() => setApiError(null)}
        />
      )}
      
      {successMessage && (
        <ErrorMessage
          message={successMessage}
          type="info"
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Street Address"
          type="text"
          value={values.street}
          onChange={(e) => handleChange('street', e.target.value)}
          onBlur={() => handleBlur('street')}
          error={touched.street ? errors.street : undefined}
          required
          placeholder="Enter your street address"
          helpText="Include building number and street name"
        />

        <FormField
          label="City"
          type="text"
          value={values.city}
          onChange={(e) => handleChange('city', e.target.value)}
          onBlur={() => handleBlur('city')}
          error={touched.city ? errors.city : undefined}
          required
          placeholder="Enter your city"
        />

        <FormField
          label="State"
          type="text"
          value={values.state}
          onChange={(e) => handleChange('state', e.target.value)}
          onBlur={() => handleBlur('state')}
          error={touched.state ? errors.state : undefined}
          required
          placeholder="Enter your state"
        />

        <FormField
          label="Pincode"
          type="text"
          value={values.pincode}
          onChange={(e) => handleChange('pincode', e.target.value)}
          onBlur={() => handleBlur('pincode')}
          error={touched.pincode ? errors.pincode : undefined}
          required
          placeholder="Enter 6-digit pincode"
          maxLength={6}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: isSubmitting ? '#ccc' : '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <h3>Form State (Debug)</h3>
        <pre style={{ fontSize: '0.85rem', overflow: 'auto' }}>
          {JSON.stringify({ values, errors, touched, isSubmitting }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ValidationExample;
