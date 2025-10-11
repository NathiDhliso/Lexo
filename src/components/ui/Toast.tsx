/**
 * Toast Component
 * 
 * Individual toast notification component with LexoHub design system styling.
 * This component is used internally by the toast service.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: (id: string) => void;
  visible?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  action,
  onDismiss,
  visible = true,
}) => {
  const getIcon = () => {
    const iconClass = 'w-6 h-6';

    switch (type) {
      case 'success':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getColors = () => {
    const colors = {
      success: {
        border: 'border-status-success-200 dark:border-status-success-800',
        bg: 'bg-status-success-50 dark:bg-status-success-900/20',
        icon: 'text-status-success-600 dark:text-status-success-400',
        actionText: 'text-status-success-700 dark:text-status-success-300',
      },
      error: {
        border: 'border-status-error-200 dark:border-status-error-800',
        bg: 'bg-status-error-50 dark:bg-status-error-900/20',
        icon: 'text-status-error-600 dark:text-status-error-400',
        actionText: 'text-status-error-700 dark:text-status-error-300',
      },
      warning: {
        border: 'border-status-warning-200 dark:border-status-warning-800',
        bg: 'bg-status-warning-50 dark:bg-status-warning-900/20',
        icon: 'text-status-warning-600 dark:text-status-warning-400',
        actionText: 'text-status-warning-700 dark:text-status-warning-300',
      },
      info: {
        border: 'border-judicial-blue-200 dark:border-judicial-blue-800',
        bg: 'bg-judicial-blue-50 dark:bg-judicial-blue-900/20',
        icon: 'text-judicial-blue-600 dark:text-judicial-blue-400',
        actionText: 'text-judicial-blue-700 dark:text-judicial-blue-300',
      },
    };

    return colors[type];
  };

  const colors = getColors();

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border',
        colors.bg,
        colors.border,
        'max-w-md w-full',
        visible ? 'animate-in' : 'animate-out'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', colors.icon)}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        {message && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className={cn(
              'mt-2 text-sm font-medium',
              colors.actionText,
              'hover:underline focus:outline-none focus:underline'
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
