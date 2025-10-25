import React, { useState, useEffect } from 'react';
import { Receipt, Trash2, Plus, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../design-system/components';
import { QuickDisbursementModal } from './QuickDisbursementModal';
import { supabase } from '../../lib/supabase';

interface Expense {
  id: string;
  matter_id: string;
  description: string;
  amount: number;
  disbursement_type: string;
  payment_date: string;
  receipt_number?: string;
  vendor_name?: string;
  invoice_id?: string;
}

interface ExpenseListProps {
  matterId: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ matterId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('matter_id', matterId)
        .is('invoice_id', null)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [matterId]);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) throw error;
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  const formatDisbursementType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Expenses</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </Button>
      </div>

      {expenses.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Expenses</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {expenses.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                R{calculateTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <Receipt className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">No expenses logged yet</p>
          <Button variant="primary" onClick={handleAdd} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Log Your First Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 hover:border-green-300 dark:hover:border-green-700 p-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(expense.payment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      <Receipt className="w-4 h-4" />
                      {formatDisbursementType(expense.disbursement_type)}
                    </div>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-2">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-neutral-400" />
                    {expense.vendor_name && (
                      <>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {expense.vendor_name}
                        </span>
                        <span className="text-neutral-400">•</span>
                      </>
                    )}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      R{expense.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDelete(expense)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuickDisbursementModal
        matterId={matterId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          loadExpenses();
        }}
      />
    </div>
  );
};
