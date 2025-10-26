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

import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { dashboardService, type DashboardMetrics, type UrgentAttentionItem, type ThisWeekDeadline, type ActiveMatterWithProgress } from '../services/api/dashboard.service';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Lazy load non-critical components for better initial load performance
const ActiveMattersCard = lazy(() => import('../components/dashboard/ActiveMattersCard').then(m => ({ default: m.ActiveMattersCard })));
const PendingActionsCard = lazy(() => import('../components/dashboard/PendingActionsCard').then(m => ({ default: m.PendingActionsCard })));
const QuickStatsCard = lazy(() => import('../components/dashboard/QuickStatsCard').then(m => ({ default: m.QuickStatsCard })));

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const EnhancedDashboardPage: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load dashboard metrics
  const loadMetrics = async (showToast = false) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await dashboardService.getMetrics(user.id);
      setMetrics(data);
      setLastRefresh(new Date());
      if (showToast) {
        toast.success('Dashboard refreshed');
      }
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      loadMetrics();
    }
  }, [authLoading, isAuthenticated, user?.id]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        loadMetrics();
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Handle manual refresh
  const handleRefresh = () => {
    loadMetrics(true);
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

  if (authLoading) {
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
            Last updated: {lastRefresh.toLocaleTimeString()}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <UrgentAttentionSkeleton />
            <ThisWeekDeadlinesSkeleton />
          </>
        ) : (
          <>
            <UrgentAttentionCard
              items={metrics?.urgentAttention || []}
              onItemClick={handleUrgentItemClick}
            />
            <ThisWeekDeadlinesCard
              deadlines={metrics?.thisWeekDeadlines || []}
              onDeadlineClick={handleDeadlineClick}
              onViewAll={handleViewAllDeadlines}
            />
          </>
        )}
      </div>

      {/* Financial Snapshot */}
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

      {/* Active Matters and Pending Actions - Lazy loaded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Quick Stats - Lazy loaded */}
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
    </div>
  );
};
