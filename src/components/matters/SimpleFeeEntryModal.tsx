/**
 * SimpleFeeEntryModal Component
 * Quick fee entry for Path B (Accept & Work) matters
 * For simple brief fees without detailed time tracking
 */
import React, { useMemo } from 'react';
import { Button, Input } from '../design-system/components';
import { X, DollarSign, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { useModalForm } from '../../hooks/useModalForm';
import { createValidator, required, numeric, positive, minLength } from '../../utils/validation.utils';
import type { Matter } from '../../types';

interface SimpleFeeEntryModalProps {
  isOpen: boolean;
  matter: Matter | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Disbursement {
  description: string;
  amount: number;
}

interface FeeEntryFormData {
  briefFee: number;
  feeDescription: string;
  disbursements: Disbursement[];
}

export const SimpleFeeEntryModal: React.FC<SimpleFeeEntryModalProps> = ({
  isOpen,
  matter,
  onClose,
  onSuccess
}) => {
  // Create validator for fee entry form
  const validator = useMemo(() => createValidator<FeeEntryFormData>({
    briefFee: [required(), numeric(), positive()],
    feeDescription: [required(), minLength(10)],
    disbursements: [], // Optional array
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
  } = useModalForm<FeeEntryFormData>({
    initialData: {
      briefFee: 0,
      feeDescription: '',
      disbursements: [],
    },
    onSubmit: async (data) => {
      if (!matter) throw new Error('No matter selected');
      await submitFeeEntry(data, matter);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    validate: (data) => {
      const result = validator.validate(data);
      return result.isValid ? null : result.errors;
    },
    successMessage: 'Fee note created successfully!',
    resetOnSuccess: true,
  });

  // Extract fee submission logic
  const submitFeeEntry = async (data: FeeEntryFormData, matter: Matter) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const disbursementsTotal = data.disbursements.reduce((sum, d) => sum + d.amount, 0);
    const subtotal = data.briefFee + disbursementsTotal;
    const vatAmount = subtotal * 0.15;
    const totalAmount = subtotal + vatAmount;

    // Generate invoice number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`);

    const sequence = (count || 0) + 1;
    const invoiceNumber = `INV-${year}-${sequence.toString().padStart(4, '0')}`;

    // Create invoice (fee note)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        matter_id: matter.id,
        advocate_id: user.id,
        fees_amount: data.briefFee,
        disbursements_amount: disbursementsTotal,
        vat_rate: 0.15,
        amount_paid: 0,
        fee_narrative: data.feeDescription,
        status: 'draft',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Log disbursements as expenses
    if (data.disbursements.length > 0) {
      const expenseRecords = data.disbursements
        .filter(d => d.description && d.amount > 0)
        .map(d => ({
          matter_id: matter.id,
          advocate_id: user.id,
          invoice_id: invoice.id,
          expense_date: new Date().toISOString(),
          description: d.description,
          amount: d.amount,
          category: 'disbursement',
          is_billable: true
        }));

      if (expenseRecords.length > 0) {
        await supabase.from('expenses').insert(expenseRecords);
      }
    }

    // Update matter WIP
    await supabase
      .from('matters')
      .update({ wip_value: (matter.wip_value || 0) + totalAmount })
      .eq('id', matter.id);
  };

  // Calculate totals for display
  const calculations = useMemo(() => {
    const briefFeeAmount = formData.briefFee || 0;
    const disbursementsTotal = formData.disbursements.reduce((sum, d) => sum + d.amount, 0);
    const subtotal = briefFeeAmount + disbursementsTotal;
    const vatAmount = subtotal * 0.15;
    const totalAmount = subtotal + vatAmount;

    return {
      briefFeeAmount,
      disbursementsTotal,
      subtotal,
      vatAmount,
      totalAmount,
    };
  }, [formData.briefFee, formData.disbursements]);

  if (!isOpen || !matter) return null;

  const handleAddDisbursement = () => {
    const newDisbursements = [...formData.disbursements, { description: '', amount: 0 }];
    handleChange('disbursements', newDisbursements);
  };

  const handleRemoveDisbursement = (index: number) => {
    const newDisbursements = formData.disbursements.filter((_, i) => i !== index);
    handleChange('disbursements', newDisbursements);
  };

  const handleDisbursementChange = (index: number, field: keyof Disbursement, value: string | number) => {
    const updated = [...formData.disbursements];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('disbursements', updated);
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Simple Fee Entry
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Quick fee note for brief work
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              aria-label="Close modal"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Matter Details */}
          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {matter.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {matter.client_name} • {matter.instructing_attorney}
            </p>
          </div>

          {/* Brief Fee */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Brief Fee <span className="text-status-error-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.briefFee || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('briefFee', parseFloat(e.target.value) || 0)}
              placeholder="15000.00"
              min="0"
              step="100"
              disabled={isLoading}
            />
            {validationErrors.briefFee && (
              <p className="text-xs text-status-error-500 mt-1">
                {validationErrors.briefFee}
              </p>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Enter the agreed brief fee amount
            </p>
          </div>

          {/* Fee Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Work Description <span className="text-status-error-500">*</span>
            </label>
            <textarea
              value={formData.feeDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('feeDescription', e.target.value)}
              placeholder="e.g., Court appearance in Johannesburg High Court for bail application..."
              className="w-full h-24 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none focus:ring-2 focus:ring-mpondo-gold-500"
              disabled={isLoading}
            />
            {validationErrors.feeDescription && (
              <p className="text-xs text-status-error-500 mt-1">
                {validationErrors.feeDescription}
              </p>
            )}
          </div>

          {/* Disbursements */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Disbursements (Optional)
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDisbursement}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Disbursement
              </Button>
            </div>

            {formData.disbursements.length > 0 && (
              <div className="space-y-3">
                {formData.disbursements.map((disbursement, index) => (
                  <div key={index} className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          type="text"
                          value={disbursement.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDisbursementChange(index, 'description', e.target.value)}
                          placeholder="e.g., Travel to Pretoria"
                          disabled={isLoading}
                        />
                        <Input
                          type="number"
                          value={disbursement.amount || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDisbursementChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="10"
                          disabled={isLoading}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveDisbursement(index)}
                        className="p-2 text-status-error-500 hover:bg-status-error-50 dark:hover:bg-status-error-900/20 rounded-lg transition-colors"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 border border-mpondo-gold-200 dark:border-mpondo-gold-800 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">Brief Fee:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRand(calculations.briefFeeAmount)}
                </span>
              </div>
              {calculations.disbursementsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-700 dark:text-neutral-300">Disbursements:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatRand(calculations.disbursementsTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">Subtotal:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRand(calculations.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">VAT (15%):</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRand(calculations.vatAmount)}
                </span>
              </div>
              <div className="border-t border-mpondo-gold-200 dark:border-mpondo-gold-700 pt-2 flex justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Total:</span>
                <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  {formatRand(calculations.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-status-error-50 dark:bg-status-error-900/20 border border-status-error-200 dark:border-status-error-800 rounded-lg">
              <p className="text-sm text-status-error-600 dark:text-status-error-400">
                {error.message || 'An error occurred while creating the fee note.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex-1 bg-mpondo-gold-600 hover:bg-mpondo-gold-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Fee Note'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
