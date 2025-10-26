/**
 * useConfirmation Hook
 * 
 * A hook for managing confirmation dialogs with a clean API.
 * Provides methods to show confirmation dialogs and handle user responses.
 * 
 * @example
 * ```tsx
 * const { confirm, ConfirmationDialog } = useConfirmation();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure?',
 *     variant: 'danger',
 *   });
 *   
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 * 
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Delete</Button>
 *     <ConfirmationDialog />
 *   </>
 * );
 * ```
 */

import { useState, useCallback } from 'react';

export interface ConfirmationOptions {
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

export interface UseConfirmationReturn {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>; // Alias for confirm
  confirmationState: ConfirmationState;
  closeConfirmation: () => void;
}

/**
 * Hook for managing confirmation dialogs
 * 
 * @returns Object with confirm function and confirmation state
 */
export const useConfirmation = (): UseConfirmationReturn => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationState({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmationState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmationState.resolve) {
      confirmationState.resolve(true);
    }
    closeConfirmation();
  }, [confirmationState.resolve, closeConfirmation]);

  const handleCancel = useCallback(() => {
    if (confirmationState.resolve) {
      confirmationState.resolve(false);
    }
    closeConfirmation();
  }, [confirmationState.resolve, closeConfirmation]);

  return {
    confirm,
    showConfirmation: confirm, // Alias for backwards compatibility
    confirmationState: {
      ...confirmationState,
      onConfirm: handleConfirm,
      onClose: handleCancel,
    } as any,
    closeConfirmation,
  };
};

export default useConfirmation;
