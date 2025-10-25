/**
 * InlineErrorAlert Component
 * Full-width inline error display for forms and sections
 */

import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InlineErrorAlertProps {
  error: string | string[];
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const InlineErrorAlert: React.FC<InlineErrorAlertProps> = ({
  error,
  variant = 'error',
  dismissible = false,
  onDismiss,
  className
}) => {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];

  const variantConfig = {
    error: {
      bg: 'bg-status-error-50 dark:bg-status-error-950/20',
      border: 'border-status-error-200 dark:border-status-error-800',
      text: 'text-status-error-700 dark:text-status-error-300',
      icon: XCircle,
      iconColor: 'text-status-error-600 dark:text-status-error-400'
    },
    warning: {
      bg: 'bg-status-warning-50 dark:bg-status-warning-950/20',
      border: 'border-status-warning-200 dark:border-status-warning-800',
      text: 'text-status-warning-700 dark:text-status-warning-300',
      icon: AlertTriangle,
      iconColor: 'text-status-warning-600 dark:text-status-warning-400'
    },
    info: {
      bg: 'bg-judicial-blue-50 dark:bg-judicial-blue-950/20',
      border: 'border-judicial-blue-200 dark:border-judicial-blue-800',
      text: 'text-judicial-blue-700 dark:text-judicial-blue-300',
      icon: AlertCircle,
      iconColor: 'text-judicial-blue-600 dark:text-judicial-blue-400'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        config.bg,
        config.border,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
      
      <div className={cn('flex-1 text-sm', config.text)}>
        {errors.length === 1 ? (
          <p>{errors[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        )}
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded transition-colors',
            config.text,
            'hover:bg-black/5 dark:hover:bg-white/5'
          )}
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default InlineErrorAlert;
