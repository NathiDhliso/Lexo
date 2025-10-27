/**
 * EditMatterForm - Edit existing matter
 * Extracted from EditMatterModal
 */

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { FormInput } from '../../../ui/FormInput';
import { matterApiService } from '../../../../services/api/matter-api.service';
import { toastService } from '../../../../services/toast.service';
import { BillingModelSelector } from '../../../matters/BillingModelSelector';
import { BillingModelChangeConfirmation } from '../../../matters/BillingModelChangeConfirmation';
import { BillingModel } from '../../../../services/billing-strategies';
import type { Matter, MatterStatus } from '../../../../types';

const MATTER_TYPES = [
  'Personal Injury',
  'Motor Vehicle Accident',
  'Medical Malpractice',
  'Product Liability',
  'Workplace Injury',
  'Property Damage',
  'Contract Dispute',
  'Insurance Claim',
  'Commercial Litigation',
  'Contract Law',
  'Employment Law',
  'Family Law',
  'Criminal Law',
  'Property Law',
  'Intellectual Property',
  'Tax Law',
  'Constitutional Law',
  'Administrative Law',
  'Other'
];

export interface EditMatterFormProps {
  matter: Matter;
  onSuccess: (matter: Matter) => void;
  onClose: () => void;
}

export const EditMatterForm: React.FC<EditMatterFormProps> = ({
  matter,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: matter.title || '',
    matter_type: matter.matter_type || '',
    description: matter.description || '',
    client_name: matter.client_name || '',
    client_email: matter.client_email || '',
    client_phone: matter.client_phone || '',
    client_address: matter.client_address || '',
    instructing_attorney: matter.instructing_attorney || '',
    instructing_firm: matter.instructing_firm || '',
    instructing_attorney_email: matter.instructing_attorney_email || '',
    instructing_attorney_phone: matter.instructing_attorney_phone || '',
    estimated_fee: matter.estimated_fee || 0,
    status: (matter.status || 'active') as MatterStatus,
    billing_model: matter.billing_model || BillingModel.BRIEF_FEE,
    hourly_rate: matter.hourly_rate,
    fee_cap: matter.fee_cap,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showBillingModelConfirmation, setShowBillingModelConfirmation] = useState(false);
  const [pendingBillingModel, setPendingBillingModel] = useState<BillingModel | null>(null);
  const originalBillingModel = matter.billing_model || BillingModel.BRIEF_FEE;

  const handleBillingModelChange = (newModel: BillingModel) => {
    // If billing model is changing, show confirmation
    if (newModel !== originalBillingModel) {
      setPendingBillingModel(newModel);
      setShowBillingModelConfirmation(true);
    } else {
      // Same model, just update
      setFormData(prev => ({ ...prev, billing_model: newModel }));
    }
  };

  const handleConfirmBillingModelChange = () => {
    if (pendingBillingModel) {
      setFormData(prev => ({ ...prev, billing_model: pendingBillingModel }));
      setPendingBillingModel(null);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      const result = await matterApiService.update(matter.id, formData);
      
      if (result.error || !result.data) {
        throw new Error(result.error?.message || 'Failed to update matter');
      }

      toastService.success('Matter updated successfully');
      onSuccess(result.data);
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to update matter');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Matter Title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Matter Type *
          </label>
          <select
            value={formData.matter_type}
            onChange={(e) => setFormData(prev => ({ ...prev, matter_type: e.target.value }))}
            required
            className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          >
            <option value="">Select matter type</option>
            {MATTER_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MatterStatus }))}
            className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="settled">Settled</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Client Name"
            required
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
          />
          <FormInput
            label="Client Email"
            type="email"
            value={formData.client_email}
            onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
          />
          <FormInput
            label="Client Phone"
            value={formData.client_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
          />
          <FormInput
            label="Client Address"
            value={formData.client_address}
            onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Attorney Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Instructing Attorney"
            required
            value={formData.instructing_attorney}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney: e.target.value }))}
          />
          <FormInput
            label="Law Firm"
            value={formData.instructing_firm}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_firm: e.target.value }))}
          />
          <FormInput
            label="Attorney Email"
            type="email"
            value={formData.instructing_attorney_email}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney_email: e.target.value }))}
          />
          <FormInput
            label="Attorney Phone"
            value={formData.instructing_attorney_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney_phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Billing Model</h3>
        <BillingModelSelector
          value={formData.billing_model as BillingModel}
          onChange={handleBillingModelChange}
          disabled={isSaving}
        />
        
        {/* Billing Model Specific Fields */}
        <div className="mt-6 space-y-4">
          {(formData.billing_model === BillingModel.BRIEF_FEE || 
            formData.billing_model === BillingModel.QUICK_OPINION) && (
            <FormInput
              label={formData.billing_model === BillingModel.BRIEF_FEE ? "Agreed Brief Fee (R)" : "Consultation Fee (R)"}
              type="number"
              value={formData.estimated_fee}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_fee: parseFloat(e.target.value) || 0 }))}
            />
          )}

          {formData.billing_model === BillingModel.TIME_BASED && (
            <>
              <FormInput
                label="Hourly Rate (R)"
                type="number"
                value={formData.hourly_rate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || undefined }))}
              />
              <div>
                <FormInput
                  label="Fee Cap (Optional)"
                  type="number"
                  value={formData.fee_cap || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee_cap: parseFloat(e.target.value) || undefined }))}
                />
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Set a maximum fee limit for time-based billing
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <AsyncButton
          type="submit"
          variant="primary"
          onAsyncClick={handleSubmit}
          disabled={isSaving}
          icon={<Save className="w-4 h-4" />}
          successMessage="Matter updated"
          errorMessage="Failed to update matter"
        >
          Save Changes
        </AsyncButton>
      </div>
      
      {/* Billing Model Change Confirmation Modal */}
      <BillingModelChangeConfirmation
        isOpen={showBillingModelConfirmation}
        onClose={() => {
          setShowBillingModelConfirmation(false);
          setPendingBillingModel(null);
        }}
        onConfirm={handleConfirmBillingModelChange}
        currentModel={originalBillingModel as BillingModel}
        newModel={pendingBillingModel || originalBillingModel as BillingModel}
        matterTitle={matter.title}
      />
    </form>
  );
};

export default EditMatterForm;
