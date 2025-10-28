/**
 * QuickBriefCaptureModal Component - OVERHAULED
 * Streamlined voice-enabled matter capture with attorney selection
 * Uses AttorneySelectionField and MatterDescriptionModal
 */

import React, { useState } from 'react';
import { Phone, Check } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { AsyncButton } from '../../ui/AsyncButton';
import { FormInput } from '../../ui/FormInput';
import { AttorneySelectionField } from '../../attorneys/AttorneySelectionField';
import { MatterDescriptionModal } from '../MatterDescriptionModal';
import { matterApiService } from '../../../services/api/matter-api.service';
import { useAuth } from '../../../hooks/useAuth';
import { toastService } from '../../../services/toast.service';
import { MatterStatus, MatterCreationSource } from '../../../types';

interface QuickBriefCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (matterId: string) => void;
}

export const QuickBriefCaptureModal: React.FC<QuickBriefCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedAttorney, setSelectedAttorney] = useState<{
    id: string;
    attorney_name: string;
    email: string;
    firm_id: string;
    firm_name?: string;
  } | null>(null);
  const [matterTitle, setMatterTitle] = useState('');
  const [matterDescription, setMatterDescription] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedAttorney(null);
      setMatterTitle('');
      setMatterDescription('');
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedAttorney(null);
      setMatterTitle('');
      setMatterDescription('');
    }, 300);
  };

  const handleAttorneySelect = (attorney: {
    id: string;
    attorney_name: string;
    email: string;
    firm_id: string;
    firm_name?: string;
  } | null) => {
    setSelectedAttorney(attorney);
  };

  const handleNextFromStep1 = () => {
    if (!selectedAttorney) {
      toastService.error('Please select an attorney');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!matterTitle.trim()) {
      toastService.error('Please enter a matter title');
      return;
    }
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleDescriptionSave = (description: string) => {
    setMatterDescription(description);
    setShowDescriptionModal(false);
    toastService.success('Matter description captured');
  };

  const handleSubmit = async () => {
    if (!user?.id || !selectedAttorney) {
      throw new Error('Missing required information');
    }

    // Create matter
    const matterData = {
      advocate_id: user.id,
      firm_id: selectedAttorney.firm_id,
      attorney_id: selectedAttorney.id,
      title: matterTitle,
      description: matterDescription || 'Quick Brief Capture',
      status: MatterStatus.ACTIVE,
      creation_source: MatterCreationSource.QUICK_CREATE,
      is_quick_create: true,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    const response = await matterApiService.create(matterData);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    toastService.success('Matter created successfully!');
    onSuccess?.(response.data!.id);
    handleClose();
  };

  return (
    <>
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
          {[1, 2, 3].map((step) => (
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
              {step < 3 && (
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

        <div className="space-y-6">
          {/* Step 1: Attorney Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Select Attorney</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Choose the attorney requesting this brief
                </p>
              </div>
              <AttorneySelectionField
                value={selectedAttorney}
                onChange={handleAttorneySelect}
                required
              />
            </div>
          )}

          {/* Step 2: Matter Title */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Matter Title</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Enter a brief, descriptive title for this matter
                </p>
              </div>
              <FormInput
                label="Matter Title"
                required
                value={matterTitle}
                onChange={(e) => setMatterTitle(e.target.value)}
                placeholder="e.g., Contract Dispute - ABC Corp v. XYZ Ltd"
              />
              {selectedAttorney && (
                <div className="p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg">
                  <p className="text-sm"><strong>Attorney:</strong> {selectedAttorney.attorney_name}</p>
                  <p className="text-sm mt-1"><strong>Firm:</strong> {selectedAttorney.firm_name}</p>
                  <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">{selectedAttorney.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Matter Description */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Matter Description</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Use voice recording or type manually to capture matter details
                </p>
              </div>

              {/* Voice Recording Button */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setShowDescriptionModal(true)}
                  className="w-full"
                  icon={<Phone className="w-4 h-4" />}
                >
                  {matterDescription ? 'Re-record Description' : 'Record Matter Description'}
                </Button>

                {/* Manual Entry */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Or type manually (optional)
                  </label>
                  <textarea
                    value={matterDescription}
                    onChange={(e) => setMatterDescription(e.target.value)}
                    placeholder="Type matter description here..."
                    rows={6}
                    className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900 focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {matterDescription.length} characters
                  </p>
                </div>
              </div>

              {/* Summary Preview */}
              <div className="p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 rounded-lg border border-mpondo-gold-200 dark:border-mpondo-gold-800">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success-600" />
                  Ready to Create
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Attorney:</dt>
                    <dd className="font-medium">{selectedAttorney?.attorney_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Firm:</dt>
                    <dd className="font-medium">{selectedAttorney?.firm_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Matter:</dt>
                    <dd className="font-medium">{matterTitle}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Description:</dt>
                    <dd className="font-medium">
                      {matterDescription ? `${matterDescription.substring(0, 50)}${matterDescription.length > 50 ? '...' : ''}` : 'Not provided'}
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
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep === 1 && (
              <Button
                type="button"
                variant="primary"
                onClick={handleNextFromStep1}
              >
                Next
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                type="button"
                variant="primary"
                onClick={handleNextFromStep2}
              >
                Next
              </Button>
            )}

            {currentStep === 3 && (
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
      </Modal>

      {/* Matter Description Modal */}
      <MatterDescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        onSave={handleDescriptionSave}
        initialValue={matterDescription}
      />
    </>
  );
};

export default QuickBriefCaptureModal;
