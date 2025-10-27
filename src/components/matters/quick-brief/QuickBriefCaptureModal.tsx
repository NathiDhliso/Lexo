/**
 * QuickBriefCaptureModal Component - OPTIMIZED
 * Fast, clean multi-step form matching MatterCreationModal design
 * Path B: "Accept & Work" workflow
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Phone } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { AsyncButton } from '../../ui/AsyncButton';
import { FormInput } from '../../ui/FormInput';
import { AnswerButtonGrid } from './AnswerButtonGrid';
import { quickBriefTemplateService } from '../../../services/api/quick-brief-template.service';
import { matterApiService } from '../../../services/api/matter-api.service';
import { useAuth } from '../../../hooks/useAuth';
import { toastService } from '../../../services/toast.service';
import type { QuickBriefMatterData, TemplateItem, UrgencyLevel } from '../../../types/quick-brief.types';
import { type Firm, MatterStatus, MatterCreationSource } from '../../../types';

interface QuickBriefCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (matterId: string) => void;
  firms: Firm[];
}

const URGENCY_PRESETS: { value: UrgencyLevel; label: string; days: number }[] = [
  { value: 'same_day', label: 'Same Day', days: 0 },
  { value: '1-2_days', label: '1-2 Days', days: 2 },
  { value: 'within_week', label: 'Within a Week', days: 7 },
  { value: 'within_2_weeks', label: 'Within 2 Weeks', days: 14 },
  { value: 'within_month', label: 'Within a Month', days: 30 },
  { value: 'custom', label: 'Custom Date', days: 0 }
];

export const QuickBriefCaptureModal: React.FC<QuickBriefCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  firms
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [formData, setFormData] = useState<Partial<QuickBriefMatterData>>({});
  
  // Templates
  const [workTypeTemplates, setWorkTypeTemplates] = useState<TemplateItem[]>([]);
  const [practiceAreaTemplates, setPracticeAreaTemplates] = useState<TemplateItem[]>([]);
  const [issueTemplates, setIssueTemplates] = useState<TemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Load templates once when modal opens
  useEffect(() => {
    if (isOpen && user?.id && workTypeTemplates.length === 0) {
      loadTemplates();
    }
  }, [isOpen, user?.id]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({});
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    if (!user?.id) return;

    setIsLoadingTemplates(true);
    try {
      const [workTypes, practiceAreas, issues] = await Promise.all([
        quickBriefTemplateService.getTemplatesByCategory(user.id, 'work_type'),
        quickBriefTemplateService.getTemplatesByCategory(user.id, 'practice_area'),
        quickBriefTemplateService.getTemplatesByCategory(user.id, 'issue_template')
      ]);

      if (workTypes.data) setWorkTypeTemplates(workTypes.data);
      if (practiceAreas.data) setPracticeAreaTemplates(practiceAreas.data);
      if (issues.data) setIssueTemplates(issues.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleAddCustomTemplate = async (category: 'work_type' | 'practice_area' | 'issue_template', value: string) => {
    if (!user?.id) return;
    const response = await quickBriefTemplateService.upsertTemplate(user.id, category, value);
    if (response.error) throw new Error(response.error.message);
    await loadTemplates();
  };

  const calculateDeadline = (urgency: UrgencyLevel): string => {
    const preset = URGENCY_PRESETS.find(p => p.value === urgency);
    if (!preset || urgency === 'custom') {
      return new Date().toISOString().split('T')[0];
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + preset.days);
    return deadline.toISOString().split('T')[0];
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setFormData({});
    }, 300);
  };

  const handleSubmit = async () => {
    if (!user?.id || !formData.firm_id) {
      throw new Error('Missing required information');
    }

    // Update template usage
    const templateUpdates: { category: 'work_type' | 'practice_area' | 'issue_template'; value: string }[] = [];
    if (formData.work_type) templateUpdates.push({ category: 'work_type' as const, value: formData.work_type });
    if (formData.practice_area) templateUpdates.push({ category: 'practice_area' as const, value: formData.practice_area });
    if (formData.issue_template) templateUpdates.push({ category: 'issue_template' as const, value: formData.issue_template });

    if (templateUpdates.length > 0) {
      await quickBriefTemplateService.batchUpdateUsage(user.id, templateUpdates);
    }

    // Map urgency level to database enum
    const urgencyMap: Record<string, 'routine' | 'standard' | 'urgent' | 'emergency'> = {
      'same_day': 'emergency',
      '1-2_days': 'urgent',
      'within_week': 'urgent',
      'within_2_weeks': 'standard',
      'within_month': 'routine',
      'custom': 'standard'
    };

    // Create matter
    const matterData = {
      advocate_id: user.id,
      firm_id: formData.firm_id,
      title: formData.title!,
      matter_type: formData.work_type!,
      practice_area: formData.practice_area,
      description: formData.brief_summary || formData.issue_template || '',
      deadline: formData.deadline_date!,
      status: MatterStatus.ACTIVE,
      creation_source: MatterCreationSource.QUICK_CREATE,
      is_quick_create: true,
      urgency: formData.urgency_level ? urgencyMap[formData.urgency_level] : undefined
    };

    const response = await matterApiService.create(matterData);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    toastService.success('Matter created successfully!');
    onSuccess?.(response.data!.id);
    handleClose();
  };

  const selectedFirm = firms.find(f => f.id === formData.firm_id);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
            <Phone className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400" />
          </div>
          <div>
            <div className="text-xl font-bold">Quick Brief Capture</div>
            <div className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
              Capture matter details during phone call
            </div>
          </div>
        </div>
      }
      size="lg"
    >
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                step < currentStep
                  ? 'bg-status-success-600 text-white'
                  : step === currentStep
                  ? 'bg-judicial-blue-600 text-white'
                  : 'bg-neutral-200 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-1 ${
                  step < currentStep
                    ? 'bg-status-success-600'
                    : 'bg-neutral-200 dark:bg-metallic-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {isLoadingTemplates ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-judicial-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Attorney & Firm */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Attorney & Firm Details</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Attorney Firm <span className="text-status-error-600">*</span>
                </label>
                <select
                  value={formData.firm_id || ''}
                  onChange={(e) => {
                    const firm = firms.find(f => f.id === e.target.value);
                    setFormData({ ...formData, firm_id: e.target.value, firm_name: firm?.name || '' });
                  }}
                  className="w-full px-3 py-2.5 min-h-[44px] border rounded-lg bg-white dark:bg-metallic-gray-900"
                >
                  <option value="">Select a firm...</option>
                  {firms.map(firm => (
                    <option key={firm.id} value={firm.id}>{firm.name}</option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Attorney Name"
                required
                value={formData.attorney_name || ''}
                onChange={(e) => setFormData({ ...formData, attorney_name: e.target.value })}
                placeholder="John Smith"
              />
              <FormInput
                label="Attorney Email"
                type="email"
                required
                value={formData.attorney_email || ''}
                onChange={(e) => setFormData({ ...formData, attorney_email: e.target.value })}
                placeholder="john@firm.com"
              />
            </div>
          )}

          {/* Step 2: Matter Title */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Matter Title</h3>
              <FormInput
                label="Matter Title"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Contract Dispute - ABC Corp"
              />
              {selectedFirm && (
                <div className="p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg">
                  <p className="text-sm"><strong>Firm:</strong> {selectedFirm.name}</p>
                  <p className="text-sm mt-1"><strong>Attorney:</strong> {formData.attorney_name}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Work Type */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Type of Work</h3>
              <AnswerButtonGrid
                options={workTypeTemplates}
                selectedValue={formData.work_type}
                onSelect={(value) => setFormData({ ...formData, work_type: value })}
                onAddCustom={(value) => handleAddCustomTemplate('work_type', value)}
                maxColumns={3}
              />
            </div>
          )}

          {/* Step 4: Practice Area */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Practice Area</h3>
              <AnswerButtonGrid
                options={practiceAreaTemplates}
                selectedValue={formData.practice_area}
                onSelect={(value) => setFormData({ ...formData, practice_area: value })}
                onAddCustom={(value) => handleAddCustomTemplate('practice_area', value)}
                maxColumns={3}
              />
            </div>
          )}

          {/* Step 5: Urgency & Deadline */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Urgency & Deadline</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {URGENCY_PRESETS.map((preset) => {
                  const isSelected = formData.urgency_level === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          urgency_level: preset.value,
                          deadline_date: calculateDeadline(preset.value)
                        });
                      }}
                      className={`px-4 py-3 rounded-lg border-2 transition-all min-h-[44px] ${
                        isSelected
                          ? 'border-judicial-blue-600 bg-judicial-blue-50 dark:bg-judicial-blue-900/20'
                          : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-judicial-blue-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <FormInput
                label="Deadline Date"
                type="date"
                required
                value={formData.deadline_date || ''}
                onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Step 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Brief Summary</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Common Issues (Optional)
                </label>
                <AnswerButtonGrid
                  options={issueTemplates}
                  selectedValue={formData.issue_template}
                  onSelect={(value) => setFormData({ ...formData, issue_template: value })}
                  onAddCustom={(value) => handleAddCustomTemplate('issue_template', value)}
                  maxColumns={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.brief_summary || ''}
                  onChange={(e) => setFormData({ ...formData, brief_summary: e.target.value })}
                  placeholder="Add any additional details..."
                  rows={4}
                  className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
                />
              </div>
              {/* Summary Preview */}
              <div className="p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Matter Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Firm:</dt>
                    <dd className="font-medium">{formData.firm_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Matter:</dt>
                    <dd className="font-medium">{formData.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Type:</dt>
                    <dd className="font-medium">{formData.work_type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Practice Area:</dt>
                    <dd className="font-medium">{formData.practice_area}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Deadline:</dt>
                    <dd className="font-medium">
                      {formData.deadline_date ? new Date(formData.deadline_date).toLocaleDateString() : 'Not set'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={currentStep === 1 ? handleClose : handleBack}
              icon={currentStep > 1 ? <ChevronLeft className="w-4 h-4" /> : undefined}
              iconPosition="left"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Next
              </Button>
            ) : (
              <AsyncButton
                type="button"
                variant="primary"
                onAsyncClick={handleSubmit}
                successMessage="Matter created"
                errorMessage="Failed to create matter"
              >
                Create Matter
              </AsyncButton>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QuickBriefCaptureModal;
