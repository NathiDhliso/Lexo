import React, { useState, useEffect, useCallback } from 'react';
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
import { matterApiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { NewMatterForm, Page } from '../types';
import { useNavigate } from 'react-router-dom';

interface NewMatterWizardPageProps {
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

const NewMatterWizardPage: React.FC<NewMatterWizardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
      title: 'Basic Information',
      description: 'Matter type, title, and description',
      icon: FileText,
      color: 'bg-green-500 dark:bg-green-600'
    },
    {
      id: 2,
      title: 'Client Details',
      description: 'Client information and contact details',
      icon: Users,
      color: 'bg-purple-500 dark:bg-purple-600'
    },
    {
      id: 3,
      title: 'Attorney Information',
      description: 'Instructing attorney and firm details',
      icon: Building2,
      color: 'bg-orange-500 dark:bg-orange-600'
    },
    {
      id: 4,
      title: 'Financial Terms',
      description: 'Fee structure and financial arrangements',
      icon: DollarSign,
      color: 'bg-yellow-500 dark:bg-yellow-600'
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Review all information before creating matter',
      icon: CheckCircle,
      color: 'bg-emerald-500 dark:bg-emerald-600'
    }
  ];

  const handleInputChange = useCallback((field: keyof NewMatterForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  // Memoized handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('title', e.target.value);
  }, [handleInputChange]);

  const handleMatterTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange('matterType', e.target.value);
    handleInputChange('matter_type', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleCourtCaseNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('courtCaseNumber', e.target.value);
  }, [handleInputChange]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange('description', e.target.value);
  }, [handleInputChange]);

  const handleClientNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('clientName', e.target.value);
    handleInputChange('client_name', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleClientTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange('clientType', e.target.value);
    handleInputChange('client_type', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleClientEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('clientEmail', e.target.value);
    handleInputChange('client_email', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleClientPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('clientPhone', e.target.value);
    handleInputChange('client_phone', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleClientAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange('clientAddress', e.target.value);
    handleInputChange('client_address', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleInstructingAttorneyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('instructingAttorney', e.target.value);
    handleInputChange('instructing_attorney', e.target.value); // Keep both in sync
  }, [handleInputChange]);

  const handleInstructingAttorneyFirmChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('instructingFirm', e.target.value);
  }, [handleInputChange]);

  const handleInstructingAttorneyEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('instructingAttorneyEmail', e.target.value);
  }, [handleInputChange]);

  const handleInstructingAttorneyPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('instructingAttorneyPhone', e.target.value);
  }, [handleInputChange]);

  const handleFirmReferenceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('instructingFirmRef', e.target.value);
  }, [handleInputChange]);

  const handleFeeTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange('feeType', e.target.value);
  }, [handleInputChange]);

  const handleEstimatedFeeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('estimatedFee', parseFloat(e.target.value) || 0);
  }, [handleInputChange]);

  const handleFeeCapChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('feeCap', parseFloat(e.target.value) || 0);
  }, [handleInputChange]);

  const handleRiskLevelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange('riskLevel', e.target.value);
  }, [handleInputChange]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.title.trim()) errors.title = 'Matter title is required';
        if (!formData.matter_type) errors.matter_type = 'Matter type is required';
        if (!formData.description?.trim()) errors.description = 'Description is required';
        break;
      case 2: // Client Details
        if (!formData.client_name.trim()) errors.client_name = 'Client name is required';
        if (!formData.client_email?.trim()) errors.client_email = 'Client email is required';
        if (formData.client_email && !/\S+@\S+\.\S+/.test(formData.client_email)) {
          errors.client_email = 'Valid email is required';
        }
        break;
      case 3: // Attorney Information
        if (!formData.instructing_attorney.trim()) errors.instructing_attorney = 'Instructing attorney name is required';
        if (!formData.instructingFirm?.trim()) errors.instructingFirm = 'Attorney firm is required';
        if (!formData.instructingAttorneyEmail?.trim()) errors.instructingAttorneyEmail = 'Attorney email is required';
        if (formData.instructingAttorneyEmail && !/\S+@\S+\.\S+/.test(formData.instructingAttorneyEmail)) {
          errors.instructingAttorneyEmail = 'Valid email is required';
        }
        break;
      case 4: // Financial Terms
        if (!formData.feeType) errors.feeType = 'Fee type is required';
        if (formData.estimatedFee && formData.estimatedFee < 0) errors.estimatedFee = 'Estimated fee cannot be negative';
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

      // Create the matter using createFromForm which properly handles the data
      const result = await matterApiService.createFromForm(formData);

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success('Matter created successfully!');
      
      // Navigate to the matter workbench to see the Documents tab
      if (result.data) {
        navigate(`/matter-workbench/${result.data.id}`);
      } else {
        navigatePage('matters');
      }
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
                  onChange={handleTitleChange}
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
                  onChange={handleMatterTypeChange}
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
                    value={formData.courtCaseNumber || ''}
                    onChange={handleCourtCaseNumberChange}
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
                  onChange={handleDescriptionChange}
                  placeholder="Provide a detailed description of the matter, including key facts and circumstances..."
                  rows={4}
                  error={validationErrors.description}
                />
              </div>
            </div>
          </div>
        );

      case 2:
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
                    onChange={handleClientNameChange}
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
                  onChange={handleClientTypeChange}
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
                      onChange={handleClientEmailChange}
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
                      onChange={handleClientPhoneChange}
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
                    onChange={handleClientAddressChange}
                    placeholder="Full address including postal code"
                    rows={3}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
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
                    onChange={handleInstructingAttorneyChange}
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
                    value={formData.instructingFirm || ''}
                    onChange={handleInstructingAttorneyFirmChange}
                    placeholder="Law firm name"
                    className="pl-10"
                    error={validationErrors.instructingFirm}
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
                      onChange={handleInstructingAttorneyEmailChange}
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
                      onChange={handleInstructingAttorneyPhoneChange}
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
                    value={formData.instructingFirmRef || ''}
                    onChange={handleFirmReferenceChange}
                    placeholder="Internal firm reference"
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
                  value={formData.feeType}
                  onChange={handleFeeTypeChange}
                  error={validationErrors.feeType}
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
                      value={formData.estimatedFee}
                      onChange={handleEstimatedFeeChange}
                      placeholder="0.00"
                      className="pl-10"
                      error={validationErrors.estimatedFee}
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
                      value={formData.feeCap}
                      onChange={handleFeeCapChange}
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
                  value={formData.riskLevel}
                  onChange={handleRiskLevelChange}
                >
                  {RISK_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Review & Submit</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Review all information before creating the matter</p>
            </div>

            {/* Single consolidated card */}
            <Card>
              <CardHeader>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{formData.title}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{formData.matter_type}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</h5>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{formData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Client</p>
                    <p className="text-sm font-medium dark:text-neutral-200">{formData.client_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Attorney</p>
                    <p className="text-sm font-medium dark:text-neutral-200">{formData.instructing_attorney}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Firm</p>
                    <p className="text-sm font-medium dark:text-neutral-200">{formData.instructingFirm}</p>
                  </div>
                  {formData.courtCaseNumber && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Case Number</p>
                      <p className="text-sm font-medium dark:text-neutral-200">{formData.courtCaseNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">New Matter Wizard</h1>
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

export default NewMatterWizardPage;
