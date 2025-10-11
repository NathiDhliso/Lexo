/**
 * Error Handling Utilities
 * 
 * Centralized error handling utilities for consistent error management
 * across the application.
 */

import { toastService } from '../services/toast.service';
import { AuthError } from '@supabase/supabase-js';

export interface ErrorHandlingOptions {
  /** Custom error message to display */
  message?: string;
  /** Duration to show the error toast (ms) */
  duration?: number;
  /** Whether to log the error to console */
  logError?: boolean;
  /** Context information for debugging */
  context?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
}

/**
 * Handle API errors with consistent messaging
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): string {
  const {
    message = 'An error occurred. Please try again.',
    duration = 5000,
    logError = true,
    context = 'API Error',
    showToast = true,
  } = options;

  // Log error if enabled
  if (logError) {
    console.error(`[${context}]`, error);
  }

  // Determine error message
  let errorMessage = message;
  
  if (error instanceof Error) {
    errorMessage = error.message || message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = (error as any).message || message;
  }

  // Show toast if enabled
  if (showToast) {
    toastService.error(errorMessage, undefined, { duration });
  }

  return errorMessage;
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
  error: AuthError | Error | null,
  options: ErrorHandlingOptions = {}
): string {
  if (!error) return '';

  const defaultMessage = 'Authentication failed. Please try again.';
  
  return handleApiError(error, {
    message: defaultMessage,
    context: 'Authentication Error',
    ...options,
  });
}

/**
 * Handle form validation errors
 */
export function handleValidationError(
  fieldName: string,
  error: string,
  options: ErrorHandlingOptions = {}
): void {
  const message = `${fieldName}: ${error}`;
  
  handleApiError(new Error(message), {
    message,
    context: 'Validation Error',
    duration: 4000,
    ...options,
  });
}

/**
 * Handle network errors
 */
export function handleNetworkError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): string {
  return handleApiError(error, {
    message: 'Network error. Please check your connection and try again.',
    context: 'Network Error',
    ...options,
  });
}

/**
 * Handle success operations with toast
 */
export function handleSuccess(
  message: string,
  options: { duration?: number } = {}
): void {
  const { duration = 3000 } = options;
  toastService.success(message, undefined, { duration });
}

/**
 * Handle loading states with toast
 */
export function handleLoading(message: string): string {
  return toastService.loading(message);
}

/**
 * Update a loading toast to success
 */
export function updateToSuccess(
  toastId: string,
  message: string,
  options: { duration?: number } = {}
): void {
  const { duration = 3000 } = options;
  toastService.update(toastId, 'success', message);
}

/**
 * Update a loading toast to error
 */
export function updateToError(
  toastId: string,
  message: string,
  options: { duration?: number } = {}
): void {
  const { duration = 5000 } = options;
  toastService.update(toastId, 'error', message);
}

/**
 * Async operation wrapper with automatic error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    context?: string;
  } = {}
): Promise<{ data: T | null; error: string | null }> {
  const {
    loadingMessage,
    successMessage,
    errorMessage = 'Operation failed',
    context = 'Operation',
  } = options;

  let toastId: string | undefined;

  try {
    // Show loading toast if message provided
    if (loadingMessage) {
      toastId = handleLoading(loadingMessage);
    }

    // Execute operation
    const data = await operation();

    // Show success toast if message provided
    if (successMessage) {
      if (toastId) {
        updateToSuccess(toastId, successMessage);
      } else {
        handleSuccess(successMessage);
      }
    } else if (toastId) {
      toastService.dismiss(toastId);
    }

    return { data, error: null };
  } catch (error) {
    // Handle error
    const errorMsg = handleApiError(error, {
      message: errorMessage,
      context,
      showToast: !toastId, // Only show new toast if no loading toast
    });

    if (toastId) {
      updateToError(toastId, errorMsg);
    }

    return { data: null, error: errorMsg };
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.name === 'NetworkError'
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    return (
      'status' in error && (error as any).status === 401 ||
      'code' in error && (error as any).code === 'PGRST301'
    );
  }
  return false;
}

/**
 * Format error for display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return 'An unknown error occurred';
}
