import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Users, 
  DollarSign, 
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Briefcase,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Input, Select, Textarea } from '../components/design-system/components';
import FileUpload from '../components/common/FileUpload';
import { awsDocumentProcessingService } from '../services/aws-document-processing.service';
import { matterApiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { NewMatterForm, Page, DocumentProcessingResult } from '../types';
import { useNavigate } from 'react-router-dom';

interface MatterWorkbenchPageProps {
  onNavigate?: (page: Page) => void;
}

const MATTER_TYPES = [
  'Personal Injury',
  'Motor Vehicle Accident',
  'Medical Malpractice',
  'Product Liability',
  'Workplace Injury',
  'Property Damage',
  'Contract Dispute',
  'Insurance Claim',
  'Other'
];

const FEE_TYPES = [
  'Contingency',
  'Hourly',
  'Fixed Fee',
  'Hybrid'
];

const RISK_LEVELS = [
  'Low',
  'Medium',
  'High'
];

const CLIENT_TYPES = [
  'Individual',
  'Business',
  'Government',
  'Non-Profit'
];

const MatterWorkbenchPage: React.FC<MatterWorkbenchPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Document processing states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [documentProcessingError, setDocumentProcessingError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<DocumentProcessingResult | null>(null);
  const [showExtractedDataPreview, setShowExtractedDataPreview] = useState(false);

  const [formData, setFormData] = useState<NewMatterForm>({
    title: '',
    matterType: '',
    matter_type: '',
    description: '',
    courtCaseNumber: '',
    clientName: '',
    client_name: '',
    clientEmail: '',
    client_email: '',
    clientPhone: '',
    client_phone: '',
    clientAddress: '',
    client_address: '',
    clientType: 'individual' as any,
    client_type: 'individual' as any,
    instructingAttorney: '',
    instructing_attorney: '',
    instructingFirm: '',
    instructing_firm: '',
    instructingAttorneyEmail: '',
    instructing_attorney_email: '',
    instructingAttorneyPhone: '',
    instructing_attorney_phone: '',
    instructingFirmRef: '',
    instructing_firm_ref: '',
    feeType: 'contingency' as any,
    fee_type: 'contingency' as any,
    estimatedFee: 0,
    estimated_fee: 0,
    feeCap: 0,
    fee_cap: 0,
    riskLevel: 'medium' as any,
    risk_level: 'medium' as any
  });

  const steps = [
    {
      id: 1,
      title: 'Document Upload',
      description: 'Upload legal documents for automatic data extraction',
      icon: Upload,
      color: 'bg-blue-500 dark:bg-blue-600'
    },
    {
      id: 2,
      title: 'Basic Information',
      description: 'Matter type, title, and description',
      icon: FileText,
      color: 'bg-green-500 dark:bg-green-600'
    },
    {
      id: 3,
      title: 'Client Details',
      description: 'Client information and contact details',
      icon: Users,
      color: 'bg-purple-500 dark:bg-purple-600'
    },
    {
      id: 4,
      title: 'Attorney Information',
      description: 'Instructing attorney and firm details',
      icon: Building2,
      color: 'bg-orange-500 dark:bg-orange-600'
    },
    {
      id: 5,
      title: 'Financial Terms',
      description: 'Fee structure and financial arrangements',
      icon: DollarSign,
      color: 'bg-yellow-500 dark:bg-yellow-600'
    },
    {
      id: 6,
      title: 'Review & Submit',
      description: 'Review all information before creating matter',
      icon: CheckCircle,
      color: 'bg-emerald-500 dark:bg-emerald-600'
    }
  ];

  const handleInputChange = (field: keyof NewMatterForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingDocument(true);
    setProcessingProgress(0);
    setDocumentProcessingError(null);
    setExtractedData(null);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await awsDocumentProcessingService.processDocument(file);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setExtractedData(result);
      setShowExtractedDataPreview(true);
      
      toast.success('Document processed successfully!');
    } catch (error) {
      console.error('Document processing error:', error);
      setDocumentProcessingError(error instanceof Error ? error.message : 'Failed to process document');
      toast.error('Failed to process document');
    } finally {
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

  const applyExtractedData = () => {
    if (!extractedData) return;

    console.log('[MatterWorkbench] Applying extracted data:', extractedData);

    // The actual extracted fields are in extractedData.extractedData
    const data = (extractedData as any).extractedData || extractedData;
    console.log('[MatterWorkbench] Actual data to extract from:', data);

    const updates: Partial<NewMatterForm> = {};
    
    // Client fields - use both camelCase and snake_case
    if (data.clientName) {
      updates.clientName = data.clientName;
      updates.client_name = data.clientName;
    }
    if (data.clientEmail) {
      updates.clientEmail = data.clientEmail;
      updates.client_email = data.clientEmail;
    }
    if (data.clientPhone) {
      updates.clientPhone = data.clientPhone;
      updates.client_phone = data.clientPhone;
    }
    if (data.clientAddress) {
      updates.clientAddress = data.clientAddress;
      updates.client_address = data.clientAddress;
    }
    
    // Case fields
    if (data.caseNumber) {
      updates.courtCaseNumber = data.caseNumber;
    }
    if (data.description) {
      updates.description = data.description;
    }
    if (data.caseTitle) {
      updates.title = data.caseTitle;
    }
    
    // Attorney fields
    if (data.attorneyName) {
      updates.instructingAttorney = data.attorneyName;
      updates.instructing_attorney = data.attorneyName;
    }
    if (data.attorneyEmail) {
      updates.instructingAttorneyEmail = data.attorneyEmail;
      updates.instructing_attorney_email = data.attorneyEmail;
    }
    if (data.attorneyPhone) {
      updates.instructingAttorneyPhone = data.attorneyPhone;
      updates.instructing_attorney_phone = data.attorneyPhone;
    }
    if (data.firmName) {
      updates.instructingFirm = data.firmName;
      updates.instructing_firm = data.firmName;
    }
    if (data.lawFirm) {
      updates.instructingFirm = data.lawFirm;
      updates.instructing_firm = data.lawFirm;
    }
    
    // Financial fields
    if (data.estimatedAmount) {
      updates.estimatedFee = data.estimatedAmount;
      updates.estimated_fee = data.estimatedAmount;
    }

    console.log('[MatterWorkbench] Updates to apply:', updates);
    setFormData(prev => ({ ...prev, ...updates }));
    setShowExtractedDataPreview(false);
    
    toast.success('Extracted data applied to form!');
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 2: // Basic Information
        if (!formData.title.trim()) errors.title = 'Matter title is required';
        if (!formData.matter_type) errors.matter_type = 'Matter type is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        break;
      case 3: // Client Details
        if (!formData.client_name.trim()) errors.client_name = 'Client name is required';
        if (!formData.client_email.trim()) errors.client_email = 'Client email is required';
        if (formData.client_email && !/\S+@\S+\.\S+/.test(formData.client_email)) {
          errors.client_email = 'Valid email is required';
        }
        break;
      case 4: // Attorney Information
        if (!formData.instructing_attorney.trim()) errors.instructing_attorney = 'Instructing attorney name is required';
        if (!formData.instructing_attorney_firm.trim()) errors.instructing_attorney_firm = 'Attorney firm is required';
        if (!formData.instructing_attorney_email.trim()) errors.instructing_attorney_email = 'Attorney email is required';
        if (formData.instructing_attorney_email && !/\S+@\S+\.\S+/.test(formData.instructing_attorney_email)) {
          errors.instructing_attorney_email = 'Valid email is required';
        }
        break;
      case 5: // Financial Terms
        if (!formData.fee_type) errors.fee_type = 'Fee type is required';
        if (formData.estimated_fee < 0) errors.estimated_fee = 'Estimated fee cannot be negative';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create the matter
      const result = await matterApiService.create({
        ...formData,
        advocate_id: user.id,
        status: 'active'
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Matter created successfully!');
      navigatePage('matters');
    } catch (error) {
      console.error('Error creating matter:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create matter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();

  const navigatePage = (page: Page) => {
    if (onNavigate) {
      onNavigate(page);
      return;
    }
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'proforma-requests':
        navigate('/proforma-requests');
        break;
      case 'matters':
        navigate('/matters');
        break;
      case 'matter-workbench':
        navigate('/matter-workbench');
        break;
      case 'invoices':
        navigate('/invoices');
        break;
      case 'partner-approval':
        navigate('/partner-approval');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="w-16 h-16 text-blue-500 dark:text-judicial-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Upload Legal Documents</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Upload attorney briefs, court documents, or client correspondence to automatically extract case details
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              currentFile={uploadedFile}
              isProcessing={isProcessingDocument}
              processingProgress={processingProgress}
              error={documentProcessingError}
              label="Upload Attorney's Brief or Legal Document"
              description="Upload PDF, DOC, or DOCX files (max 10MB) for automatic data extraction"
              className="max-w-2xl mx-auto"
            />

            {showExtractedDataPreview && extractedData && (
              <Card className="max-w-2xl mx-auto border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Extracted Information</h4>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {extractedData.clientName && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-300">Client:</span>
                        <span className="ml-2 text-green-700 dark:text-green-400">{extractedData.clientName}</span>
                      </div>
                    )}
                    {extractedData.clientEmail && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-300">Email:</span>
                        <span className="ml-2 text-green-700 dark:text-green-400">{extractedData.clientEmail}</span>
                      </div>
                    )}
                    {extractedData.clientPhone && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-300">Phone:</span>
                        <span className="ml-2 text-green-700 dark:text-green-400">{extractedData.clientPhone}</span>
                      </div>
                    )}
                    {extractedData.caseNumber && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-300">Case Number:</span>
                        <span className="ml-2 text-green-700 dark:text-green-400">{extractedData.caseNumber}</span>
                      </div>
                    )}
                    {extractedData.attorneyName && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-300">Attorney:</span>
                        <span className="ml-2 text-green-700 dark:text-green-400">{extractedData.attorneyName}</span>
                      </div>
                    )}
                    {extractedData.firmName && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-300">Firm:</span>
                        <span className="ml-2 text-green-700 dark:text-green-400">{extractedData.firmName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <Button onClick={applyExtractedData} variant="primary" size="sm">
                      Apply to Form
                    </Button>
                    <Button 
                      onClick={() => setShowExtractedDataPreview(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Basic Information</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Provide the fundamental details about this matter</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Matter Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Smith vs. ABC Insurance - Motor Vehicle Accident"
                  error={validationErrors.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Matter Type *
                </label>
                <Select
                  value={formData.matter_type}
                  onChange={(e) => handleInputChange('matter_type', e.target.value)}
                  error={validationErrors.matter_type}
                >
                  <option value="">Select matter type</option>
                  {MATTER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Court Case Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Input
                    value={formData.court_case_number}
                    onChange={(e) => handleInputChange('court_case_number', e.target.value)}
                    placeholder="e.g., 2024/12345"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of the matter, including key facts and circumstances..."
                  rows={4}
                  error={validationErrors.description}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-purple-500 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Client Details</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Information about the client for this matter</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Client Name *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Input
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    placeholder="Full name or company name"
                    className="pl-10"
                    error={validationErrors.client_name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Client Type
                </label>
                <Select
                  value={formData.client_type}
                  onChange={(e) => handleInputChange('client_type', e.target.value)}
                >
                  {CLIENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => handleInputChange('client_email', e.target.value)}
                      placeholder="client@example.com"
                      className="pl-10"
                      error={validationErrors.client_email}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                    <Input
                      value={formData.client_phone}
                      onChange={(e) => handleInputChange('client_phone', e.target.value)}
                      placeholder="+27 11 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Textarea
                    value={formData.client_address}
                    onChange={(e) => handleInputChange('client_address', e.target.value)}
                    placeholder="Full address including postal code"
                    rows={3}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Attorney Information</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Details about the instructing attorney and firm</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Instructing Attorney Name *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Input
                    value={formData.instructing_attorney}
                    onChange={(e) => handleInputChange('instructing_attorney', e.target.value)}
                    placeholder="Attorney full name"
                    className="pl-10"
                    error={validationErrors.instructing_attorney}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Law Firm *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Input
                    value={formData.instructing_attorney_firm}
                    onChange={(e) => handleInputChange('instructing_attorney_firm', e.target.value)}
                    placeholder="Law firm name"
                    className="pl-10"
                    error={validationErrors.instructing_attorney_firm}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Attorney Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.instructing_attorney_email}
                      onChange={(e) => handleInputChange('instructing_attorney_email', e.target.value)}
                      placeholder="attorney@lawfirm.com"
                      className="pl-10"
                      error={validationErrors.instructing_attorney_email}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Attorney Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                    <Input
                      value={formData.instructing_attorney_phone}
                      onChange={(e) => handleInputChange('instructing_attorney_phone', e.target.value)}
                      placeholder="+27 11 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Firm Reference Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                  <Input
                    value={formData.firm_reference}
                    onChange={(e) => handleInputChange('firm_reference', e.target.value)}
                    placeholder="Internal firm reference"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <DollarSign className="w-16 h-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Financial Terms</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Fee structure and financial arrangements</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Fee Type *
                </label>
                <Select
                  value={formData.fee_type}
                  onChange={(e) => handleInputChange('fee_type', e.target.value)}
                  error={validationErrors.fee_type}
                >
                  {FEE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Estimated Fee (R)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                    <Input
                      type="number"
                      value={formData.estimated_fee}
                      onChange={(e) => handleInputChange('estimated_fee', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="pl-10"
                      error={validationErrors.estimated_fee}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Fee Cap (R)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
                    <Input
                      type="number"
                      value={formData.fee_cap}
                      onChange={(e) => handleInputChange('fee_cap', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Risk Level
                </label>
                <Select
                  value={formData.risk_level}
                  onChange={(e) => handleInputChange('risk_level', e.target.value)}
                >
                  {RISK_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Review & Submit</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Review all information before creating the matter</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Basic Information
                  </h4>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Title:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Type:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.matter_type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Case Number:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.court_case_number || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Client Details */}
              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Client Details
                  </h4>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Name:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.client_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Type:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.client_type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Email:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.client_email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Phone:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.client_phone || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Attorney Information */}
              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Attorney Information
                  </h4>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Attorney:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.instructing_attorney}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Firm:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.instructing_attorney_firm}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Email:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.instructing_attorney_email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Phone:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.instructing_attorney_phone || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Financial Terms */}
              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Financial Terms
                  </h4>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Fee Type:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.fee_type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Estimated Fee:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">R {formData.estimated_fee.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Fee Cap:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">R {formData.fee_cap.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Risk Level:</dt>
                      <dd className="font-medium text-right dark:text-neutral-200">{formData.risk_level}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            {formData.description && (
              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Description</h4>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{formData.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('matters')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Matters</span>
              </Button>
              <div className="h-6 w-px bg-neutral-300" />
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Matter Workbench</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Create a new legal matter</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Step {currentStep} of {steps.length}
              </span>
              <div className="w-32 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-judicial-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                      ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 
                        isCompleted ? 'border-green-600 bg-green-600 text-white' : 
                        'border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-400 dark:text-neutral-500'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-judicial-blue-400' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      hidden sm:block w-16 h-0.5 mx-4 transition-all duration-200
                      ${isCompleted ? 'bg-green-600 dark:bg-green-500' : 'bg-neutral-300 dark:bg-metallic-gray-600'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="min-h-[600px]">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <Button
                variant="primary"
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Creating Matter...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Matter</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterWorkbenchPage;