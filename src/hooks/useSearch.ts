/**
 * Search and Filter Hook
 * 
 * Unified hook for implementing search, filtering, and sorting functionality.
 * Eliminates repetitive search/filter logic across components.
 * 
 * @example
 * ```tsx
 * const {
 *   searchQuery,
 *   filteredData,
 *   setSearchQuery,
 *   addFilter,
 *   removeFilter,
 *   setSortBy
 * } = useSearch(matters, {
 *   searchFields: ['title', 'client_name'],
 *   filters: {
 *     status: (item, value) => item.status === value,
 *     urgent: (item) => item.is_urgent
 *   },
 *   sortOptions: {
 *     date: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
 *     name: (a, b) => a.title.localeCompare(b.title)
 *   }
 * });
 * ```
 */

import { useState, useMemo, useCallback } from 'react';

export interface SearchOptions<T> {
  /**
   * Fields to search in (supports nested paths like 'client.name')
   */
  searchFields?: (keyof T | string)[];
  
  /**
   * Custom search function (overrides searchFields)
   */
  searchFn?: (item: T, query: string) => boolean;
  
  /**
   * Available filters
   */
  filters?: Record<string, (item: T, value: any) => boolean>;
  
  /**
   * Available sort options
   */
  sortOptions?: Record<string, (a: T, b: T) => number>;
  
  /**
   * Default sort key
   */
  defaultSort?: string;
  
  /**
   * Case sensitive search
   * @default false
   */
  caseSensitive?: boolean;
  
  /**
   * Debounce search in milliseconds
   * @default 300
   */
  debounceMs?: number;
}

export interface UseSearchReturn<T> {
  /**
   * Current search query
   */
  searchQuery: string;
  
  /**
   * Filtered and sorted data
   */
  filteredData: T[];
  
  /**
   * Active filters
   */
  activeFilters: Record<string, any>;
  
  /**
   * Current sort key
   */
  sortBy: string | null;
  
  /**
   * Update search query
   */
  setSearchQuery: (query: string) => void;
  
  /**
   * Add or update a filter
   */
  addFilter: (key: string, value: any) => void;
  
  /**
   * Remove a filter
   */
  removeFilter: (key: string) => void;
  
  /**
   * Clear all filters
   */
  clearFilters: () => void;
  
  /**
   * Set sort option
   */
  setSortBy: (key: string | null) => void;
  
  /**
   * Get value from nested path
   */
  getNestedValue: (obj: any, path: string) => any;
  
  /**
   * Search statistics
   */
  stats: {
    total: number;
    filtered: number;
    hasActiveFilters: boolean;
  };
}

/**
 * Get value from nested object path (e.g., 'client.name')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Default search function that searches in specified fields
 */
function defaultSearchFn<T>(
  item: T,
  query: string,
  searchFields: (keyof T | string)[],
  caseSensitive: boolean = false
): boolean {
  if (!query.trim()) return true;
  
  const searchTerm = caseSensitive ? query : query.toLowerCase();
  
  return searchFields.some(field => {
    const value = getNestedValue(item, field as string);
    if (value == null) return false;
    
    const stringValue = String(value);
    const searchValue = caseSensitive ? stringValue : stringValue.toLowerCase();
    
    return searchValue.includes(searchTerm);
  });
}

/**
 * Hook for implementing search, filtering, and sorting
 * 
 * Features:
 * - Text search across multiple fields
 * - Multiple filters with custom logic
 * - Sorting with custom comparators
 * - Search statistics
 * - Nested field access
 * 
 * @param data Array of data to search/filter
 * @param options Search configuration
 * @returns Search state and controls
 */
export function useSearch<T>(
  data: T[],
  options: SearchOptions<T> = {}
): UseSearchReturn<T> {
  const {
    searchFields = [],
    searchFn,
    filters = {},
    sortOptions = {},
    defaultSort = null,
    caseSensitive = false,
    debounceMs = 300,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string | null>(defaultSort);

  // Memoized filtered and sorted data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery.trim()) {
      const searchFunction = searchFn || ((item: T, query: string) => 
        defaultSearchFn(item, query, searchFields, caseSensitive)
      );
      result = result.filter(item => searchFunction(item, searchQuery));
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      const filterFn = filters[filterKey];
      if (filterFn && filterValue !== undefined && filterValue !== null) {
        result = result.filter(item => filterFn(item, filterValue));
      }
    });

    // Apply sorting
    if (sortBy && sortOptions[sortBy]) {
      result.sort(sortOptions[sortBy]);
    }

    return result;
  }, [data, searchQuery, activeFilters, sortBy, searchFn, searchFields, caseSensitive, filters, sortOptions]);

  const addFilter = useCallback((key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const stats = useMemo(() => ({
    total: data.length,
    filtered: filteredData.length,
    hasActiveFilters: Object.keys(activeFilters).length > 0 || searchQuery.trim() !== '',
  }), [data.length, filteredData.length, activeFilters, searchQuery]);

  return {
    searchQuery,
    filteredData,
    activeFilters,
    sortBy,
    setSearchQuery,
    addFilter,
    removeFilter,
    clearFilters,
    setSortBy,
    getNestedValue,
    stats,
  };
}

/**
 * Specialized hook for table data with common patterns
 * Pre-configured for typical table use cases
 * 
 * @example
 * ```tsx
 * const {
 *   searchQuery,
 *   filteredData,
 *   setSearchQuery,
 *   sortBy,
 *   setSortBy
 * } = useTableSearch(invoices, {
 *   searchFields: ['number', 'client_name', 'matter_title'],
 *   defaultSort: 'date_desc'
 * });
 * ```
 */
export function useTableSearch<T>(
  data: T[],
  options: {
    searchFields: (keyof T | string)[];
    defaultSort?: string;
    sortOptions?: Record<string, (a: T, b: T) => number>;
  }
): Pick<UseSearchReturn<T>, 'searchQuery' | 'filteredData' | 'setSearchQuery' | 'sortBy' | 'setSortBy' | 'stats'> {
  const result = useSearch(data, {
    searchFields: options.searchFields,
    defaultSort: options.defaultSort,
    sortOptions: options.sortOptions,
    debounceMs: 200, // Faster for tables
  });

  return {
    searchQuery: result.searchQuery,
    filteredData: result.filteredData,
    setSearchQuery: result.setSearchQuery,
    sortBy: result.sortBy,
    setSortBy: result.setSortBy,
    stats: result.stats,
  };
}

/**
 * Common sort functions for reuse
 */
export const commonSorts = {
  /**
   * Sort by date (newest first)
   */
  dateDesc: <T extends { created_at?: string | Date }>(a: T, b: T) => {
    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();
    return bDate - aDate;
  },

  /**
   * Sort by date (oldest first)
   */
  dateAsc: <T extends { created_at?: string | Date }>(a: T, b: T) => {
    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();
    return aDate - bDate;
  },

  /**
   * Sort by name/title alphabetically
   */
  nameAsc: <T extends { name?: string; title?: string }>(a: T, b: T) => {
    const aName = a.name || a.title || '';
    const bName = b.name || b.title || '';
    return aName.localeCompare(bName);
  },

  /**
   * Sort by amount (highest first)
   */
  amountDesc: <T extends { amount?: number; total?: number }>(a: T, b: T) => {
    const aAmount = a.amount || a.total || 0;
    const bAmount = b.amount || b.total || 0;
    return bAmount - aAmount;
  },

  /**
   * Sort by status (active first, then alphabetical)
   */
  statusActive: <T extends { status?: string; is_active?: boolean }>(a: T, b: T) => {
    const aActive = a.is_active ?? (a.status === 'active');
    const bActive = b.is_active ?? (b.status === 'active');
    
    if (aActive !== bActive) {
      return bActive ? 1 : -1;
    }
    
    const aStatus = a.status || '';
    const bStatus = b.status || '';
    return aStatus.localeCompare(bStatus);
  },

  /**
   * Sort by usage count (most used first)
   */
  usageDesc: <T extends { usage_count?: number }>(a: T, b: T) => {
    const aUsage = a.usage_count || 0;
    const bUsage = b.usage_count || 0;
    return bUsage - aUsage;
  },
};

/**
 * Common filter functions for reuse
 */
export const commonFilters = {
  /**
   * Filter by active status
   */
  active: <T extends { is_active?: boolean; status?: string }>(item: T, value: boolean) => {
    return value ? (item.is_active ?? item.status === 'active') : !(item.is_active ?? item.status === 'active');
  },

  /**
   * Filter by status
   */
  status: <T extends { status?: string }>(item: T, value: string) => {
    return item.status === value;
  },

  /**
   * Filter by date range
   */
  dateRange: <T extends { created_at?: string | Date }>(item: T, range: { start?: Date; end?: Date }) => {
    if (!item.created_at) return false;
    const itemDate = new Date(item.created_at);
    
    if (range.start && itemDate < range.start) return false;
    if (range.end && itemDate > range.end) return false;
    
    return true;
  },

  /**
   * Filter by amount range
   */
  amountRange: <T extends { amount?: number; total?: number }>(item: T, range: { min?: number; max?: number }) => {
    const amount = item.amount || item.total || 0;
    
    if (range.min !== undefined && amount < range.min) return false;
    if (range.max !== undefined && amount > range.max) return false;
    
    return true;
  },
};