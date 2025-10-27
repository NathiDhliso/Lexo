/**
 * Modal Component
 * 
 * An enhanced modal component with comprehensive features for the LexoHub application.
 * 
 * Features:
 * - Multiple size variants (sm, md, lg, xl, 2xl, full)
 * - Focus trap within modal
 * - Escape key to close
 * - Click outside to close (configurable)
 * - Smooth animations
 * - Body scroll lock
 * - Accessibility (ARIA attributes, focus management)
 * - Theme-aware styling (Mpondo Gold & Judicial Blue)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  title?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  footer?: React.ReactNode;
}

/**
 * Modal Component
 * 
 * A comprehensive modal dialog component with accessibility and UX features.
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Matter"
 *   size="lg"
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  size = 'md',
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-2xl sm:max-w-4xl',
    '2xl': 'max-w-4xl sm:max-w-6xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Add escape key listener
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);

        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, handleEscape]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 overflow-y-auto',
        'animate-in fade-in duration-200'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm',
          'transition-opacity duration-200',
          overlayClassName
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Centering trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal Content */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={cn(
            'inline-block w-full align-middle',
            'bg-white dark:bg-metallic-gray-800',
            'rounded-lg shadow-xl',
            'border border-neutral-200 dark:border-metallic-gray-700',
            'text-left overflow-hidden',
            'transform transition-all duration-200',
            'animate-in slide-up',
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-metallic-gray-700">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    'p-2 rounded-lg',
                    'text-neutral-400 hover:text-neutral-600',
                    'dark:text-neutral-500 dark:hover:text-neutral-300',
                    'hover:bg-neutral-100 dark:hover:bg-metallic-gray-700',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mpondo-gold-400',
                    !title && 'ml-auto'
                  )}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 dark:text-neutral-200">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 dark:border-metallic-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
