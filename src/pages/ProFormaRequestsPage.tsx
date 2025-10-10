import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle, ArrowRight, Link, Undo2, Download } from 'lucide-react';
import { proformaRequestService } from '../services/api/proforma-request.service';
import { matterConversionService } from '../services/api/matter-conversion.service';
import { proFormaPDFService } from '../services/proforma-pdf.service';
import { LoadingSpinner, Button, EmptyState, Badge, SkeletonCard } from '../components/design-system/components';
import { NewProFormaModal } from '../components/proforma/NewProFormaModal';
import { CreateProFormaModal } from '../components/proforma/CreateProFormaModal';
import { ConvertProFormaModal } from '../components/matters/ConvertProFormaModal';
import { ProFormaLinkModal } from '../components/proforma/ProFormaLinkModal';
import { useAuth } from '../hooks/useAuth';
import { Database } from '../../types/database';
import type { Page } from '../types';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { formatRand } from '../lib/currency';
import { formatSADate, calculateVAT } from '../lib/sa-legal-utils';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedProFormaId, setSelectedProFormaId] = useState<string | null>(null);
  const [selectedProFormaTitle, setSelectedProFormaTitle] = useState<string>('');
  const [filter, setFilter] = useState<ProFormaRequestStatus[]>(['draft', 'sent', 'accepted', 'converted']);
  const [selectedProForma, setSelectedProForma] = useState<any | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

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
      setTimeout(() => {
        loadRequests();
      }, 500);
    } catch (error) {
      console.error('Error reversing conversion:', error);
    }
  };

  const handleDownloadPDF = async (request: ProFormaRequest) => {
    try {
      const { data: advocate, error } = await supabase
        .from('advocates')
        .select('full_name, practice_number, email, phone_number')
        .eq('id', user?.id)
        .single();

      if (error || !advocate) {
        toast.error('Failed to load advocate information');
        return;
      }

      await proFormaPDFService.downloadProFormaPDF(request, {
        full_name: advocate.full_name,
        practice_number: advocate.practice_number,
        email: advocate.email || undefined,
        phone: advocate.phone_number || undefined,
      });

      toast.success('Pro forma PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
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
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Pro Forma
          </Button>
          <Button variant="secondary" onClick={() => setShowNewModal(true)}>
            <Link className="w-5 h-5 mr-2" />
            Generate Link
          </Button>
        </div>
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
        <div className="grid gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pro forma requests found"
          description="Create your first pro forma to send quotes and estimates to attorneys before creating matters."
          action={
            <Button variant="primary" onClick={() => setShowNewModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Pro Forma
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {request.status && getStatusIcon(request.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-neutral-100">
                        {request.work_title}
                      </h3>
                      {request.status && getStatusBadge(request.status)}
                      {request.status === 'sent' && request.responded_at && (
                        <Badge variant="info" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Attorney Responded
                        </Badge>
                      )}
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
                      <div className="mt-3 p-3 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/10 rounded-lg border border-mpondo-gold-200 dark:border-mpondo-gold-800">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">Estimated Amount (excl. VAT):</span>
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                              {formatRand(calculateVAT(request.estimated_amount).subtotal / 1.15)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">VAT (15%):</span>
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                              {formatRand(request.estimated_amount * 0.15 / 1.15)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-mpondo-gold-200 dark:border-mpondo-gold-800">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Total (incl. VAT):</span>
                            <span className="font-bold text-lg text-mpondo-gold-700 dark:text-mpondo-gold-400">
                              {formatRand(request.estimated_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {request.created_at && (
                      <p className="text-xs text-gray-500 dark:text-neutral-500 mt-3">
                        Created {formatSADate(new Date(request.created_at))}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(request.status === 'draft' || request.status === 'sent' || request.status === 'accepted') && request.estimated_amount && (
                    <Button size="sm" variant="secondary" onClick={() => handleDownloadPDF(request)}>
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </Button>
                  )}
                  {request.status === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProFormaId(request.id);
                          setSelectedProFormaTitle(request.work_title || '');
                          setShowLinkModal(true);
                        }}
                      >
                        <Link className="w-4 h-4 mr-1" />
                        Generate Link
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleSendQuote(request.id)}
                      >
                        Send Quote
                      </Button>
                    </>
                  )}
                  {request.status === 'sent' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAccept(request.id)}
                    >
                      Mark Accepted
                    </Button>
                  )}
                  {request.status === 'accepted' && !request.converted_matter_id && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedProFormaId(request.id);
                        setShowConvertModal(true);
                      }}
                    >
                      Convert to Matter
                    </Button>
                  )}
                  {request.converted_matter_id && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReverseConversion(request)}
                        title="Reverse conversion back to pro forma"
                      >
                        <Undo2 className="w-4 h-4 mr-1" />
                        Reverse
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate?.('matters')}
                      >
                        View Matter
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProFormaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(proforma) => {
          setSelectedProForma(proforma);
          setShowSendModal(true);
        }}
      />

      <NewProFormaModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => {
          setShowNewModal(false);
          loadRequests();
        }}
      />

      {selectedProForma && showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Send Pro Forma to Client</h3>
            <p className="mb-4">Send this pro forma to {selectedProForma.clientName}?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.success('Pro forma sent to client');
                  setShowSendModal(false);
                  setShowCreateModal(false);
                  setSelectedProForma(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSelectedProForma(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProFormaId && (
        <ConvertProFormaModal
          proformaId={selectedProFormaId}
          isOpen={showConvertModal}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedProFormaId(null);
          }}
          onSuccess={() => {
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
