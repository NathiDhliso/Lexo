/**
 * ToastContainer Component
 * 
 * Container component for managing and displaying multiple toast notifications.
 * Integrates with react-hot-toast for toast management.
 */

import React from 'react';
import { Toaster, ToasterProps } from 'react-hot-toast';

export interface ToastContainerProps {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  gutter?: number;
}

/**
 * ToastContainer Component
 * 
 * Renders the toast notification container with LexoHub styling.
 * Should be placed once at the root level of your application.
 * 
 * @example
 * ```tsx
 * import { ToastContainer } from '@/components/ui';
 * 
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <ToastContainer position="top-right" />
 *     </>
 *   );
 * }
 * ```
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  gutter = 8,
}) => {
  const toasterProps: ToasterProps = {
    position,
    reverseOrder: false,
    gutter,
    containerClassName: '',
    containerStyle: {},
    toastOptions: {
      // Default options for all toasts
      duration: 4000,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
      },
      // Success toast styling - using status-success colors
      success: {
        duration: 4000,
        iconTheme: {
          primary: '#22c55e', // status-success-600
          secondary: '#fff',
        },
      },
      // Error toast styling - using status-error colors
      error: {
        duration: 5000,
        iconTheme: {
          primary: '#dc2626', // status-error-600
          secondary: '#fff',
        },
      },
      // Loading toast styling - using judicial-blue colors
      loading: {
        duration: Infinity,
        iconTheme: {
          primary: '#2563eb', // judicial-blue-600
          secondary: '#fff',
        },
      },
      // Custom styling for different toast types
      custom: {
        duration: 4000,
      },
    },
  };

  return <Toaster {...toasterProps} />;
};

export default ToastContainer;
