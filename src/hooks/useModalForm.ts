/**
 * Modal Form Hook
 * 
 * Unified hook for managing modal forms with loading states, error handling,
 * and form data management. Eliminates boilerplate in modal components.
 * 
 * @example
 * ```tsx
 * const {
 *   formData,
 *   isLoading,
 *   error,
 *   handleChange,
 *   handleSubmit,
 *   reset
 * } = useModalForm({
 *   initialData: { name: '', email: '' },
 *   onSubmit: async (data) => await api.save(data),
 *   onSuccess: () => {
 *     toastService.success('Saved!');
 *     onClose();
 *   },
 * });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLoadingState } from './useLoadingState';

export interface UseModalFormOptions<T> {
  /**
   * Initial form data
   */
  initialData: T;
  
  /**
   * Function to call on form submission
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
   * Validation function
   */
  validate?: (data: T) => Record<string, string> | null;
  
  /**
   * Whether to reset form on success
   * @default true
   */
  resetOnSuccess?: boolean;
  
  /**
   * Success message to display
   */
  successMessage?: string;
  
  /**
   * Error message to display (overrides error.message)
   */
  errorMessage?: string;
}

export interface UseModalFormReturn<T> {
  /**
   * Current form data
   */
  formData: T;
  
  /**
   * Whether form is currently submitting
   */
  isLoading: boolean;
  
  /**
   * Current error (null if no error)
   */
  error: Error | null;
  
  /**
   * Validation errors
   */
  validationErrors: Record<string, string>;
  
  /**
   * Whether form has been modified
   */
  isDirty: boolean;
  
  /**
   * Whether form is valid
   */
  isValid: boolean;
  
  /**
   * Update a single field
   */
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  
  /**
   * Update multiple fields at once
   */
  setFormData: (data: Partial<T>) => void;
  
  /**
   * Handle form submission
   */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  
  /**
   * Reset form to initial state
   */
  reset: () => void;
  
  /**
   * Set validation errors manually
   */
  setValidationErrors: (errors: Record<string, string>) => void;
}

/**
 * Hook for managing modal forms with automatic loading states and validation
 * 
 * Features:
 * - Automatic loading state management
 * - Form data management
 * - Validation support
 * - Dirty state tracking
 * - Error handling
 * - Success callbacks
 * 
 * @param options Configuration options
 * @returns Modal form state and handlers
 */
export function useModalForm<T extends Record<string, any>>(
  options: UseModalFormOptions<T>
): UseModalFormReturn<T> {
  const {
    initialData,
    onSubmit,
    onSuccess,
    onError,
    validate,
    resetOnSuccess = true,
    successMessage,
    errorMessage,
  } = options;

  const [formData, setFormDataState] = useState<T>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { isLoading, error, execute, reset: resetLoading } = useLoadingState({
    onSuccess: (data) => {
      if (successMessage) {
        import('../services/toast.service').then(({ toastService }) => {
          toastService.success(successMessage);
        });
      }
      onSuccess?.(formData);
      if (resetOnSuccess) {
        reset();
      }
    },
    onError: (err) => {
      const message = errorMessage || err.message;
      import('../services/toast.service').then(({ toastService }) => {
        toastService.error(message);
      });
      onError?.(err);
    },
  });

  // Check if form is valid
  const isValid = Object.keys(validationErrors).length === 0;

  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormDataState(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear validation error for this field
    if (validationErrors[field as string]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const setFormData = useCallback((data: Partial<T>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Run validation if provided
    if (validate) {
      const errors = validate(formData);
      if (errors) {
        setValidationErrors(errors);
        return;
      }
    }
    
    // Clear any existing validation errors
    setValidationErrors({});
    
    // Execute the submission
    await execute(() => onSubmit(formData));
  }, [formData, validate, execute, onSubmit]);

  const reset = useCallback(() => {
    setFormDataState(initialData);
    setValidationErrors({});
    setIsDirty(false);
    resetLoading();
  }, [initialData, resetLoading]);

  // Track initial data to prevent unnecessary resets
  const initialDataRef = useRef(initialData);
  const initialDataString = JSON.stringify(initialData);
  const prevInitialDataString = useRef(initialDataString);

  // Reset form when initialData changes (e.g., when editing different items)
  useEffect(() => {
    if (prevInitialDataString.current !== initialDataString) {
      setFormDataState(initialData);
      setIsDirty(false);
      initialDataRef.current = initialData;
      prevInitialDataString.current = initialDataString;
    }
  }, [initialDataString, initialData]);

  return {
    formData,
    isLoading,
    error,
    validationErrors,
    isDirty,
    isValid,
    handleChange,
    setFormData,
    handleSubmit,
    reset,
    setValidationErrors,
  };
}

/**
 * Specialized hook for simple modal forms (just loading + error)
 * For modals that don't need complex form management
 * 
 * @example
 * ```tsx
 * const { isLoading, error, handleSubmit } = useSimpleModal({
 *   onSubmit: async () => await api.delete(id),
 *   onSuccess: () => {
 *     toastService.success('Deleted!');
 *     onClose();
 *   },
 * });
 * ```
 */
export function useSimpleModal(options: {
  onSubmit: () => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}) {
  const {
    onSubmit,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
  } = options;

  const { isLoading, error, execute } = useLoadingState({
    onSuccess: () => {
      if (successMessage) {
        import('../services/toast.service').then(({ toastService }) => {
          toastService.success(successMessage);
        });
      }
      onSuccess?.();
    },
    onError: (err) => {
      const message = errorMessage || err.message;
      import('../services/toast.service').then(({ toastService }) => {
        toastService.error(message);
      });
      onError?.(err);
    },
  });

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    await execute(onSubmit);
  }, [execute, onSubmit]);

  return {
    isLoading,
    error,
    handleSubmit,
  };
}

/**
 * Hook for approval/rejection modals
 * Common pattern for partner approvals, pro forma reviews, etc.
 * 
 * @example
 * ```tsx
 * const {
 *   decision,
 *   comments,
 *   isLoading,
 *   handleDecision,
 *   handleCommentsChange,
 *   handleSubmit
 * } = useApprovalModal({
 *   onSubmit: async (decision, comments) => 
 *     await api.processApproval(id, decision, comments),
 *   onSuccess: () => onClose(),
 * });
 * ```
 */
export function useApprovalModal(options: {
  onSubmit: (decision: 'approve' | 'reject', comments: string) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
}) {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');

  const { isLoading, error, handleSubmit: baseHandleSubmit } = useSimpleModal({
    onSubmit: async () => {
      if (!decision) throw new Error('Please select approve or reject');
      await options.onSubmit(decision, comments);
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
    successMessage: options.successMessage,
  });

  const handleDecision = useCallback((newDecision: 'approve' | 'reject') => {
    setDecision(newDecision);
  }, []);

  const handleCommentsChange = useCallback((newComments: string) => {
    setComments(newComments);
  }, []);

  const reset = useCallback(() => {
    setDecision(null);
    setComments('');
  }, []);

  return {
    decision,
    comments,
    isLoading,
    error,
    handleDecision,
    handleCommentsChange,
    handleSubmit: baseHandleSubmit,
    reset,
  };
}