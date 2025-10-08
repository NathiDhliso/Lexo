import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle, ArrowRight, Link, Undo2 } from 'lucide-react';
import { proformaRequestService } from '../services/api/proforma-request.service';
import { matterConversionService } from '../services/api/matter-conversion.service';
import { LoadingSpinner } from '../components/design-system/components';
import { NewProFormaModal } from '../components/proforma/NewProFormaModal';
import { ConvertProFormaModal } from '../components/matters/ConvertProFormaModal';
import { ProFormaLinkModal } from '../components/proforma/ProFormaLinkModal';
import { useAuth } from '../hooks/useAuth';
import { Database } from '../../types/database';
import type { Page } from '../types';
import { toast } from 'react-hot-toast';

type ProFormaRequest = Database['public']['Tables']['proforma_requests']['Row'];
type ProFormaRequestStatus = Database['public']['Enums']['proforma_request_status'];

interface ProFormaRequestsPageProps {
  onNavigate?: (page: Page) => void;
}

export const ProFormaRequestsPage: React.FC<ProFormaRequestsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProFormaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedProFormaId, setSelectedProFormaId] = useState<string | null>(null);
  const [selectedProFormaTitle, setSelectedProFormaTitle] = useState<string>('');
  const [filter, setFilter] = useState<ProFormaRequestStatus[]>(['draft', 'sent', 'accepted', 'converted']);

  useEffect(() => {
    loadRequests();
  }, [filter, user]);

  const loadRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await proformaRequestService.list({
        status: filter,
        advocateId: user.id,
      });
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ProFormaRequestStatus) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-5 h-5 text-gray-400" />;
      case 'sent':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'converted':
        return <ArrowRight className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ProFormaRequestStatus) => {
    const styles: Record<ProFormaRequestStatus, string> = {
      draft: 'bg-gray-100 dark:bg-metallic-gray-800 text-gray-700 dark:text-neutral-300',
      sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      declined: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      expired: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      converted: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string | null) => {
    if (!urgency) return null;

    const styles: Record<string, string> = {
      low: 'bg-gray-100 dark:bg-metallic-gray-800 text-gray-700 dark:text-neutral-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[urgency]}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
      </span>
    );
  };

  const handleSendQuote = async (id: string) => {
    try {
      await proformaRequestService.updateStatus(id, 'sent');
      loadRequests();
    } catch (error) {
      console.error('Failed to send quote:', error);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await proformaRequestService.updateStatus(id, 'accepted');
      loadRequests();
    } catch (error) {
      console.error('Failed to accept quote:', error);
    }
  };

  const handleReverseConversion = async (request: ProFormaRequest) => {
    if (!request.converted_matter_id) {
      toast.error('This pro forma has not been converted to a matter');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reverse the conversion for "${request.work_title}"?\n\n` +
      'This will:\n' +
      '• Delete the associated matter permanently\n' +
      '• Restore this pro forma to "accepted" status\n' +
      '• Allow the pro forma to be converted again\n\n' +
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await matterConversionService.reverseConversion(request.converted_matter_id);
      // Add a small delay to ensure database changes are propagated
      setTimeout(() => {
        loadRequests();
      }, 500);
    } catch (error) {
      console.error('Error reversing conversion:', error);
      // Error is already handled in the service with toast
    }
  };

  return (
    <div className="p-6 min-h-screen bg-neutral-50 dark:bg-metallic-gray-950">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Pro Forma Requests</h1>
          <p className="text-gray-600 dark:text-neutral-400 mt-1">
            Manage quotes and estimates before creating matters
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Link
        </button>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        {(['draft', 'sent', 'accepted', 'declined', 'converted', 'expired'] as ProFormaRequestStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => {
              if (filter.includes(status)) {
                setFilter(filter.filter((s) => s !== status));
              } else {
                setFilter([...filter, status]);
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter.includes(status)
                ? 'bg-blue-600 dark:bg-mpondo-gold-600 text-white'
                : 'bg-gray-100 dark:bg-metallic-gray-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-metallic-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-metallic-gray-900 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-neutral-400">No pro forma requests found</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="mt-4 text-blue-600 dark:text-mpondo-gold-400 hover:text-blue-700 dark:hover:text-mpondo-gold-300 font-medium"
          >
            Create your first pro forma
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-neutral-100">
                        {request.work_title}
                      </h3>
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">
                      {request.quote_number}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      <span className="font-medium">Attorney:</span>{' '}
                      {request.instructing_attorney_name}
                      {request.instructing_firm && ` (${request.instructing_firm})`}
                    </p>
                    {request.work_description && (
                      <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">
                        {request.work_description}
                      </p>
                    )}
                    {request.estimated_amount && (
                      <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mt-2">
                        R {request.estimated_amount.toLocaleString('en-ZA', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-neutral-500 mt-2">
                      Created {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {request.status === 'draft' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedProFormaId(request.id);
                          setSelectedProFormaTitle(request.work_title);
                          setShowLinkModal(true);
                        }}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm whitespace-nowrap flex items-center gap-1"
                      >
                        <Link className="w-3 h-3" />
                        Generate Link
                      </button>
                      <button
                        onClick={() => handleSendQuote(request.id)}
                        className="px-3 py-1 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 text-sm whitespace-nowrap transition-colors"
                      >
                        Send Quote
                      </button>
                    </>
                  )}
                  {request.status === 'sent' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedProFormaId(request.id);
                          setSelectedProFormaTitle(request.work_title);
                          setShowLinkModal(true);
                        }}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm whitespace-nowrap flex items-center gap-1"
                      >
                        <Link className="w-3 h-3" />
                        Generate Link
                      </button>
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm whitespace-nowrap transition-colors"
                      >
                        Mark Accepted
                      </button>
                    </>
                  )}
                  {request.status === 'accepted' && !request.converted_matter_id && (
                    <button 
                      onClick={() => {
                        setSelectedProFormaId(request.id);
                        setShowConvertModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                    >
                      Convert to Matter
                    </button>
                  )}
                  {request.converted_matter_id && (
                    <>
                      <button
                        onClick={() => handleReverseConversion(request)}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm whitespace-nowrap flex items-center gap-1"
                        title="Reverse conversion back to pro forma"
                      >
                        <Undo2 className="w-3 h-3" />
                        Reverse Conversion
                      </button>
                      <button
                        onClick={() => onNavigate?.('matters')}
                        className="px-3 py-1 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 text-sm whitespace-nowrap transition-colors"
                      >
                        View Matter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewProFormaModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => {
          setShowNewModal(false);
          loadRequests();
        }}
      />

      {selectedProFormaId && (
        <ConvertProFormaModal
          proformaId={selectedProFormaId}
          isOpen={showConvertModal}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedProFormaId(null);
          }}
          onSuccess={(matterId) => {
            setShowConvertModal(false);
            setSelectedProFormaId(null);
            loadRequests();
            onNavigate?.('matters');
          }}
        />
      )}

      {selectedProFormaId && (
        <ProFormaLinkModal
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedProFormaId(null);
            setSelectedProFormaTitle('');
          }}
          proformaId={selectedProFormaId}
          workTitle={selectedProFormaTitle}
        />
      )}
    </div>
  );
};
