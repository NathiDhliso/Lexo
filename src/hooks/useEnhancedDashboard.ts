/**
 * Enhanced Dashboard Hook with Smart Caching and Real-time Updates
 * 
 * Features:
 * - React Query for intelligent caching
 * - Real-time subscriptions for critical updates
 * - Stale-while-revalidate strategy
 * - Automatic background refetching
 * - Optimistic updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { dashboardService } from '../services/api/dashboard.service';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  urgentAttention: {
    deadlinesToday: number;
    overdue45Days: number;
    pendingProformas5Days: number;
  };
  thisWeekDeadlines: number;
  financialSnapshot: {
    outstandingFees: number;
    outstandingInvoicesCount: number;
    wipValue: number;
    mattersInWip: number;
    invoicedThisMonth: number;
    invoicesThisMonthCount: number;
    paymentRate: number;
  };
  activeMatters: {
    count: number;
    matters: Array<{
      id: string;
      title: string;
      clientName: string;
      practiceArea: string;
      status: string;
      completionPercentage: number;
      lastActivityDate: string;
      daysInactive: number;
    }>;
  };
  pendingActions: {
    newRequests: number;
    proformaApprovals: number;
    scopeAmendments: number;
    readyToInvoice: number;
  };
  quickStats: {
    mattersCompleted30Days: number;
    invoiced30Days: number;
    paymentsReceived30Days: number;
    averageTimeToInvoice: number;
  };
}

/**
 * Hook for urgent attention items (refreshes every 1 minute)
 */
export function useUrgentAttention() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', 'urgent', user?.id],
    queryFn: () => user?.id ? dashboardService.getUrgentAttention(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (formerly cacheTime)
  });

  // Real-time subscription for critical updates
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to matter deadline changes
    const matterSubscription = supabase
      .channel('matters-urgent')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matters',
          filter: `advocate_id=eq.${user.id}`,
        },
        (payload) => {
          // Invalidate urgent attention query on matter changes
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'urgent'] });
        }
      )
      .subscribe();

    // Subscribe to invoice status changes
    const invoiceSubscription = supabase
      .channel('invoices-urgent')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `advocate_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'urgent'] });
        }
      )
      .subscribe();

    return () => {
      matterSubscription.unsubscribe();
      invoiceSubscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  return query;
}

/**
 * Hook for financial snapshot (refreshes every 5 minutes)
 */
export function useFinancialSnapshot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', 'financial', user?.id],
    queryFn: () => user?.id ? dashboardService.getFinancialSnapshot(user.id) : Promise.resolve({ totalReceivables: 0, overdueAmount: 0, thisMonthInvoiced: 0, thisMonthCollected: 0, averageCollectionDays: 0, collectionRate: 0 }),
    enabled: !!user?.id,
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000, // 4 minutes
    gcTime: 600000, // 10 minutes
  });

  // Real-time subscription for payment updates
  useEffect(() => {
    if (!user?.id) return;

    const paymentSubscription = supabase
      .channel('payments-financial')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `advocate_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'financial'] });
        }
      )
      .subscribe();

    return () => {
      paymentSubscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  return query;
}

/**
 * Hook for active matters (refreshes every 2 minutes)
 * TODO: Fix - getActiveMatters method doesn't exist on DashboardService
 */
export function useActiveMatters(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'active-matters', user?.id, limit],
    queryFn: () => Promise.reject('Method not implemented'),
    enabled: false, // Disabled until method is implemented
    refetchInterval: 120000, // 2 minutes
    staleTime: 90000, // 1.5 minutes
    gcTime: 300000,
  });
}

/**
 * Hook for pending actions (refreshes every 1 minute)
 */
export function usePendingActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', 'pending-actions', user?.id],
    queryFn: () => user?.id ? dashboardService.getPendingActions(user.id) : Promise.reject('No user'),
    enabled: !!user?.id,
    refetchInterval: 60000, // 1 minute
    staleTime: 45000,
    gcTime: 300000,
  });

  // Real-time subscription for new requests
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('matters-pending')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matters',
          filter: `advocate_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'pending-actions'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  return query;
}

/**
 * Hook for quick stats (refreshes every 10 minutes)
 */
export function useQuickStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'quick-stats', user?.id],
    queryFn: () => user?.id ? dashboardService.getQuickStats(user.id) : Promise.reject('No user'),
    enabled: !!user?.id,
    refetchInterval: 600000, // 10 minutes
    staleTime: 540000, // 9 minutes
    gcTime: 1200000, // 20 minutes
  });
}

/**
 * Hook for this week's deadlines (refreshes every 5 minutes)
 */
export function useThisWeekDeadlines() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'week-deadlines', user?.id],
    queryFn: () => user?.id ? dashboardService.getThisWeekDeadlines(user.id) : Promise.reject('No user'),
    enabled: !!user?.id,
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000,
    gcTime: 600000,
  });
}

/**
 * Main dashboard hook that combines all metrics
 */
export function useEnhancedDashboard() {
  const urgentAttention = useUrgentAttention();
  const financialSnapshot = useFinancialSnapshot();
  const activeMatters = useActiveMatters();
  const pendingActions = usePendingActions();
  const quickStats = useQuickStats();
  const weekDeadlines = useThisWeekDeadlines();

  const isLoading =
    urgentAttention.isLoading ||
    financialSnapshot.isLoading ||
    activeMatters.isLoading ||
    pendingActions.isLoading ||
    quickStats.isLoading ||
    weekDeadlines.isLoading;

  const isError =
    urgentAttention.isError ||
    financialSnapshot.isError ||
    activeMatters.isError ||
    pendingActions.isError ||
    quickStats.isError ||
    weekDeadlines.isError;

  const error =
    urgentAttention.error ||
    financialSnapshot.error ||
    activeMatters.error ||
    pendingActions.error ||
    quickStats.error ||
    weekDeadlines.error;

  // Combine all data
  const data: DashboardMetrics | undefined = isLoading
    ? undefined
    : {
        urgentAttention: urgentAttention.data || {
          deadlinesToday: 0,
          overdue45Days: 0,
          pendingProformas5Days: 0,
        },
        thisWeekDeadlines: weekDeadlines.data?.count || 0,
        financialSnapshot: financialSnapshot.data || {
          outstandingFees: 0,
          outstandingInvoicesCount: 0,
          wipValue: 0,
          mattersInWip: 0,
          invoicedThisMonth: 0,
          invoicesThisMonthCount: 0,
          paymentRate: 0,
        },
        activeMatters: activeMatters.data || {
          count: 0,
          matters: [],
        },
        pendingActions: pendingActions.data || {
          newRequests: 0,
          proformaApprovals: 0,
          scopeAmendments: 0,
          readyToInvoice: 0,
        },
        quickStats: quickStats.data || {
          mattersCompleted30Days: 0,
          invoiced30Days: 0,
          paymentsReceived30Days: 0,
          averageTimeToInvoice: 0,
        },
      };

  // Calculate if any data is stale
  const isStale =
    urgentAttention.isStale ||
    financialSnapshot.isStale ||
    activeMatters.isStale ||
    pendingActions.isStale ||
    quickStats.isStale ||
    weekDeadlines.isStale;

  // Manual refetch all
  const refetchAll = async () => {
    await Promise.all([
      urgentAttention.refetch(),
      financialSnapshot.refetch(),
      activeMatters.refetch(),
      pendingActions.refetch(),
      quickStats.refetch(),
      weekDeadlines.refetch(),
    ]);
  };

  return {
    data,
    isLoading,
    isError,
    error,
    isStale,
    refetchAll,
    // Individual query states for granular control
    queries: {
      urgentAttention,
      financialSnapshot,
      activeMatters,
      pendingActions,
      quickStats,
      weekDeadlines,
    },
  };
}

/**
 * Hook to prefetch dashboard data (useful for navigation)
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return () => {
    if (!user?.id) return;

    // Prefetch all dashboard queries
    queryClient.prefetchQuery({
      queryKey: ['dashboard', 'urgent', user.id],
      queryFn: () => dashboardService.getUrgentAttention(user.id),
      staleTime: 30000,
    });

    queryClient.prefetchQuery({
      queryKey: ['dashboard', 'financial', user.id],
      queryFn: () => dashboardService.getFinancialSnapshot(user.id),
      staleTime: 240000,
    });

    // TODO: Fix getActiveMatters - method doesn't exist on DashboardService
    // queryClient.prefetchQuery({
    //   queryKey: ['dashboard', 'active-matters', user.id, 5],
    //   queryFn: () => dashboardService.getActiveMatters(5),
    //   staleTime: 90000,
    // });

    queryClient.prefetchQuery({
      queryKey: ['dashboard', 'pending-actions', user.id],
      queryFn: () => dashboardService.getPendingActions(user.id),
      staleTime: 45000,
    });
  };
}

/**
 * Hook to invalidate dashboard cache (useful after mutations)
 */
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();

  return {
    invalidateUrgent: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'urgent'] }),
    invalidateFinancial: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'financial'] }),
    invalidateActiveMatters: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'active-matters'] }),
    invalidatePendingActions: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pending-actions'] }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  };
}
