/**
 * ConfirmationDialog Component
 * 
 * A specialized modal component for confirmation dialogs with preset variants
 * for common use cases (info, warning, danger).
 * 
 * Features:
 * - Pre-styled variants (info, warning, danger)
 * - Async action support with loading states
 * - Customizable confirm/cancel buttons
 * - Icon support
 * - Theme-aware styling
 * 
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   isOpen={isOpen}
 *   onClose={close}
 *   onConfirm={handleDelete}
 *   variant="danger"
 *   title="Delete Matter"
 *   message="Are you sure you want to delete this matter? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel"
 * />
 * ```
 */

import React, { useState } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ModalDescription } from './ModalComponents';
import { cn } from '../../lib/utils';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  variant?: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  loading?: boolean;
}

/**
 * ConfirmationDialog Component
 * 
 * A pre-styled confirmation dialog for common use cases.
 * Handles async operations automatically with loading states.
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close } = useModalState();
 * 
 * <Button variant="danger" onClick={open}>Delete</Button>
 * 
 * <ConfirmationDialog
 *   isOpen={isOpen}
 *   onClose={close}
 *   onConfirm={async () => {
 *     await deleteItem();
 *   }}
 *   variant="danger"
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item? This action cannot be undone."
 * />
 * ```
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  variant = 'info',
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  icon,
  showIcon = true,
  loading: externalLoading,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Get variant-specific styling
  const getVariantConfig = () => {
    const configs = {
      info: {
        icon: <Info className="w-6 h-6" />,
        iconColor: 'text-judicial-blue-600 dark:text-judicial-blue-400',
        confirmVariant: 'primary' as const,
        confirmText: confirmText || 'Confirm',
      },
      warning: {
        icon: <AlertTriangle className="w-6 h-6" />,
        iconColor: 'text-status-warning-600 dark:text-status-warning-400',
        confirmVariant: 'secondary' as const,
        confirmText: confirmText || 'Continue',
      },
      danger: {
        icon: <AlertCircle className="w-6 h-6" />,
        iconColor: 'text-status-error-600 dark:text-status-error-400',
        confirmVariant: 'danger' as const,
        confirmText: confirmText || 'Delete',
      },
    };

    return configs[variant];
  };

  const config = getVariantConfig();

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      const result = onConfirm();
      
      // Check if it's a promise
      if (result instanceof Promise) {
        await result;
      }
      
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Don't close on error, let the parent handle it
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {config.confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {showIcon && (
          <div className={cn('flex items-center gap-3', config.iconColor)}>
            {icon || config.icon}
            {variant === 'danger' && (
              <p className="font-semibold">This action cannot be undone</p>
            )}
          </div>
        )}
        <ModalDescription>{message}</ModalDescription>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
