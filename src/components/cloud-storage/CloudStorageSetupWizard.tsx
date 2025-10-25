/**
 * CloudStorageSetupWizard Component
 * 3-step wizard for setting up cloud storage providers
 * Reuses existing MultiStepForm and StepIndicator components
 */
import React, { useState } from 'react';
import { Cloud, CheckCircle } from 'lucide-react';
import { MultiStepForm, Step } from '../common/MultiStepForm';
import { CloudStorageService } from '../../services/api/cloud-storage.service';
import type { CloudStorageProvider } from '../../types/cloud-storage.types';
import { ProviderSelectionStep } from './ProviderSelectionStep';
import { ConnectionVerificationStep } from './ConnectionVerificationStep';
import { Button } from '../design-system/components';

interface CloudStorageSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface WizardData {
  selectedProvider?: CloudStorageProvider;
  isConnecting?: boolean;
  connectionSuccess?: boolean;
  connectionError?: string;
}

const WIZARD_STEPS: Step[] = [
  {
    id: 'provider-selection',
    title: 'Select Provider',
    description: 'Choose your cloud storage',
    icon: Cloud,
    fields: ['selectedProvider']
  },
  {
    id: 'connection-verification',
    title: 'Verify Connection',
    description: 'Test and confirm',
    icon: CheckCircle,
    fields: []
  }
];

export const CloudStorageSetupWizard: React.FC<CloudStorageSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [wizardData, setWizardData] = useState<WizardData>({});

  const handleInitiateConnection = (provider: CloudStorageProvider) => {
    setWizardData(prev => ({ ...prev, selectedProvider: provider, isConnecting: true }));
    // Initiate OAuth flow
    CloudStorageService.initiateOAuth(provider);
  };

  const handleComplete = () => {
    onComplete();
    setWizardData({});
    onClose();
  };

  const renderStepContent = (currentStep: Step, data: WizardData, updateData: (field: string, value: any) => void) => {
    switch (currentStep.id) {
      case 'provider-selection':
        return (
          <ProviderSelectionStep
            selectedProvider={data.selectedProvider}
            onSelectProvider={(provider: CloudStorageProvider) => updateData('selectedProvider', provider)}
            onInitiateConnection={handleInitiateConnection}
          />
        );

      case 'connection-verification':
        return (
          <ConnectionVerificationStep
            provider={data.selectedProvider}
            isConnecting={data.isConnecting}
            isSuccess={data.connectionSuccess}
            error={data.connectionError}
            onRetry={() => {
              if (data.selectedProvider) {
                handleInitiateConnection(data.selectedProvider);
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Connect Cloud Storage
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Link your cloud storage to access documents from LexoHub
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <MultiStepForm
            steps={WIZARD_STEPS}
            initialData={wizardData}
            onComplete={handleComplete}
            onCancel={onClose}
          >
            {renderStepContent}
          </MultiStepForm>
        </div>
      </div>
    </div>
  );
};
