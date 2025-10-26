import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DisbursementService, DisbursementCreate } from '../../services/api/disbursement.service';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';

/**
 * LogDisbursementModal Component
 * Modal for logging new disbursements (expenses) for a matter
 * Requirements: 2.2, 2.3
 */

interface LogDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  matterId: string;
  onSuccess?: () => void;
}

export const LogDisbursementModal: React.FC<LogDisbursementModalProps> = ({
  isOpen,
  onClose,
  matterId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<DisbursementCreate>({
    matter_id: matterId,
    description: '',
    amount: 0,
    date_incurred: new Date().toISOString().split('T')[0],
    vat_applicable: true,
    receipt_link: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate VAT and total in real-time
  const vatAmount = formData.vat_applicable ? formData.amount * 0.15 : 0;
  const totalAmount = formData.amount + vatAmount;

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        matter_id: matterId,
        description: '',
        amount: 0,
        date_incurred: new Date().toISOString().split('T')[0],
        vat_applicable: true,
        receipt_link: ''
      });
      setErrors({});
    }
  }, [isOpen, matterId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!formData.date_incurred) {
      newErrors.date_incurred = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await DisbursementService.createDisbursement(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error logging disbursement:', error);
      // Error toast is handled by the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof DisbursementCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Log Disbursement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Court filing fees, Travel expenses, Expert witness fees"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Amount and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (excl. VAT) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Date Incurred */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Incurred <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date_incurred}
                onChange={(e) => handleChange('date_incurred', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date_incurred ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.date_incurred && (
                <p className="mt-1 text-sm text-red-600">{errors.date_incurred}</p>
              )}
            </div>
          </div>

          {/* VAT Applicable Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="vat-applicable"
              checked={formData.vat_applicable}
              onChange={(e) => handleChange('vat_applicable', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="vat-applicable" className="text-sm font-medium text-gray-700">
              VAT Applicable (15%)
            </label>
          </div>

          {/* Real-time Calculation Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Amount (excl. VAT):</span>
              <span className="font-medium text-gray-900">
                R {formData.amount.toFixed(2)}
              </span>
            </div>
            {formData.vat_applicable && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">VAT (15%):</span>
                <span className="font-medium text-gray-900">
                  R {vatAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-blue-300">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-blue-600">
                R {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Receipt Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Link (Optional)
            </label>
            <input
              type="url"
              value={formData.receipt_link}
              onChange={(e) => handleChange('receipt_link', e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Link to receipt stored in your cloud storage
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Disbursement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
