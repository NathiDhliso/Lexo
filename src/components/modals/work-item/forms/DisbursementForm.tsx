/**
 * DisbursementForm - Log/Edit Disbursement
 * Extracted from LogDisbursementModal and EditDisbursementModal
 */

import React, { useState, useEffect } from 'react';
import { Save, Receipt } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { FormInput } from '../../../ui/FormInput';
import { toastService } from '../../../../services/toast.service';
import { supabase } from '../../../../lib/supabase';
import type { WorkItemMode } from '../WorkItemModal';

export interface DisbursementFormProps {
  mode: WorkItemMode;
  matterId: string;
  matterTitle?: string;
  itemId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const DisbursementForm: React.FC<DisbursementFormProps> = ({
  mode,
  matterId,
  matterTitle,
  itemId,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: 0,
    vat_amount: 0,
    receipt_url: '',
    billable: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load disbursement if editing
  useEffect(() => {
    if (mode === 'edit' && itemId) {
      loadDisbursement(itemId);
    }
  }, [mode, itemId]);

  const loadDisbursement = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('disbursements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.description || '',
          category: data.category || '',
          amount: data.amount || 0,
          vat_amount: data.vat_amount || 0,
          receipt_url: data.receipt_url || '',
          billable: data.billable !== false,
        });
      }
    } catch (error) {
      console.error('Error loading disbursement:', error);
      toastService.error('Failed to load disbursement');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const disbursementData = {
        ...formData,
        matter_id: matterId,
        billed: false,
        write_off: false,
      };

      let result;
      if (mode === 'edit' && itemId) {
        result = await supabase
          .from('disbursements')
          .update(disbursementData)
          .eq('id', itemId);
      } else {
        result = await supabase
          .from('disbursements')
          .insert([disbursementData]);
      }

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save disbursement');
      }

      toastService.success(mode === 'edit' ? 'Disbursement updated' : 'Disbursement logged');
      onSuccess();
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to save disbursement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {matterTitle && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Matter:</strong> {matterTitle}
          </p>
        </div>
      )}

      <FormInput
        label="Date"
        type="date"
        required
        value={formData.date}
        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
        >
          <option value="">Select category</option>
          <option value="travel">Travel</option>
          <option value="accommodation">Accommodation</option>
          <option value="meals">Meals</option>
          <option value="court_fees">Court Fees</option>
          <option value="filing_fees">Filing Fees</option>
          <option value="expert_fees">Expert Fees</option>
          <option value="photocopying">Photocopying</option>
          <option value="postage">Postage</option>
          <option value="telephone">Telephone</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-status-error-600">{errors.category}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={mode === 'quick' ? 2 : 3}
          className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          placeholder="Describe the disbursement..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-status-error-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Amount (R)"
          type="number"
          required
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
          error={errors.amount}
        />

        <FormInput
          label="VAT Amount (R)"
          type="number"
          value={formData.vat_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, vat_amount: parseFloat(e.target.value) || 0 }))}
        />
      </div>

      {mode !== 'quick' && (
        <>
          <FormInput
            label="Receipt URL (optional)"
            type="url"
            value={formData.receipt_url}
            onChange={(e) => setFormData(prev => ({ ...prev, receipt_url: e.target.value }))}
            placeholder="https://..."
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
              className="w-4 h-4 rounded border-neutral-300"
            />
            <label htmlFor="billable" className="text-sm text-neutral-700 dark:text-neutral-300">
              Billable to client
            </label>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex-1"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <AsyncButton
          variant="primary"
          onAsyncClick={handleSubmit}
          className="flex-1"
          disabled={isSaving}
          icon={<Save className="w-4 h-4" />}
          successMessage={mode === 'edit' ? 'Disbursement updated' : 'Disbursement logged'}
          errorMessage="Failed to save disbursement"
        >
          {mode === 'edit' ? 'Update' : 'Log Disbursement'}
        </AsyncButton>
      </div>
    </div>
  );
};

export default DisbursementForm;
