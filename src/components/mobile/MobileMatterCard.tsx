/**
 * MobileMatterCard Component
 * 
 * Mobile-optimized matter card with swipe actions and thumb-friendly design.
 * Features swipe-to-reveal actions and optimized touch targets.
 * 
 * Requirements: 11.4
 */
import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { 
  Eye, 
  Edit, 
  FileText, 
  Calendar, 
  User, 
  DollarSign,
  Clock,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { formatRand } from '../../lib/currency';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';

interface MobileMatterCardProps {
  matter: {
    id: string;
    title: string;
    client: string;
    status: 'active' | 'pending' | 'completed' | 'urgent';
    billingModel: 'brief-fee' | 'time-based' | 'quick-opinion';
    amount?: number;
    dueDate?: string;
    lastActivity?: string;
    progress?: number;
  };
  onView?: (matterId: string) => void;
  onEdit?: (matterId: string) => void;
  onInvoice?: (matterId: string) => void;
  onMoreActions?: (matterId: string) => void;
  className?: string;
}

/**
 * MobileMatterCard Component
 * 
 * Mobile-specific optimizations:
 * - Card-based layout optimized for thumb reach
 * - Swipe actions: View, Edit, Invoice
 * - Large touch targets (minimum 48px)
 * - Clear visual hierarchy with status indicators
 * - Haptic feedback on interactions
 * - Accessible with proper ARIA labels
 * 
 * @example
 * ```tsx
 * <MobileMatterCard
 *   matter={matter}
 *   onView={(id) => navigate(`/matters/${id}`)}
 *   onEdit={(id) => setEditMatter(id)}
 *   onInvoice={(id) => setInvoiceMatter(id)}
 * />
 * ```
 */
export const MobileMatterCard: React.FC<MobileMatterCardProps> = ({
  matter,
  onView,
  onEdit,
  onInvoice,
  onMoreActions,
  className,
}) => {
  const [isSwipeRevealed, setIsSwipeRevealed] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle swipe gestures for revealing actions
  const handleSwipeMove = useCallback((deltaX: number) => {
    if (deltaX < 0) { // Swipe left to reveal actions
      const offset = Math.min(Math.abs(deltaX), 120);
      setSwipeOffset(-offset);
      
      if (offset > 60 && !isSwipeRevealed) {
        setIsSwipeRevealed(true);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    } else if (deltaX > 0 && isSwipeRevealed) { // Swipe right to hide actions
      const offset = Math.max(-120 + deltaX, 0);
      setSwipeOffset(offset - 120);
      
      if (deltaX > 60) {
        setIsSwipeRevealed(false);
        setSwipeOffset(0);
      }
    }
  }, [isSwipeRevealed]);

  const handleSwipeEnd = useCallback(() => {
    if (Math.abs(swipeOffset) > 60) {
      setIsSwipeRevealed(true);
      setSwipeOffset(-120);
    } else {
      setIsSwipeRevealed(false);
      setSwipeOffset(0);
    }
  }, [swipeOffset]);

  // Get status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'urgent':
        return {
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          border: 'border-l-red-500',
        };
      case 'active':
        return {
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          border: 'border-l-green-500',
        };
      case 'pending':
        return {
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          border: 'border-l-yellow-500',
        };
      case 'completed':
        return {
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          border: 'border-l-blue-500',
        };
      default:
        return {
          badge: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400',
          border: 'border-l-neutral-500',
        };
    }
  };

  const statusStyles = getStatusStyles(matter.status);

  // Handle card tap
  const handleCardTap = () => {
    if (isSwipeRevealed) {
      setIsSwipeRevealed(false);
      setSwipeOffset(0);
    } else {
      onView?.(matter.id);
    }
  };

  // Handle action buttons
  const handleAction = (action: () => void) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Reset swipe state
    setIsSwipeRevealed(false);
    setSwipeOffset(0);
    
    action();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Action Buttons (Hidden by default) */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center bg-neutral-100 dark:bg-metallic-gray-800">
        <div className="flex">
          {onView && (
            <button
              onClick={() => handleAction(() => onView(matter.id))}
              className={cn(
                "h-full px-4 bg-blue-500 text-white flex items-center justify-center",
                "hover:bg-blue-600 active:bg-blue-700 transition-colors",
                "mobile-touch-target"
              )}
              aria-label="View matter"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => handleAction(() => onEdit(matter.id))}
              className={cn(
                "h-full px-4 bg-mpondo-gold-500 text-white flex items-center justify-center",
                "hover:bg-mpondo-gold-600 active:bg-mpondo-gold-700 transition-colors",
                "mobile-touch-target"
              )}
              aria-label="Edit matter"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          
          {onInvoice && (
            <button
              onClick={() => handleAction(() => onInvoice(matter.id))}
              className={cn(
                "h-full px-4 bg-green-500 text-white flex items-center justify-center",
                "hover:bg-green-600 active:bg-green-700 transition-colors",
                "mobile-touch-target"
              )}
              aria-label="Create invoice"
            >
              <FileText className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className={cn(
          "bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700",
          "rounded-xl shadow-sm transition-all duration-200",
          "mobile-card-elevated",
          statusStyles.border,
          "border-l-4"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none',
        }}
      >
        {/* Card Content */}
        <div
          onClick={handleCardTap}
          className="p-4 cursor-pointer active:bg-neutral-50 dark:active:bg-metallic-gray-700 transition-colors"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {matter.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                  {matter.client}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 ml-3">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                statusStyles.badge
              )}>
                {matter.status.charAt(0).toUpperCase() + matter.status.slice(1)}
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Billing Model & Amount */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                {matter.billingModel.replace('-', ' ')}
              </span>
            </div>
            
            {matter.amount && (
              <span className="text-base font-semibold text-mpondo-gold-600 dark:text-mpondo-gold-400">
                {formatRand(matter.amount)}
              </span>
            )}
          </div>

          {/* Progress Bar (for active matters) */}
          {matter.status === 'active' && matter.progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                <span>Progress</span>
                <span>{matter.progress}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
                <div
                  className="bg-mpondo-gold-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${matter.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-4">
              {matter.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due {new Date(matter.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {matter.lastActivity && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{matter.lastActivity}</span>
                </div>
              )}
            </div>

            {/* More Actions Button */}
            {onMoreActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreActions(matter.id);
                }}
                className={cn(
                  "p-1 rounded hover:bg-neutral-100 dark:hover:bg-metallic-gray-700",
                  "transition-colors"
                )}
                aria-label="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Swipe Hint (shown on first render) */}
      {!isSwipeRevealed && (
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <div className="text-xs text-neutral-400 dark:text-neutral-500 animate-pulse">
            ← Swipe for actions
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * MobileMatterList Component
 * 
 * Container component for displaying a list of mobile matter cards.
 */
interface MobileMatterListProps {
  matters: Array<MobileMatterCardProps['matter']>;
  onView?: (matterId: string) => void;
  onEdit?: (matterId: string) => void;
  onInvoice?: (matterId: string) => void;
  onMoreActions?: (matterId: string) => void;
  className?: string;
  emptyMessage?: string;
}

export const MobileMatterList: React.FC<MobileMatterListProps> = ({
  matters,
  onView,
  onEdit,
  onInvoice,
  onMoreActions,
  className,
  emptyMessage = 'No matters found',
}) => {
  if (matters.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-neutral-400 dark:text-neutral-500 mb-2">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {matters.map((matter) => (
        <MobileMatterCard
          key={matter.id}
          matter={matter}
          onView={onView}
          onEdit={onEdit}
          onInvoice={onInvoice}
          onMoreActions={onMoreActions}
        />
      ))}
    </div>
  );
};