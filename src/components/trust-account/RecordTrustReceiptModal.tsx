/**
 * Record Trust Receipt Modal
 * For recording deposits into trust account with automatic receipt generation
 * Requirements: 4.2, 4.4
 */

import React, { useState, useEffect } from 'react';
import { X, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trustAccountService } from '../../services/api';
import { supabase } from '../../lib/supabase';

interface RecordTrustReceiptModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordTrustReceiptModal: React.FC<RecordTrustReceiptModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [matters, setMatters] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    matterId: '',
    clientId: '',
    amount: '',
    reference: '',
    description: '',
    paymentMethod: 'eft' as 'eft' | 'cash' | 'cheque' | 'card' | 'debit_order',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadMatters();
    loadClients();
  }, []);

  const loadMatters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('matters')
        .select('id, matter_name, matter_number, client:clients(full_name)')
        .eq('advocate_id', user.id)
        .in('status', ['active', 'pending'])
        .order('matter_name');

      if (error) throw error;
      setMatters(data || []);
    } catch (error) {
      console.error('Error loading matters:', error);
    }
  };

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('advocate_id', user.id)
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matterId) {
      toast.error('Please select a matter');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.description) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const { receiptNumber } = await trustAccountService.recordTrustReceipt({
        matterId: formData.matterId,
        clientId: formData.clientId || undefined,
        amount: parseFloat(formData.amount),
        reference: formData.reference || undefined,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        transactionDate: formData.transactionDate,
      });

      toast.success(
        <div>
          <p className="font-semibold">Trust Receipt Recorded</p>
          <p className="text-sm">Receipt No: {receiptNumber}</p>
        </div>
      );
      
      onSuccess();
    } catch (error: any) {
      console.error('Error recording receipt:', error);
      toast.error(error.message || 'Failed to record receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-metallic-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Receipt className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
              Record Trust Receipt
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Receipt Number:</strong> Will be auto-generated in format TR-YYYY-NNNN for LPC compliance
            </p>
          </div>

          {/* Matter Selection */}
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
                  {matter.client && ` (${matter.client.full_name})`}
                </option>
              ))}
            </select>
          </div>

          {/* Client Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Client (Optional)
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} {client.email && `(${client.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Deposit Amount (R) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              placeholder="0.00"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              required
            >
              <option value="eft">EFT / Electronic Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card Payment</option>
              <option value="debit_order">Debit Order</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reference / Transaction ID
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              placeholder="Bank reference or transaction ID"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              placeholder="e.g., Initial retainer deposit from client"
              required
            />
          </div>

          {/* Transaction Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Transaction Date *
            </label>
            <input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              required
            />
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  <span>Record Receipt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
