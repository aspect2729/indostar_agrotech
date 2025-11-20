/**
 * FormField Component Tests
 * 
 * Unit tests for the FormField component.
 */

import { render, screen } from '@testing-library/react';
import FormField from './FormField';

describe('FormField Component', () => {
  describe('Input Field', () => {
    it('should render input field with label', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          error="Email is required"
        />
      );

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display help text when no error', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          helpText="Enter your email address"
        />
      );

      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('should not display help text when error exists', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          helpText="Enter your email address"
          error="Email is required"
        />
      );

      expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should show error validation icon', () => {
      const { container } = render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          error="Email is required"
        />
      );

      const errorIcon = container.querySelector('.validation-icon.error');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon?.textContent).toBe('✕');
    });

    it('should show success validation icon', () => {
      const { container } = render(
        <FormField
          label="Email"
          type="email"
          value="test@example.com"
          onChange={() => {}}
          success
        />
      );

      const successIcon = container.querySelector('.validation-icon.success');
      expect(successIcon).toBeInTheDocument();
      expect(successIcon?.textContent).toBe('✓');
    });

    it('should apply error class when error exists', () => {
      const { container } = render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          error="Email is required"
        />
      );

      const input = container.querySelector('input');
      expect(input).toHaveClass('error');
    });

    it('should apply success class when success is true', () => {
      const { container } = render(
        <FormField
          label="Email"
          type="email"
          value="test@example.com"
          onChange={() => {}}
          success
        />
      );

      const input = container.querySelector('input');
      expect(input).toHaveClass('success');
    });

    it('should set aria-invalid when error exists', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          error="Email is required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error exists', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          error="Email is required"
          id="email-field"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-field-error');
    });
  });

  describe('Textarea Field', () => {
    it('should render textarea field', () => {
      render(
        <FormField
          label="Description"
          as="textarea"
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should display error for textarea', () => {
      render(
        <FormField
          label="Description"
          as="textarea"
          value=""
          onChange={() => {}}
          error="Description is required"
        />
      );

      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  describe('Select Field', () => {
    const options = [
      { value: '', label: 'Select an option' },
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    it('should render select field with options', () => {
      render(
        <FormField
          label="Category"
          as="select"
          options={options}
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should display error for select', () => {
      render(
        <FormField
          label="Category"
          as="select"
          options={options}
          value=""
          onChange={() => {}}
          error="Category is required"
        />
      );

      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });
  });

  describe('Field Types', () => {
    it('should render email input type', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render tel input type', () => {
      render(
        <FormField
          label="Phone"
          type="tel"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render number input type', () => {
      render(
        <FormField
          label="Quantity"
          type="number"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render password input type', () => {
      const { container } = render(
        <FormField
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
        />
      );

      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should pass through custom input props', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          placeholder="Enter email"
          disabled
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).toBeDisabled();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          className="custom-class"
        />
      );

      const formField = container.querySelector('.form-field');
      expect(formField).toHaveClass('custom-class');
    });

    it('should use custom id', () => {
      render(
        <FormField
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          id="custom-id"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should generate id from label when not provided', () => {
      render(
        <FormField
          label="Email Address"
          type="email"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'field-email-address');
    });
  });
});
