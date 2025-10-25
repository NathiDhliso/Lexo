import React, { useState } from 'react';
import { X, Edit, User, Building2, Phone, Mail, Calendar, DollarSign, FileText, Briefcase, Clock, TrendingUp, FolderOpen, CheckSquare } from 'lucide-react';
import { Button } from '../design-system/components';
import { TimeEntryList } from '../time-entries/TimeEntryList';
import { CreateAmendmentModal } from '../scope/CreateAmendmentModal';
import { AmendmentHistory } from '../scope/AmendmentHistory';
import { DocumentsTab } from '../documents/DocumentsTab';
import type { Matter } from '../../types';
import toast from 'react-hot-toast';

interface MatterDetailModalProps {
  matter: Matter | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (matter: Matter) => void;
}

export const MatterDetailModal: React.FC<MatterDetailModalProps> = ({
  matter,
  isOpen,
  onClose,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'time' | 'scope' | 'documents'>('details');
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);

  if (!isOpen || !matter) return null;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simplified view for NEW REQUEST matters
  if (matter.status === 'new_request') {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">New Matter Request</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Review and choose how to proceed</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Matter Title & Type */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{matter.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{matter.matter_type || 'General Matter'}</p>
            </div>

            {/* Brief Description */}
            {matter.description && (
              <div className="bg-neutral-50 dark:bg-metallic-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Brief Description
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{matter.description}</p>
              </div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Client</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.client_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Attorney</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.instructing_attorney || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Firm</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.instructing_firm || 'N/A'}</p>
              </div>
              {matter.court_case_number && (
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Case Number</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.court_case_number}</p>
                </div>
              )}
            </div>

            {/* Action Choice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">What would you like to do?</h4>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    // Navigate to pro forma page - this should be handled by parent
                    toast('Opening Pro Forma builder...', { icon: '📋' });
                  }}
                  className="w-full flex items-start gap-3 p-4 bg-white dark:bg-metallic-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Create Pro Forma</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Build detailed estimate for attorney approval (Path A)</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    // Accept brief - this should be handled by parent
                    toast('Opening Accept Brief modal...', { icon: '✅' });
                  }}
                  className="w-full flex items-start gap-3 p-4 bg-white dark:bg-metallic-gray-800 border-2 border-green-200 dark:border-green-700 rounded-lg hover:border-green-400 dark:hover:border-green-500 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Accept Brief</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Start work immediately with agreed fee (Path B)</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full detailed view for active/other matters
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-mpondo-gold-400" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Matter Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <div className="border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'time'
                  ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Time Entries
            </button>
            <button
              onClick={() => setActiveTab('scope')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'scope'
                  ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Scope & Amendments
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Documents
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'scope' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  Scope Amendments
                </h3>
                <button
                  onClick={() => setShowAmendmentModal(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 transition-colors"
                >
                  Create Amendment
                </button>
              </div>
              <AmendmentHistory matterId={matter.id} />
            </div>
          ) : activeTab === 'details' ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{matter.title}</h3>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  matter.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  matter.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                  matter.status === 'settled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                  'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300'
                }`}>
                  {matter.status}
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Ref: {matter.reference_number}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Client Information</h4>
                </div>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-neutral-600 dark:text-neutral-400">Name</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{matter.client_name}</dd>
                  </div>
                  {matter.client_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <dd className="text-neutral-700 dark:text-neutral-300">{matter.client_email}</dd>
                    </div>
                  )}
                  {matter.client_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <dd className="text-neutral-700 dark:text-neutral-300">{matter.client_phone}</dd>
                    </div>
                  )}
                  {matter.client_address && (
                    <div>
                      <dt className="text-neutral-600 dark:text-neutral-400">Address</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300">{matter.client_address}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Instructing Attorney</h4>
                </div>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-neutral-600 dark:text-neutral-400">Attorney</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{matter.instructing_attorney}</dd>
                  </div>
                  {matter.instructing_firm && (
                    <div>
                      <dt className="text-neutral-600 dark:text-neutral-400">Firm</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300">{matter.instructing_firm}</dd>
                    </div>
                  )}
                  {matter.instructing_attorney_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <dd className="text-neutral-700 dark:text-neutral-300">{matter.instructing_attorney_email}</dd>
                    </div>
                  )}
                  {matter.instructing_attorney_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <dd className="text-neutral-700 dark:text-neutral-300">{matter.instructing_attorney_phone}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {matter.description && (
              <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Description</h4>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{matter.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Matter Type</span>
                </div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{matter.matter_type}</p>
              </div>

              {matter.estimated_fee && (
                <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Estimated Fee</span>
                  </div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(matter.estimated_fee)}</p>
                </div>
              )}

              <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Created</span>
                </div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatDate(matter.created_at)}</p>
              </div>
            </div>
          </div>
        ) : activeTab === 'documents' ? (
          <DocumentsTab matterId={matter.id} />
        ) : (
          <TimeEntryList
            matterId={matter.id}
            matterTitle={matter.title}
            defaultRate={2000}
          />
        )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-metallic-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(matter)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Matter
          </Button>
        </div>
      </div>

      {/* Amendment Modal */}
      {showAmendmentModal && matter && (
        <CreateAmendmentModal
          matterId={matter.id}
          matterTitle={matter.title}
          currentEstimatedCost={matter.estimated_fee || 0}
          currentWIP={matter.wip_value || 0}
          onClose={() => setShowAmendmentModal(false)}
          onSuccess={() => {
            setShowAmendmentModal(false);
            toast.success('Amendment created successfully');
          }}
        />
      )}
    </div>
  );
};
