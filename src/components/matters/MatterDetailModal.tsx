import React, { useState, useEffect } from 'react';
import { X, Edit, User, Building2, Phone, Mail, Calendar, DollarSign, FileText, Briefcase, Clock, Wallet, TrendingUp, FolderOpen, CheckSquare } from 'lucide-react';
import { Button } from '../design-system/components';
import { TimeEntryList } from '../time-entries/TimeEntryList';
import { CreateRetainerModal } from '../retainer/CreateRetainerModal';
import { DepositFundsModal } from '../retainer/DepositFundsModal';
import { DrawdownModal } from '../retainer/DrawdownModal';
import { RefundModal } from '../retainer/RefundModal';
import { TransactionHistory } from '../retainer/TransactionHistory';
import { CreateAmendmentModal } from '../scope/CreateAmendmentModal';
import { AmendmentHistory } from '../scope/AmendmentHistory';
import { DocumentsTab } from './DocumentsTab';
import { PartnerApprovalModal } from '../partner/PartnerApprovalModal';
import { supabase } from '../../lib/supabase';
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
  const [activeTab, setActiveTab] = useState<'details' | 'time' | 'retainer' | 'scope' | 'documents'>('details');
  const [showRetainerModal, setShowRetainerModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDrawdownModal, setShowDrawdownModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [retainer, setRetainer] = useState<any>(null);
  const [loadingRetainer, setLoadingRetainer] = useState(false);
  const [hasTimeEntries, setHasTimeEntries] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);

  useEffect(() => {
    if (matter?.id) {
      loadRetainer();
    }
  }, [matter?.id]);

  const loadRetainer = async () => {
    if (!matter?.id) return;
    setLoadingRetainer(true);
    try {
      const { data, error } = await supabase
        .from('retainers')
        .select('*')
        .eq('matter_id', matter.id)
        .eq('status', 'active')
        .single();
      
      if (!error && data) {
        setRetainer(data);
      }
    } catch (err) {
      console.error('Error loading retainer:', err);
    } finally {
      setLoadingRetainer(false);
    }
  };

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
              onClick={() => setActiveTab('retainer')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'retainer'
                  ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Retainer & Trust
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
          <div className="px-6 py-3 flex gap-2">
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Submit for Approval
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
          ) : activeTab === 'retainer' ? (
            <div className="space-y-4">
              {loadingRetainer ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600 dark:text-neutral-400">Loading retainer...</p>
                </div>
              ) : !retainer ? (
                <div className="text-center py-8">
                  <Wallet className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    No Retainer Agreement
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Create a retainer agreement to manage trust account funds for this matter.
                  </p>
                  <button
                    onClick={() => setShowRetainerModal(true)}
                    className="px-6 py-3 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 transition-colors"
                  >
                    Create Retainer Agreement
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Trust Account Balance</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Retainer Type: {retainer.retainer_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          R {(retainer.balance || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Available</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDepositModal(true)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Deposit Funds
                      </button>
                      <button
                        onClick={() => setShowDrawdownModal(true)}
                        className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Drawdown Funds
                      </button>
                      <button
                        onClick={() => setShowRefundModal(true)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Refund
                      </button>
                    </div>
                  </div>
                  <TransactionHistory retainerId={retainer.id} />
                </>
              )}
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

      {showRetainerModal && matter && (
        <CreateRetainerModal
          matterId={matter.id}
          matterTitle={matter.title}
          onClose={() => setShowRetainerModal(false)}
          onSuccess={() => {
            loadRetainer();
            setShowRetainerModal(false);
          }}
        />
      )}

      {showDepositModal && retainer && (
        <DepositFundsModal
          retainerId={retainer.id}
          currentBalance={retainer.balance || 0}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            loadRetainer();
            setShowDepositModal(false);
          }}
        />
      )}

      {showDrawdownModal && retainer && (
        <DrawdownModal
          retainerId={retainer.id}
          currentBalance={retainer.balance || 0}
          onClose={() => setShowDrawdownModal(false)}
          onSuccess={() => {
            loadRetainer();
            setShowDrawdownModal(false);
          }}
        />
      )}

      {showRefundModal && retainer && (
        <RefundModal
          retainerId={retainer.id}
          currentBalance={retainer.balance || 0}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            loadRetainer();
            setShowRefundModal(false);
          }}
        />
      )}

      {showAmendmentModal && matter && (
        <CreateAmendmentModal
          matterId={matter.id}
          matterTitle={matter.title}
          currentEstimatedCost={matter.estimated_fee || 0}
          currentWIP={matter.wip_value || 0}
          onClose={() => setShowAmendmentModal(false)}
          onSuccess={() => {
            setShowAmendmentModal(false);
          }}
        />
      )}

      {showApprovalModal && matter && (
        <PartnerApprovalModal
          matterId={matter.id}
          matterTitle={matter.title}
          wipValue={matter.wip_value || 0}
          estimatedFee={matter.estimated_fee || 0}
          hasRetainer={!!retainer}
          hasTimeEntries={hasTimeEntries}
          hasInvoice={hasInvoice}
          matterStatus={matter.status}
          onClose={() => setShowApprovalModal(false)}
          onSuccess={() => {
            setShowApprovalModal(false);
            toast.success('Submitted for partner approval');
          }}
        />
      )}
    </div>
  );
};
