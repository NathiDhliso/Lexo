/**
 * Transfer To Business Modal
 * For transferring funds from trust account to business account
 * Requirements: 4.5
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trustAccountService } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';

interface TransferToBusinessModalProps {
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferToBusinessModal: React.FC<TransferToBusinessModalProps> = ({
  currentBalance,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [matters, setMatters] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    matterId: '',
    amount: '',
    reason: '',
    authorizationType: 'fee_earned' as 'invoice_payment' | 'fee_earned' | 'cost_reimbursement' | 'refund' | 'correction',
    invoiceId: '',
    transferDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadMatters();
  }, []);

  const loadMatters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('matters')
        .select('id, matter_name, matter_number')
        .eq('advocate_id', user.id)
        .in('status', ['active', 'pending'])
        .order('matter_name');

      if (error) throw error;
      setMatters(data || []);
    } catch (error) {
      console.error('Error loading matters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    
    if (!formData.matterId || !formData.amount || amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (amount > currentBalance) {
      toast.error(`Insufficient balance. Available: ${formatRand(currentBalance)}`);
      return;
    }

    setLoading(true);

    try {
      await trustAccountService.transferToBusinessAccount({
        matterId: formData.matterId,
        amount,
        reason: formData.reason,
        authorizationType: formData.authorizationType,
        invoiceId: formData.invoiceId || undefined,
        transferDate: formData.transferDate,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error transferring funds:', error);
      toast.error(error.message || 'Failed to transfer funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-2xl w-full">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
              Transfer to Business Account
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Available Balance:</strong> {formatRand(currentBalance)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Matter *
            </label>
            <select
              value={formData.matterId}
              onChange={(e) => setFormData({ ...formData, matterId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              required
            >
              <option value="">Select matter...</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.matter_number} - {matter.matter_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Transfer Amount (R) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={currentBalance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Authorization Type *
            </label>
            <select
              value={formData.authorizationType}
              onChange={(e) => setFormData({ ...formData, authorizationType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              required
            >
              <option value="fee_earned">Fee Earned</option>
              <option value="invoice_payment">Invoice Payment</option>
              <option value="cost_reimbursement">Cost Reimbursement</option>
              <option value="refund">Refund</option>
              <option value="correction">Correction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              placeholder="e.g., Transfer for invoice #INV-2025-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Transfer Date *
            </label>
            <input
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-metallic-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-metallic-gray-700 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Transfer Funds</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
