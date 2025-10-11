/**
 * Pagination Component
 * Page navigation with multiple variants
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'numbers' | 'simple' | 'loadMore';
  isLoading?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'numbers',
  isLoading = false,
  className,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (variant === 'loadMore') {
    return (
      <div className={cn('flex justify-center', className)}>
        <Button
          variant="secondary"
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          loading={isLoading}
        >
          Load More
        </Button>
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious || isLoading}
          icon={<ChevronLeft className="w-4 h-4" />}
          iconPosition="left"
        >
          Previous
        </Button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          icon={<ChevronRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={!canGoPrevious || isLoading}
        icon={<ChevronLeft className="w-4 h-4" />}
        iconPosition="left"
        aria-label="Previous page"
      />

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-neutral-400 dark:text-neutral-600"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            disabled={isLoading}
            className={cn(
              'min-w-[40px] h-[40px] px-3 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 focus:ring-offset-2',
              isActive
                ? 'bg-judicial-blue-600 text-white hover:bg-judicial-blue-700'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={!canGoNext || isLoading}
        icon={<ChevronRight className="w-4 h-4" />}
        iconPosition="right"
        aria-label="Next page"
      />
    </div>
  );
};

export default Pagination;
