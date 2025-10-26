/**
 * FormSelect Component
 * Select dropdown component with consistent styling
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, touched, required, helperText, className, children, ...props }, ref) => {
    const showError = touched && error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {label}
            {required && <span className="text-status-error-600 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 min-h-[44px]',
            'border rounded-lg',
            'bg-white dark:bg-metallic-gray-800',
            'text-neutral-900 dark:text-neutral-100',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            showError
              ? 'border-status-error-500 focus:border-status-error-500 focus:ring-status-error-500'
              : 'border-neutral-300 dark:border-metallic-gray-600 focus:border-mpondo-gold-500 focus:ring-mpondo-gold-500',
            'hover:border-neutral-400 dark:hover:border-metallic-gray-500',
            'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed dark:disabled:bg-metallic-gray-700',
            className
          )}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        >
          {children}
        </select>
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

FormSelect.displayName = 'FormSelect';

export default FormSelect;
