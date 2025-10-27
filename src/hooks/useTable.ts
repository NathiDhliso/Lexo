/**
 * Table Management Hook
 * 
 * Comprehensive hook for managing table state including selection,
 * pagination, sorting, and bulk actions. Eliminates repetitive table logic.
 * 
 * @example
 * ```tsx
 * const {
 *   selectedItems,
 *   isAllSelected,
 *   handleSelectItem,
 *   handleSelectAll,
 *   handleBulkAction,
 *   pagination,
 *   paginatedData
 * } = useTable(data, {
 *   pageSize: 10,
 *   bulkActions: {
 *     delete: async (items) => await api.deleteMany(items.map(i => i.id)),
 *     archive: async (items) => await api.archiveMany(items.map(i => i.id))
 *   }
 * });
 * ```
 */

import { useState, useMemo, useCallback, useEffect } from 'react';

export interface TableColumn<T> {
  /**
   * Column key (must match data property)
   */
  key: keyof T | string;
  
  /**
   * Column header text
   */
  header: string;
  
  /**
   * Whether column is sortable
   */
  sortable?: boolean;
  
  /**
   * Custom render function
   */
  render?: (value: any, item: T, index: number) => React.ReactNode;
  
  /**
   * Column width (CSS value)
   */
  width?: string;
  
  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Whether column is hidden
   */
  hidden?: boolean;
}

export interface BulkAction<T> {
  /**
   * Action key
   */
  key: string;
  
  /**
   * Action label
   */
  label: string;
  
  /**
   * Action icon
   */
  icon?: React.ComponentType<any>;
  
  /**
   * Action function
   */
  action: (items: T[]) => Promise<void>;
  
  /**
   * Action variant (for styling)
   */
  variant?: 'default' | 'danger' | 'warning';
  
  /**
   * Confirmation message
   */
  confirmMessage?: string;
  
  /**
   * Whether action is disabled
   */
  disabled?: (items: T[]) => boolean;
}

export interface UseTableOptions<T> {
  /**
   * Items per page
   * @default 10
   */
  pageSize?: number;
  
  /**
   * Available bulk actions
   */
  bulkActions?: BulkAction<T>[];
  
  /**
   * Whether to enable selection
   * @default true
   */
  selectable?: boolean;
  
  /**
   * Custom row key function
   */
  getRowKey?: (item: T, index: number) => string;
  
  /**
   * Whether to persist selection across pages
   * @default false
   */
  persistSelection?: boolean;
  
  /**
   * Initial selected items
   */
  initialSelected?: T[];
  
  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selected: T[]) => void;
}

export interface PaginationState {
  /**
   * Current page (0-based)
   */
  currentPage: number;
  
  /**
   * Items per page
   */
  pageSize: number;
  
  /**
   * Total number of items
   */
  totalItems: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Whether there's a next page
   */
  hasNext: boolean;
  
  /**
   * Whether there's a previous page
   */
  hasPrev: boolean;
  
  /**
   * Start index of current page
   */
  startIndex: number;
  
  /**
   * End index of current page
   */
  endIndex: number;
}

export interface UseTableReturn<T> {
  /**
   * Currently selected items
   */
  selectedItems: T[];
  
  /**
   * Selected item keys/IDs
   */
  selectedKeys: Set<string>;
  
  /**
   * Whether all visible items are selected
   */
  isAllSelected: boolean;
  
  /**
   * Whether some (but not all) items are selected
   */
  isIndeterminate: boolean;
  
  /**
   * Paginated data for current page
   */
  paginatedData: T[];
  
  /**
   * Pagination state
   */
  pagination: PaginationState;
  
  /**
   * Bulk action loading states
   */
  bulkActionLoading: Record<string, boolean>;
  
  /**
   * Select/deselect an item
   */
  handleSelectItem: (item: T, selected?: boolean) => void;
  
  /**
   * Select/deselect all visible items
   */
  handleSelectAll: (selected?: boolean) => void;
  
  /**
   * Clear all selections
   */
  clearSelection: () => void;
  
  /**
   * Execute a bulk action
   */
  handleBulkAction: (actionKey: string) => Promise<void>;
  
  /**
   * Go to specific page
   */
  goToPage: (page: number) => void;
  
  /**
   * Go to next page
   */
  nextPage: () => void;
  
  /**
   * Go to previous page
   */
  prevPage: () => void;
  
  /**
   * Change page size
   */
  changePageSize: (size: number) => void;
  
  /**
   * Get row key for an item
   */
  getRowKey: (item: T, index: number) => string;
  
  /**
   * Check if item is selected
   */
  isItemSelected: (item: T, index: number) => boolean;
}

/**
 * Default row key function
 */
function defaultGetRowKey<T>(item: T, index: number): string {
  // Try common ID fields
  if (item && typeof item === 'object') {
    const obj = item as any;
    if (obj.id) return String(obj.id);
    if (obj._id) return String(obj._id);
    if (obj.uuid) return String(obj.uuid);
  }
  
  // Fall back to index
  return String(index);
}

/**
 * Hook for managing table state and interactions
 * 
 * Features:
 * - Row selection (single/multiple)
 * - Pagination
 * - Bulk actions with loading states
 * - Selection persistence
 * - Customizable row keys
 * 
 * @param data Array of table data
 * @param options Table configuration
 * @returns Table state and controls
 */
export function useTable<T>(
  data: T[],
  options: UseTableOptions<T> = {}
): UseTableReturn<T> {
  const {
    pageSize = 10,
    bulkActions = [],
    selectable = true,
    getRowKey = defaultGetRowKey,
    persistSelection = false,
    initialSelected = [],
    onSelectionChange,
  } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set(initialSelected.map((item, index) => getRowKey(item, index)))
  );
  const [bulkActionLoading, setBulkActionLoading] = useState<Record<string, boolean>>({});

  // Calculate pagination
  const pagination = useMemo((): PaginationState => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNext: currentPage < totalPages - 1,
      hasPrev: currentPage > 0,
      startIndex,
      endIndex,
    };
  }, [data.length, pageSize, currentPage]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const start = pagination.startIndex;
    const end = pagination.endIndex;
    return data.slice(start, end);
  }, [data, pagination.startIndex, pagination.endIndex]);

  // Get selected items
  const selectedItems = useMemo(() => {
    if (!selectable) return [];
    
    return data.filter((item, index) => {
      const key = getRowKey(item, index);
      return selectedKeys.has(key);
    });
  }, [data, selectedKeys, selectable, getRowKey]);

  // Check selection states
  const isAllSelected = useMemo(() => {
    if (!selectable || paginatedData.length === 0) return false;
    
    return paginatedData.every((item, index) => {
      const key = getRowKey(item, pagination.startIndex + index);
      return selectedKeys.has(key);
    });
  }, [paginatedData, selectedKeys, selectable, getRowKey, pagination.startIndex]);

  const isIndeterminate = useMemo(() => {
    if (!selectable || paginatedData.length === 0) return false;
    
    const selectedCount = paginatedData.filter((item, index) => {
      const key = getRowKey(item, pagination.startIndex + index);
      return selectedKeys.has(key);
    }).length;
    
    return selectedCount > 0 && selectedCount < paginatedData.length;
  }, [paginatedData, selectedKeys, selectable, getRowKey, pagination.startIndex]);

  // Selection handlers
  const handleSelectItem = useCallback((item: T, selected?: boolean) => {
    if (!selectable) return;
    
    const index = data.indexOf(item);
    const key = getRowKey(item, index);
    
    setSelectedKeys(prev => {
      const newKeys = new Set(prev);
      const shouldSelect = selected !== undefined ? selected : !prev.has(key);
      
      if (shouldSelect) {
        newKeys.add(key);
      } else {
        newKeys.delete(key);
      }
      
      return newKeys;
    });
  }, [data, getRowKey, selectable]);

  const handleSelectAll = useCallback((selected?: boolean) => {
    if (!selectable) return;
    
    const shouldSelect = selected !== undefined ? selected : !isAllSelected;
    
    setSelectedKeys(prev => {
      const newKeys = new Set(prev);
      
      paginatedData.forEach((item, index) => {
        const key = getRowKey(item, pagination.startIndex + index);
        
        if (shouldSelect) {
          newKeys.add(key);
        } else {
          newKeys.delete(key);
        }
      });
      
      return newKeys;
    });
  }, [paginatedData, getRowKey, isAllSelected, selectable, pagination.startIndex]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const isItemSelected = useCallback((item: T, index: number) => {
    if (!selectable) return false;
    const key = getRowKey(item, index);
    return selectedKeys.has(key);
  }, [selectedKeys, getRowKey, selectable]);

  // Bulk actions
  const handleBulkAction = useCallback(async (actionKey: string) => {
    const action = bulkActions.find(a => a.key === actionKey);
    if (!action || selectedItems.length === 0) return;
    
    // Check if action is disabled
    if (action.disabled?.(selectedItems)) return;
    
    // Show confirmation if required
    if (action.confirmMessage) {
      const confirmed = window.confirm(
        action.confirmMessage.replace('{count}', String(selectedItems.length))
      );
      if (!confirmed) return;
    }
    
    setBulkActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      await action.action(selectedItems);
      
      // Clear selection after successful action
      clearSelection();
      
      // Show success message
      import('../services/toast.service').then(({ toastService }) => {
        toastService.success(`${action.label} completed successfully`);
      });
    } catch (error) {
      // Show error message
      import('../services/toast.service').then(({ toastService }) => {
        toastService.error(`Failed to ${action.label.toLowerCase()}: ${error}`);
      });
    } finally {
      setBulkActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [bulkActions, selectedItems, clearSelection]);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    const maxPage = Math.max(0, Math.ceil(data.length / pageSize) - 1);
    const newPage = Math.max(0, Math.min(page, maxPage));
    setCurrentPage(newPage);
    
    // Clear selection if not persisting
    if (!persistSelection) {
      clearSelection();
    }
  }, [data.length, pageSize, persistSelection, clearSelection]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      goToPage(currentPage + 1);
    }
  }, [pagination.hasNext, currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      goToPage(currentPage - 1);
    }
  }, [pagination.hasPrev, currentPage, goToPage]);

  const changePageSize = useCallback((size: number) => {
    const newPageSize = Math.max(1, size);
    const newCurrentPage = Math.floor((currentPage * pageSize) / newPageSize);
    
    setCurrentPage(newCurrentPage);
    
    // Note: pageSize is controlled by options, so parent component needs to handle this
    // This is just for calculating the new current page
  }, [currentPage, pageSize]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedItems);
  }, [selectedItems, onSelectionChange]);

  return {
    selectedItems,
    selectedKeys,
    isAllSelected,
    isIndeterminate,
    paginatedData,
    pagination,
    bulkActionLoading,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    handleBulkAction,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    getRowKey,
    isItemSelected,
  };
}

/**
 * Specialized hook for simple tables without bulk actions
 * Pre-configured for basic table use cases
 * 
 * @example
 * ```tsx
 * const {
 *   paginatedData,
 *   pagination,
 *   goToPage,
 *   nextPage,
 *   prevPage
 * } = useSimpleTable(data, { pageSize: 20 });
 * ```
 */
export function useSimpleTable<T>(
  data: T[],
  options: { pageSize?: number } = {}
): Pick<UseTableReturn<T>, 'paginatedData' | 'pagination' | 'goToPage' | 'nextPage' | 'prevPage'> {
  const result = useTable(data, {
    pageSize: options.pageSize,
    selectable: false,
  });

  return {
    paginatedData: result.paginatedData,
    pagination: result.pagination,
    goToPage: result.goToPage,
    nextPage: result.nextPage,
    prevPage: result.prevPage,
  };
}