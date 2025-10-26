/**
 * QuickBriefCaptureModal Component
 * Multi-step questionnaire for capturing matter details via phone call
 * Path B: "Accept & Work" workflow
 * OPTIMIZED: Matches MatterCreationModal design patterns for speed and consistency
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Phone, Check } from 'lucide-react';
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
import type { Firm } from '../../../types';

interface QuickBriefCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (matterId: string) => void;
  firms: Firm[];
}

const STEP_LABELS = [
  'Attorney',
  'Matter',
  'Work Type',
  'Practice Area',
  'Deadline',
  'Summary'
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Form data
  const [formData, setFormData] = useState<Partial<QuickBriefMatterData>>({});

  // Templates
  const [workTypeTemplates, setWorkTypeTemplates] = useState<TemplateItem[]>([]);
  const [practiceAreaTemplates, setPracticeAreaTemplates] = useState<TemplateItem[]>([]);
  const [issueTemplates, setIssueTemplates] = useState<TemplateItem[]>([]);

  // Load templates on mount
  useEffect(() => {
    if (isOpen && user?.id) {
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
      toastService.error('Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleAddCustomTemplate = async (category: 'work_type' | 'practice_area' | 'issue_template', value: string) => {
    if (!user?.id) return;

    const response = await quickBriefTemplateService.upsertTemplate(user.id, category, value);
    if (response.error) {
      throw new Error(response.error.message);
    }

    // Reload templates
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
    // Validation for current step
    if (currentStep === 1 && (!formData.firm_id || !formData.attorney_name)) {
      toast.error('Please select a firm and enter attorney name');
      return;
    }
    if (currentStep === 2 && !formData.title) {
      toast.error('Please enter a matter title');
      return;
    }
    if (currentStep === 3 && !formData.work_type) {
      toast.error('Please select a work type');
      return;
    }
    if (currentStep === 4 && !formData.practice_area) {
      toast.error('Please select a practice area');
      return;
    }
    if (currentStep === 5 && (!formData.urgency_level || !formData.deadline_date)) {
      toast.error('Please select urgency and deadline');
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user?.id || !formData.firm_id) {
      toast.error('Missing required information');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update template usage
      const templateUpdates = [];
      if (formData.work_type) templateUpdates.push({ category: 'work_type' as const, value: formData.work_type });
      if (formData.practice_area) templateUpdates.push({ category: 'practice_area' as const, value: formData.practice_area });
      if (formData.issue_template) templateUpdates.push({ category: 'issue_template' as const, value: formData.issue_template });

      if (templateUpdates.length > 0) {
        await quickBriefTemplateService.batchUpdateUsage(user.id, templateUpdates);
      }

      // Create matter
      const matterData = {
        advocate_id: user.id,
        firm_id: formData.firm_id,
        title: formData.title!,
        matter_type: formData.work_type!,
        practice_area: formData.practice_area,
        description: formData.brief_summary || formData.issue_template || '',
        deadline: formData.deadline_date!,
        status: 'active' as const,
        creation_source: 'quick_brief',
        is_quick_create: true,
        urgency: formData.urgency_level
      };

      const response = await matterApiService.create(matterData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Matter created successfully!');
      onSuccess?.(response.data!.id);
      onClose();
    } catch (error) {
      console.error('Failed to create matter:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create matter');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedFirm = firms.find(f => f.id === formData.firm_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Quick Brief Capture
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Capture matter details during phone call
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="p-6 bg-neutral-50 dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={6}
            stepLabels={STEP_LABELS}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-judicial-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Step 1: Attorney & Firm */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Attorney & Firm Details
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Select the attorney firm and enter contact details
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Attorney Firm <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.firm_id || ''}
                      onChange={(e) => {
                        const firm = firms.find(f => f.id === e.target.value);
                        setFormData({
                          ...formData,
                          firm_id: e.target.value,
                          firm_name: firm?.name || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="">Select a firm...</option>
                      {firms.map(firm => (
                        <option key={firm.id} value={firm.id}>{firm.name}</option>
                      ))}
                    </select>
                  </div>

                  <FormInput
                    label="Attorney Name"
                    value={formData.attorney_name || ''}
                    onChange={(e) => setFormData({ ...formData, attorney_name: e.target.value })}
                    placeholder="John Smith"
                    required
                  />

                  <FormInput
                    label="Attorney Email"
                    type="email"
                    value={formData.attorney_email || ''}
                    onChange={(e) => setFormData({ ...formData, attorney_email: e.target.value })}
                    placeholder="john@firm.com"
                    required
                  />

                  <FormInput
                    label="Attorney Phone (Optional)"
                    type="tel"
                    value={formData.attorney_phone || ''}
                    onChange={(e) => setFormData({ ...formData, attorney_phone: e.target.value })}
                    placeholder="+27 11 123 4567"
                  />
                </div>
              )}

              {/* Step 2: Matter Title */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Matter Title
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Enter a descriptive title for this matter
                    </p>
                  </div>

                  <FormInput
                    label="Matter Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Contract Dispute - ABC Corp"
                    required
                  />

                  {selectedFirm && (
                    <div className="p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg border border-judicial-blue-200 dark:border-judicial-blue-800">
                      <p className="text-sm text-judicial-blue-900 dark:text-judicial-blue-100">
                        <strong>Firm:</strong> {selectedFirm.name}
                      </p>
                      <p className="text-sm text-judicial-blue-900 dark:text-judicial-blue-100 mt-1">
                        <strong>Attorney:</strong> {formData.attorney_name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Work Type */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Type of Work
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      What type of legal work is required?
                    </p>
                  </div>

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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Practice Area
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Which practice area does this matter fall under?
                    </p>
                  </div>

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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Urgency & Deadline
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      When does this work need to be completed?
                    </p>
                  </div>

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
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-judicial-blue-600 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 text-judicial-blue-900 dark:text-judicial-blue-100'
                              : 'border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 hover:border-judicial-blue-400'
                          }`}
                        >
                          <div className="text-sm font-medium">{preset.label}</div>
                        </button>
                      );
                    })}
                  </div>

                  <FormInput
                    label="Deadline Date"
                    type="date"
                    value={formData.deadline_date || ''}
                    onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              )}

              {/* Step 6: Brief Summary */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Brief Summary
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Provide a brief description of the matter (optional)
                    </p>
                  </div>

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
                      allowCustom={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.brief_summary || ''}
                      onChange={(e) => setFormData({ ...formData, brief_summary: e.target.value })}
                      placeholder="Add any additional details about the matter..."
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none"
                    />
                  </div>

                  {/* Summary Preview */}
                  <div className="p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 rounded-lg border border-mpondo-gold-200 dark:border-mpondo-gold-800">
                    <h4 className="text-sm font-semibold text-mpondo-gold-900 dark:text-mpondo-gold-100 mb-3">
                      Matter Summary
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Firm:</dt>
                        <dd className="font-medium text-neutral-900 dark:text-neutral-100">{formData.firm_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Attorney:</dt>
                        <dd className="font-medium text-neutral-900 dark:text-neutral-100">{formData.attorney_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Matter:</dt>
                        <dd className="font-medium text-neutral-900 dark:text-neutral-100">{formData.title}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Type:</dt>
                        <dd className="font-medium text-neutral-900 dark:text-neutral-100">{formData.work_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Practice Area:</dt>
                        <dd className="font-medium text-neutral-900 dark:text-neutral-100">{formData.practice_area}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Deadline:</dt>
                        <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                          {formData.deadline_date ? new Date(formData.deadline_date).toLocaleDateString() : 'Not set'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-800">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep < 6 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isLoadingTemplates}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Matter'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBriefCaptureModal;
