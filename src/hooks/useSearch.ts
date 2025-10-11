/**
 * useSearch Hook
 * Search state management with debouncing
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseSearchConfig {
  initialQuery?: string;
  debounceMs?: number;
  onSearch?: (query: string) => void;
}

export interface UseSearchReturn {
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  isSearching: boolean;
}

export const useSearch = ({
  initialQuery = '',
  debounceMs = 300,
  onSearch,
}: UseSearchConfig = {}): UseSearchReturn => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
      if (onSearch) {
        onSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    isSearching,
  };
};

export default useSearch;
