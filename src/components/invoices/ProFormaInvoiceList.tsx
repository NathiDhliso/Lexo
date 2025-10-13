import React, { useState, useEffect } from 'react';
import { Plus, FileCheck, AlertCircle, ArrowRight, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { proformaRequestService } from '../../services/api/proforma-request.service';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import { NewProFormaModal } from '../proforma/NewProFormaModal';
import { ConvertProFormaModal } from '../matters/ConvertProFormaModal';

interface ProFormaRequest {
  id: string;
  status: string | null;
  estimated_amount?: number | null;
  work_description?: string | null;
  instructing_attorney_name?: string | null;
  instructing_firm?: string | null;
  created_at: string | null;
  sent_at?: string | null;
  responded_at?: string | null;
  expires_at?: string | null;
  converted_matter_id?: string | null;
}

export const ProFormaInvoiceList: React.FC = () => {
  const [proFormaRequests, setProFormaRequests] = useState<ProFormaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedProForma, setSelectedProForma] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadProFormaRequests();
  }, [filterStatus]);

  const loadProFormaRequests = async () => {
    setLoading(true);
    try {
      const filters = filterStatus !== 'all' ? { status: [filterStatus as any] } : undefined;
      const data = await proformaRequestService.list(filters);
      setProFormaRequests(data);
    } catch (error) {
      console.error('Error loading pro forma requests:', error);
      toast.error('Failed to load pro forma requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300', icon: FileCheck, label: 'Draft' };
      case 'sent':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Clock, label: 'Sent' };
      case 'accepted':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle, label: 'Accepted' };
      case 'declined':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle, label: 'Declined' };
      case 'expired':
        return { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: AlertCircle, label: 'Expired' };
      case 'converted':
        return { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: ArrowRight, label: 'Converted' };
      default:
        return { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300', icon: FileCheck, label: status };
    }
  };

  const handleConvertToMatter = (proFormaId: string) => {
    setSelectedProForma(proFormaId);
    setShowConvertModal(true);
  };

  const handleConversionSuccess = () => {
    toast.success('Pro forma converted to matter successfully!');
    setShowConvertModal(false);
    setSelectedProForma(null);
    loadProFormaRequests();
  };

  const handleViewDetails = (proFormaId: string) => {
    // Navigate to pro forma details page or open details modal
    toast.success(`Opening details for pro forma ${proFormaId}`);
    // TODO: Implement navigation or modal for pro forma details
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const stats = {
    total: proFormaRequests.length,
    draft: proFormaRequests.filter(p => p.status === 'draft').length,
    sent: proFormaRequests.filter(p => p.status === 'sent').length,
    accepted: proFormaRequests.filter(p => p.status === 'accepted').length,
    totalValue: proFormaRequests.reduce((sum, p) => sum + (p.estimated_amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Pro Forma Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Requests</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Sent</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{stats.sent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Accepted</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Value</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{formatRand(stats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Filter:</span>
        {['all', 'draft', 'sent', 'accepted', 'converted', 'declined'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {proFormaRequests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
            <FileCheck className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No pro forma requests yet
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Create your first pro forma request to get started
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Pro Forma Request
            </button>
          </div>
        ) : (
          proFormaRequests.map((proForma) => {
            const statusConfig = getStatusConfig(proForma.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={proForma.id}
                className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 p-6 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      {proForma.estimated_amount && (
                        <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatRand(proForma.estimated_amount)}
                        </span>
                      )}
                    </div>

                    {proForma.instructing_attorney_name && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {proForma.instructing_attorney_name}
                        </span>
                        {proForma.instructing_firm && (
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
                            • {proForma.instructing_firm}
                          </span>
                        )}
                      </div>
                    )}

                    {proForma.work_description && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-2">
                        {proForma.work_description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created: {formatDate(proForma.created_at)}
                      </div>
                      {proForma.sent_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Sent: {formatDate(proForma.sent_at)}
                        </div>
                      )}
                      {proForma.expires_at && proForma.status === 'sent' && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Expires: {formatDate(proForma.expires_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {proForma.status === 'accepted' && !proForma.converted_matter_id && (
                      <button
                        onClick={() => handleConvertToMatter(proForma.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Convert to Matter
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(proForma.id)}
                      className="px-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showNewModal && (
        <NewProFormaModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            loadProFormaRequests();
          }}
        />
      )}

      {showConvertModal && selectedProForma && (
        <ConvertProFormaModal
          proformaId={selectedProForma}
          isOpen={showConvertModal}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedProForma(null);
          }}
          onSuccess={handleConversionSuccess}
        />
      )}
    </div>
  );
};
