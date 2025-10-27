/**
 * MobileSendInvoiceModal Component
 * 
 * Mobile-optimized modal for sending invoices with simplified workflow.
 * Features quick invoice generation and WhatsApp sharing capability.
 * 
 * Requirements: 11.2
 */
import React, { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { X, Send, Mail, MessageCircle, Eye, FileText } from 'lucide-react';
import { useModalForm } from '../../hooks/useModalForm';
import { createValidator, required } from '../../utils/validation.utils';
import { formatRand } from '../../lib/currency';
import { WhatsAppInvoiceShare } from './WhatsAppInvoiceShare';

interface MobileSendInvoiceModalProps {
  isOpen: boolean;
  matterId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InvoiceFormData {
  recipientEmail: string;
  subject: string;
  message: string;
  sendMethod: 'email' | 'whatsapp' | 'both';
  includeAttachments: boolean;
}

// Mock invoice data - in real implementation, this would come from props or API
const mockInvoice = {
  id: 'INV-2025-0043',
  number: 'INV-2025-0043',
  amount: 15000,
  dueDate: '2025-02-15',
  clientName: 'Wilson & Partners',
  matterDescription: 'Contract Review - Acme Corp',
  status: 'draft' as const,
};

/**
 * MobileSendInvoiceModal Component
 * 
 * Mobile-specific optimizations:
 * - Simplified send workflow with smart defaults
 * - WhatsApp integration for instant sharing
 * - Preview functionality before sending
 * - Quick message templates
 * - Large touch targets and clear actions
 * 
 * @example
 * ```tsx
 * <MobileSendInvoiceModal
 *   isOpen={showInvoiceModal}
 *   matterId={selectedMatterId}
 *   onClose={() => setShowInvoiceModal(false)}
 *   onSuccess={handleInvoiceSuccess}
 * />
 * ```
 */
export const MobileSendInvoiceModal: React.FC<MobileSendInvoiceModalProps> = ({
  isOpen,
  matterId,
  onClose,
  onSuccess
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Create validator for invoice form
  const validator = useMemo(() => createValidator<InvoiceFormData>({
    recipientEmail: [required()],
    subject: [required()],
    message: [required()],
    sendMethod: [required()],
  }), []);

  // Use the modal form hook
  const {
    formData,
    isLoading,
    error,
    validationErrors,
    handleChange,
    handleSubmit,
    reset,
  } = useModalForm<InvoiceFormData>({
    initialData: {
      recipientEmail: '',
      subject: `Invoice ${mockInvoice.number} - ${mockInvoice.matterDescription}`,
      message: `Dear Client,\n\nPlease find attached invoice ${mockInvoice.number} for ${formatRand(mockInvoice.amount)}.\n\nPayment is due by ${new Date(mockInvoice.dueDate).toLocaleDateString()}.\n\nThank you for your business.\n\nBest regards`,
      sendMethod: 'email',
      includeAttachments: true,
    },
    onSubmit: async (data) => {
      // TODO: Implement invoice sending API call
      console.log('Sending invoice:', data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    validate: (data) => {
      const result = validator.validate(data);
      return result.isValid ? null : result.errors;
    },
    successMessage: 'Invoice sent successfully!',
    resetOnSuccess: true,
  });

  // Quick message templates
  const messageTemplates = [
    {
      label: 'Standard',
      message: `Dear Client,\n\nPlease find attached invoice ${mockInvoice.number} for ${formatRand(mockInvoice.amount)}.\n\nPayment is due by ${new Date(mockInvoice.dueDate).toLocaleDateString()}.\n\nThank you for your business.\n\nBest regards`,
    },
    {
      label: 'Friendly Reminder',
      message: `Hi there,\n\nHope you're well! Attached is invoice ${mockInvoice.number} for the recent work completed.\n\nAmount: ${formatRand(mockInvoice.amount)}\nDue: ${new Date(mockInvoice.dueDate).toLocaleDateString()}\n\nLet me know if you have any questions.\n\nThanks!`,
    },
    {
      label: 'Brief',
      message: `Invoice ${mockInvoice.number} attached.\nAmount: ${formatRand(mockInvoice.amount)}\nDue: ${new Date(mockInvoice.dueDate).toLocaleDateString()}\n\nThank you.`,
    },
  ];

  const handleTemplateSelect = (template: typeof messageTemplates[0]) => {
    handleChange('message', template.message);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleWhatsAppShare = (method: 'whatsapp' | 'link') => {
    console.log(`Invoice shared via ${method}`);
    // Track sharing analytics here
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setShowPreview(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4 sm:items-center">
      <div className={cn(
        "bg-white dark:bg-metallic-gray-900 w-full max-w-lg overflow-hidden",
        "sm:rounded-xl sm:shadow-xl sm:max-h-[90vh]",
        // Mobile: bottom sheet style
        "rounded-t-2xl max-h-[85vh]",
        // Animation
        "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300"
      )}>
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700 z-10">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Send Invoice
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {mockInvoice.number} • {formatRand(mockInvoice.amount)}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
                "hover:bg-neutral-100 dark:hover:bg-metallic-gray-800",
                "transition-colors disabled:opacity-50",
                "mobile-touch-target"
              )}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto">
          {/* Invoice Summary */}
          <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Invoice</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {mockInvoice.number}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {mockInvoice.matterDescription}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Amount</p>
                <p className="text-xl font-bold text-mpondo-gold-600 dark:text-mpondo-gold-400">
                  {formatRand(mockInvoice.amount)}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  icon={<Eye className="w-4 h-4" />}
                  className="flex-1"
                >
                  Preview
                </Button>
              </div>
              
              {/* WhatsApp Share Component */}
              <WhatsAppInvoiceShare
                invoice={{
                  id: mockInvoice.id,
                  invoiceNumber: mockInvoice.number,
                  totalAmount: mockInvoice.amount,
                  dueDate: mockInvoice.dueDate,
                  advocateName: 'Your Practice Name',
                  shareToken: 'mock-share-token'
                }}
                onShare={handleWhatsAppShare}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Send Method */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Send Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('sendMethod', 'email')}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-colors",
                    "mobile-touch-target border flex flex-col items-center gap-1",
                    formData.sendMethod === 'email'
                      ? "bg-judicial-blue-900 text-white border-judicial-blue-900"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 dark:bg-metallic-gray-800 dark:text-neutral-300 dark:border-metallic-gray-600"
                  )}
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('sendMethod', 'whatsapp')}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-colors",
                    "mobile-touch-target border flex flex-col items-center gap-1",
                    formData.sendMethod === 'whatsapp'
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 dark:bg-metallic-gray-800 dark:text-neutral-300 dark:border-metallic-gray-600"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('sendMethod', 'both')}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-colors",
                    "mobile-touch-target border flex flex-col items-center gap-1",
                    formData.sendMethod === 'both'
                      ? "bg-mpondo-gold-500 text-white border-mpondo-gold-500"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 dark:bg-metallic-gray-800 dark:text-neutral-300 dark:border-metallic-gray-600"
                  )}
                >
                  <Send className="w-5 h-5" />
                  Both
                </button>
              </div>
            </div>

            {/* Recipient Email */}
            {(formData.sendMethod === 'email' || formData.sendMethod === 'both') && (
              <div>
                <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => handleChange('recipientEmail', e.target.value)}
                  placeholder="client@example.com"
                  required
                  disabled={isLoading}
                  className={cn(
                    "block w-full px-4 py-4 text-base",
                    "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                    "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
                    "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
                    "disabled:opacity-50",
                    "mobile-touch-target"
                  )}
                />
                
                {validationErrors.recipientEmail && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.recipientEmail}
                  </p>
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Invoice subject"
                required
                disabled={isLoading}
                className={cn(
                  "block w-full px-4 py-4 text-base",
                  "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                  "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
                  "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
                  "disabled:opacity-50",
                  "mobile-touch-target"
                )}
              />
            </div>

            {/* Message Templates */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Message Templates
              </label>
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {messageTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    disabled={isLoading}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
                      "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                      "dark:bg-metallic-gray-700 dark:text-neutral-300 dark:hover:bg-metallic-gray-600",
                      "transition-colors disabled:opacity-50"
                    )}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Enter your message..."
                rows={6}
                required
                disabled={isLoading}
                className={cn(
                  "block w-full px-4 py-4 text-base",
                  "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                  "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
                  "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
                  "disabled:opacity-50 resize-none"
                )}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error.message || 'An error occurred while sending the invoice.'}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Actions - Sticky Bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-metallic-gray-900 border-t border-neutral-200 dark:border-metallic-gray-700 p-4 sm:p-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              size="lg"
              className="flex-1 mobile-touch-target"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !formData.subject || !formData.message}
              size="lg"
              className="flex-1 mobile-touch-target"
              loading={isLoading}
              icon={<Send className="w-5 h-5" />}
            >
              Send Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};