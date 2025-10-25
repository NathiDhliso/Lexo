/**
 * FieldError Component
 * Inline error display for form fields with icon and message
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
  id?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  touched = true,
  className,
  id
}) => {
  if (!error || !touched) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2 mt-1.5 text-sm text-status-error-600 dark:text-status-error-400',
        className
      )}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
};

export default FieldError;
