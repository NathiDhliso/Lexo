import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ExternalLink, FileText, Filter } from 'lucide-react';
import { DisbursementService, Disbursement } from '../../services/api/disbursement.service';
import { Button } from '../ui/Button';
import { useConfirmation } from '../../hooks/useConfirmation';
import { format } from 'date-fns';

/**
 * DisbursementsTable Component
 * Displays list of disbursements for a matter with filtering and actions
 * Requirements: 2.4
 */

interface DisbursementsTableProps {
  matterId: string;
  onEdit?: (disbursement: Disbursement) => void;
  onRefresh?: () => void;
  showBulkSelect?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}

type FilterType = 'all' | 'billed' | 'unbilled';

export const DisbursementsTable: React.FC<DisbursementsTableProps> = ({
  matterId,
  onEdit,
  onRefresh,
  showBulkSelect = false,
  onSelectionChange
}) => {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { showConfirmation } = useConfirmation();

  useEffect(() => {
    loadDisbursements();
  }, [matterId]);

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds));
  }, [selectedIds, onSelectionChange]);

  const loadDisbursements = async () => {
    setIsLoading(true);
    try {
      const data = await DisbursementService.getDisbursementsByMatter(matterId);
      setDisbursements(data);
    } catch (error) {
      console.error('Error loading disbursements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (disbursement: Disbursement) => {
    const confirmed = await showConfirmation({
      title: 'Delete Disbursement',
      message: `Are you sure you want to delete "${disbursement.description}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await DisbursementService.deleteDisbursement(disbursement.id);
        loadDisbursements();
        onRefresh?.();
      } catch (error) {
        console.error('Error deleting disbursement:', error);
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredDisbursements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDisbursements.map(d => d.id)));
    }
  };

  // Filter disbursements based on selected filter
  const filteredDisbursements = disbursements.filter(d => {
    if (filter === 'billed') return d.is_billed;
    if (filter === 'unbilled') return !d.is_billed;
    return true;
  });

  // Calculate totals
  const totals = filteredDisbursements.reduce(
    (acc, d) => ({
      amount: acc.amount + d.amount,
      vat: acc.vat + d.vat_amount,
      total: acc.total + d.total_amount
    }),
    { amount: 0, vat: 0, total: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({disbursements.length})
            </button>
            <button
              onClick={() => setFilter('unbilled')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'unbilled'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unbilled ({disbursements.filter(d => !d.is_billed).length})
            </button>
            <button
              onClick={() => setFilter('billed')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === 'billed'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Billed ({disbursements.filter(d => d.is_billed).length})
            </button>
          </div>
        </div>

        {showBulkSelect && filteredDisbursements.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedIds.size === filteredDisbursements.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Table */}
      {filteredDisbursements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No disbursements found</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'all'
              ? 'Log your first disbursement to get started'
              : `No ${filter} disbursements`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showBulkSelect && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredDisbursements.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDisbursements.map((disbursement) => (
                <tr
                  key={disbursement.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedIds.has(disbursement.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {showBulkSelect && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(disbursement.id)}
                        onChange={() => handleToggleSelect(disbursement.id)}
                        disabled={disbursement.is_billed}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {format(new Date(disbursement.date_incurred), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{disbursement.description}</span>
                      {disbursement.receipt_link && (
                        <a
                          href={disbursement.receipt_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          title="View receipt"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                    R {disbursement.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
                    {disbursement.vat_applicable ? (
                      `R ${disbursement.vat_amount.toFixed(2)}`
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                    R {disbursement.total_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {disbursement.is_billed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Billed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Unbilled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      {!disbursement.is_billed && (
                        <>
                          <button
                            onClick={() => onEdit?.(disbursement)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit disbursement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(disbursement)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete disbursement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {disbursement.is_billed && (
                        <span className="text-xs text-gray-400">Locked</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Footer */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td
                  colSpan={showBulkSelect ? 3 : 2}
                  className="px-4 py-3 text-sm font-semibold text-gray-900"
                >
                  Total ({filteredDisbursements.length} items)
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                  R {totals.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                  R {totals.vat.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                  R {totals.total.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Selection Summary */}
      {showBulkSelect && selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{selectedIds.size}</span> disbursement
            {selectedIds.size !== 1 ? 's' : ''} selected for invoicing
          </p>
        </div>
      )}
    </div>
  );
};
