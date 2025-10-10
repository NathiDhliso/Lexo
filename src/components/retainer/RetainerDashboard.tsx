import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, Download } from 'lucide-react';
import { retainerService, type RetainerSummary } from '../../services/api';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface RetainerDashboardProps {
  matterId: string;
}

export const RetainerDashboard: React.FC<RetainerDashboardProps> = ({ matterId }) => {
  const [summary, setSummary] = useState<RetainerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRetainerSummary();
  }, [matterId]);

  const loadRetainerSummary = async () => {
    try {
      const retainer = await retainerService.getByMatterId(matterId);
      if (retainer) {
        const summaryData = await retainerService.getSummary(retainer.id);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error loading retainer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No retainer agreement for this matter</p>
        </div>
      </div>
    );
  }

  const { retainer, totalDeposits, totalDrawdowns, currentBalance, percentageRemaining, isLowBalance } = summary;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Trust Account Balance</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              retainer.status === 'active' ? 'bg-green-100 text-green-800' :
              retainer.status === 'depleted' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {retainer.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Original Retainer</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatRand(retainer.retainer_amount)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Current Balance</p>
              <p className={`text-3xl font-bold ${
                isLowBalance ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatRand(currentBalance)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {percentageRemaining.toFixed(1)}% remaining
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Drawn</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatRand(totalDrawdowns)}
              </p>
            </div>
          </div>

          {isLowBalance && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-orange-900">Low Balance Alert</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Retainer balance is below {retainer.low_balance_threshold}%. 
                    Consider topping up to continue work without interruption.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Retainer Type</span>
              <span className="font-medium text-gray-900 capitalize">{retainer.retainer_type}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Start Date</span>
              <span className="font-medium text-gray-900">
                {new Date(retainer.start_date).toLocaleDateString()}
              </span>
            </div>
            {retainer.end_date && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">End Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(retainer.end_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {summary.recentTransactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No transactions yet
            </div>
          ) : (
            summary.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.transaction_type === 'deposit' ? 'bg-green-100' :
                      transaction.transaction_type === 'drawdown' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {transaction.transaction_type === 'deposit' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : transaction.transaction_type === 'drawdown' ? (
                        <TrendingDown className="h-5 w-5 text-blue-600" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {transaction.transaction_type}
                      </p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transaction_type === 'deposit' ? 'text-green-600' :
                      transaction.transaction_type === 'drawdown' ? 'text-blue-600' :
                      'text-gray-900'
                    }`}>
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}
                      {formatRand(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Balance: {formatRand(transaction.balance_after)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Total Deposits</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatRand(totalDeposits)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <TrendingDown className="h-5 w-5" />
              <span className="font-medium">Total Drawdowns</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatRand(totalDrawdowns)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
