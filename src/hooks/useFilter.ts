/**
 * useFilter Hook
 * Filter state management with URL sync
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type FilterValue = string | number | boolean | string[] | undefined;

export interface UseFilterConfig<T extends Record<string, FilterValue>> {
  initialFilters?: T;
  syncWithUrl?: boolean;
}

export interface UseFilterReturn<T extends Record<string, FilterValue>> {
  filters: T;
  setFilter: (key: keyof T, value: FilterValue) => void;
  setFilters: (filters: Partial<T>) => void;
  clearFilter: (key: keyof T) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export const useFilter = <T extends Record<string, FilterValue>>({
  initialFilters = {} as T,
  syncWithUrl = false,
}: UseFilterConfig<T> = {}): UseFilterReturn<T> => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFiltersState] = useState<T>(() => {
    if (syncWithUrl) {
      const urlFilters = {} as T;
      Object.keys(initialFilters).forEach((key) => {
        const value = searchParams.get(key);
        if (value !== null) {
          urlFilters[key as keyof T] = value as any;
        }
      });
      return { ...initialFilters, ...urlFilters };
    }
    return initialFilters;
  });

  // Sync filters to URL
  useEffect(() => {
    if (syncWithUrl) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      setSearchParams(params, { replace: true });
    }
  }, [filters, syncWithUrl, setSearchParams]);

  const setFilter = useCallback((key: keyof T, value: FilterValue) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilter = useCallback((key: keyof T) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ''
  );

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== ''
  ).length;

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export default useFilter;
