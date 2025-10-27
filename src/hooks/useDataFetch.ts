/**
 * Data Fetching Hook
 * 
 * Generic hook for data fetching with loading states, error handling, and caching.
 * Provides consistent data loading patterns across the application.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useDataFetch(
 *   'matters',
 *   () => matterApiService.getAll(),
 *   {
 *     onSuccess: (data) => console.log(`Loaded ${data.length} matters`),
 *     refetchInterval: 30000, // Refetch every 30s
 *   }
 * );
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseDataFetchOptions<T> {
  /**
   * Whether to fetch data automatically on mount
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Interval to refetch data (in milliseconds)
   */
  refetchInterval?: number;
  
  /**
   * Callback fired on successful data fetch
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback fired on error
   */
  onError?: (error: Error) => void;
  
  /**
   * Callback fired when fetch completes (success or error)
   */
  onComplete?: () => void;
  
  /**
   * Dependencies that trigger a refetch when changed
   */
  dependencies?: any[];
  
  /**
   * Cache duration in milliseconds
   * @default 5 * 60 * 1000 (5 minutes)
   */
  cacheDuration?: number;
  
  /**
   * Whether to show loading state on refetch
   * @default false
   */
  showLoadingOnRefetch?: boolean;
}

export interface UseDataFetchReturn<T> {
  /**
   * Fetched data (null if no data or error)
   */
  data: T | null;
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state (null if no error)
   */
  error: Error | null;
  
  /**
   * Manually trigger a refetch
   */
  refetch: () => Promise<void>;
  
  /**
   * Timestamp of last successful fetch
   */
  lastFetch: number | null;
  
  /**
   * Whether data is stale (based on cache duration)
   */
  isStale: boolean;
  
  /**
   * Manually set data (useful for optimistic updates)
   */
  setData: (data: T | null) => void;
  
  /**
   * Clear error state
   */
  clearError: () => void;
}

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Hook for fetching data with loading states, error handling, and caching
 * 
 * Features:
 * - Automatic loading state management
 * - Error capture and handling
 * - Success/error callbacks
 * - Automatic refetching with intervals
 * - Dependency-based refetching
 * - In-memory caching
 * - Stale data detection
 * - Manual refetch capability
 * - Optimistic updates
 * 
 * @param key Unique key for caching and identification
 * @param fetchFn Function that returns a Promise with the data
 * @param options Configuration options
 * @returns Data fetching state and controls
 */
export function useDataFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions<T> = {}
): UseDataFetchReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    onComplete,
    dependencies = [],
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    showLoadingOnRefetch = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  
  const fetchFnRef = useRef(fetchFn);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update fetch function ref when it changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  // Check if data is stale
  const isStale = lastFetch ? (Date.now() - lastFetch) > cacheDuration : true;

  // Get data from cache
  const getCachedData = useCallback((): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const isExpired = (Date.now() - cached.timestamp) > cacheDuration;
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    
    return cached.data;
  }, [key, cacheDuration]);

  // Set data in cache
  const setCachedData = useCallback((data: T) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, [key]);

  // Fetch data function
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Check cache first
      const cachedData = getCachedData();
      if (cachedData && !isStale) {
        setData(cachedData);
        setLastFetch(Date.now());
        onSuccess?.(cachedData);
        return;
      }

      // Fetch fresh data
      const result = await fetchFnRef.current();
      
      setData(result);
      setLastFetch(Date.now());
      setCachedData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      onComplete?.();
    }
  }, [getCachedData, setCachedData, isStale, onSuccess, onError, onComplete]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData(showLoadingOnRefetch);
  }, [fetchData, showLoadingOnRefetch]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Manual set data function (for optimistic updates)
  const setDataManual = useCallback((newData: T | null) => {
    setData(newData);
    if (newData) {
      setCachedData(newData);
      setLastFetch(Date.now());
    }
  }, [setCachedData]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, ...dependencies]);

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(false); // Don't show loading on interval refetch
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    lastFetch,
    isStale,
    setData: setDataManual,
    clearError,
  };
}

/**
 * Specialized hook for paginated data fetching
 * 
 * @example
 * ```tsx
 * const { data, isLoading, loadMore, hasMore } = usePaginatedFetch(
 *   'matters-paginated',
 *   (page) => matterApiService.getAll({ pagination: { page, limit: 10 } }),
 *   { pageSize: 10 }
 * );
 * ```
 */
export interface UsePaginatedFetchOptions<T> extends Omit<UseDataFetchOptions<T[]>, 'onSuccess'> {
  /**
   * Number of items per page
   * @default 20
   */
  pageSize?: number;
  
  /**
   * Callback fired on successful data fetch
   */
  onSuccess?: (data: T[], page: number, hasMore: boolean) => void;
}

export interface UsePaginatedFetchReturn<T> extends Omit<UseDataFetchReturn<T[]>, 'refetch'> {
  /**
   * Load more data (next page)
   */
  loadMore: () => Promise<void>;
  
  /**
   * Whether there are more pages to load
   */
  hasMore: boolean;
  
  /**
   * Current page number
   */
  currentPage: number;
  
  /**
   * Reset to first page
   */
  reset: () => void;
  
  /**
   * Whether currently loading more data
   */
  isLoadingMore: boolean;
}

export function usePaginatedFetch<T>(
  key: string,
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UsePaginatedFetchOptions<T> = {}
): UsePaginatedFetchReturn<T> {
  const { pageSize = 20, onSuccess, ...restOptions } = options;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allData, setAllData] = useState<T[]>([]);

  const fetchFnRef = useRef(fetchFn);
  
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchPage = useCallback(async (page: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      }

      const result = await fetchFnRef.current(page);
      
      setAllData(prev => append ? [...prev, ...result.data] : result.data);
      setHasMore(result.hasMore);
      setCurrentPage(page);
      
      onSuccess?.(result.data, page, result.hasMore);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      }
    }
  }, [onSuccess]);

  const {
    isLoading,
    error,
    lastFetch,
    isStale,
    clearError,
  } = useDataFetch(
    `${key}-page-${currentPage}`,
    () => fetchPage(1, false),
    {
      ...restOptions,
      onSuccess: undefined, // Handle in fetchPage
    }
  );

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore) {
      await fetchPage(currentPage + 1, true);
    }
  }, [hasMore, isLoadingMore, currentPage, fetchPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setAllData([]);
    setHasMore(true);
    fetchPage(1, false);
  }, [fetchPage]);

  const refetch = useCallback(async () => {
    await fetchPage(1, false);
  }, [fetchPage]);

  return {
    data: allData,
    isLoading,
    error,
    lastFetch,
    isStale,
    setData: (data: T[] | null) => setAllData(data || []),
    clearError,
    loadMore,
    hasMore,
    currentPage,
    reset,
    isLoadingMore,
  };
}

/**
 * Clear all cached data
 */
export function clearDataFetchCache(): void {
  cache.clear();
}

/**
 * Clear cached data for specific key
 */
export function clearDataFetchCacheKey(key: string): void {
  cache.delete(key);
}