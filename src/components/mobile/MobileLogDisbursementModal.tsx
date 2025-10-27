/**
 * MobileLogDisbursementModal Component
 * 
 * Mobile-optimized modal for logging disbursements with simplified form layout.
 * Features smart VAT suggestions and camera integration for receipt capture.
 * 
 * Requirements: 11.2
 */
import React, { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { X, Camera, AlertCircle, Info, WifiOff, Clock, Check } from 'lucide-react';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { useModalForm } from '../../hooks/useModalForm';
import { createValidator, required, numeric, positive } from '../../utils/validation.utils';
import { CameraReceiptCapture } from './CameraReceiptCapture';
import { compressImage } from './MobilePerformanceOptimizer';

interface MobileLogDisbursementModalProps {
  isOpen: boolean;
  matterId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

// Common disbursement types with VAT suggestions
const DISBURSEMENT_TYPES = [
  { value: 'court-filing-fee', label: 'Court Filing Fee', vatSuggested: false },
  { value: 'transcript', label: 'Transcript', vatSuggested: false },
  { value: 'sheriff-fees', label: 'Sheriff Fees', vatSuggested: false },
  { value: 'travel', label: 'Travel', vatSuggested: true },
  { value: 'accommodation', label: 'Accommodation', vatSuggested: true },
  { value: 'printing', label: 'Printing', vatSuggested: true },
  { value: 'courier', label: 'Courier', vatSuggested: true },
  { value: 'other', label: 'Other', vatSuggested: true },
];

interface DisbursementFormData {
  type: string;
  amount: number;
  description: string;
  vatApplicable: boolean;
  date: string;
  receiptImage?: File;
}

/**
 * MobileLogDisbursementModal Component
 * 
 * Mobile-specific optimizations:
 * - Simplified form with smart defaults
 * - Camera integration for receipt capture
 * - Smart VAT suggestions based on disbursement type
 * - Large touch targets and clear visual hierarchy
 * - Quick type selection with common disbursements
 * 
 * @example
 * ```tsx
 * <MobileLogDisbursementModal
 *   isOpen={showDisbursementModal}
 *   matterId={selectedMatterId}
 *   onClose={() => setShowDisbursementModal(false)}
 *   onSuccess={handleDisbursementSuccess}
 * />
 * ```
 */
export const MobileLogDisbursementModal: React.FC<MobileLogDisbursementModalProps> = ({
  isOpen,
  matterId,
  onClose,
  onSuccess
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const { store, isOnline, isInitialized } = useOfflineStorage();

  // Create validator for disbursement form
  const validator = useMemo(() => createValidator<DisbursementFormData>({
    type: [required()],
    amount: [required(), numeric(), positive()],
    description: [required()],
    date: [required()],
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
  } = useModalForm<DisbursementFormData>({
    initialData: {
      type: '',
      amount: 0,
      description: '',
      vatApplicable: true,
      date: new Date().toISOString().split('T')[0],
    },
    onSubmit: async (data) => {
      const disbursementData = {
        id: `disbursement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matterId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        vatApplicable: data.vatApplicable,
        date: data.date,
        receiptImage: data.receiptImage,
        createdAt: new Date().toISOString(),
        status: isOnline ? 'submitted' : 'pending_sync',
      };

      if (isOnline) {
        // TODO: Implement actual API call when online
        console.log('Submitting disbursement online:', disbursementData);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Store offline for later sync
        if (isInitialized && store) {
          await store('disbursement', disbursementData, true);
          console.log('Disbursement stored offline:', disbursementData);
        } else {
          throw new Error('Offline storage not available');
        }
      }
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    validate: (data) => {
      const result = validator.validate(data);
      return result.isValid ? null : result.errors;
    },
    successMessage: isOnline ? 'Disbursement logged successfully!' : 'Disbursement saved offline - will sync when connected',
    resetOnSuccess: true,
  });

  // Get VAT suggestion based on selected type
  const selectedType = DISBURSEMENT_TYPES.find(type => type.value === formData.type);
  const vatSuggestion = selectedType?.vatSuggested ?? true;

  // Handle type selection and auto-update VAT
  const handleTypeChange = (typeValue: string) => {
    const type = DISBURSEMENT_TYPES.find(t => t.value === typeValue);
    handleChange('type', typeValue);
    if (type) {
      handleChange('vatApplicable', type.vatSuggested);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    setShowCamera(true);
  };

  const handleImageCapture = async (file: File) => {
    try {
      const compressedFile = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });
      handleChange('receiptImage', compressedFile);
      setShowCamera(false);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setShowCamera(false);
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Log Disbursement
                </h2>
                {!isOnline && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <WifiOff className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-orange-700 dark:text-orange-300">Offline</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isOnline ? 'Record expense for matter' : 'Recording offline - will sync when connected'}
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
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Disbursement Type */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Disbursement Type
              </label>
              
              {/* Quick Type Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {DISBURSEMENT_TYPES.slice(0, 6).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    disabled={isLoading}
                    className={cn(
                      "p-3 rounded-lg text-sm font-medium transition-colors text-left",
                      "mobile-touch-target border",
                      formData.type === type.value
                        ? "bg-judicial-blue-900 text-white border-judicial-blue-900"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 dark:bg-metallic-gray-800 dark:text-neutral-300 dark:border-metallic-gray-600 dark:hover:bg-metallic-gray-700"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Custom Type Input */}
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
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
              >
                <option value="">Select disbursement type</option>
                {DISBURSEMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              {validationErrors.type && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.type}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-neutral-400 font-medium">R</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                  className={cn(
                    "block w-full pl-12 pr-4 py-4 text-lg font-semibold",
                    "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                    "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
                    "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
                    "disabled:opacity-50",
                    "mobile-touch-target"
                  )}
                />
              </div>
              
              {validationErrors.amount && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            {/* VAT Applicable */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                VAT Applicable
              </label>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vatApplicable"
                    checked={formData.vatApplicable === true}
                    onChange={() => handleChange('vatApplicable', true)}
                    disabled={isLoading}
                    className="w-5 h-5 text-judicial-blue-900 focus:ring-mpondo-gold-500"
                  />
                  <span className="text-base">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vatApplicable"
                    checked={formData.vatApplicable === false}
                    onChange={() => handleChange('vatApplicable', false)}
                    disabled={isLoading}
                    className="w-5 h-5 text-judicial-blue-900 focus:ring-mpondo-gold-500"
                  />
                  <span className="text-base">No</span>
                </label>
              </div>

              {/* VAT Suggestion */}
              {selectedType && (
                <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedType.vatSuggested 
                        ? `${selectedType.label} typically includes VAT`
                        : `${selectedType.label} is typically VAT-exempt`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the expense"
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
              
              {validationErrors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
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

            {/* Receipt Capture */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Receipt <span className="text-neutral-400 text-sm">(Optional)</span>
              </label>
              
              {formData.receiptImage ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Receipt captured ({(formData.receiptImage.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('receiptImage', undefined)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  disabled={isLoading}
                  className={cn(
                    "w-full p-4 border-2 border-dashed border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                    "hover:border-mpondo-gold-500 hover:bg-mpondo-gold-50 dark:hover:bg-mpondo-gold-900/10",
                    "transition-colors disabled:opacity-50",
                    "mobile-touch-target"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-neutral-400" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Tap to capture receipt
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Offline Notice */}
            {!isOnline && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Working Offline
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                      This disbursement will be saved locally and synced automatically when you're back online.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error.message || 'An error occurred while logging the disbursement.'}
                  </p>
                </div>
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
              disabled={isLoading || !formData.type || formData.amount <= 0 || !formData.description}
              size="lg"
              className="flex-1 mobile-touch-target"
              loading={isLoading}
              icon={!isOnline ? <Clock className="w-5 h-5" /> : undefined}
            >
              {isOnline ? 'Log Disbursement' : 'Save Offline'}
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraReceiptCapture
          onImageCapture={handleImageCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};