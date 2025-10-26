import React, { useState, useCallback, useEffect } from 'react';
import { X, FileText, User, Mail, Phone, Building, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { proformaRequestService } from '../../services/api/proforma-request.service';
import { AsyncButton } from '../ui/AsyncButton';
import { Button } from '../design-system/components';
import { Database } from '../../../types/database';
import { toast } from 'react-hot-toast';
import type { Page } from '../../types';

type ProFormaRequest = Database['public']['Tables']['proforma_requests']['Row'];

interface ReviewProFormaRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProFormaRequest;
  onSuccess: () => void;
  onNavigate?: (page: Page, data?: any) => void;
}

export const ReviewProFormaRequestModal: React.FC<ReviewProFormaRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess,
  onNavigate,
}) => {
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showDeclineConfirm) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, showDeclineConfirm, onClose]);

  const handleCreateQuote = () => {
    setIsProcessing(true);
    // Navigate to MatterWorkbenchPage to create pro forma using Universal Toolset
    // This follows Path A: "Quote First" workflow
    if (onNavigate) {
      toast.success('Opening Matter Workbench to create pro forma quote...');
      onNavigate('matter-workbench', {
        mode: 'create-proforma',
        requestId: request.id,
        matterName: request.work_title || '',
        clientName: request.instructing_attorney_name || '',
        matterSummary: request.work_description || '',
        matterType: (request as any).matter_type || '',
        email: request.instructing_attorney_email,
        firm: request.instructing_firm,
      });
      onClose();
    } else {
      setIsProcessing(false);
      toast.error('Navigation not available');
    }
  };

  const handleDeclineReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDeclineReason(e.target.value);
  }, []);

  const handleDecline = async () => {
    try {
      await proformaRequestService.updateStatus(request.id, 'declined');
      toast.success('Request declined');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !showDeclineConfirm) {
            onClose();
          }
        }}
      >
        <div className="bg-white dark:bg-metallic-gray-800 rounded-xl theme-shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-5 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-metallic-gray-900 dark:to-metallic-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 rounded-xl">
                <FileText className="w-6 h-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Review Pro Forma Request
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 font-mono">
                  {request.quote_number}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Attorney Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Attorney Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Name:</span>
                    <p className="text-blue-900 dark:text-blue-100 mt-1">
                      {request.instructing_attorney_name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Email:</span>
                    <p className="text-blue-900 dark:text-blue-100 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {request.instructing_attorney_email || 'Not provided'}
                    </p>
                  </div>
                  {request.instructing_attorney_phone && (
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Phone:</span>
                      <p className="text-blue-900 dark:text-blue-100 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {request.instructing_attorney_phone}
                      </p>
                    </div>
                  )}
                  {request.instructing_firm && (
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Law Firm:</span>
                      <p className="text-blue-900 dark:text-blue-100 mt-1 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {request.instructing_firm}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Case Information */}
              <div className="bg-white dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Case Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Work Title:</span>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {request.work_title || 'Not provided'}
                    </p>
                  </div>
                  {request.work_description && (
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Description:</span>
                      <p className="text-neutral-900 dark:text-neutral-100 mt-1 whitespace-pre-wrap">
                        {request.work_description}
                      </p>
                    </div>
                  )}
                  {request.urgency && (
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Urgency:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${request.urgency === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : request.urgency === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-metallic-gray-800 text-gray-700 dark:text-neutral-300'
                          }`}
                      >
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-neutral-50 dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  {request.created_at && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Created:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                  )}
                  {request.responded_at && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Submitted:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {formatDate(request.responded_at)}
                      </span>
                    </div>
                  )}
                  {request.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Expires:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {formatDate(request.expires_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Guidance */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Next Steps</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>✓ Review the case details above</li>
                  <li>✓ Click "Create Pro Forma Quote" to generate pricing</li>
                  <li>✓ Use AI to analyze the case and suggest services</li>
                  <li>✓ Download the PDF and send it to the attorney</li>
                  <li>✓ Or decline if you cannot take the case</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 dark:border-metallic-gray-700 px-6 py-5 flex justify-between gap-3 bg-neutral-50 dark:bg-metallic-gray-900">
            <Button
              variant="outline"
              onClick={() => setShowDeclineConfirm(true)}
              disabled={isProcessing}
              className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 transition-all"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline Request
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isProcessing}
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateQuote}
                disabled={isProcessing}
                loading={isProcessing}
                className="min-w-[200px]"
              >
                {!isProcessing && <CheckCircle className="w-4 h-4 mr-2" />}
                Create Pro Forma Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl theme-shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Decline Request?
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This action cannot be undone. The attorney will be notified.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Reason for declining (optional):
              </label>
              <textarea
                value={declineReason}
                onChange={handleDeclineReasonChange}
                rows={3}
                className="w-full px-3 py-2.5 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                placeholder="e.g., Conflict of interest, outside area of expertise, insufficient information..."
                maxLength={500}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {declineReason.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeclineConfirm(false);
                  setDeclineReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <AsyncButton
                onAsyncClick={handleDecline}
                variant="danger"
                className="flex-1"
                successMessage="Request declined successfully"
                errorMessage="Failed to decline request"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline Request
              </AsyncButton>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Replace with SimpleProFormaModal or remove if obsolete */}
      {/* CreateProFormaModal has been deleted */}
    </>
  );
};
