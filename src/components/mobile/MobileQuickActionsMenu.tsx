/**
 * MobileQuickActionsMenu Component
 * 
 * A mobile-optimized quick actions menu with 3x2 grid of action buttons.
 * Provides one-tap access to essential actions with large touch targets.
 * 
 * Requirements: 11.1, 11.2
 */
import React from 'react';
import { cn } from '../../lib/utils';
import { 
  DollarSign, 
  Receipt, 
  Send, 
  Clock, 
  Paperclip, 
  Phone 
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

interface MobileQuickActionsMenuProps {
  className?: string;
  onRecordPayment: () => void;
  onLogDisbursement: () => void;
  onSendInvoice: () => void;
  onLogTime: () => void;
  onLinkDocument: () => void;
  onQuickCall: () => void;
}

/**
 * MobileQuickActionsMenu Component
 * 
 * Features:
 * - 3x2 grid layout optimized for mobile
 * - Large touch targets (minimum 48px, recommended 56px)
 * - Clear icons and labels
 * - Haptic feedback on touch
 * - Accessible with proper ARIA labels
 * - Responsive design for different screen sizes
 * 
 * @example
 * ```tsx
 * <MobileQuickActionsMenu
 *   onRecordPayment={() => setShowPaymentModal(true)}
 *   onLogDisbursement={() => setShowDisbursementModal(true)}
 *   onSendInvoice={() => setShowInvoiceModal(true)}
 *   onLogTime={() => setShowTimeModal(true)}
 *   onLinkDocument={() => setShowDocumentModal(true)}
 *   onQuickCall={() => handleQuickCall()}
 * />
 * ```
 */
export const MobileQuickActionsMenu: React.FC<MobileQuickActionsMenuProps> = ({
  className,
  onRecordPayment,
  onLogDisbursement,
  onSendInvoice,
  onLogTime,
  onLinkDocument,
  onQuickCall,
}) => {
  // Define the quick actions with their configurations
  const quickActions: QuickAction[] = [
    {
      id: 'record-payment',
      label: 'Record Payment',
      icon: <DollarSign className="w-6 h-6" />,
      onClick: onRecordPayment,
      variant: 'primary',
    },
    {
      id: 'log-disbursement',
      label: 'Log Disbursement',
      icon: <Receipt className="w-6 h-6" />,
      onClick: onLogDisbursement,
      variant: 'secondary',
    },
    {
      id: 'send-invoice',
      label: 'Send Invoice',
      icon: <Send className="w-6 h-6" />,
      onClick: onSendInvoice,
      variant: 'accent',
    },
    {
      id: 'log-time',
      label: 'Log Time',
      icon: <Clock className="w-6 h-6" />,
      onClick: onLogTime,
      variant: 'secondary',
    },
    {
      id: 'link-document',
      label: 'Link Document',
      icon: <Paperclip className="w-6 h-6" />,
      onClick: onLinkDocument,
      variant: 'secondary',
    },
    {
      id: 'quick-call',
      label: 'Quick Call',
      icon: <Phone className="w-6 h-6" />,
      onClick: onQuickCall,
      variant: 'accent',
    },
  ];

  // Handle button press with haptic feedback (if supported)
  const handleActionPress = (action: QuickAction) => {
    // Trigger haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for feedback
    }
    
    action.onClick();
  };

  // Get variant-specific styles
  const getVariantStyles = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return cn(
          'bg-judicial-blue-900 text-white',
          'hover:bg-judicial-blue-800 active:bg-judicial-blue-700',
          'shadow-lg shadow-judicial-blue-900/25',
          'dark:bg-judicial-blue-700 dark:hover:bg-judicial-blue-600'
        );
      case 'accent':
        return cn(
          'bg-mpondo-gold-500 text-white',
          'hover:bg-mpondo-gold-600 active:bg-mpondo-gold-700',
          'shadow-lg shadow-mpondo-gold-500/25',
          'dark:bg-mpondo-gold-400 dark:text-neutral-900 dark:hover:bg-mpondo-gold-300'
        );
      case 'secondary':
      default:
        return cn(
          'bg-white text-neutral-700 border border-neutral-200',
          'hover:bg-neutral-50 active:bg-neutral-100',
          'shadow-md',
          'dark:bg-metallic-gray-800 dark:text-neutral-200 dark:border-metallic-gray-700',
          'dark:hover:bg-metallic-gray-700 dark:active:bg-metallic-gray-600'
        );
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Quick Actions
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tap to perform common tasks
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionPress(action)}
            disabled={action.disabled}
            className={cn(
              // Base styles
              'flex flex-col items-center justify-center',
              'rounded-xl transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mpondo-gold-400 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'select-none',
              // Mobile touch target compliance (minimum 48px, recommended 56px)
              'min-h-[56px] h-16 sm:h-20',
              'min-w-[56px]',
              // Touch feedback
              'active:scale-95 transform',
              // Prevent text selection and tap highlight
              'touch-manipulation',
              '-webkit-tap-highlight-color: transparent',
              // Variant-specific styles
              getVariantStyles(action.variant)
            )}
            aria-label={action.label}
            type="button"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mb-1">
              {action.icon}
            </div>
            
            {/* Label */}
            <span className="text-xs font-medium text-center leading-tight px-1">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Usage Hint */}
      <div className="mt-4 p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
        <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
          💡 Tip: These actions are optimized for quick access while on the go
        </p>
      </div>
    </div>
  );
};