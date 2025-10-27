/**
 * MatterCreationWizard Component
 * 4-step wizard for creating new matters with auto-save functionality
 * Reuses MultiStepForm and StepIndicator components
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Building2, Cloud, CheckCircle } from 'lucide-react';
import { MultiStepForm, Step } from '../common/MultiStepForm';
import { Input, Select, Textarea, Button } from '../design-system/components';
import { DocumentBrowser, CloudStorageEmptyState } from '../cloud-storage';
import { CloudStorageService } from '../../services/api/cloud-storage.service';
import { BillingModelSelector } from './BillingModelSelector';
import { TemplateQuickSelect } from '../templates/TemplateQuickSelect';
import { useBillingPreferences } from '../../hooks/useBillingPreferences';
import { useBillingDefaults } from '../../hooks/useBillingDefaults';
import { BillingModel } from '../../types/billing-strategy.types';
import { toast } from 'react-hot-toast';
import type { NewMatterForm } from '../../types';
import type { CloudFile } from '../cloud-storage/DocumentBrowser';
import type { BriefFeeTemplate } from '../../types';
import { MatterStatus } from '../../types';

interface MatterCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: NewMatterForm) => Promise<void>;
  initialData?: Partial<NewMatterForm>;
}

interface DraftData {
  formData: Partial<NewMatterForm>;
  lastSaved: Date;
}

const MATTER_TYPES = [
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

const CLIENT_TYPES = ['Individual', 'Business', 'Government', 'NGO'];

const FEE_TYPES = [
  'Hourly',
  'Fixed Fee',
  'Contingency',
  'Retainer',
  'Hybrid'
];

// Define wizard steps
const WIZARD_STEPS: Step[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Matter details & billing',
    icon: FileText,
    fields: ['title', 'matter_type', 'description', 'billing_model', 'agreed_fee', 'hourly_rate']
  },
  {
    id: 'firm-attorney',
    title: 'Firm & Attorney',
    description: 'Assign firm and attorney',
    icon: Building2,
    fields: ['instructing_firm', 'instructing_attorney', 'client_name', 'client_email', 'client_type']
  },
  {
    id: 'cloud-docs',
    title: 'Cloud Documents',
    description: 'Link documents (optional)',
    icon: Cloud,
    fields: [] // Optional step
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Confirm details',
    icon: CheckCircle,
    fields: []
  }
];

const DRAFT_STORAGE_KEY = 'matter_creation_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const MatterCreationWizard: React.FC<MatterCreationWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData = {}
}) => {
  const { preferences } = useBillingPreferences();
  const { getMatterDefaults } = useBillingDefaults();
  
  const [formData, setFormData] = useState<Partial<NewMatterForm>>(() => {
    // Initialize with basic defaults first
    return {
      billing_model: BillingModel.BRIEF_FEE,
      ...initialData
    };
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Apply preference-based defaults when they're loaded
  useEffect(() => {
    if (preferences && !initialData.billing_model) {
      const defaults = getMatterDefaults();
      setFormData(prev => ({
        ...prev,
        // Only override if not already set by user or initialData
        billing_model: prev.billing_model || defaults.billing_model || BillingModel.BRIEF_FEE,
        hourly_rate: prev.hourly_rate || defaults.hourly_rate,
        fee_cap: prev.fee_cap || defaults.fee_cap,
      }));
    }
  }, [preferences, getMatterDefaults, initialData.billing_model]);
  const [isSaving, setIsSaving] = useState(false);
  const [linkedDocuments, setLinkedDocuments] = useState<CloudFile[]>([]);
  const [cloudConnection, setCloudConnection] = useState<{id: string; provider: string} | null>(null);

  // Check for cloud storage connection
  useEffect(() => {
    const checkCloudConnection = async () => {
      try {
        const connections = await CloudStorageService.getConnections();
        if (connections && connections.length > 0) {
          setCloudConnection({
            id: connections[0].id,
            provider: connections[0].provider
          });
        }
      } catch (error) {
        console.error('Failed to check cloud connections:', error);
      }
    };
    
    if (isOpen) {
      checkCloudConnection();
    }
  }, [isOpen]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft && !initialData.title) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setLastSaved(new Date(draft.lastSaved));
        toast.success('Draft restored');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [initialData.title]);

  // Auto-save to localStorage
  const saveDraft = useCallback(() => {
    if (!formData.title && Object.keys(formData).length === 0) return;

    const draft: DraftData = {
      formData,
      lastSaved: new Date()
    };
    
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setLastSaved(draft.lastSaved);
  }, [formData]);

  // Auto-save interval
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      saveDraft();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [isOpen, saveDraft]);

  const handleSaveDraft = () => {
    setIsSaving(true);
    saveDraft();
    toast.success('Draft saved successfully');
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleComplete = async (data: any) => {
    const matterData: NewMatterForm = {
      ...data,
      status: MatterStatus.ACTIVE,
      linked_documents: linkedDocuments.map(doc => doc.id)
    };

    try {
      await onComplete(matterData);
      // Clear draft after successful creation
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastSaved(null);
      onClose();
    } catch (error) {
      console.error('Failed to create matter:', error);
      toast.error('Failed to create matter. Please try again.');
    }
  };

  const renderStepContent = (currentStep: Step, data: any, updateData: (field: string, value: any) => void) => {
    switch (currentStep.id) {
      case 'basic-info':
        return (
          <div className="space-y-4">
            {/* Template Selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Use a Template (Optional)
              </label>
              <TemplateQuickSelect
                caseType={data.matter_type}
                onSelectTemplate={(template: BriefFeeTemplate) => {
                  // Auto-fill form with template data
                  updateData('agreed_fee', template.base_fee);
                  updateData('hourly_rate', template.hourly_rate);
                  updateData('estimated_hours', template.estimated_hours);
                  updateData('template_id', template.id);
                  
                  // Update description if empty
                  if (!data.description && template.description) {
                    updateData('description', template.description);
                  }
                  
                  toast.success(`Template "${template.template_name}" applied`);
                }}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Select a template to auto-fill fee details and services
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Matter Title *
              </label>
              <Input
                value={data.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('title', e.target.value)}
                placeholder="e.g., Smith v. Jones Commercial Dispute"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Matter Type *
              </label>
              <Select
                value={data.matter_type || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateData('matter_type', e.target.value)}
                required
              >
                <option value="">Select matter type...</option>
                {MATTER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Description *
              </label>
              <Textarea
                value={data.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateData('description', e.target.value)}
                placeholder="Brief description of the matter..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Billing Model *
              </label>
              <BillingModelSelector
                value={data.billing_model || BillingModel.BRIEF_FEE}
                onChange={(model) => updateData('billing_model', model)}
                defaultModel={getMatterDefaults().billing_model}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Choose how you'll bill for this matter. This affects time tracking and invoicing options.
              </p>
            </div>

            {/* Show additional fields based on billing model */}
            {data.billing_model === BillingModel.BRIEF_FEE && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Agreed Brief Fee (R) *
                </label>
                <Input
                  type="number"
                  value={data.agreed_fee || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('agreed_fee', parseFloat(e.target.value))}
                  placeholder="15000.00"
                  min="0"
                  step="100"
                  required
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  The fixed fee agreed with the instructing attorney
                </p>
              </div>
            )}

            {data.billing_model === BillingModel.TIME_BASED && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Hourly Rate (R) *
                </label>
                <Input
                  type="number"
                  value={data.hourly_rate || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('hourly_rate', parseFloat(e.target.value))}
                  placeholder="2500.00"
                  min="0"
                  step="50"
                  required
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Your hourly rate for this matter
                </p>
              </div>
            )}

            {data.billing_model === BillingModel.QUICK_OPINION && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Opinion Fee (R) *
                </label>
                <Input
                  type="number"
                  value={data.agreed_fee || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('agreed_fee', parseFloat(e.target.value))}
                  placeholder="3500.00"
                  min="0"
                  step="50"
                  required
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Fixed fee for the legal opinion or consultation
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Fee Type
              </label>
              <Select
                value={data.fee_type || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateData('fee_type', e.target.value)}
              >
                <option value="">Select fee type...</option>
                {FEE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            {data.fee_type && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Estimated Fee (R)
                </label>
                <Input
                  type="number"
                  value={data.estimated_fee || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('estimated_fee', parseFloat(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
        );

      case 'firm-attorney':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Instructing Firm *
              </label>
              <Input
                value={data.instructing_firm || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('instructing_firm', e.target.value)}
                placeholder="Law firm name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Instructing Attorney *
              </label>
              <Input
                value={data.instructing_attorney || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('instructing_attorney', e.target.value)}
                placeholder="Attorney name"
                required
              />
            </div>

            <hr className="my-6 border-neutral-200 dark:border-metallic-gray-700" />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Client Name *
              </label>
              <Input
                value={data.client_name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('client_name', e.target.value)}
                placeholder="Client name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Client Email
              </label>
              <Input
                type="email"
                value={data.client_email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateData('client_email', e.target.value)}
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Client Type *
              </label>
              <Select
                value={data.client_type || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateData('client_type', e.target.value)}
                required
              >
                <option value="">Select client type...</option>
                {CLIENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
          </div>
        );

      case 'cloud-docs':
        if (!cloudConnection) {
          return (
            <CloudStorageEmptyState onSetup={() => {
              // Navigate to settings to set up cloud storage
              toast.success('Please configure cloud storage in Settings');
            }} />
          );
        }

        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Link Cloud Documents
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Browse and select documents from your connected cloud storage to link to this matter.
              </p>
            </div>

            <DocumentBrowser
              provider={cloudConnection.provider as any}
              connectionId={cloudConnection.id}
              onSelectFile={(file) => {
                if (!linkedDocuments.find(d => d.id === file.id)) {
                  setLinkedDocuments([...linkedDocuments, file]);
                  toast.success(`Linked ${file.name}`);
                } else {
                  setLinkedDocuments(linkedDocuments.filter(d => d.id !== file.id));
                  toast.success(`Unlinked ${file.name}`);
                }
              }}
              selectedFiles={linkedDocuments}
            />

            {linkedDocuments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Linked Documents ({linkedDocuments.length})
                </h4>
                <ul className="space-y-2">
                  {linkedDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-metallic-gray-800 rounded"
                    >
                      <span className="text-sm">{doc.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLinkedDocuments(docs => docs.filter(d => d.id !== doc.id))}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Review Matter Details
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Basic Information</h4>
                  <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">{data.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{data.matter_type}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{data.description}</p>
                </div>

                <hr className="border-neutral-200 dark:border-metallic-gray-700" />

                <div>
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Firm & Attorney</h4>
                  <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                    {data.instructing_attorney}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{data.instructing_firm}</p>
                </div>

                <hr className="border-neutral-200 dark:border-metallic-gray-700" />

                <div>
                  <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Client</h4>
                  <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">{data.client_name}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{data.client_type}</p>
                  {data.client_email && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{data.client_email}</p>
                  )}
                </div>

                {data.fee_type && (
                  <>
                    <hr className="border-neutral-200 dark:border-metallic-gray-700" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Financial</h4>
                      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {data.fee_type}
                        {data.estimated_fee && ` - R${data.estimated_fee.toLocaleString()}`}
                      </p>
                    </div>
                  </>
                )}

                {linkedDocuments.length > 0 && (
                  <>
                    <hr className="border-neutral-200 dark:border-metallic-gray-700" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Linked Documents</h4>
                      <ul className="space-y-1 mt-2">
                        {linkedDocuments.map(doc => (
                          <li key={doc.id} className="text-sm text-neutral-600 dark:text-neutral-400">
                            • {doc.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Create New Matter
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          {lastSaved && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <MultiStepForm
            steps={WIZARD_STEPS}
            initialData={formData}
            onComplete={handleComplete}
            onCancel={onClose}
          >
            {renderStepContent}
          </MultiStepForm>
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-metallic-gray-700 flex justify-between">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    </div>
  );
};
