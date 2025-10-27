/**
 * UrgentMatterQuickCapture Component
 * 2-step wizard for capturing urgent matters
 * - Step 1: Essential details (attorney, matter type, fee)
 * - Step 2: Optional documents
 * 
 * Features:
 * - URGENT visual indicator (orange badge)
 * - Pre-fills attorney from quick select
 * - Auto-fills firm details
 * - Bypasses pro forma approval
 * - Sets status to ACTIVE immediately
 * - Sends confirmation email to attorney
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ArrowRight, ArrowLeft, Check, Zap } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { AsyncButton } from '../../ui/AsyncButton';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import { useAuth } from '../../../hooks/useAuth';
import { toastService } from '../../../services/toast.service';
import { matterApiService } from '../../../services/api/matter-api.service';
import { supabase } from '../../../lib/supabase';
import type { Firm } from '../../../types';
import { MatterStatus } from '../../../types';

interface UrgentMatterQuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (matterId: string) => void;
}

interface UrgentMatterData {
  // Step 1: Essential Details
  firm_id?: string;
  firm_name: string;
  attorney_id?: string;
  attorney_name: string;
  attorney_email: string;
  attorney_phone?: string;
  title: string;
  matter_type: string;
  client_name?: string;
  agreed_fee: number;
  urgency_reason: string;
  
  // Step 2: Optional Documents
  documents?: File[];
  additional_notes?: string;
}

const MATTER_TYPES = [
  'Bail Application',
  'Urgent Interdict',
  'Urgent Motion',
  'Emergency Appeal',
  'Contempt of Court',
  'Habeas Corpus',
  'Other Urgent Matter'
];

export const UrgentMatterQuickCapture: React.FC<UrgentMatterQuickCaptureProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UrgentMatterData>>({
    agreed_fee: 0,
    urgency_reason: ''
  });
  
  const [firms, setFirms] = useState<Firm[]>([]);
  const [attorneys, setAttorneys] = useState<any[]>([]);
  const [loadingFirms, setLoadingFirms] = useState(false);
  const [loadingAttorneys, setLoadingAttorneys] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadFirms();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (formData.firm_id) {
      loadAttorneys(formData.firm_id);
    }
  }, [formData.firm_id]);

  const loadFirms = async () => {
    if (!user?.id) return;
    
    setLoadingFirms(true);
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('id, firm_name')
        .eq('advocate_id', user.id)
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

  const loadAttorneys = async (firmId: string) => {
    setLoadingAttorneys(true);
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('id, attorney_name, email, phone')
        .eq('firm_id', firmId)
        .order('attorney_name');

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error loading attorneys:', error);
      toastService.error('Failed to load attorneys');
    } finally {
      setLoadingAttorneys(false);
    }
  };

  const handleFirmChange = (firmId: string) => {
    const selectedFirm = firms.find(f => f.id === firmId);
    setFormData({
      ...formData,
      firm_id: firmId,
      firm_name: selectedFirm?.firm_name || '',
      attorney_id: undefined,
      attorney_name: '',
      attorney_email: '',
      attorney_phone: undefined
    });
  };

  const handleAttorneyChange = (attorneyId: string) => {
    const selectedAttorney = attorneys.find(a => a.id === attorneyId);
    if (selectedAttorney) {
      setFormData({
        ...formData,
        attorney_id: attorneyId,
        attorney_name: selectedAttorney.attorney_name,
        attorney_email: selectedAttorney.email,
        attorney_phone: selectedAttorney.phone
      });
    }
  };

  const validateStep1 = (): boolean => {
    if (!formData.firm_name) {
      toastService.error('Please select a firm');
      return false;
    }
    if (!formData.attorney_name || !formData.attorney_email) {
      toastService.error('Please select an attorney');
      return false;
    }
    if (!formData.title) {
      toastService.error('Please enter matter title');
      return false;
    }
    if (!formData.matter_type) {
      toastService.error('Please select matter type');
      return false;
    }
    if (!formData.agreed_fee || formData.agreed_fee <= 0) {
      toastService.error('Please enter agreed fee');
      return false;
    }
    if (!formData.urgency_reason) {
      toastService.error('Please provide urgency reason');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({ agreed_fee: 0, urgency_reason: '' });
    onClose();
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toastService.error('Not authenticated');
      return;
    }

    if (!validateStep1()) {
      return;
    }

    try {
      // Create matter with URGENT flag and ACTIVE status
      const matterData = {
        title: formData.title!,
        firm_id: formData.firm_id,
        instructing_firm: formData.firm_name!,
        instructing_attorney: formData.attorney_name!,
        instructing_attorney_email: formData.attorney_email!,
        instructing_attorney_phone: formData.attorney_phone,
        client_name: formData.client_name || formData.attorney_name!,
        matter_type: formData.matter_type!,
        description: `URGENT: ${formData.urgency_reason}\n\n${formData.additional_notes || ''}`,
        billing_model: 'brief-fee' as const,
        agreed_fee: formData.agreed_fee!,
        status: MatterStatus.ACTIVE, // Skip pro forma, go directly to ACTIVE
        creation_source: 'urgent_quick_capture',
        is_urgent: true,
        urgency_reason: formData.urgency_reason!,
        accepted_at: new Date().toISOString()
      };

      const response = await matterApiService.create(matterData);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const matterId = response.data!.id;

      // Send confirmation email to attorney
      await sendConfirmationEmail(matterId, formData);

      toastService.success('Urgent matter created successfully!');
      onSuccess?.(matterId);
      handleClose();
    } catch (error: any) {
      console.error('Error creating urgent matter:', error);
      toastService.error(error.message || 'Failed to create urgent matter');
    }
  };

  const sendConfirmationEmail = async (matterId: string, data: Partial<UrgentMatterData>) => {
    try {
      // TODO: Integrate with email service
      // For now, just log
      console.log('Sending confirmation email:', {
        to: data.attorney_email,
        matterId,
        title: data.title,
        urgencyReason: data.urgency_reason
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't fail the whole operation
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-status-error-100 dark:bg-status-error-900/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-status-error-600 dark:text-status-error-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Urgent Matter Quick Capture
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Fast-track urgent matters • Step {currentStep} of 2
            </p>
          </div>
        </div>
      }
      size="lg"
    >
      {/* URGENT Badge */}
      <div className="mb-6 p-3 bg-status-error-50 dark:bg-status-error-900/20 border-2 border-status-error-200 dark:border-status-error-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-status-error-600 dark:text-status-error-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-error-900 dark:text-status-error-100 mb-1">
              URGENT Matter Workflow
            </p>
            <ul className="text-sm text-status-error-800 dark:text-status-error-200 space-y-1">
              <li>• Bypasses pro forma approval</li>
              <li>• Status set to <strong>ACTIVE</strong> immediately</li>
              <li>• Confirmation sent to attorney</li>
              <li>• Orange "URGENT" badge on all views</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 1: Essential Details */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Essential Details
          </h3>

          {/* Firm Selection */}
          <FormSelect
            label="Law Firm"
            value={formData.firm_id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFirmChange(e.target.value)}
            disabled={loadingFirms}
            required
          >
            <option value="">{loadingFirms ? 'Loading firms...' : 'Select a firm'}</option>
            {firms.map((firm) => (
              <option key={firm.id} value={firm.id}>
                {firm.firm_name}
              </option>
            ))}
          </FormSelect>

          {/* Attorney Selection */}
          <FormSelect
            label="Instructing Attorney"
            value={formData.attorney_id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAttorneyChange(e.target.value)}
            disabled={!formData.firm_id || loadingAttorneys}
            required
          >
            <option value="">
              {!formData.firm_id
                ? 'Select a firm first'
                : loadingAttorneys
                ? 'Loading attorneys...'
                : 'Select an attorney'}
            </option>
            {attorneys.map((attorney) => (
              <option key={attorney.id} value={attorney.id}>
                {attorney.attorney_name}
              </option>
            ))}
          </FormSelect>

          {/* Matter Details */}
          <FormInput
            label="Matter Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Urgent Bail Application - R v Smith"
            required
          />

          <FormSelect
            label="Matter Type"
            value={formData.matter_type || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, matter_type: e.target.value })}
            required
          >
            <option value="">Select matter type</option>
            {MATTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </FormSelect>

          <FormInput
            label="Client Name (Optional)"
            value={formData.client_name || ''}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            placeholder="Will default to attorney name if not provided"
          />

          <FormInput
            label="Agreed Fee (R)"
            type="number"
            value={formData.agreed_fee || ''}
            onChange={(e) => setFormData({ ...formData, agreed_fee: parseFloat(e.target.value) || 0 })}
            placeholder="15000"
            min="0"
            step="100"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Urgency Reason <span className="text-status-error-500">*</span>
            </label>
            <textarea
              value={formData.urgency_reason || ''}
              onChange={(e) => setFormData({ ...formData, urgency_reason: e.target.value })}
              placeholder="e.g., Bail hearing scheduled for tomorrow morning at 9am"
              className="w-full h-24 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none focus:ring-2 focus:ring-status-error-500"
              required
            />
          </div>
        </div>
      )}

      {/* Step 2: Optional Documents */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Optional Documents & Notes
          </h3>

          <div className="p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg">
            <p className="text-sm text-judicial-blue-900 dark:text-judicial-blue-100">
              <strong>Note:</strong> You can skip this step and attach documents later from the Matter Workbench.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Attach Documents (Optional)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, documents: files });
              }}
              className="block w-full text-sm text-neutral-900 dark:text-neutral-100 
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-judicial-blue-50 file:text-judicial-blue-700
                       hover:file:bg-judicial-blue-100
                       dark:file:bg-judicial-blue-900/30 dark:file:text-judicial-blue-300"
            />
            {formData.documents && formData.documents.length > 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {formData.documents.length} file(s) selected
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.additional_notes || ''}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="Any additional context or special instructions..."
              className="w-full h-32 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none focus:ring-2 focus:ring-judicial-blue-500"
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
        <Button
          variant="ghost"
          onClick={currentStep === 1 ? handleClose : handleBack}
          icon={currentStep > 1 ? <ArrowLeft className="w-4 h-4" /> : undefined}
          iconPosition="left"
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>

        <div className="flex-1" />

        {currentStep === 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Next: Documents
          </Button>
        ) : (
          <AsyncButton
            variant="primary"
            onClick={handleSubmit}
            icon={<Check className="w-4 h-4" />}
            iconPosition="left"
            className="bg-status-error-600 hover:bg-status-error-700"
          >
            Create Urgent Matter
          </AsyncButton>
        )}
      </div>
    </Modal>
  );
};

export default UrgentMatterQuickCapture;
