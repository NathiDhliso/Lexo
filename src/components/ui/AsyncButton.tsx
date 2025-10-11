import React, { useState } from 'react';
import { Button, ButtonProps } from './Button';
import { toastService } from '../../services/toast.service';

export interface AsyncButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'onError'> {
  onAsyncClick: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * AsyncButton Component
 * 
 * A button component that automatically handles async operations with loading states,
 * success/error feedback, and prevents double-submission.
 * 
 * Features:
 * - Automatic loading state management
 * - Toast notifications for success/error
 * - Double-click prevention during async operations
 * - Error handling with custom callbacks
 * 
 * @example
 * ```tsx
 * <AsyncButton
 *   variant="primary"
 *   onAsyncClick={async () => {
 *     await saveData();
 *   }}
 *   successMessage="Data saved successfully!"
 *   errorMessage="Failed to save data"
 * >
 *   Save
 * </AsyncButton>
 * ```
 */
export const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  (
    {
      onAsyncClick,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      disabled = false,
      ...buttonProps
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent action if already loading or disabled
      if (isLoading || disabled) {
        e.preventDefault();
        return;
      }

      setIsLoading(true);

      try {
        await onAsyncClick();
        
        // Show success message if provided
        if (successMessage) {
          toastService.success(successMessage);
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('AsyncButton error:', error);
        
        // Show error message
        const message = errorMessage || 'An error occurred. Please try again.';
        toastService.error(message);
        
        // Call error callback if provided
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Button
        ref={ref}
        {...buttonProps}
        loading={isLoading}
        disabled={disabled || isLoading}
        onClick={handleClick}
      />
    );
  }
);

AsyncButton.displayName = 'AsyncButton';
