/**
 * QuickAddMatterForm - Quick matter creation (simplified)
 * Extracted from QuickAddMatterModal
 */

import React, { useState, useEffect } from 'react';
import { Zap, Phone, Mail, Building2, Briefcase, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { FormInput } from '../../../ui/FormInput';
import { supabase } from '../../../../lib/supabase';
import { matterApiService } from '../../../../services/api/matter-api.service';
import { toastService } from '../../../../services/toast.service';
import type { Matter } from '../../../../types';

interface Firm {
  id: string;
  firm_name: string;
  attorney_name?: string;
  email?: string;
  phone_number?: string;
}

const MATTER_TYPES = [
  'Civil Litigation',
  'Criminal Defense',
  'Commercial Law',
  'Contract Dispute',
  'Personal Injury',
  'Motor Vehicle Accident',
  'Medical Malpractice',
  'Property Law',
  'Family Law',
  'Labour Law',
  'Tax Law',
  'Constitutional Law',
  'Other'
];

export interface QuickAddMatterFormProps {
  onSuccess: (matter: Matter) => void;
  onClose: () => void;
  prefillData?: Partial<Matter>;
}

export const QuickAddMatterForm: React.FC<QuickAddMatterFormProps> = ({
  onSuccess,
  onClose,
  prefillData,
}) => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string>('');
  const [loadingFirms, setLoadingFirms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  
  const [formData, setFormData] = useState({
    title: prefillData?.title || '',
    instructing_firm: prefillData?.instructing_firm || '',
    instructing_attorney: prefillData?.instructing_attorney || '',
    instructing_attorney_email: prefillData?.instructing_attorney_email || '',
    instructing_attorney_phone: prefillData?.instructing_attorney_phone || '',
    client_name: prefillData?.client_name || '',
    description: prefillData?.description || '',
    matter_type: prefillData?.matter_type || '',
    urgency: (prefillData?.urgency || 'standard') as 'routine' | 'standard' | 'urgent' | 'emergency',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFirms();
    if (prefillData) {
      setIsPrefilled(true);
      setSelectedFirmId('prefilled');
    }
  }, [prefillData]);

  const loadFirms = async () => {
    setLoadingFirms(true);
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('id, firm_name, attorney_name, email, phone_number')
        .order('firm_name');

      if (error) throw error;
      setFirms(data || []);
    } catch (error) {
      console.error('Error loading firms:', error);
      toastService.error('Failed to load firms');
    } finally {
      setLoadingFirms(false);
    }
  };

  const handleFirmSelect = (firmId: string) => {
    setSelectedFirmId(firmId);
    
    if (firmId && firmId !== 'prefilled') {
      const selectedFirm = firms.find(f => f.id === firmId);
      if (selectedFirm) {
        setFormData(prev => ({
          ...prev,
          instructing_firm: selectedFirm.firm_name,
          instructing_attorney: selectedFirm.attorney_name || '',
          instructing_attorney_email: selectedFirm.email || '',
          instructing_attorney_phone: selectedFirm.phone_number || ''
        }));
      }
    } else if (!firmId) {
      setFormData(prev => ({
        ...prev,
        instructing_firm: '',
        instructing_attorney: '',
        instructing_attorney_email: '',
        instructing_attorney_phone: ''
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Matter title is required';
    if (!formData.instructing_firm.trim()) newErrors.instructing_firm = 'Instructing firm is required';
    if (!formData.instructing_attorney.trim()) newErrors.instructing_attorney = 'Attorney name is required';
    if (!formData.instructing_attorney_email.trim()) {
      newErrors.instructing_attorney_email = 'Attorney email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.instructing_attorney_email)) {
      newErrors.instructing_attorney_email = 'Valid email is required';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.matter_type) newErrors.matter_type = 'Matter type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const matterData = {
        ...formData,
        firm_id: selectedFirmId && selectedFirmId !== 'prefilled' ? selectedFirmId : undefined,
        status: 'active',
        is_quick_create: true,
      };

      const result = await matterApiService.create(matterData as any);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create matter');
      }

      toastService.success('Matter created successfully');
      onSuccess(result.data);
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to create matter');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Fast Track
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Matter will be created with status <strong>"Active"</strong> immediately. You can start logging time and work right away.
            </p>
          </div>
        </div>
      </div>

      {/* Prefill Info Banner */}
      {isPrefilled && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-100">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Attorney details pre-filled from submission</span>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Firm Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Select Firm (or enter manually below)
          </label>
          <select
            value={selectedFirmId}
            onChange={(e) => handleFirmSelect(e.target.value)}
            disabled={loadingFirms || isPrefilled}
            className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          >
            {isPrefilled ? (
              <option value="prefilled">From attorney submission</option>
            ) : (
              <>
                <option value="">Enter manually</option>
                {loadingFirms ? (
                  <option disabled>Loading firms...</option>
                ) : (
                  firms.map(firm => (
                    <option key={firm.id} value={firm.id}>
                      {firm.firm_name} {firm.attorney_name ? `(${firm.attorney_name})` : ''}
                    </option>
                  ))
                )}
              </>
            )}
          </select>
        </div>

        <FormInput
          label="Matter Title"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          error={errors.title}
          placeholder="e.g., Smith v Jones - Contract Dispute"
        />

        <FormInput
          label="Instructing Firm"
          required
          value={formData.instructing_firm}
          onChange={(e) => setFormData(prev => ({ ...prev, instructing_firm: e.target.value }))}
          error={errors.instructing_firm}
          disabled={!!selectedFirmId}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Attorney Name"
            required
            value={formData.instructing_attorney}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney: e.target.value }))}
            error={errors.instructing_attorney}
            disabled={!!selectedFirmId}
          />
          <FormInput
            label="Attorney Email"
            type="email"
            required
            value={formData.instructing_attorney_email}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney_email: e.target.value }))}
            error={errors.instructing_attorney_email}
            disabled={!!selectedFirmId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Attorney Phone"
            value={formData.instructing_attorney_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney_phone: e.target.value }))}
            disabled={!!selectedFirmId}
          />
          <FormInput
            label="Client Name"
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Matter Type *
            </label>
            <select
              value={formData.matter_type}
              onChange={(e) => setFormData(prev => ({ ...prev, matter_type: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
            >
              <option value="">Select matter type</option>
              {MATTER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.matter_type && (
              <p className="mt-1 text-sm text-status-error-600">{errors.matter_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Urgency
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
              className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
            >
              <option value="routine">Routine</option>
              <option value="standard">Standard</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter brief details from the phone call or email..."
            rows={4}
            className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-status-error-600">{errors.description}</p>
          )}
        </div>
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
          icon={<Zap className="w-4 h-4" />}
          successMessage="Matter created"
          errorMessage="Failed to create matter"
        >
          Create Active Matter
        </AsyncButton>
      </div>
    </div>
  );
};

export default QuickAddMatterForm;
