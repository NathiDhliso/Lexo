import React from 'react';
import { Button, ButtonProps } from './Button';
import { useLoadingState } from '../../hooks/useLoadingState';

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
    // Use the loading state hook
    const { isLoading, execute } = useLoadingState({
      onSuccess: () => {
        if (successMessage) {
          import('../../services/toast.service').then(({ toastService }) => {
            toastService.success(successMessage);
          });
        }
        onSuccess?.();
      },
      onError: (error) => {
        const message = errorMessage || 'An error occurred. Please try again.';
        import('../../services/toast.service').then(({ toastService }) => {
          toastService.error(message);
        });
        onError?.(error);
      },
    });

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent action if already loading or disabled
      if (isLoading || disabled) {
        e.preventDefault();
        return;
      }

      await execute(onAsyncClick);
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
