/**
 * useOptimisticUpdate Hook
 * 
 * Provides optimistic UI updates with automatic rollback on error
 * Updates UI immediately, then syncs with server
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface OptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<void>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, data: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useOptimisticUpdate = <T,>() => {
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(
    async (
      currentData: T,
      optimisticData: T,
      updateFn: (data: T) => void,
      options: OptimisticUpdateOptions<T>
    ) => {
      // Apply optimistic update immediately
      updateFn(optimisticData);
      setIsUpdating(true);

      try {
        // Perform actual update
        await options.onUpdate(optimisticData);

        // Success
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        options.onSuccess?.(optimisticData);
      } catch (error) {
        // Rollback on error
        console.error('Optimistic update failed, rolling back:', error);
        updateFn(currentData);

        const errorMessage = options.errorMessage || 'Update failed. Changes reverted.';
        toast.error(errorMessage);
        options.onError?.(error as Error, optimisticData);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { update, isUpdating };
};

/**
 * Simplified optimistic toggle for boolean values
 */
export const useOptimisticToggle = <T extends Record<string, any>>(
  item: T,
  field: keyof T,
  updateFn: (item: T) => void,
  saveFn: (item: T) => Promise<void>
) => {
  const { update, isUpdating } = useOptimisticUpdate<T>();

  const toggle = useCallback(async () => {
    const currentValue = item[field];
    const optimisticItem = { ...item, [field]: !currentValue };

    await update(item, optimisticItem, updateFn, {
      onUpdate: saveFn,
      successMessage: undefined, // Silent success for toggles
      errorMessage: 'Failed to update. Please try again.',
    });
  }, [item, field, updateFn, saveFn, update]);

  return { toggle, isUpdating };
};
