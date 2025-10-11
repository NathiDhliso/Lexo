/**
 * Error Handler Service
 * Centralized error handling with classification and recovery
 */

import { toastService } from './toast.service';

export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  retryable?: boolean;
  statusCode?: number;
}

class ErrorHandlerService {
  /**
   * Classify error type based on error object
   */
  classifyError(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    // Network errors
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      return ErrorType.NETWORK;
    }

    // HTTP status code based classification
    if (error.response?.status) {
      const status = error.response.status;
      if (status === 400 || status === 422) return ErrorType.VALIDATION;
      if (status === 401 || status === 403) return ErrorType.PERMISSION;
      if (status >= 500) return ErrorType.SERVER;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: any): string {
    const type = this.classifyError(error);

    // Check for custom error message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Default messages by type
    switch (type) {
      case ErrorType.NETWORK:
        return 'Network connection error. Please check your internet connection.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.PERMISSION:
        return 'You do not have permission to perform this action.';
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: any): boolean {
    const type = this.classifyError(error);
    return type === ErrorType.NETWORK || type === ErrorType.SERVER;
  }

  /**
   * Handle error with toast notification
   */
  handleError(error: any, customMessage?: string): AppError {
    const type = this.classifyError(error);
    const message = customMessage || this.getUserMessage(error);
    const retryable = this.isRetryable(error);

    const appError: AppError = {
      type,
      message,
      originalError: error,
      retryable,
      statusCode: error.response?.status,
    };

    // Show toast notification
    toastService.error(message);

    // Log error for debugging
    console.error('[ErrorHandler]', {
      type,
      message,
      error,
    });

    return appError;
  }

  /**
   * Retry function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.isRetryable(error) || i === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }

    throw lastError;
  }

  /**
   * Log error for analytics/monitoring
   */
  logError(error: AppError): void {
    // In production, send to error tracking service (e.g., Sentry)
    console.error('[Error Log]', error);
  }
}

export const errorHandler = new ErrorHandlerService();
export default errorHandler;
