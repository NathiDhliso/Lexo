/**
 * FormInput Component
 * 
 * Input component with built-in validation error display.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  helperText?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, touched, required, helperText, className, ...props }, ref) => {
    const showError = touched && error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {label}
            {required && <span className="text-status-error-600 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 min-h-[44px]',
            'border rounded-lg',
            'bg-white dark:bg-metallic-gray-900',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            showError
              ? 'border-status-error-500 focus:border-status-error-500 focus:ring-status-error-500'
              : 'border-neutral-300 dark:border-metallic-gray-600 focus:border-mpondo-gold-500 focus:ring-mpondo-gold-500',
            'hover:border-neutral-400 dark:hover:border-metallic-gray-500',
            'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed dark:disabled:bg-metallic-gray-800',
            className
          )}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        {showError && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-status-error-600 dark:text-status-error-400">
            {error}
          </p>
        )}
        {!showError && helperText && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
