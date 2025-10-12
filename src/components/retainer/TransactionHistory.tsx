import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../design-system/components';

interface Transaction {
  id: string;
  transaction_type: 'deposit' | 'drawdown' | 'refund';
  amount: number;
  description: string;
  reference: string;
  transaction_date: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

interface TransactionHistoryProps {
  retainerId: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ retainerId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [retainerId]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trust_transactions')
        .select('*')
        .eq('retainer_id', retainerId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'drawdown':
        return <ArrowUpCircle className="w-5 h-5 text-amber-500" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-purple-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500 dark:text-neutral-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600 dark:text-green-400';
      case 'drawdown':
        return 'text-amber-600 dark:text-amber-400';
      case 'refund':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-neutral-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
          Transaction History
        </h3>
        <button
          onClick={loadTransactions}
          className="text-sm text-blue-600 dark:text-mpondo-gold-500 hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700 rounded-lg p-4 hover:theme-shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getTransactionIcon(transaction.transaction_type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-neutral-100 capitalize">
                      {transaction.transaction_type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-neutral-500">
                      {new Date(transaction.transaction_date).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">
                    {transaction.description}
                  </p>
                  {transaction.reference && (
                    <p className="text-xs text-gray-500 dark:text-neutral-500">
                      Ref: {transaction.reference}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right ml-4">
                <p className={`text-lg font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                  {transaction.transaction_type === 'deposit' ? '+' : '-'}
                  R {transaction.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
                <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                  <p>Before: R {transaction.balance_before.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                  <p>After: R {transaction.balance_after.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
