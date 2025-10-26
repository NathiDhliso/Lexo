/**
 * Matter Search Bar Component
 * Real-time search with debouncing and advanced filters
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface MatterSearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedFilters: () => void;
  resultCount?: number;
  isLoading?: boolean;
  placeholder?: string;
}

export const MatterSearchBar: React.FC<MatterSearchBarProps> = ({
  onSearch,
  onAdvancedFilters,
  resultCount,
  isLoading = false,
  placeholder = 'Search matters by title, client, attorney, or firm...'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
            disabled={isLoading}
          />
          
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Advanced Filters Button */}
        <button
          onClick={onAdvancedFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg
                   bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2
                   focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          disabled={isLoading}
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Advanced Filters</span>
          <span className="sm:hidden">Filters</span>
        </button>
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : (
            <span>
              {resultCount === 0 ? (
                'No matters found'
              ) : resultCount === 1 ? (
                '1 matter found'
              ) : (
                `${resultCount} matters found`
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
