import { useState, useCallback, useMemo } from 'react';

export interface UseSelectionOptions<T> {
  items: T[];
  getItemId: (item: T) => string | number;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
}

export interface UseSelectionReturn<T> {
  selectedIds: Set<string | number>;
  selectedItems: T[];
  isSelected: (id: string | number) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  selectedCount: number;
  totalCount: number;
  toggleSelection: (id: string | number) => void;
  toggleAll: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectMultiple: (ids: (string | number)[]) => void;
  deselectMultiple: (ids: (string | number)[]) => void;
}

/**
 * Hook for managing multi-select state in lists
 * 
 * @example
 * ```tsx
 * const {
 *   selectedIds,
 *   selectedItems,
 *   isSelected,
 *   isAllSelected,
 *   toggleSelection,
 *   toggleAll,
 *   clearSelection,
 * } = useSelection({
 *   items: matters,
 *   getItemId: (matter) => matter.id,
 * });
 * ```
 */
export const useSelection = <T,>({
  items,
  getItemId,
  onSelectionChange,
}: UseSelectionOptions<T>): UseSelectionReturn<T> => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Get all item IDs
  const allIds = useMemo(() => items.map(getItemId), [items, getItemId]);

  // Get selected items
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );

  // Check if an item is selected
  const isSelected = useCallback(
    (id: string | number) => selectedIds.has(id),
    [selectedIds]
  );

  // Check if all items are selected
  const isAllSelected = useMemo(
    () => allIds.length > 0 && allIds.every((id) => selectedIds.has(id)),
    [allIds, selectedIds]
  );

  // Check if some (but not all) items are selected
  const isSomeSelected = useMemo(
    () => selectedIds.size > 0 && !isAllSelected,
    [selectedIds.size, isAllSelected]
  );

  // Toggle selection for a single item
  const toggleSelection = useCallback(
    (id: string | number) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        onSelectionChange?.(newSet);
        return newSet;
      });
    },
    [onSelectionChange]
  );

  // Toggle all items
  const toggleAll = useCallback(() => {
    setSelectedIds(() => {
      const newSet = isAllSelected ? new Set<string | number>() : new Set(allIds);
      onSelectionChange?.(newSet);
      return newSet;
    });
  }, [isAllSelected, allIds, onSelectionChange]);

  // Select all items
  const selectAll = useCallback(() => {
    const newSet = new Set(allIds);
    setSelectedIds(newSet);
    onSelectionChange?.(newSet);
  }, [allIds, onSelectionChange]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    const newSet = new Set<string | number>();
    setSelectedIds(newSet);
    onSelectionChange?.(newSet);
  }, [onSelectionChange]);

  // Select multiple items
  const selectMultiple = useCallback(
    (ids: (string | number)[]) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        ids.forEach((id) => newSet.add(id));
        onSelectionChange?.(newSet);
        return newSet;
      });
    },
    [onSelectionChange]
  );

  // Deselect multiple items
  const deselectMultiple = useCallback(
    (ids: (string | number)[]) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        ids.forEach((id) => newSet.delete(id));
        onSelectionChange?.(newSet);
        return newSet;
      });
    },
    [onSelectionChange]
  );

  return {
    selectedIds,
    selectedItems,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectedCount: selectedIds.size,
    totalCount: items.length,
    toggleSelection,
    toggleAll,
    selectAll,
    clearSelection,
    selectMultiple,
    deselectMultiple,
  };
};
