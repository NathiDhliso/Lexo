/**
 * QuickBriefCaptureModal Component
 * Multi-step questionnaire for quickly capturing brief details
 * Integrates all step components with localStorage persistence
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  ProgressIndicator,
  FirmAttorneySelector,
  MatterTitleInput,
  WorkTypeSelector,
  PracticeAreaSelector,
  UrgencyDeadlineSelector,
  BriefSummaryEditor
} from './quick-brief';
import { matterApiService, quickBriefTemplateService } from '../../services/api';
import type { QuickBriefMatterData } from '../../types/quick-brief.types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface QuickBriefCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  advocateId: string;
}

const TOTAL_STEPS = 6;
const STEP_LABELS = [
  'Firm & Attorney',
  'Matter Title',
  'Work Type',
  'Practice Area',
  'Urgency',
  'Brief Summary'
];

const STORAGE_KEY = 'quick_brief_draft';
const STORAGE_EXPIRY_HOURS = 24;

export const QuickBriefCaptureModal: React.FC<QuickBriefCaptureModalProps> = ({
  isOpen,
  onClose,
  advocateId
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<QuickBriefMatterData>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      loadFromStorage();
    }
  }, [isOpen]);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (isDirty && isOpen) {
      const timeoutId = setTimeout(() => {
        saveToStorage();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty, isOpen]);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        const hoursAgo = (Date.now() - timestamp) / (1000 * 60 * 60);
        
        if (hoursAgo < STORAGE_EXPIRY_HOURS) {
          setFormData(data);
          setIsDirty(false);
          toast.success('Restored your previous draft', { duration: 2000 });
        } else {
          // Expired, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const saveToStorage = () => {
    try {
      const toSave = {
        data: formData,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDataChange = useCallback((updates: Partial<QuickBriefMatterData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Firm & Attorney
        if (!formData.firm_name || !formData.attorney_name || !formData.attorney_email) {
          toast.error('Please complete all required fields');
          return false;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.attorney_email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;

      case 2: // Matter Title
        if (!formData.title || formData.title.trim().length === 0) {
          toast.error('Please enter a matter title');
          return false;
        }
        return true;

      case 3: // Work Type
        if (!formData.work_type) {
          toast.error('Please select a work type');
          return false;
        }
        return true;

      case 4: // Practice Area
        if (!formData.practice_area) {
          toast.error('Please select a practice area');
          return false;
        }
        return true;

      case 5: // Urgency & Deadline
        if (!formData.urgency_level || !formData.deadline_date) {
          toast.error('Please select urgency and deadline');
          return false;
        }
        return true;

      case 6: // Brief Summary (optional but warn if empty)
        return true; // Summary is optional

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Final validation
    if (!formData.firm_name || !formData.attorney_name || !formData.attorney_email ||
        !formData.title || !formData.work_type || !formData.practice_area ||
        !formData.urgency_level || !formData.deadline_date) {
      toast.error('Please complete all required steps');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create matter
      const response = await matterApiService.createFromQuickBrief(
        {
          title: formData.title,
          firm_name: formData.firm_name,
          attorney_name: formData.attorney_name,
          attorney_email: formData.attorney_email,
          attorney_phone: formData.attorney_phone,
          work_type: formData.work_type,
          practice_area: formData.practice_area,
          urgency_level: formData.urgency_level,
          deadline_date: formData.deadline_date,
          brief_summary: formData.brief_summary,
          reference_links: formData.reference_links
        },
        advocateId,
        {
          trackTemplate: async (category, value) => {
            await quickBriefTemplateService.upsertTemplate(
              advocateId,
              category as any,
              value
            );
          }
        }
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Success!
      toast.success('Matter created successfully!');
      clearStorage();
      setIsDirty(false);
      onClose();

      // Navigate to Matter Workbench
      if (response.data?.id) {
        navigate(`/matters/${response.data.id}/workbench`);
      }
    } catch (error) {
      console.error('Error creating matter:', error);
      toast.error('Failed to create matter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setIsDirty(false);
    onClose();
    // Don't clear storage - allow resume later
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FirmAttorneySelector
            formData={formData}
            onChange={handleDataChange}
            advocateId={advocateId}
          />
        );
      case 2:
        return (
          <MatterTitleInput
            formData={formData}
            onChange={handleDataChange}
            advocateId={advocateId}
          />
        );
      case 3:
        return (
          <WorkTypeSelector
            formData={formData}
            onChange={handleDataChange}
            advocateId={advocateId}
          />
        );
      case 4:
        return (
          <PracticeAreaSelector
            formData={formData}
            onChange={handleDataChange}
            advocateId={advocateId}
          />
        );
      case 5:
        return (
          <UrgencyDeadlineSelector
            formData={formData}
            onChange={handleDataChange}
            advocateId={advocateId}
          />
        );
      case 6:
        return (
          <BriefSummaryEditor
            formData={formData}
            onChange={handleDataChange}
            advocateId={advocateId}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-3xl w-full my-8">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Quick Brief Capture
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Answer a few questions to create your matter
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                stepLabels={STEP_LABELS}
              />
            </div>

            {/* Step Content */}
            <div className="min-h-[400px] max-h-[50vh] overflow-y-auto pr-2">
              {renderCurrentStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStep < TOTAL_STEPS ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save & Accept Brief
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Auto-save indicator */}
            {isDirty && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
                💾 Auto-saving...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  You have unsaved changes. Your progress has been auto-saved and you can resume later. Are you sure you want to exit?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleCancelExit}
                    className="flex-1"
                  >
                    Continue Editing
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmExit}
                    className="flex-1"
                  >
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickBriefCaptureModal;
