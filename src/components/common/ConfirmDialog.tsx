import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Button, Modal, ModalBody, ModalFooter } from '../../design-system/components';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-status-error-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-mpondo-gold-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-status-success-500" />;
      default:
        return <Info className="w-12 h-12 text-judicial-blue-500" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive' as const;
      case 'warning':
        return 'primary' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        <ModalBody>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center mb-4">
              {getIcon()}
            </div>
            
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {title}
            </h3>
            
            <div className="text-sm text-neutral-600">
              {message}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
            >
              {confirmText}
            </Button>
          </div>
        </ModalFooter>
      </div>
    </Modal>
  );
};
