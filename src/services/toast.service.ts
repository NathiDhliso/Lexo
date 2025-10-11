/**
 * Toast Notification Service
 * 
 * A centralized service for displaying toast notifications throughout the application.
 * Wraps react-hot-toast with LexoHub design system styling and provides a consistent API.
 * 
 * Features:
 * - Success, error, warning, and info variants
 * - Customizable duration and positioning
 * - Auto-dismiss with manual dismiss option
 * - Theme-aware (Mpondo Gold & Judicial Blue)
 */

import toast, { ToastOptions as HotToastOptions } from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

class ToastService {
  private defaultDuration = 4000;

  /**
   * Display a success toast notification
   */
  success(title: string, message?: string, options?: ToastOptions): string {
    const fullMessage = message ? `${title}\n${message}` : title;
    return toast.success(fullMessage, this.getOptions(options));
  }

  /**
   * Display an error toast notification
   */
  error(title: string, message?: string, options?: ToastOptions): string {
    const fullMessage = message ? `${title}\n${message}` : title;
    return toast.error(fullMessage, {
      ...this.getOptions(options),
      duration: options?.duration || 5000, // Errors stay longer
    });
  }

  /**
   * Display a warning toast notification
   */
  warning(title: string, message?: string, options?: ToastOptions): string {
    const fullMessage = message ? `${title}\n${message}` : title;
    return toast(fullMessage, {
      ...this.getOptions(options),
      icon: '⚠️',
    });
  }

  /**
   * Display an info toast notification
   */
  info(title: string, message?: string, options?: ToastOptions): string {
    const fullMessage = message ? `${title}\n${message}` : title;
    return toast(fullMessage, {
      ...this.getOptions(options),
      icon: 'ℹ️',
    });
  }

  /**
   * Display a loading toast notification
   */
  loading(title: string, message?: string): string {
    const fullMessage = message ? `${title}\n${message}` : title;
    return toast.loading(fullMessage);
  }

  /**
   * Update an existing toast
   */
  update(toastId: string, type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string): void {
    toast.dismiss(toastId);
    
    switch (type) {
      case 'success':
        this.success(title, message);
        break;
      case 'error':
        this.error(title, message);
        break;
      case 'warning':
        this.warning(title, message);
        break;
      case 'info':
        this.info(title, message);
        break;
    }
  }

  /**
   * Dismiss a specific toast by ID
   */
  dismiss(id: string): void {
    toast.dismiss(id);
  }

  /**
   * Dismiss all active toasts
   */
  dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Promise-based toast for async operations
   */
  async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> {
    return toast.promise(promise, messages);
  }

  /**
   * Get toast options with defaults
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
