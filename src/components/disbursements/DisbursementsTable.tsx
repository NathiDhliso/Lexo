import React, { useMemo } from 'react';
import { Edit2, Trash2, ExternalLink, FileText, Filter } from 'lucide-react';
import { DisbursementService, Disbursement } from '../../services/api/disbursement.service';
import { Button } from '../ui/Button';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useDataFetch } from '../../hooks/useDataFetch';
import { useSearch, commonFilters } from '../../hooks/useSearch';
import { useTable } from '../../hooks/useTable';
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
  const { showConfirmation } = useConfirmation();

  // Use data fetching hook with caching
  const { data: disbursements = [], isLoading, error, refetch } = useDataFetch(
    `disbursements-${matterId}`,
    () => DisbursementService.getDisbursementsByMatter(matterId),
    {
      enabled: !!matterId,
      onError: (error) => console.error('Error loading disbursements:', error),
    }
  );

  // Use search hook for filtering
  const {
    filteredData: filteredDisbursements,
    addFilter,
    removeFilter,
    activeFilters,
  } = useSearch(disbursements || [], {
    filters: {
      billed: (item: Disbursement, value: boolean) => item.is_billed === value,
    },
  });

  // Use table hook for selection and bulk actions
  const {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    handleSelectItem,
    handleSelectAll,
    handleBulkAction,
  } = useTable(filteredDisbursements, {
    selectable: showBulkSelect,
    bulkActions: [
      {
        key: 'delete',
        label: 'Delete Selected',
        action: async (items: Disbursement[]) => {
          const confirmed = await showConfirmation({
            title: 'Delete Disbursements',
            message: `Are you sure you want to delete ${items.length} disbursement${items.length > 1 ? 's' : ''}? This action cannot be undone.`,
            confirmText: 'Delete',
            variant: 'danger'
          });

          if (confirmed) {
            await Promise.all(items.map(item => DisbursementService.deleteDisbursement(item.id)));
            await refetch();
            onRefresh?.();
          }
        },
        variant: 'danger',
        disabled: (items) => items.some(item => item.is_billed),
      }
    ],
    onSelectionChange: (selected) => {
      onSelectionChange?.(selected.map(item => item.id));
    },
  });

  const handleDelete = async (disbursement: Disbursement) => {
    const confirmed = await showConfirmation({
      title: 'Delete Disbursement',
      message: `Are you sure you want to delete "${disbursement.description}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await DisbursementService.deleteDisbursement(disbursement.id);
        await refetch();
        onRefresh?.();
      } catch (error) {
        console.error('Error deleting disbursement:', error);
      }
    }
  };

  // Filter handlers
  const handleFilterChange = (filterType: FilterType) => {
    if (filterType === 'all') {
      removeFilter('billed');
    } else if (filterType === 'billed') {
      addFilter('billed', true);
    } else if (filterType === 'unbilled') {
      addFilter('billed', false);
    }
  };

  // Get current filter type for UI
  const currentFilter: FilterType = 
    activeFilters.billed === true ? 'billed' :
    activeFilters.billed === false ? 'unbilled' : 'all';

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

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
        <FileText className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">Failed to load disbursements</p>
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
        <Button onClick={() => refetch()} className="mt-3">
          Try Again
        </Button>
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
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({disbursements?.length || 0})
            </button>
            <button
              onClick={() => handleFilterChange('unbilled')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentFilter === 'unbilled'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unbilled ({disbursements?.filter(d => !d.is_billed).length || 0})
            </button>
            <button
              onClick={() => handleFilterChange('billed')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentFilter === 'billed'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Billed ({disbursements?.filter(d => d.is_billed).length || 0})
            </button>
          </div>
        </div>

        {showBulkSelect && filteredDisbursements.length > 0 && (
          <button
            onClick={() => handleSelectAll()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Table */}
      {filteredDisbursements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No disbursements found</p>
          <p className="text-sm text-gray-500 mt-1">
            {currentFilter === 'all'
              ? 'Log your first disbursement to get started'
              : `No ${currentFilter} disbursements`}
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
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
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
                    selectedItems.includes(disbursement) ? 'bg-blue-50' : ''
                  }`}
                >
                  {showBulkSelect && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(disbursement)}
                        onChange={(e) => handleSelectItem(disbursement, e.target.checked)}
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
      {showBulkSelect && selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{selectedItems.length}</span> disbursement
            {selectedItems.length !== 1 ? 's' : ''} selected for invoicing
          </p>
        </div>
      )}
    </div>
  );
};
