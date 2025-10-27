/**
 * Enhanced Modal Component
 * 
 * A comprehensive modal component that includes common patterns like loading states,
 * error handling, confirmation dialogs, and form submission.
 * 
 * @example
 * ```tsx
 * <EnhancedModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Create Matter"
 *   description="Fill in the details to create a new matter"
 *   onConfirm={handleSubmit}
 *   confirmText="Create"
 *   loading={isSubmitting}
 * >
 *   <form>...</form>
 * </EnhancedModal>
 * ```
 */

import React, { useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Modal, ModalProps } from './Modal';
import { ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from './ModalComponents';
import { Button } from './Button';
import { AsyncButton } from './AsyncButton';
import { useLoadingState } from '../../hooks/useLoadingState';
import { cn } from '../../lib/utils';

export interface EnhancedModalProps extends Omit<ModalProps, 'children'> {
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Modal description/subtitle
   */
  description?: string;
  
  /**
   * Loading state (disables interactions)
   */
  loading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string | null;
  
  /**
   * Success message to display
   */
  success?: string | null;
  
  /**
   * Confirm button handler
   */
  onConfirm?: () => void | Promise<void>;
  
  /**
   * Cancel button handler (defaults to onClose)
   */
  onCancel?: () => void;
  
  /**
   * Confirm button text
   * @default "Confirm"
   */
  confirmText?: string;
  
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;
  
  /**
   * Confirm button variant
   * @default "primary"
   */
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  
  /**
   * Whether to show the footer with action buttons
   * @default true
   */
  showFooter?: boolean;
  
  /**
   * Whether to show the close button in header
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Whether to require confirmation before closing
   */
  requireConfirmation?: boolean;
  
  /**
   * Confirmation message for closing
   */
  confirmationMessage?: string;
  
  /**
   * Custom footer content (overrides default buttons)
   */
  customFooter?: React.ReactNode;
  
  /**
   * Additional CSS classes for the modal content
   */
  contentClassName?: string;
  
  /**
   * Modal content
   */
  children?: React.ReactNode;
}

/**
 * Enhanced Modal with built-in patterns for loading, errors, and confirmations
 * 
 * Features:
 * - Built-in loading states
 * - Error and success message display
 * - Confirmation dialogs
 * - Async action handling
 * - Customizable footer
 * - Close confirmation
 * - Keyboard shortcuts
 * 
 * @param props EnhancedModalProps
 * @returns Enhanced modal component
 */
export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  title,
  description,
  loading = false,
  error,
  success,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  showFooter = true,
  showCloseButton = true,
  requireConfirmation = false,
  confirmationMessage = 'Are you sure you want to close? Any unsaved changes will be lost.',
  customFooter,
  contentClassName,
  children,
  onClose,
  ...modalProps
}) => {
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  
  const { isLoading: isConfirming, execute: executeConfirm } = useLoadingState({
    onError: (err) => {
      console.error('Confirmation error:', err);
    },
  });

  // Handle close with optional confirmation
  const handleClose = useCallback(() => {
    if (requireConfirmation && !showConfirmClose) {
      setShowConfirmClose(true);
      return;
    }
    
    setShowConfirmClose(false);
    onClose();
  }, [requireConfirmation, showConfirmClose, onClose]);

  // Handle cancel (same as close but calls onCancel if provided)
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      handleClose();
    }
  }, [onCancel, handleClose]);

  // Handle confirm action
  const handleConfirm = useCallback(async () => {
    if (onConfirm) {
      await executeConfirm(async () => {
        await onConfirm();
      });
    }
  }, [onConfirm, executeConfirm]);

  // Determine if modal should be closable
  const isClosable = !loading && !isConfirming;

  return (
    <>
      <Modal
        {...modalProps}
        onClose={isClosable ? handleClose : () => {}}
        closeOnOverlayClick={isClosable && !requireConfirmation}
        closeOnEscape={isClosable && !requireConfirmation}
      >
        <div className={cn('relative', contentClassName)}>
          {/* Loading Overlay */}
          {(loading || isConfirming) && (
            <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">
                  {isConfirming ? 'Processing...' : 'Loading...'}
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          {(title || description || showCloseButton) && (
            <ModalHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {title && (
                    <ModalTitle className="pr-8">{title}</ModalTitle>
                  )}
                  {description && (
                    <ModalDescription className="mt-1">
                      {description}
                    </ModalDescription>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={!isClosable}
                    className={cn(
                      'flex-shrink-0 p-1 rounded-md transition-colors',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      'focus:outline-none focus:ring-2 focus:ring-judicial-blue-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    )}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </ModalHeader>
          )}

          {/* Body */}
          <ModalBody>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Success
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {children}
          </ModalBody>

          {/* Footer */}
          {showFooter && (
            <ModalFooter>
              {customFooter || (
                <div className="flex items-center justify-end gap-3">
                  {(onCancel || onClose) && (
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={!isClosable}
                    >
                      {cancelText}
                    </Button>
                  )}
                  
                  {onConfirm && (
                    <AsyncButton
                      variant={confirmVariant}
                      onAsyncClick={handleConfirm}
                      disabled={loading || isConfirming}
                    >
                      {confirmText}
                    </AsyncButton>
                  )}
                </div>
              )}
            </ModalFooter>
          )}
        </div>
      </Modal>

      {/* Close Confirmation Dialog */}
      {showConfirmClose && (
        <Modal
          isOpen={showConfirmClose}
          onClose={() => setShowConfirmClose(false)}
          size="sm"
        >
          <ModalHeader>
            <ModalTitle>Confirm Close</ModalTitle>
          </ModalHeader>
          
          <ModalBody>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {confirmationMessage}
            </p>
          </ModalBody>
          
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmClose(false)}
              >
                Continue Editing
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowConfirmClose(false);
                  onClose();
                }}
              >
                Close Anyway
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

/**
 * Confirmation Modal - Simplified version for quick confirmations
 * 
 * @example
 * ```tsx
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Matter"
 *   message="Are you sure you want to delete this matter? This action cannot be undone."
 *   confirmText="Delete"
 *   confirmVariant="danger"
 * />
 * ```
 */
export interface ConfirmationModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
  
  /**
   * Confirm handler
   */
  onConfirm: () => void | Promise<void>;
  
  /**
   * Modal title
   */
  title: string;
  
  /**
   * Confirmation message
   */
  message: string;
  
  /**
   * Confirm button text
   * @default "Confirm"
   */
  confirmText?: string;
  
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;
  
  /**
   * Confirm button variant
   * @default "primary"
   */
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  
  /**
   * Loading state
   */
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmVariant={confirmVariant}
      loading={loading}
      size="sm"
    >
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
    </EnhancedModal>
  );
};

/**
 * Form Modal - Specialized for form submissions
 * 
 * @example
 * ```tsx
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSubmit}
 *   title="Create Matter"
 *   submitText="Create"
 *   loading={isSubmitting}
 *   error={error}
 * >
 *   <FormInput label="Title" value={title} onChange={setTitle} />
 * </FormModal>
 * ```
 */
export interface FormModalProps extends Omit<EnhancedModalProps, 'onConfirm' | 'confirmText'> {
  /**
   * Form submit handler
   */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  
  /**
   * Submit button text
   * @default "Save"
   */
  submitText?: string;
  
  /**
   * Whether form is valid (enables/disables submit)
   */
  isValid?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  onSubmit,
  submitText = 'Save',
  isValid = true,
  children,
  ...props
}) => {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  return (
    <EnhancedModal
      {...props}
      onConfirm={isValid ? () => handleSubmit({} as React.FormEvent) : undefined}
      confirmText={submitText}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </EnhancedModal>
  );
};