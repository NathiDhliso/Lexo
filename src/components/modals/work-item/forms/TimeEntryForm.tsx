/**
 * TimeEntryForm - Log/Edit Time Entry
 * Extracted from TimeEntryModal
 */

import React, { useState, useEffect } from 'react';
import { Clock, Save } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { FormInput } from '../../../ui/FormInput';
import { toastService } from '../../../../services/toast.service';
import { supabase } from '../../../../lib/supabase';
import type { WorkItemMode } from '../WorkItemModal';

export interface TimeEntryFormProps {
  mode: WorkItemMode;
  matterId: string;
  matterTitle?: string;
  itemId?: string;
  defaultRate?: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  mode,
  matterId,
  matterTitle,
  itemId,
  defaultRate = 2000,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    hours: 0,
    hourly_rate: defaultRate,
    description: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate amount
  const amount = formData.hours * formData.hourly_rate;

  // Load time entry if editing
  useEffect(() => {
    if (mode === 'edit' && itemId) {
      loadTimeEntry(itemId);
    }
  }, [mode, itemId]);

  const loadTimeEntry = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          entry_date: data.entry_date || new Date().toISOString().split('T')[0],
          hours: data.hours || 0,
          hourly_rate: data.hourly_rate || defaultRate,
          description: data.description || '',
        });
      }
    } catch (error) {
      console.error('Error loading time entry:', error);
      toastService.error('Failed to load time entry');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }
    if (formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Hourly rate must be greater than 0';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const timeEntryData = {
        ...formData,
        matter_id: matterId,
        amount,
        is_billed: false,
      };

      let result;
      if (mode === 'edit' && itemId) {
        result = await supabase
          .from('time_entries')
          .update(timeEntryData)
          .eq('id', itemId);
      } else {
        result = await supabase
          .from('time_entries')
          .insert([timeEntryData]);
      }

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save time entry');
      }

      toastService.success(mode === 'edit' ? 'Time entry updated' : 'Time entry logged');
      onSuccess();
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to save time entry');
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
        value={formData.entry_date}
        onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Hours"
          type="number"
          step="0.25"
          required
          value={formData.hours}
          onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
          error={errors.hours}
        />

        <FormInput
          label="Hourly Rate (R)"
          type="number"
          required
          value={formData.hourly_rate}
          onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
          error={errors.hourly_rate}
        />
      </div>

      {/* Amount Display */}
      <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Total Amount:
          </span>
          <span className="text-lg font-bold text-judicial-blue-600 dark:text-mpondo-gold-400">
            R{amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={mode === 'quick' ? 2 : 4}
          className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          placeholder="Describe the work performed..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-status-error-600">{errors.description}</p>
        )}
      </div>

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
          successMessage={mode === 'edit' ? 'Time entry updated' : 'Time entry logged'}
          errorMessage="Failed to save time entry"
        >
          {mode === 'edit' ? 'Update Entry' : 'Log Time'}
        </AsyncButton>
      </div>
    </div>
  );
};

export default TimeEntryForm;
