/**
 * Unified Loading State Hook
 * 
 * Provides consistent loading, error, and success state handling across the application.
 * Reduces boilerplate code and ensures consistent behavior.
 * 
 * @example
 * ```tsx
 * const { isLoading, error, execute } = useLoadingState({
 *   onSuccess: () => toastService.success('Operation successful!'),
 *   onError: (err) => toastService.error(err.message),
 * });
 * 
 * const handleSave = async () => {
 *   await execute(() => api.save(data));
 * };
 * ```
 */

import { useState, useCallback } from 'react';

export interface UseLoadingStateOptions<T = void> {
  /**
   * Initial loading state
   * @default false
   */
  initialLoading?: boolean;
  
  /**
   * Callback fired on successful execution
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback fired on error
   */
  onError?: (error: Error) => void;
  
  /**
   * Callback fired when execution completes (success or error)
   */
  onComplete?: () => void;
}

export interface UseLoadingStateReturn<T = void> {
  /**
   * Current loading state
   */
  isLoading: boolean;
  
  /**
   * Current error (null if no error)
   */
  error: Error | null;
  
  /**
   * Last successful result (null if no success yet)
   */
  data: T | null;
  
  /**
   * Execute an async function with automatic loading/error handling
   */
  execute: (asyncFn: () => Promise<T>) => Promise<T>;
  
  /**
   * Reset all state to initial values
   */
  reset: () => void;
  
  /**
   * Set error manually
   */
  setError: (error: Error | null) => void;
  
  /**
   * Set loading state manually
   */
  setLoading: (loading: boolean) => void;
}

/**
 * Hook for managing loading states with automatic error handling
 * 
 * Features:
 * - Automatic loading state management
 * - Error capture and handling
 * - Success callbacks
 * - Data storage
 * - Manual state control
 * - Type-safe
 * 
 * @param options Configuration options
 * @returns Loading state management object
 */
export function useLoadingState<T = void>(
  options: UseLoadingStateOptions<T> = {}
): UseLoadingStateReturn<T> {
  const [isLoading, setIsLoading] = useState(options.initialLoading ?? false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  const setErrorManual = useCallback((error: Error | null) => {
    setError(error);
  }, []);

  const setLoadingManual = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setError: setErrorManual,
    setLoading: setLoadingManual,
  };
}

/**
 * Specialized hook for form submissions
 * Includes toast notifications by default
 * 
 * @example
 * ```tsx
 * const { isSubmitting, handleSubmit } = useFormSubmission({
 *   onSubmit: async (data) => await api.save(data),
 *   successMessage: 'Saved successfully!',
 * });
 * ```
 */
export interface UseFormSubmissionOptions<T = any> {
  /**
   * Async function to execute on submit
   */
  onSubmit: (data: T) => Promise<void>;
  
  /**
   * Callback fired on successful submission
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback fired on error
   */
  onError?: (error: Error) => void;
  
  /**
   * Success message to display (uses toast service)
   */
  successMessage?: string;
  
  /**
   * Error message to display (uses toast service)
   * If not provided, uses error.message
   */
  errorMessage?: string;
}

export interface UseFormSubmissionReturn<T = any> {
  /**
   * Whether form is currently submitting
   */
  isSubmitting: boolean;
  
  /**
   * Current error (null if no error)
   */
  error: Error | null;
  
  /**
   * Handle form submission
   */
  handleSubmit: (data: T) => Promise<void>;
  
  /**
   * Reset submission state
   */
  reset: () => void;
}

/**
 * Hook for handling form submissions with toast notifications
 * 
 * @param options Configuration options
 * @returns Form submission management object
 */
export function useFormSubmission<T = any>(
  options: UseFormSubmissionOptions<T>
): UseFormSubmissionReturn<T> {
  const { isLoading, error, execute, reset } = useLoadingState<void>({
    onSuccess: () => {
      if (options.successMessage) {
        // Dynamic import to avoid circular dependency
        import('../services/toast.service').then(({ toastService }) => {
          toastService.success(options.successMessage!);
        });
      }
    },
    onError: (err) => {
      const message = options.errorMessage || err.message;
      // Dynamic import to avoid circular dependency
      import('../services/toast.service').then(({ toastService }) => {
        toastService.error(message);
      });
      options.onError?.(err);
    },
  });

  const handleSubmit = useCallback(
    async (data: T) => {
      await execute(() => options.onSubmit(data));
      options.onSuccess?.(data);
    },
    [execute, options]
  );

  return {
    isSubmitting: isLoading,
    error,
    handleSubmit,
    reset,
  };
}
