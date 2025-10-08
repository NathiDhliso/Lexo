import React, { useState } from 'react';
import { X, Copy, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { proformaRequestService } from '../../services/api/proforma-request.service';
import { toast } from 'react-hot-toast';

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

  const generateLink = async () => {
    setLoading(true);
    try {
      const { token, expiresAt: expiry } = await proformaRequestService.generateToken(proformaId);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/pro-forma-request/${token}`;
      setGeneratedLink(link);
      setExpiresAt(expiry);
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setLoading(false);
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

  const handleClose = () => {
    setGeneratedLink(null);
    setExpiresAt(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Generate Pro Forma Link
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Work Title</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{workTitle}</p>
          </div>

          {!generatedLink ? (
            <div className="text-center">
              <div className="mb-6">
                <ExternalLink className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Create Shareable Link
                </h3>
                <p className="text-gray-600">
                  Generate a secure link that attorneys can use to submit their pro forma request details.
                  The link will be valid for 7 days.
                </p>
              </div>

              <button
                onClick={generateLink}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">Link Generated Successfully</h3>
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 font-mono text-sm text-gray-700 bg-white p-2 rounded border break-all">
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
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                  
                  {expiresAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Expires: {formatExpiryDate(expiresAt)}</span>
                    </div>
                  )}
                </div>
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
                  onClick={generateLink}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Generate New Link
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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