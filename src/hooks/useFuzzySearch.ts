// Fuzzy Search Hook - Placeholder implementation
import { useState, useMemo } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  score: number;
  navigateTo?: string;
}

export const useFuzzySearch = <T extends { id: string; title: string; category: string }>(
  items: T[],
  query: string
): SearchResult[] => {
  const results = useMemo(() => {
    if (!query || !query.trim()) return [];

    const searchQuery = query.toLowerCase();
    
    return items
      .map(item => ({
        id: item.id,
        title: item.title,
        description: '',
        category: item.category,
        score: item.title.toLowerCase().includes(searchQuery) ? 1 : 0,
        navigateTo: `/${item.category}/${item.id}`
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [items, query]);

  return results;
};

export default useFuzzySearch;
