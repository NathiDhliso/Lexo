import React, { useState, useEffect } from 'react';
import { X, DollarSign, Receipt, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../design-system/components';
import { supabase } from '../../lib/supabase';
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
  
  // Smart VAT suggestion state
  const [vatSuggestion, setVatSuggestion] = useState<{
    vat_applicable: boolean;
    explanation: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  const [manualVatOverride, setManualVatOverride] = useState(false);
  const [vatApplicable, setVatApplicable] = useState(true);
  const [overrideReason, setOverrideReason] = useState('');

  // Simple inline VAT suggestion logic based on disbursement type
  useEffect(() => {
    if (!formData.disbursement_type) {
      setVatSuggestion(null);
      return;
    }

    // VAT rules for common disbursement types
    const vatRules: Record<string, { vat_applicable: boolean; explanation: string; confidence: 'high' | 'medium' | 'low' }> = {
      court_fees: {
        vat_applicable: false,
        explanation: 'Court fees are typically VAT-exempt (government services)',
        confidence: 'high'
      },
      filing_fees: {
        vat_applicable: false,
        explanation: 'Filing fees are usually VAT-exempt (statutory charges)',
        confidence: 'high'
      },
      expert_witness: {
        vat_applicable: true,
        explanation: 'Expert witness fees are subject to VAT (professional services)',
        confidence: 'high'
      },
      travel: {
        vat_applicable: true,
        explanation: 'Travel expenses generally include VAT',
        confidence: 'medium'
      },
      accommodation: {
        vat_applicable: true,
        explanation: 'Accommodation costs typically include VAT',
        confidence: 'high'
      },
      courier: {
        vat_applicable: true,
        explanation: 'Courier services are VAT-inclusive',
        confidence: 'high'
      },
      photocopying: {
        vat_applicable: true,
        explanation: 'Photocopying services include VAT',
        confidence: 'high'
      },
      research: {
        vat_applicable: true,
        explanation: 'Research services are subject to VAT',
        confidence: 'medium'
      },
      translation: {
        vat_applicable: true,
        explanation: 'Translation services include VAT',
        confidence: 'high'
      },
      other: {
        vat_applicable: true,
        explanation: 'Most disbursements include VAT unless exempt by law',
        confidence: 'low'
      }
    };

    const rule = vatRules[formData.disbursement_type];
    if (rule) {
      setVatSuggestion(rule);
      
      // Auto-apply suggestion if not manually overridden
      if (!manualVatOverride) {
        setVatApplicable(rule.vat_applicable);
      }
    }
  }, [formData.disbursement_type, manualVatOverride]);

  const handleVatToggle = () => {
    setManualVatOverride(true);
    setVatApplicable(!vatApplicable);
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-orange-600 dark:text-orange-400';
    }
  };

  const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <AlertCircle className="w-4 h-4" />;
    }
  };


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
      // Add disbursement with VAT information
      const { error } = await supabase.rpc('quick_add_disbursement', {
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

      // Show success message with VAT info
      const vatInfo = vatApplicable ? 'with VAT' : 'VAT-exempt';
      toast.success(`Disbursement added successfully (${vatInfo})`);
      
      // Record override if user changed the suggestion
      if (manualVatOverride && vatSuggestion && vatApplicable !== vatSuggestion.vat_applicable) {
        const reason = overrideReason || 'Manual override by user';
        console.log('VAT override recorded:', {
          suggested: vatSuggestion.vat_applicable,
          actual: vatApplicable,
          reason
        });
      }
      
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

            {/* Smart VAT Suggestion */}
            {vatSuggestion && (
              <div className={`p-4 rounded-lg border-2 ${
                getConfidenceColor(vatSuggestion.confidence).replace('text-', 'border-').replace('-600', '-200').replace('-400', '-300')
              } ${
                getConfidenceColor(vatSuggestion.confidence).replace('text-', 'bg-').replace('-600', '-50').replace('-400', '-900/10')
              }`}>
                <div className="flex items-start gap-3">
                  <div className={getConfidenceColor(vatSuggestion.confidence)}>
                    {getConfidenceIcon(vatSuggestion.confidence)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                        Smart VAT Suggestion
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          getConfidenceColor(vatSuggestion.confidence).replace('text-', 'bg-').replace('-600', '-100').replace('-400', '-900/20')
                        } ${getConfidenceColor(vatSuggestion.confidence)}`}>
                          {vatSuggestion.confidence} confidence
                        </span>
                      </h4>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                      {vatSuggestion.explanation}
                    </p>
                    
                    {/* VAT Toggle */}
                    <div className="flex items-center justify-between bg-white dark:bg-metallic-gray-700 rounded-lg p-3 border border-neutral-200 dark:border-metallic-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          VAT Applicable:
                        </span>
                        <span className={`text-sm font-semibold ${
                          vatApplicable ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {vatApplicable ? 'Yes (15%)' : 'No (Exempt)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleVatToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          vatApplicable ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            vatApplicable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Override reason input */}
                    {manualVatOverride && vatApplicable !== vatSuggestion.vat_applicable && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Reason for override (optional)
                        </label>
                        <Input
                          type="text"
                          value={overrideReason}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOverrideReason(e.target.value)}
                          placeholder="e.g., Special arrangement with vendor"
                          className="text-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
