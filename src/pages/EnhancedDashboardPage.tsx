/**
 * Enhanced Dashboard Page
 * Reorganized dashboard with new components and improved layout
 * Features:
 * - Urgent attention items
 * - This week's deadlines
 * - Financial snapshot
 * - Active matters with progress
 * - Pending actions
 * - Quick stats (30-day metrics)
 * - Auto-refresh every 5 minutes
 */

import React, { lazy, Suspense } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, Icon } from '../components/design-system/components';
import { UrgentAttentionCard } from '../components/dashboard/UrgentAttentionCard';
import { ThisWeekDeadlinesCard } from '../components/dashboard/ThisWeekDeadlinesCard';
import { FinancialSnapshotCards } from '../components/dashboard/FinancialSnapshotCards';
import { 
  UrgentAttentionSkeleton, 
  ThisWeekDeadlinesSkeleton, 
  FinancialSnapshotSkeleton,
  ActiveMattersSkeleton,
  PendingActionsSkeleton,
  QuickStatsSkeleton
} from '../components/dashboard/DashboardSkeletons';
import { dashboardService, type UrgentAttentionItem, type ThisWeekDeadline, type ActiveMatterWithProgress } from '../services/api/dashboard.service';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDataFetch } from '../hooks/useDataFetch';
import { useDashboardConfiguration } from '../hooks/useDashboardConfiguration';

// Lazy load non-critical components for better initial load performance
const ActiveMattersCard = lazy(() => import('../components/dashboard/ActiveMattersCard').then(m => ({ default: m.ActiveMattersCard })));
const PendingActionsCard = lazy(() => import('../components/dashboard/PendingActionsCard').then(m => ({ default: m.PendingActionsCard })));
const QuickStatsCard = lazy(() => import('../components/dashboard/QuickStatsCard').then(m => ({ default: m.QuickStatsCard })));

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const EnhancedDashboardPage: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { visibleWidgets, shouldShowWidget, isLoading: configLoading } = useDashboardConfiguration();
  
  // Use the new data fetching hook with auto-refresh and caching
  const { 
    data: metrics, 
    isLoading, 
    error, 
    refetch, 
    lastFetch 
  } = useDataFetch(
    'dashboard-metrics',
    () => dashboardService.getMetrics(user?.id || ''),
    {
      enabled: !authLoading && isAuthenticated && !!user?.id,
      refetchInterval: AUTO_REFRESH_INTERVAL,
      cacheDuration: 30000, // Cache for 30 seconds
    }
  );

  // Handle manual refresh with toast notification
  const handleRefresh = async () => {
    try {
      await refetch();
      // Dynamic import to avoid bundle bloat
      const { toast } = await import('react-hot-toast');
      toast.success('Dashboard refreshed');
    } catch (error) {
      const { toast } = await import('react-hot-toast');
      toast.error('Failed to refresh dashboard');
    }
  };

  // Navigation handlers
  const handleUrgentItemClick = (item: UrgentAttentionItem) => {
    if (item.matterId) {
      navigate(`/matters?id=${item.matterId}`);
    } else if (item.invoiceId) {
      navigate(`/invoices?id=${item.invoiceId}`);
    } else if (item.proformaId) {
      navigate(`/proforma-requests?id=${item.proformaId}`);
    }
  };

  const handleDeadlineClick = (deadline: ThisWeekDeadline) => {
    navigate(`/matters?id=${deadline.matterId}`);
  };

  const handleMatterClick = (item: ActiveMatterWithProgress) => {
    navigate(`/matters?id=${item.matter.id}`);
  };

  const handleViewAllMatters = () => {
    navigate('/matters');
  };

  const handleViewAllDeadlines = () => {
    navigate('/matters?filter=upcoming_deadlines');
  };

  const handleOutstandingFeesClick = () => {
    navigate('/invoices?filter=outstanding');
  };

  const handleWipClick = () => {
    navigate('/reports?report=wip');
  };

  const handleMonthInvoicedClick = () => {
    navigate('/reports?report=monthly_billing');
  };

  const handleNewRequestsClick = () => {
    navigate('/matters?status=new_request');
  };

  const handleProformaApprovalsClick = () => {
    navigate('/proforma-requests?status=sent');
  };

  const handleScopeAmendmentsClick = () => {
    navigate('/matters?filter=scope_amendments');
  };

  const handleReadyToInvoiceClick = () => {
    navigate('/matters?status=completed&filter=ready_to_invoice');
  };

  if (authLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mpondo-gold-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Please log in to view the dashboard</p>
      </div>
    );
  }

  // Show error state if data fetching failed
  if (error && !isLoading) {
    return (
      <div className="w-full space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
          >
            <Icon icon={RefreshCw} className="w-4 h-4 mr-2" noGradient />
            Retry
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-red-500 mb-4">
            <Icon icon={RefreshCw} className="w-12 h-12 mx-auto" noGradient />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Failed to load dashboard data
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {error.message || 'Something went wrong while loading your dashboard.'}
          </p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">
            Last updated: {lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'Never'}
          </span>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <Icon icon={RefreshCw} className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} noGradient />
            Refresh
          </Button>
        </div>
      </div>

      {/* Urgent Attention Section */}
      {(shouldShowWidget('urgent-attention') || shouldShowWidget('this-week-deadlines')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              {shouldShowWidget('urgent-attention') && <UrgentAttentionSkeleton />}
              {shouldShowWidget('this-week-deadlines') && <ThisWeekDeadlinesSkeleton />}
            </>
          ) : (
            <>
              {shouldShowWidget('urgent-attention') && (
                <UrgentAttentionCard
                  items={metrics?.urgentAttention || []}
                  onItemClick={handleUrgentItemClick}
                />
              )}
              {shouldShowWidget('this-week-deadlines') && (
                <ThisWeekDeadlinesCard
                  deadlines={metrics?.thisWeekDeadlines || []}
                  onDeadlineClick={handleDeadlineClick}
                  onViewAll={handleViewAllDeadlines}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Financial Snapshot */}
      {shouldShowWidget('financial-snapshot') && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Financial Snapshot
          </h2>
          {isLoading ? (
            <FinancialSnapshotSkeleton />
          ) : (
            <FinancialSnapshotCards
              snapshot={metrics?.financialSnapshot || {
                outstandingFees: { amount: 0, count: 0 },
                wipValue: { amount: 0, count: 0 },
                monthInvoiced: { amount: 0, count: 0 }
              }}
              onOutstandingFeesClick={handleOutstandingFeesClick}
              onWipClick={handleWipClick}
              onMonthInvoicedClick={handleMonthInvoicedClick}
            />
          )}
        </div>
      )}

      {/* Active Matters and Pending Actions - Lazy loaded */}
      {(shouldShowWidget('active-matters') || shouldShowWidget('pending-actions')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shouldShowWidget('active-matters') && (
            <Suspense fallback={<ActiveMattersSkeleton />}>
              {isLoading ? (
                <ActiveMattersSkeleton />
              ) : (
                <ActiveMattersCard
                  matters={metrics?.activeMatters || []}
                  onMatterClick={handleMatterClick}
                  onViewAll={handleViewAllMatters}
                />
              )}
            </Suspense>
          )}
          {shouldShowWidget('pending-actions') && (
            <Suspense fallback={<PendingActionsSkeleton />}>
              {isLoading ? (
                <PendingActionsSkeleton />
              ) : (
                <PendingActionsCard
                  actions={metrics?.pendingActions || {
                    newRequests: 0,
                    proformaApprovals: 0,
                    scopeAmendments: 0,
                    readyToInvoice: 0
                  }}
                  onNewRequestsClick={handleNewRequestsClick}
                  onProformaApprovalsClick={handleProformaApprovalsClick}
                  onScopeAmendmentsClick={handleScopeAmendmentsClick}
                  onReadyToInvoiceClick={handleReadyToInvoiceClick}
                />
              )}
            </Suspense>
          )}
        </div>
      )}

      {/* Billing Model Specific Widgets */}
      {(shouldShowWidget('time-tracking') || shouldShowWidget('fee-milestones') || shouldShowWidget('wip-tracker')) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {shouldShowWidget('time-tracking') && (
            <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Time Tracking
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Time tracking widget will be implemented in future tasks.
              </p>
            </div>
          )}
          {shouldShowWidget('fee-milestones') && (
            <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Fee Milestones
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Fee milestones widget will be implemented in future tasks.
              </p>
            </div>
          )}
          {shouldShowWidget('wip-tracker') && (
            <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                WIP Tracker
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                WIP tracker widget will be implemented in future tasks.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {shouldShowWidget('recent-activity') && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Performance Metrics
          </h2>
          <Suspense fallback={<QuickStatsSkeleton />}>
            {isLoading ? (
              <QuickStatsSkeleton />
            ) : (
              <QuickStatsCard
                stats={metrics?.quickStats || {
                  mattersCompleted30d: 0,
                  invoiced30d: 0,
                  paymentsReceived30d: 0,
                  avgTimeToInvoice: 0
                }}
              />
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
};
