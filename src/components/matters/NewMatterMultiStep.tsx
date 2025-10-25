import React, { useState } from 'react';
import { FileText, User, Briefcase, DollarSign, CheckCircle, Upload } from 'lucide-react';
import { MultiStepForm, Step } from '../common/MultiStepForm';
import { Input, Select, Textarea } from '../design-system/components';
import { DocumentUploadWithProcessing } from '../document-processing/DocumentUploadWithProcessing';
import type { NewMatterForm } from '../../types';

interface NewMatterMultiStepProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: NewMatterForm) => void;
  initialData?: Partial<NewMatterForm>;
  sourceProFormaId?: string;
  isPrepopulated?: boolean;
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

const MATTER_STEPS: Step[] = [
  {
    id: 'document',
    title: 'Document',
    description: 'Upload brief (optional)',
    icon: Upload,
    fields: []
  },
  {
    id: 'basics',
    title: 'Basic Info',
    description: 'Matter details',
    icon: FileText,
    fields: ['title', 'matter_type', 'description']
  },
  {
    id: 'client',
    title: 'Client',
    description: 'Client information',
    icon: User,
    fields: ['client_name', 'client_email', 'client_type']
  },
  {
    id: 'attorney',
    title: 'Attorney',
    description: 'Instructing attorney',
    icon: Briefcase,
    fields: ['instructing_attorney', 'instructing_firm']
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Fee structure',
    icon: DollarSign,
    fields: ['fee_type', 'estimated_fee']
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm details',
    icon: CheckCircle,
    fields: []
  }
];

const MATTER_STEPS_WITHOUT_UPLOAD: Step[] = [
  {
    id: 'basics',
    title: 'Basic Info',
    description: 'Matter details',
    icon: FileText,
    fields: ['title', 'matter_type', 'description']
  },
  {
    id: 'client',
    title: 'Client',
    description: 'Client information',
    icon: User,
    fields: ['client_name', 'client_email', 'client_type']
  },
  {
    id: 'attorney',
    title: 'Attorney',
    description: 'Instructing attorney',
    icon: Briefcase,
    fields: ['instructing_attorney', 'instructing_firm']
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Fee structure',
    icon: DollarSign,
    fields: ['fee_type', 'estimated_fee']
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm details',
    icon: CheckCircle,
    fields: []
  }
];

export const NewMatterMultiStep: React.FC<NewMatterMultiStepProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData = {},
  isPrepopulated = false
}) => {
  const steps = isPrepopulated ? MATTER_STEPS_WITHOUT_UPLOAD : MATTER_STEPS;
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [documentProcessingError, setDocumentProcessingError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<DocumentProcessingResult | null>(null);
  const [showExtractedDataPreview, setShowExtractedDataPreview] = useState(false);

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setDocumentProcessingError(null);
    setIsProcessingDocument(true);
    setProcessingProgress(0);

    try {
      const result = await awsDocumentProcessingService.processDocument(
        file,
        (progress) => setProcessingProgress(progress)
      );
      
      setExtractedData(result);
      setShowExtractedDataPreview(true);
      setIsProcessingDocument(false);
    } catch (error) {
      console.error('Document processing failed:', error);
      setDocumentProcessingError(error instanceof Error ? error.message : 'Processing failed');
      setIsProcessingDocument(false);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setShowExtractedDataPreview(false);
    setDocumentProcessingError(null);
    setProcessingProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Create New Matter</h2>
          
          <MultiStepForm
            steps={steps}
            initialData={initialData}
            onComplete={onComplete}
            onCancel={onClose}
          >
            {(currentStep, data, updateData) => {
              const applyExtractedData = () => {
                if (!extractedData) return;
                
                const extracted = extractedData.extractedData;
                
                if (extracted.caseTitle) updateData('title', extracted.caseTitle);
                if (extracted.description) updateData('description', extracted.description);
                if (extracted.caseNumber) updateData('court_case_number', extracted.caseNumber);
                
                if (extracted.clientName) updateData('client_name', extracted.clientName);
                if (extracted.clientEmail) updateData('client_email', extracted.clientEmail);
                if (extracted.clientPhone) updateData('client_phone', extracted.clientPhone);
                if (extracted.clientAddress) updateData('client_address', extracted.clientAddress);
                
                if (extracted.lawFirm) updateData('instructing_firm', extracted.lawFirm);
                
                console.log('✓ Applied extracted data to form:', extracted);
                setShowExtractedDataPreview(false);
              };

              return (
                <div className="space-y-4">
                  {currentStep.id === 'document' && (
                    <>
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">Upload Attorney's Brief (Optional)</h3>
                        <p className="text-gray-600 dark:text-neutral-400">Upload the attorney's soft copy to automatically extract client and case details</p>
                      </div>
                      
                      <DocumentUploadWithProcessing
                        onFileSelect={handleFileSelect}
                        onFileRemove={handleFileRemove}
                        currentFile={uploadedFile}
                        isProcessing={isProcessingDocument}
                        processingProgress={processingProgress}
                        error={documentProcessingError}
                        label="Upload Legal Document"
                        description="Upload a PDF or Word document to automatically extract case details and populate the form"
                        acceptedTypes={awsDocumentProcessingService.getSupportedFileTypes()}
                        maxSizeInMB={awsDocumentProcessingService.getMaxFileSizeInMB()}
                      />

                      {/* Extracted Data Preview */}
                      {showExtractedDataPreview && extractedData && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-blue-900">Extracted Information</h4>
                              <p className="text-sm text-blue-700">
                                Confidence: {extractedData.confidence}% • Processing time: {(extractedData.processingTime / 1000).toFixed(1)}s
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={applyExtractedData}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Apply to Form
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowExtractedDataPreview(false)}
                                className="px-3 py-1 bg-gray-200 dark:bg-metallic-gray-700 text-gray-700 dark:text-neutral-300 text-sm rounded hover:bg-gray-300"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {extractedData.extractedData.clientName && (
                              <div>
                                <span className="font-medium text-blue-900">Client:</span>
                                <span className="ml-2 text-blue-800">{extractedData.extractedData.clientName}</span>
                              </div>
                            )}
                            {extractedData.extractedData.caseTitle && (
                              <div>
                                <span className="font-medium text-blue-900">Case Title:</span>
                                <span className="ml-2 text-blue-800">{extractedData.extractedData.caseTitle}</span>
                              </div>
                            )}
                            {extractedData.extractedData.lawFirm && (
                              <div>
                                <span className="font-medium text-blue-900">Law Firm:</span>
                                <span className="ml-2 text-blue-800">{extractedData.extractedData.lawFirm}</span>
                              </div>
                            )}
                            {extractedData.extractedData.caseNumber && (
                              <div>
                                <span className="font-medium text-blue-900">Case Number:</span>
                                <span className="ml-2 text-blue-800">{extractedData.extractedData.caseNumber}</span>
                              </div>
                            )}
                            {extractedData.extractedData.dateOfIncident && (
                              <div>
                                <span className="font-medium text-blue-900">Date:</span>
                                <span className="ml-2 text-blue-800">{extractedData.extractedData.dateOfIncident}</span>
                              </div>
                            )}
                            {extractedData.extractedData.urgency && (
                              <div>
                                <span className="font-medium text-blue-900">Urgency:</span>
                                <span className="ml-2 text-blue-800 capitalize">{extractedData.extractedData.urgency}</span>
                              </div>
                            )}
                          </div>
                          
                          {extractedData.extractedData.description && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <span className="font-medium text-blue-900">Description:</span>
                              <p className="mt-1 text-blue-800 text-sm">{extractedData.extractedData.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {currentStep.id === 'basics' && (
                  <>
                    <Input
                      label="Matter Title"
                      value={data.title || ''}
                      onChange={(e) => updateData('title', e.target.value)}
                      required
                      placeholder="e.g., Smith v. Jones Litigation"
                    />
                    
                    <Select
                      label="Matter Type"
                      value={data.matter_type || ''}
                      onChange={(e) => updateData('matter_type', e.target.value)}
                      required
                    >
                      <option value="">Select type...</option>
                      {MATTER_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                    
                    <Textarea
                      label="Description"
                      value={data.description || ''}
                      onChange={(e) => updateData('description', e.target.value)}
                      rows={4}
                      placeholder="Brief description of the matter..."
                    />
                    
                    <Input
                      label="Court Case Number (Optional)"
                      value={data.court_case_number || ''}
                      onChange={(e) => updateData('court_case_number', e.target.value)}
                      placeholder="e.g., CC-2024-001"
                    />
                  </>
                )}
                
                {currentStep.id === 'client' && (
                  <>
                    <Input
                      label="Client Name"
                      value={data.client_name || ''}
                      onChange={(e) => updateData('client_name', e.target.value)}
                      required
                      placeholder="Full name or company name"
                    />
                    
                    <Input
                      label="Client Email"
                      type="email"
                      value={data.client_email || ''}
                      onChange={(e) => updateData('client_email', e.target.value)}
                      required
                      placeholder="client@example.com"
                    />
                    
                    <Input
                      label="Client Phone"
                      type="tel"
                      value={data.client_phone || ''}
                      onChange={(e) => updateData('client_phone', e.target.value)}
                      placeholder="+27 11 123 4567"
                    />
                    
                    <Textarea
                      label="Client Address"
                      value={data.client_address || ''}
                      onChange={(e) => updateData('client_address', e.target.value)}
                      rows={3}
                      placeholder="Physical address..."
                    />
                    
                    <Select
                      label="Client Type"
                      value={data.client_type || ''}
                      onChange={(e) => updateData('client_type', e.target.value)}
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="individual">Individual</option>
                      <option value="corporate">Corporate</option>
                      <option value="government">Government</option>
                      <option value="ngo">NGO</option>
                    </Select>
                  </>
                )}
                
                {currentStep.id === 'attorney' && (
                  <>
                    <Input
                      label="Instructing Attorney"
                      value={data.instructing_attorney || ''}
                      onChange={(e) => updateData('instructing_attorney', e.target.value)}
                      required
                      placeholder="Attorney name"
                    />
                    
                    <Input
                      label="Law Firm"
                      value={data.instructing_firm || ''}
                      onChange={(e) => updateData('instructing_firm', e.target.value)}
                      required
                      placeholder="Firm name"
                    />
                    
                    <Input
                      label="Attorney Email"
                      type="email"
                      value={data.instructing_attorney_email || ''}
                      onChange={(e) => updateData('instructing_attorney_email', e.target.value)}
                      placeholder="attorney@firm.com"
                    />
                    
                    <Input
                      label="Attorney Phone"
                      type="tel"
                      value={data.instructing_attorney_phone || ''}
                      onChange={(e) => updateData('instructing_attorney_phone', e.target.value)}
                      placeholder="+27 11 123 4567"
                    />
                    
                    <Input
                      label="Firm Reference"
                      value={data.instructing_firm_ref || ''}
                      onChange={(e) => updateData('instructing_firm_ref', e.target.value)}
                      placeholder="Internal reference number"
                    />
                  </>
                )}
                
                {currentStep.id === 'financial' && (
                  <>
                    <Select
                      label="Fee Type"
                      value={data.fee_type || ''}
                      onChange={(e) => updateData('fee_type', e.target.value)}
                      required
                    >
                      <option value="">Select fee type...</option>
                      <option value="hourly">Hourly Rate</option>
                      <option value="fixed">Fixed Fee</option>
                      <option value="contingency">Contingency</option>
                      <option value="retainer">Retainer</option>
                    </Select>
                    
                    <Input
                      label="Estimated Fee"
                      type="number"
                      value={data.estimated_fee || ''}
                      onChange={(e) => updateData('estimated_fee', e.target.value)}
                      required
                      placeholder="0.00"
                      step="0.01"
                    />
                    
                    <Input
                      label="Fee Cap (Optional)"
                      type="number"
                      value={data.fee_cap || ''}
                      onChange={(e) => updateData('fee_cap', e.target.value)}
                      placeholder="Maximum fee amount"
                      step="0.01"
                    />
                    
                    <Select
                      label="Risk Level"
                      value={data.risk_level || 'medium'}
                      onChange={(e) => updateData('risk_level', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </>
                )}
                
                {currentStep.id === 'review' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Review Your Matter</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Basic Information</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Title:</dt>
                            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{data.title}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Type:</dt>
                            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{data.matter_type}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Client Details</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Name:</dt>
                            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{data.client_name}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Email:</dt>
                            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{data.client_email}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Type:</dt>
                            <dd className="font-medium capitalize text-neutral-900 dark:text-neutral-100">{data.client_type}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Attorney Information</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Attorney:</dt>
                            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{data.instructing_attorney}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Firm:</dt>
                            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{data.instructing_firm}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 border border-mpondo-gold-200 dark:border-mpondo-gold-700 rounded-lg">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Financial Details</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Fee Type:</dt>
                            <dd className="font-medium capitalize text-neutral-900 dark:text-neutral-100">{data.fee_type}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600 dark:text-neutral-400">Estimated Fee:</dt>
                            <dd className="font-bold text-mpondo-gold-700 dark:text-mpondo-gold-400">
                              R{Number(data.estimated_fee || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              );
            }}
          </MultiStepForm>
        </div>
      </div>
    </div>
  );
};
