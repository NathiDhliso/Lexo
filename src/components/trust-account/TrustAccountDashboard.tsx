/**
 * Trust Account Dashboard
 * Main dashboard for trust account management with LPC compliance
 * Requirements: 4.1, 4.2, 4.3
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  Plus,
  ArrowRightLeft,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { trustAccountService } from '../../services/api';
import { formatRand } from '../../lib/currency';
import { RecordTrustReceiptModal } from './RecordTrustReceiptModal';
import { TransferToBusinessModal } from './TransferToBusinessModal';
import { TrustAccountReconciliationReport } from './TrustAccountReconciliationReport';

export const TrustAccountDashboard: React.FC = () => {
  const [trustAccount, setTrustAccount] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_violation, _setViolation] = useState<any>(null);
  
  // Modal states
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReconciliationReport, setShowReconciliationReport] = useState(false);

  useEffect(() => {
    loadTrustAccountData();
    checkViolations();
  }, []);

  const loadTrustAccountData = async () => {
    try {
      setLoading(true);
      const account = await trustAccountService.getTrustAccount();
      setTrustAccount(account);

      const transactions = await trustAccountService.getTrustTransactions({
        isReconciled: false,
      });
      setRecentTransactions(transactions.slice(0, 10));
    } catch (error) {
      console.error('Error loading trust account:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkViolations = async () => {
    try {
      const result = await trustAccountService.checkForViolations();
      if (result.hasViolation) {
        _setViolation(result);
      }
    } catch (error) {
      console.error('Error checking violations:', error);
    }
  };

  const handleReceiptSuccess = () => {
    loadTrustAccountData();
    setShowReceiptModal(false);
  };

  const handleTransferSuccess = () => {
    loadTrustAccountData();
    setShowTransferModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trustAccount) {
    return (
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-400 dark:text-neutral-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-neutral-400">Trust account not configured</p>
        </div>
      </div>
    );
  }

  const isLowBalance = trustAccount.current_balance < trustAccount.low_balance_threshold;
  const hasNegativeBalance = trustAccount.current_balance < 0;

  return (
    <div className="space-y-6">
      {/* Critical Negative Balance Alert (Requirement 4.7) */}
      {hasNegativeBalance && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <XCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                CRITICAL: Trust Account Violation
              </h3>
              <p className="text-red-800 dark:text-red-200 mb-4">
                Your trust account has a negative balance of <span className="font-bold">{formatRand(Math.abs(trustAccount.current_balance))}</span>.
                This violates Legal Practice Council (LPC) regulations. Immediate action is required.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Deposit Funds Now
                </button>
                <a
                  href="tel:your-compliance-hotline"
                  className="px-4 py-2 bg-white dark:bg-metallic-gray-800 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium"
                >
                  Contact Compliance
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Balance Warning */}
      {!hasNegativeBalance && isLowBalance && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Low Trust Account Balance
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-200">
                Balance is below threshold of {formatRand(trustAccount.low_balance_threshold)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Trust Account Balance</p>
            <h2 className="text-4xl font-bold">
              {formatRand(trustAccount.current_balance)}
            </h2>
          </div>
          <div className={`p-3 rounded-full ${
            hasNegativeBalance ? 'bg-red-500' :
            isLowBalance ? 'bg-orange-500' : 
            'bg-green-500'
          }`}>
            <DollarSign className="h-8 w-8" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-100">
            {trustAccount.lpc_compliant ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>LPC Compliant</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <span>Non-Compliant</span>
              </>
            )}
          </div>
          <div className="text-sm text-blue-100">
            Last Reconciled: {
              trustAccount.last_reconciliation_date 
                ? new Date(trustAccount.last_reconciliation_date).toLocaleDateString()
                : 'Never'
            }
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowReceiptModal(true)}
          disabled={hasNegativeBalance}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Record Receipt</span>
        </button>

        <button
          onClick={() => setShowTransferModal(true)}
          disabled={hasNegativeBalance || trustAccount.current_balance === 0}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRightLeft className="h-5 w-5" />
          <span className="font-medium">Transfer Funds</span>
        </button>

        <button
          onClick={() => setShowReconciliationReport(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium">Reconcile</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-metallic-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
              Recent Transactions
            </h3>
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              {recentTransactions.length} unreconciled
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-metallic-gray-700">
          {recentTransactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-neutral-400">
              No recent transactions
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-metallic-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        transaction.transaction_type === 'deposit' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {transaction.transaction_type}
                      </span>
                      {transaction.receipt_number && (
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          {transaction.receipt_number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-neutral-100 font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.payment_method || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.transaction_type === 'deposit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatRand(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      Balance: {formatRand(transaction.balance_after)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
          Account Details
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500 dark:text-neutral-400">Bank</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-100">
              {trustAccount.bank_name}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-neutral-400">Account Holder</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-100">
              {trustAccount.account_holder_name}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-neutral-400">Account Number</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-100">
              {trustAccount.account_number}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-neutral-400">Branch Code</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-100">
              {trustAccount.branch_code || 'N/A'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Modals */}
      {showReceiptModal && (
        <RecordTrustReceiptModal
          onClose={() => setShowReceiptModal(false)}
          onSuccess={handleReceiptSuccess}
        />
      )}

      {showTransferModal && (
        <TransferToBusinessModal
          currentBalance={trustAccount.current_balance}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleTransferSuccess}
        />
      )}

      {showReconciliationReport && (
        <TrustAccountReconciliationReport
          onClose={() => setShowReconciliationReport(false)}
          onReconciled={loadTrustAccountData}
        />
      )}
    </div>
  );
};
