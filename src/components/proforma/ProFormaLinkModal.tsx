import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, Clock, CheckCircle, Calculator, Mail } from 'lucide-react';
import { proformaRequestService } from '../../services/api/proforma-request.service';
import RateCardSelector from '../pricing/RateCardSelector';
import { PricingCalculator, ServiceItem } from '../../utils/PricingCalculator';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { awsEmailService } from '../../services/aws-email.service';

interface ProFormaLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  proformaId: string;
  workTitle: string;
}

export const ProFormaLinkModal: React.FC<ProFormaLinkModalProps> = ({
  isOpen,
  onClose,
  proformaId,
  workTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [includeRateCards, setIncludeRateCards] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [estimatedAmount, setEstimatedAmount] = useState<number>(0);
  const [matterType, setMatterType] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrGenerateLink = async () => {
      try {
        // First, try to get existing token
        const { data, error } = await supabase
          .from('proforma_requests')
          .select('token, expires_at')
          .eq('id', proformaId)
          .single();

        if (error) {
          console.error('Error fetching proforma:', error);
          return;
        }

        let token = data.token;
        let expiresAt = data.expires_at;

        // If no token exists or it's expired, generate a new one
        if (!token || (expiresAt && new Date(expiresAt) < new Date())) {
          const result = await proformaRequestService.generateToken(proformaId);
          token = result.token;
          expiresAt = result.expiresAt;
        }

        const baseUrl = window.location.origin;
        const link = `${baseUrl}/#/pro-forma-request/${token}`;
        setGeneratedLink(link);
        setExpiresAt(expiresAt);
      } catch (error) {
        console.error('Error generating link:', error);
        toast.error('Failed to generate link');
      }
    };

    fetchOrGenerateLink();
  }, [isOpen, proformaId]);

  const generateLink = async () => {
    setLoading(true);
    try {
      if (includeRateCards && selectedServices.length > 0) {
        await proformaRequestService.update(proformaId, {
          estimated_amount: estimatedAmount,
          metadata: {
            matter_type: matterType,
            services: selectedServices,
          },
        });
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      setExpiresAt(expiryDate.toISOString());
    } catch (error) {
      console.error('Failed to generate link:', error);
      toast.error('Failed to generate link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!emailAddress || !generatedLink) return;
    
    setSendingEmail(true);
    try {
      const attorneyName = emailAddress.split('@')[0].replace(/[._-]/g, ' ');
      
      const result = await awsEmailService.sendProFormaLinkEmail({
        recipientEmail: emailAddress,
        recipientName: attorneyName,
        matterTitle: workTitle,
        linkUrl: generatedLink,
        expiresAt: expiresAt || undefined
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      await supabase
        .from('proforma_requests')
        .update({
          link_sent_at: new Date().toISOString(),
          link_sent_to: emailAddress
        })
        .eq('id', proformaId);

      toast.success(`Link sent to ${emailAddress}`);
      setEmailAddress('');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  const openInNewTab = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank');
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleServicesChange = async (services: any[]) => {
    setSelectedServices(services);
    
    if (services.length > 0 && matterType) {
      try {
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
    setExpiresAt(null);
    setCopied(false);
    setIncludeRateCards(false);
    setSelectedServices([]);
    setEstimatedAmount(0);
    setMatterType('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Generate Pro Forma Link
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Work Title</h3>
            <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-metallic-gray-900 p-3 rounded-lg">{workTitle}</p>
          </div>

          {!generatedLink ? (
            <div>
              <div className="text-center mb-6">
                <ExternalLink className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Generate Attorney Link
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Create a secure link that attorneys can use to submit their pro forma request details.
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="includeRateCards"
                    checked={includeRateCards}
                    onChange={(e) => setIncludeRateCards(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                        <option value="">Select type...</option>
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
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          Estimated Amount: R {estimatedAmount.toLocaleString('en-ZA', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Link Generated Successfully</h3>
                </div>
                
                <div className="bg-neutral-50 dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 font-mono text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-metallic-gray-800 p-2 rounded border border-neutral-200 dark:border-metallic-gray-700 break-all">
                      {generatedLink}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="flex items-center gap-2 px-3 py-2 bg-neutral-600 dark:bg-metallic-gray-600 text-white rounded hover:bg-neutral-700 dark:hover:bg-metallic-gray-500 whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                  
                  {expiresAt && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Clock className="w-4 h-4" />
                      <span>Expires: {formatExpiryDate(expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Link via Email
                </h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="attorney@example.com"
                    className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={sendEmail}
                    disabled={!emailAddress || sendingEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {sendingEmail ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  The attorney will receive an email with the link to submit their pro forma details.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Instructions for Attorney</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Share this link with the instructing attorney</li>
                  <li>• The attorney can access the form without creating an account</li>
                  <li>• The link expires in 7 days for security</li>
                  <li>• Once submitted, you'll receive the pro forma request details</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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