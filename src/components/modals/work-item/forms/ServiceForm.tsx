/**
 * ServiceForm - Log/Edit Service
 * Extracted from LogServiceModal
 */

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { FormInput } from '../../../ui/FormInput';
import { toastService } from '../../../../services/toast.service';
import { loggedServicesService } from '../../../../services/api/logged-services.service';
import type { WorkItemMode } from '../WorkItemModal';

export interface ServiceFormProps {
  mode: WorkItemMode;
  matterId: string;
  matterTitle?: string;
  itemId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  mode,
  matterId,
  matterTitle,
  itemId,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_type: '',
    description: '',
    fee_amount: 0,
    vat_amount: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load service data if editing
  useEffect(() => {
    if (mode === 'edit' && itemId) {
      loadService(itemId);
    }
  }, [mode, itemId]);

  const loadService = async (id: string) => {
    try {
      const result = await loggedServicesService.getById(id);
      if (result.data) {
        setFormData({
          service_date: result.data.service_date || new Date().toISOString().split('T')[0],
          service_type: result.data.service_type || '',
          description: result.data.description || '',
          fee_amount: result.data.fee_amount || 0,
          vat_amount: result.data.vat_amount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading service:', error);
      toastService.error('Failed to load service');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.service_type.trim()) {
      newErrors.service_type = 'Service type is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.fee_amount <= 0) {
      newErrors.fee_amount = 'Fee amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const serviceData = {
        ...formData,
        matter_id: matterId,
      };

      let result;
      if (mode === 'edit' && itemId) {
        result = await loggedServicesService.update(itemId, serviceData);
      } else {
        result = await loggedServicesService.create(serviceData);
      }

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save service');
      }

      toastService.success(mode === 'edit' ? 'Service updated' : 'Service logged');
      onSuccess();
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to save service');
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
        label="Service Date"
        type="date"
        required
        value={formData.service_date}
        onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
        error={errors.service_date}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Service Type *
        </label>
        <select
          value={formData.service_type}
          onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
          className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
        >
          <option value="">Select service type</option>
          <option value="consultation">Consultation</option>
          <option value="court_appearance">Court Appearance</option>
          <option value="legal_opinion">Legal Opinion</option>
          <option value="drafting">Drafting</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>
        {errors.service_type && (
          <p className="mt-1 text-sm text-status-error-600">{errors.service_type}</p>
        )}
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
          placeholder="Describe the service provided..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-status-error-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Fee Amount (R)"
          type="number"
          required
          value={formData.fee_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, fee_amount: parseFloat(e.target.value) || 0 }))}
          error={errors.fee_amount}
        />

        <FormInput
          label="VAT Amount (R)"
          type="number"
          value={formData.vat_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, vat_amount: parseFloat(e.target.value) || 0 }))}
        />
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
          successMessage={mode === 'edit' ? 'Service updated' : 'Service logged'}
          errorMessage="Failed to save service"
        >
          {mode === 'edit' ? 'Update Service' : 'Log Service'}
        </AsyncButton>
      </div>
    </div>
  );
};

export default ServiceForm;
