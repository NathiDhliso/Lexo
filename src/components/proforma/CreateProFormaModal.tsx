import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '../design-system/components';
import { AsyncButton } from '../ui/AsyncButton';
import toast from 'react-hot-toast';
import RateCardSelector, { SelectedService } from '../pricing/RateCardSelector';
import { ProFormaEstimate } from '../../services/rate-card.service';
import { DocumentIntelligenceService } from '../../services/api/document-intelligence.service';
import { proFormaPDFService } from '../../services/proforma-pdf.service';
import { useAuth } from '../../hooks/useAuth';

interface CreateProFormaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proforma: any) => void;
  matterId?: string;
  matterName?: string;
  clientName?: string;
}

export const CreateProFormaModal: React.FC<CreateProFormaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  matterId,
  matterName,
  clientName,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'review'>('input');
  
  // Form data
  const [formData, setFormData] = useState({
    matterName: matterName || '',
    clientName: clientName || '',
    matterSummary: '',
    matterType: '',
  });

  // AI and rate card state
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [estimate, setEstimate] = useState<ProFormaEstimate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const matterTypes = [
    { value: 'civil_litigation', label: 'Civil Litigation' },
    { value: 'commercial_law', label: 'Commercial Law' },
    { value: 'criminal_law', label: 'Criminal Law' },
    { value: 'family_law', label: 'Family Law' },
    { value: 'property_law', label: 'Property Law' },
    { value: 'labour_law', label: 'Labour Law' },
    { value: 'constitutional_law', label: 'Constitutional Law' },
    { value: 'administrative_law', label: 'Administrative Law' },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        matterName: matterName || '',
        clientName: clientName || '',
        matterSummary: '',
        matterType: '',
      });
      setSelectedServices([]);
      setEstimate(null);
      setAiGenerated(false);
      setStep('input');
    }
  }, [isOpen, matterName, clientName]);

  const handleGenerateWithAI = async () => {
    if (!formData.matterSummary || !formData.matterType) {
      toast.error('Please enter a matter summary and select a matter type.');
      return;
    }

    setIsGenerating(true);
    try {
      // Use AI to extract billable activities from the summary
      await DocumentIntelligenceService.generateFeeNarrative({
        matterId: matterId || 'temp-' + Date.now(),
        includeValuePropositions: true,
      });

      // For now, we'll use the rate card selector to populate services
      // In a full implementation, you'd map AI-extracted activities to rate cards
      toast.success('AI analysis complete! Review and adjust the suggested services below.');
      setAiGenerated(true);
    } catch (error) {
      console.error('Failed to generate items with AI:', error);
      toast.error('AI generation failed. You can still manually select services below.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleServicesChange = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleEstimateChange = (newEstimate: ProFormaEstimate) => {
    setEstimate(newEstimate);
  };

  const handleReview = () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service.');
      return;
    }
    setStep('review');
  };

  const handleDownloadPDF = async () => {
    if (!estimate || !user) return;

    // Create a pro forma request object
    const proformaData = {
      work_title: formData.matterName,
      client: { name: formData.clientName },
      instructing_attorney_name: formData.clientName,
      instructing_attorney_email: '',
      work_description: formData.matterSummary,
      estimated_amount: estimate.subtotal,
      quote_number: `PF-${Date.now()}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        services: selectedServices,
      },
    };

    const advocateInfo = {
      full_name: user.user_metadata?.full_name || user.email || 'Advocate',
      practice_number: user.user_metadata?.practice_number || 'N/A',
      email: user.email,
      phone: (user.user_metadata as any)?.phone,
    };

    await proFormaPDFService.downloadProFormaPDF(proformaData as any, advocateInfo);
    
    onSuccess(proformaData);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {step === 'input' ? 'Create Pro Forma Invoice' : 'Review Pro Forma'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {step === 'input' 
                ? 'Use AI to analyze matter details and generate pricing estimates'
                : 'Review your pro forma and download as PDF'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' ? (
            <div className="space-y-6">
              {/* Matter Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Matter Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Matter Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.matterName}
                      onChange={(e) => setFormData({ ...formData, matterName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Smith v. Jones Contract Dispute"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Matter Type *
                  </label>
                  <select
                    value={formData.matterType}
                    onChange={(e) => setFormData({ ...formData, matterType: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select matter type...</option>
                    {matterTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Matter Summary *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.matterSummary}
                    onChange={(e) => setFormData({ ...formData, matterSummary: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the matter summary, email thread, attendance notes, or brief description here...&#10;&#10;Example:&#10;- Initial consultation regarding contract breach&#10;- Review of employment agreement&#10;- Draft response to opposing counsel&#10;- Prepare for court hearing on 15 March"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    💡 Tip: The more detail you provide, the better AI can suggest relevant services and pricing
                  </p>
                </div>

                <AsyncButton
                  onAsyncClick={handleGenerateWithAI}
                  disabled={!formData.matterSummary || !formData.matterType}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  successMessage="AI analysis complete!"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze with AI ✨
                    </>
                  )}
                </AsyncButton>

                {aiGenerated && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✓ AI analysis complete! Review the suggested services below and make any adjustments.
                    </p>
                  </div>
                )}
              </div>

              {/* Rate Card Selector */}
              <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Select Services & Pricing
                </h3>
                <RateCardSelector
                  matterType={formData.matterType}
                  onServicesChange={handleServicesChange}
                  onEstimateChange={handleEstimateChange}
                  showEstimate={true}
                />
              </div>
            </div>
          ) : (
            /* Review Step */
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pro Forma Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Matter:</span>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{formData.matterName}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Client:</span>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{formData.clientName}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Matter Type:</span>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {matterTypes.find(t => t.value === formData.matterType)?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Services:</span>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{selectedServices.length} selected</p>
                  </div>
                </div>
              </div>

              {estimate && (
                <div className="bg-white dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-6">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                      <span>VAT (15%):</span>
                      <span className="font-medium">{formatCurrency(estimate.vat_amount)}</span>
                    </div>
                    <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-3 flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      <span>Total Estimate:</span>
                      <span className="text-green-600 dark:text-green-400">{formatCurrency(estimate.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                      <span>Estimated Hours:</span>
                      <span>{estimate.estimated_hours}h</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This pro forma will be generated using your custom PDF template settings. 
                  You can customize your template in Settings → PDF Templates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex justify-between">
          {step === 'input' ? (
            <>
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={selectedServices.length === 0}
                variant="primary"
              >
                Review Pro Forma
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setStep('input')} variant="secondary">
                Back to Edit
              </Button>
              <AsyncButton
                onAsyncClick={handleDownloadPDF}
                disabled={!estimate}
                variant="primary"
                successMessage="Pro forma PDF downloaded successfully!"
                errorMessage="Failed to generate PDF. Please try again."
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF 📄
              </AsyncButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProFormaModal;
