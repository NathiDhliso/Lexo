/**
 * QuickAddMatterModal Component
 * Modal for quickly adding a matter that was accepted over phone/email
 * Creates active matter immediately without pro forma
 */
import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Textarea } from '../design-system/components';
import { X, Zap, Phone, Mail, Building2, Briefcase, User, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Firm {
  id: string;
  firm_name: string;
  attorney_name?: string;
  email?: string;
  phone_number?: string;
}

interface QuickAddMatterModalProps {
  isOpen: boolean;
  onConfirm: (matterData: QuickAddMatterData) => void;
  onClose: () => void;
  prefillData?: Partial<QuickAddMatterData>; // Optional pre-fill from pro forma or matter
}

export interface QuickAddMatterData {
  title: string;
  instructing_firm: string;
  instructing_attorney: string;
  instructing_attorney_email: string;
  instructing_attorney_phone?: string;
  client_name?: string;
  description: string;
  matter_type: string;
  urgency?: 'routine' | 'standard' | 'urgent' | 'emergency';
}

const MATTER_TYPES = [
  'Civil Litigation',
  'Criminal Defense',
  'Commercial Law',
  'Contract Dispute',
  'Personal Injury',
  'Motor Vehicle Accident',
  'Medical Malpractice',
  'Property Law',
  'Family Law',
  'Labour Law',
  'Tax Law',
  'Constitutional Law',
  'Other'
];

export const QuickAddMatterModal: React.FC<QuickAddMatterModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  prefillData
}) => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string>('');
  const [loadingFirms, setLoadingFirms] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false); // Track if data came from prefill
  
  const [formData, setFormData] = useState<QuickAddMatterData>({
    title: '',
    instructing_firm: '',
    instructing_attorney: '',
    instructing_attorney_email: '',
    instructing_attorney_phone: '',
    client_name: '',
    description: '',
    matter_type: '',
    urgency: 'standard'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load firms when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFirms();
      // Apply prefill data if provided
      if (prefillData) {
        setFormData(prev => ({ ...prev, ...prefillData }));
        setIsPrefilled(true);
        setSelectedFirmId('prefilled'); // Special marker for prefilled data
      }
    }
  }, [isOpen, prefillData]);

  const loadFirms = async () => {
    setLoadingFirms(true);
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('id, firm_name, attorney_name, email, phone_number')
        .order('firm_name');

      if (error) throw error;
      setFirms(data || []);
    } catch (error) {
      console.error('Error loading firms:', error);
      toast.error('Failed to load firms');
    } finally {
      setLoadingFirms(false);
    }
  };

  const handleFirmSelect = (firmId: string) => {
    setSelectedFirmId(firmId);
    
    if (firmId) {
      const selectedFirm = firms.find(f => f.id === firmId);
      if (selectedFirm) {
        // Auto-fill firm and attorney details
        setFormData(prev => ({
          ...prev,
          instructing_firm: selectedFirm.firm_name,
          instructing_attorney: selectedFirm.attorney_name || '',
          instructing_attorney_email: selectedFirm.email || '',
          instructing_attorney_phone: selectedFirm.phone_number || ''
        }));
      }
    } else {
      // Clear auto-filled data if "Enter manually" is selected
      setFormData(prev => ({
        ...prev,
        instructing_firm: '',
        instructing_attorney: '',
        instructing_attorney_email: '',
        instructing_attorney_phone: ''
      }));
    }
  };

  const handleInputChange = (field: keyof QuickAddMatterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Matter title is required';
    }

    if (!formData.instructing_firm.trim()) {
      newErrors.instructing_firm = 'Instructing firm is required';
    }

    if (!formData.instructing_attorney.trim()) {
      newErrors.instructing_attorney = 'Attorney name is required';
    }

    if (!formData.instructing_attorney_email.trim()) {
      newErrors.instructing_attorney_email = 'Attorney email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.instructing_attorney_email)) {
      newErrors.instructing_attorney_email = 'Valid email is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.matter_type) {
      newErrors.matter_type = 'Matter type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onConfirm(formData);
      // Reset form
      setSelectedFirmId('');
      setFormData({
        title: '',
        instructing_firm: '',
        instructing_attorney: '',
        instructing_attorney_email: '',
        instructing_attorney_phone: '',
        client_name: '',
        description: '',
        matter_type: '',
        urgency: 'standard'
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Quick Add Matter
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Add matter accepted over phone or email
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Fast Track
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Matter will be created with status <strong>"Active"</strong> immediately. You can start logging time and work right away.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Prefill Info Banner */}
            {isPrefilled && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-100">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Attorney details pre-filled from submission</span>
                </div>
              </div>
            )}

            {/* Firm Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Select Firm (or enter manually below)
              </label>
              <Select
                value={selectedFirmId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFirmSelect(e.target.value)}
                disabled={loadingFirms || isPrefilled}
              >
                {isPrefilled ? (
                  <option value="prefilled">From attorney submission</option>
                ) : (
                  <>
                    <option value="">Enter manually</option>
                    {loadingFirms ? (
                      <option disabled>Loading firms...</option>
                    ) : (
                      firms.map(firm => (
                        <option key={firm.id} value={firm.id}>
                          {firm.firm_name} {firm.attorney_name ? `(${firm.attorney_name})` : ''}
                        </option>
                      ))
                    )}
                  </>
                )}
              </Select>
              {!isPrefilled && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Select a registered firm to auto-fill attorney details
                </p>
              )}
            </div>

            {/* Matter Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Matter Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Smith v Jones - Contract Dispute"
                error={errors.title}
              />
            </div>

            {/* Instructing Firm */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Instructing Firm * {(selectedFirmId && selectedFirmId !== 'prefilled') && <span className="text-xs text-green-600 dark:text-green-400">(auto-filled)</span>}
                {isPrefilled && <span className="text-xs text-green-600 dark:text-green-400">(from submission)</span>}
              </label>
              <Input
                value={formData.instructing_firm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('instructing_firm', e.target.value)}
                placeholder="e.g., Smith & Associates Attorneys"
                error={errors.instructing_firm}
                disabled={!!selectedFirmId}
                className={selectedFirmId ? 'bg-green-50 dark:bg-green-900/20' : ''}
              />
            </div>

            {/* Attorney Details - Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Attorney Name * {(selectedFirmId && selectedFirmId !== 'prefilled') && <span className="text-xs text-green-600 dark:text-green-400">(auto-filled)</span>}
                  {isPrefilled && <span className="text-xs text-green-600 dark:text-green-400">(from submission)</span>}
                </label>
                <Input
                  value={formData.instructing_attorney}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('instructing_attorney', e.target.value)}
                  placeholder="e.g., John Smith"
                  error={errors.instructing_attorney}
                  disabled={!!selectedFirmId}
                  className={selectedFirmId ? 'bg-green-50 dark:bg-green-900/20' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Attorney Email * {(selectedFirmId && selectedFirmId !== 'prefilled') && <span className="text-xs text-green-600 dark:text-green-400">(auto-filled)</span>}
                  {isPrefilled && <span className="text-xs text-green-600 dark:text-green-400">(from submission)</span>}
                </label>
                <Input
                  type="email"
                  value={formData.instructing_attorney_email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('instructing_attorney_email', e.target.value)}
                  placeholder="john@smithlaw.com"
                  error={errors.instructing_attorney_email}
                  disabled={!!selectedFirmId}
                  className={selectedFirmId ? 'bg-green-50 dark:bg-green-900/20' : ''}
                />
              </div>
            </div>

            {/* Phone & Client - Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Attorney Phone {(selectedFirmId && selectedFirmId !== 'prefilled') && <span className="text-xs text-green-600 dark:text-green-400">(auto-filled)</span>}
                  {isPrefilled && <span className="text-xs text-green-600 dark:text-green-400">(from submission)</span>}
                </label>
                <Input
                  value={formData.instructing_attorney_phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('instructing_attorney_phone', e.target.value)}
                  placeholder="+27 11 123 4567"
                  disabled={!!selectedFirmId}
                  className={selectedFirmId ? 'bg-green-50 dark:bg-green-900/20' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Client Name
                </label>
                <Input
                  value={formData.client_name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('client_name', e.target.value)}
                  placeholder="e.g., Mary Johnson"
                />
              </div>
            </div>

            {/* Matter Type & Urgency - Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Matter Type *
                </label>
                <Select
                  value={formData.matter_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('matter_type', e.target.value)}
                  error={errors.matter_type}
                >
                  <option value="">Select matter type</option>
                  {MATTER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Urgency
                </label>
                <Select
                  value={formData.urgency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('urgency', e.target.value as 'routine' | 'standard' | 'urgent' | 'emergency')}
                >
                  <option value="routine">Routine</option>
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Enter brief details from the phone call or email..."
                rows={4}
                error={errors.description}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Include key facts, what was agreed, and any special instructions
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Active Matter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
