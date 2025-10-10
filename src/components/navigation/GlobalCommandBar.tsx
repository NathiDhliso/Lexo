import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, ArrowRight, FileText, Users, Receipt, Zap } from 'lucide-react';
import { SearchResult, SearchCategory, SearchState, KeyboardShortcut } from '../../types';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface GlobalCommandBarProps {
  onNavigate: (page: string) => void;
  onAction: (actionId: string) => void;
  className?: string;
}

const GlobalCommandBar: React.FC<GlobalCommandBarProps> = ({
  onNavigate,
  onAction,
  className = ''
}) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    isOpen: false,
    isLoading: false,
    results: [],
    selectedIndex: -1,
    recentSearches: [],
    categories: [SearchCategory.MATTERS, SearchCategory.CLIENTS, SearchCategory.INVOICES, SearchCategory.ACTIONS]
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      description: 'Open command bar',
      action: () => openCommandBar()
    },
    {
      key: 'Escape',
      description: 'Close command bar',
      action: () => closeCommandBar()
    }
  ];

  useKeyboardShortcuts(shortcuts);

  const openCommandBar = useCallback(() => {
    setSearchState(prev => ({ ...prev, isOpen: true }));
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeCommandBar = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      isOpen: false,
      query: '',
      selectedIndex: -1,
      results: []
    }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: false
    }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!searchState.isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSearchState(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.results.length - 1)
        }));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSearchState(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, -1)
        }));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchState.selectedIndex >= 0 && searchState.results[searchState.selectedIndex]) {
          handleSelectResult(searchState.results[searchState.selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeCommandBar();
        break;
    }
  }, [searchState.isOpen, searchState.selectedIndex, searchState.results]);

  const handleSelectResult = useCallback((result: SearchResult) => {
    // Add to recent searches
    setSearchState(prev => ({
      ...prev,
      recentSearches: [result.title, ...prev.recentSearches.filter(s => s !== result.title)].slice(0, 5)
    }));

    // Navigate or perform action
    if (result.page) {
      onNavigate(result.page);
    } else if (result.href) {
      window.location.href = result.href;
    } else if (result.category === SearchCategory.ACTIONS) {
      onAction(result.id);
    }

    closeCommandBar();
  }, [onNavigate, onAction]);

  // Auto-focus on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Mock search - in production, this would query your backend
  useEffect(() => {
    if (searchState.query) {
      // Simulate search delay
      const timer = setTimeout(() => {
        setSearchState(prev => ({
          ...prev,
          results: [],
          isLoading: false,
          selectedIndex: -1
        }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchState.query]);

  const getCategoryIcon = (category: SearchCategory) => {
    switch (category) {
      case SearchCategory.MATTERS:
        return FileText;
      case SearchCategory.CLIENTS:
        return Users;
      case SearchCategory.INVOICES:
        return Receipt;
      case SearchCategory.ACTIONS:
        return Zap;
      case SearchCategory.RECENT:
        return Clock;
      default:
        return Search;
    }
  };

  const getCategoryLabel = (category: SearchCategory) => {
    switch (category) {
      case SearchCategory.MATTERS:
        return 'Matters';
      case SearchCategory.CLIENTS:
        return 'Clients';
      case SearchCategory.INVOICES:
        return 'Invoices';
      case SearchCategory.ACTIONS:
        return 'Actions';
      case SearchCategory.RECENT:
        return 'Recent';
      default:
        return 'Search';
    }
  };

  const groupedResults = searchState.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<SearchCategory, SearchResult[]>);

  const containerWidthClasses = searchState.isOpen
    ? 'w-[24rem] sm:w-[28rem] md:w-[32rem]'
    : 'w-48 sm:w-64 md:w-72';

  return (
    <div
      className={`relative w-full ${className}`}
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      <div className="relative bg-white dark:bg-metallic-gray-900 rounded-t-lg border border-neutral-200 dark:border-metallic-gray-700">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search matters, clients, invoices..."
          value={searchState.query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-4 bg-transparent text-base placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          aria-label="Global search"
          aria-haspopup="listbox"
          role="combobox"
        />
      </div>

      {/* Search Dropdown */}
      {(
        <div className="bg-white dark:bg-metallic-gray-900 border-t-0 border border-neutral-200 dark:border-metallic-gray-700 rounded-b-lg shadow-xl max-h-96 overflow-y-auto">
          {searchState.query === '' ? (
            /* Empty State - Recent Searches */
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              {searchState.recentSearches.length > 0 ? (
                <div className="space-y-1">
                  {searchState.recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 rounded-md transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No recent searches</p>
              )}
              
              {/* Quick Actions */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  <Zap className="h-4 w-4" />
                  Quick Actions
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => onAction('new-matter')}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 rounded-md transition-colors flex items-center justify-between"
                  >
                    <span>Add New Matter</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">Ctrl+Shift+M</span>
                  </button>
                  <button
                    onClick={() => onAction('create-invoice')}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 rounded-md transition-colors flex items-center justify-between"
                  >
                    <span>Create Invoice</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">Ctrl+Shift+I</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="p-2">
              {searchState.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-judicial-blue-500"></div>
                </div>
              ) : searchState.results.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedResults).map(([category, results]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        {React.createElement(getCategoryIcon(category as SearchCategory), { className: "h-3 w-3" })}
                        {getCategoryLabel(category as SearchCategory)}
                      </div>
                      <div className="space-y-1">
                        {results.map((result, index) => {
                          const globalIndex = searchState.results.indexOf(result);
                          const isSelected = globalIndex === searchState.selectedIndex;
                          return (
                            <button
                              key={result.id}
                              onClick={() => handleSelectResult(result)}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-judicial-blue-50 dark:bg-judicial-blue-900/30 text-judicial-blue-900 dark:text-judicial-blue-300'
                                  : 'hover:bg-neutral-50 dark:hover:bg-metallic-gray-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {result.icon && (
                                  <result.icon className={`h-4 w-4 flex-shrink-0 ${
                                    isSelected ? 'text-judicial-blue-600 dark:text-judicial-blue-400' : 'text-neutral-400 dark:text-neutral-500'
                                  }`} />
                                )}
                                <div className="min-w-0">
                                  <div className={`text-sm font-medium truncate ${
                                    isSelected ? 'text-judicial-blue-900' : 'text-neutral-900 dark:text-neutral-100'
                                  }`}>
                                    {result.title}
                                  </div>
                                  {result.description && (
                                    <div className={`text-xs truncate ${
                                      isSelected ? 'text-judicial-blue-700 dark:text-judicial-blue-400' : 'text-neutral-500 dark:text-neutral-400'
                                    }`}>
                                      {result.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isSelected ? 'text-judicial-blue-600 dark:text-judicial-blue-400' : 'text-neutral-400 dark:text-neutral-500'
                              }`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">No results found</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    Try searching for matters, clients, or invoices
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalCommandBar;
