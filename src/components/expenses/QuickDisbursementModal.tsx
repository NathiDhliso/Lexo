import React, { useState } from 'react';
import { X, DollarSign, Receipt } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../design-system/components';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { QuickDisbursementRequest, DisbursementType } from '../../types';

interface QuickDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  matterId: string;
  onSuccess?: () => void;
}

const DISBURSEMENT_TYPES: { value: DisbursementType; label: string }[] = [
  { value: 'court_fees' as DisbursementType, label: 'Court Fees' },
  { value: 'filing_fees' as DisbursementType, label: 'Filing Fees' },
  { value: 'expert_witness' as DisbursementType, label: 'Expert Witness' },
  { value: 'travel' as DisbursementType, label: 'Travel' },
  { value: 'accommodation' as DisbursementType, label: 'Accommodation' },
  { value: 'courier' as DisbursementType, label: 'Courier' },
  { value: 'photocopying' as DisbursementType, label: 'Photocopying' },
  { value: 'research' as DisbursementType, label: 'Research' },
  { value: 'translation' as DisbursementType, label: 'Translation' },
  { value: 'other' as DisbursementType, label: 'Other' }
];

export const QuickDisbursementModal: React.FC<QuickDisbursementModalProps> = ({
  isOpen,
  onClose,
  matterId,
  onSuccess
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuickDisbursementRequest>({
    matter_id: matterId,
    description: '',
    amount: 0,
    disbursement_type: 'other' as DisbursementType,
    payment_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    vendor_name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof QuickDisbursementRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!formData.disbursement_type) {
      newErrors.disbursement_type = 'Disbursement type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('quick_add_disbursement', {
        p_matter_id: matterId,
        p_description: formData.description,
        p_amount: formData.amount,
        p_disbursement_type: formData.disbursement_type,
        p_payment_date: formData.payment_date || new Date().toISOString().split('T')[0],
        p_receipt_number: formData.receipt_number || null,
        p_vendor_name: formData.vendor_name || null
      });

      if (error) {
        toast.error(error.message || 'Failed to add disbursement');
        return;
      }

      toast.success('Disbursement added successfully');
      
      if (onSuccess) {
        onSuccess();
      }

      onClose();
      
      setFormData({
        matter_id: matterId,
        description: '',
        amount: 0,
        disbursement_type: 'other' as DisbursementType,
        payment_date: new Date().toISOString().split('T')[0],
        receipt_number: '',
        vendor_name: ''
      });
    } catch (error) {
      console.error('Error adding disbursement:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Quick Add Disbursement</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Record an expense for this matter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Disbursement Type *
              </label>
              <Select
                value={formData.disbursement_type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('disbursement_type', e.target.value)}
                error={errors.disbursement_type}
                disabled={isSubmitting}
              >
                {DISBURSEMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Court filing fee for application"
                rows={3}
                error={errors.description}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Amount (R) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-10"
                    error={errors.amount}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Payment Date
                </label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('payment_date', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Receipt Number (Optional)
                </label>
                <Input
                  value={formData.receipt_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('receipt_number', e.target.value)}
                  placeholder="Receipt or invoice number"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Vendor Name (Optional)
                </label>
                <Input
                  value={formData.vendor_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('vendor_name', e.target.value)}
                  placeholder="Vendor or service provider"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>Add Disbursement</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
