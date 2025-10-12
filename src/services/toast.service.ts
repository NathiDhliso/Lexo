/**
 * Toast Notification Service - DISABLED
 * 
 * All toast notifications have been disabled per user request.
 * This service now acts as a no-op (no operation) to prevent any toast notifications
 * from appearing in the application.
 * 
 * All methods return empty strings or do nothing to maintain API compatibility.
 */

import toast, { ToastOptions as HotToastOptions } from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

class ToastService {
  private defaultDuration = 4000;

  /**
   * Display a success toast notification - DISABLED
   */
  success(title: string, message?: string, options?: ToastOptions): string {
    // No-op: Do nothing
    return '';
  }

  /**
   * Display an error toast notification - DISABLED
   */
  error(title: string, message?: string, options?: ToastOptions): string {
    // No-op: Do nothing
    console.error(title, message); // Log to console instead
    return '';
  }

  /**
   * Display a warning toast notification - DISABLED
   */
  warning(title: string, message?: string, options?: ToastOptions): string {
    // No-op: Do nothing
    return '';
  }

  /**
   * Display an info toast notification - DISABLED
   */
  info(title: string, message?: string, options?: ToastOptions): string {
    // No-op: Do nothing
    return '';
  }

  /**
   * Display a loading toast notification - DISABLED
   */
  loading(title: string, message?: string): string {
    // No-op: Do nothing
    return '';
  }

  /**
   * Update an existing toast - DISABLED
   */
  update(toastId: string, type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string): void {
    // No-op: Do nothing
  }

  /**
   * Dismiss a specific toast by ID - DISABLED
   */
  dismiss(id: string): void {
    // No-op: Do nothing
  }

  /**
   * Dismiss all active toasts - DISABLED
   */
  dismissAll(): void {
    // No-op: Do nothing
  }

  /**
   * Promise-based toast for async operations - DISABLED
   */
  async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> {
    // Just return the promise result without showing toasts
    return promise;
  }

  /**
   * Get toast options with defaults - DISABLED
   */
  private getOptions(options?: ToastOptions): HotToastOptions {
    return {
      duration: options?.duration || this.defaultDuration,
      position: options?.position || 'top-right',
    };
  }
}

// Export singleton instance
export const toastService = new ToastService();

// Export default for convenience
export default toastService;
