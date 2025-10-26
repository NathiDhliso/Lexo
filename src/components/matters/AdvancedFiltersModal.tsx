/**
 * Advanced Filters Modal Component
 * Comprehensive filtering options for matter search
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MatterSearchParams } from '@/services/api/matter-search.service';
import type { MatterStatus } from '@/types';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: MatterSearchParams) => void;
  currentFilters: MatterSearchParams;
  filterOptions: {
    practice_areas: string[];
    matter_types: string[];
    attorney_firms: string[];
    statuses: MatterStatus[];
  };
}

const STATUS_OPTIONS: { value: MatterStatus; label: string }[] = [
  { value: 'active' as MatterStatus, label: 'Active' },
  { value: 'new_request' as MatterStatus, label: 'New Request' },
  { value: 'pending' as MatterStatus, label: 'Pending' },
  { value: 'settled' as MatterStatus, label: 'Settled' },
  { value: 'closed' as MatterStatus, label: 'Closed' },
  { value: 'on_hold' as MatterStatus, label: 'On Hold' }
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'total_fee', label: 'Total Fee' },
  { value: 'wip', label: 'WIP Value' },
  { value: 'last_activity', label: 'Last Activity' }
];

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilters,
  filterOptions
}) => {
  const [filters, setFilters] = useState<MatterSearchParams>(currentFilters);

  // Update local state when currentFilters change
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters: MatterSearchParams = {
      query: filters.query, // Keep search query
      include_archived: false,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setFilters(clearedFilters);
  };

  const handleStatusToggle = (status: MatterStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    setFilters({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-metallic-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-metallic-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">
                Advanced Filters
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-neutral-500 hover:text-gray-500 dark:hover:text-neutral-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filter Form */}
            <div className="space-y-4">
              {/* Practice Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Practice Area
                </label>
                <select
                  value={filters.practice_area || ''}
                  onChange={(e) => setFilters({ ...filters, practice_area: e.target.value || undefined })}
                  className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                           border border-gray-300 dark:border-metallic-gray-600 
                           text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                           focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                >
                  <option value="">All Practice Areas</option>
                  {filterOptions.practice_areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Matter Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Matter Type
                </label>
                <select
                  value={filters.matter_type || ''}
                  onChange={(e) => setFilters({ ...filters, matter_type: e.target.value || undefined })}
                  className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                           border border-gray-300 dark:border-metallic-gray-600 
                           text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                           focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                >
                  <option value="">All Matter Types</option>
                  {filterOptions.matter_types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Status Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(value) || false}
                        onChange={() => handleStatusToggle(value)}
                        className="rounded border-gray-300 dark:border-metallic-gray-600 
                                 text-mpondo-gold-600 focus:ring-mpondo-gold-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-neutral-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
                    className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                             border border-gray-300 dark:border-metallic-gray-600 
                             text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                             focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
                    className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                             border border-gray-300 dark:border-metallic-gray-600 
                             text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                             focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                  />
                </div>
              </div>

              {/* Attorney Firm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Attorney Firm
                </label>
                <select
                  value={filters.attorney_firm || ''}
                  onChange={(e) => setFilters({ ...filters, attorney_firm: e.target.value || undefined })}
                  className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                           border border-gray-300 dark:border-metallic-gray-600 
                           text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                           focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                >
                  <option value="">All Firms</option>
                  {filterOptions.attorney_firms.map(firm => (
                    <option key={firm} value={firm}>{firm}</option>
                  ))}
                </select>
              </div>

              {/* Fee Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Min Fee (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={filters.fee_min || ''}
                    onChange={(e) => setFilters({ ...filters, fee_min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                    className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                             border border-gray-300 dark:border-metallic-gray-600 
                             text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                             placeholder:text-gray-400 dark:placeholder:text-neutral-500
                             focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Max Fee (R)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={filters.fee_max || ''}
                    onChange={(e) => setFilters({ ...filters, fee_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="No limit"
                    className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                             border border-gray-300 dark:border-metallic-gray-600 
                             text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                             placeholder:text-gray-400 dark:placeholder:text-neutral-500
                             focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sort_by || 'created_at'}
                    onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
                    className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                             border border-gray-300 dark:border-metallic-gray-600 
                             text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                             focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Sort Order
                  </label>
                  <select
                    value={filters.sort_order || 'desc'}
                    onChange={(e) => setFilters({ ...filters, sort_order: e.target.value as 'asc' | 'desc' })}
                    className="block w-full px-3 py-2 bg-white dark:bg-metallic-gray-800 
                             border border-gray-300 dark:border-metallic-gray-600 
                             text-gray-900 dark:text-neutral-100 rounded-md shadow-sm
                             focus:ring-mpondo-gold-500 focus:border-mpondo-gold-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              {/* Include Archived */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.include_archived || false}
                    onChange={(e) => setFilters({ ...filters, include_archived: e.target.checked })}
                    className="rounded border-gray-300 dark:border-metallic-gray-600 
                             text-mpondo-gold-600 focus:ring-mpondo-gold-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Include Archived Matters
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-metallic-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <button
              onClick={handleApply}
              className="w-full inline-flex justify-center rounded-md border border-transparent
                       shadow-sm px-4 py-2 bg-mpondo-gold-600 text-base font-medium text-white
                       hover:bg-mpondo-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-mpondo-gold-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearAll}
              className="mt-3 w-full inline-flex justify-center rounded-md 
                       border border-gray-300 dark:border-metallic-gray-600
                       shadow-sm px-4 py-2 bg-white dark:bg-metallic-gray-700 
                       text-base font-medium text-gray-700 dark:text-neutral-200
                       hover:bg-gray-50 dark:hover:bg-metallic-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-mpondo-gold-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Clear All Filters
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md 
                       border border-gray-300 dark:border-metallic-gray-600
                       shadow-sm px-4 py-2 bg-white dark:bg-metallic-gray-700 
                       text-base font-medium text-gray-700 dark:text-neutral-200
                       hover:bg-gray-50 dark:hover:bg-metallic-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-mpondo-gold-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
