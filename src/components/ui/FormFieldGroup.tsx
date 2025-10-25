/**
 * FormFieldGroup Component
 * Wrapper for form fields with label, error display, and helper text
 */

import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormFieldGroupProps {
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  helperText?: string;
  helpTooltip?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  label,
  required,
  error,
  touched = true,
  helperText,
  helpTooltip,
  className,
  children,
  htmlFor
}) => {
  const showError = touched && error;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          <span>
            {label}
            {required && <span className="text-status-error-600 ml-1" aria-label="required">*</span>}
          </span>
          {helpTooltip && (
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              title={helpTooltip}
              aria-label={`Help: ${helpTooltip}`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </label>
      )}
      
      {children}
      
      {showError ? (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 mt-1.5 text-sm text-status-error-600 dark:text-status-error-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default FormFieldGroup;
