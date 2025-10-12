import React, { useState } from 'react';
import { X, Link, Copy, CheckCircle, Calculator } from 'lucide-react';
import { proformaRequestService } from '../../services/api/proforma-request.service';
import { rateCardService } from '../../services/api/rate-card.service';
import RateCardSelector from '../pricing/RateCardSelector';
import { PricingCalculator, ServiceItem } from '../../utils/PricingCalculator';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface NewProFormaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const NewProFormaModal: React.FC<NewProFormaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'setup' | 'generated'>('setup');
  const [includeRateCards, setIncludeRateCards] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [estimatedAmount, setEstimatedAmount] = useState<number>(0);
  const [matterType, setMatterType] = useState<string>('');

  const generateLink = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create pro forma request with rate card data if included
      const requestData: any = {
        advocate_id: user.id,
        status: 'draft',
      };

      if (includeRateCards && selectedServices.length > 0) {
        requestData.estimated_amount = estimatedAmount;
        requestData.matter_type = matterType;
        requestData.services = selectedServices;
      }

      const request = await proformaRequestService.create(requestData);

      // Generate the token and link
      const token = await proformaRequestService.generateToken(request.id);
      const link = `${window.location.origin}/pro-forma-request/${token}`;
      
      setGeneratedLink(link);
      setStep('generated');
      onSuccess(request.id);
    } catch (error) {
      console.error('Failed to generate pro forma link:', error);
      toast.error('Failed to generate link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleServicesChange = async (services: any[]) => {
    setSelectedServices(services);
    
    if (services.length > 0 && matterType) {
      try {
        // Convert services to PricingCalculator format
        const serviceItems: ServiceItem[] = services.map(service => ({
          id: service.id,
          name: service.name,
          pricing_type: service.pricing_type,
          hourly_rate: service.hourly_rate,
          fixed_fee: service.fixed_fee,
          estimated_hours: service.estimated_hours || PricingCalculator.estimateHours(matterType, 'medium'),
          quantity: service.quantity || 1,
          description: service.description,
        }));

        // Calculate estimate using PricingCalculator
        const result = PricingCalculator.calculate(serviceItems, [], []);
        setEstimatedAmount(result.total);
      } catch (error) {
        console.error('Error generating estimate:', error);
        setEstimatedAmount(0);
      }
    } else {
      setEstimatedAmount(0);
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    setStep('setup');
    setIncludeRateCards(false);
    setSelectedServices([]);
    setEstimatedAmount(0);
    setMatterType('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-xl max-w-md w-full mx-4">
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Generate Pro Forma Link</h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'setup' ? (
            <div>
              <div className="text-center mb-6">
                <Link className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Generate Attorney Link
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Create a secure link that attorneys can use to submit their pro forma request details.
                </p>
              </div>

              {/* Rate Card Option */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="includeRateCards"
                    checked={includeRateCards}
                    onChange={(e) => setIncludeRateCards(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeRateCards" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <Calculator className="w-4 h-4" />
                    Include pricing estimation with rate cards
                  </label>
                </div>
                
                {includeRateCards && (
                  <div className="border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4 bg-neutral-50 dark:bg-metallic-gray-900">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Matter Type
                      </label>
                      <select
                        value={matterType}
                        onChange={(e) => setMatterType(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select matter type...</option>
                        <option value="civil_litigation">Civil Litigation</option>
                        <option value="commercial_law">Commercial Law</option>
                        <option value="criminal_law">Criminal Law</option>
                        <option value="family_law">Family Law</option>
                        <option value="property_law">Property Law</option>
                        <option value="labour_law">Labour Law</option>
                        <option value="constitutional_law">Constitutional Law</option>
                        <option value="administrative_law">Administrative Law</option>
                      </select>
                    </div>

                    {matterType && (
                      <RateCardSelector
                        matterType={matterType}
                        onServicesChange={handleServicesChange}
                        compact={true}
                      />
                    )}

                    {estimatedAmount > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Estimated Amount: R {estimatedAmount.toLocaleString('en-ZA', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          This estimate will be shown to the attorney when they access the link.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={generateLink}
                disabled={loading || (includeRateCards && (!matterType || selectedServices.length === 0))}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Generating Link...' : 'Generate Link'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Link Generated Successfully!
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Share this link with the attorney to collect their details:
              </p>
              
              <div className="bg-neutral-50 dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-3 mb-4">
                <div className="text-sm text-neutral-800 dark:text-neutral-200 break-all font-mono">
                  {generatedLink}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
