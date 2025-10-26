/**
 * Dashboard Service
 * Handles all dashboard metrics and data aggregation
 * Implements caching for performance optimization
 */

import { supabase } from '@/lib/supabase';
import type { Matter, MatterStatus } from '../../types';

// Dashboard Metrics Interfaces
export interface UrgentAttentionItem {
  type: 'deadline_today' | 'overdue_invoice' | 'pending_proforma';
  id: string;
  title: string;
  description: string;
  daysOverdue?: number;
  amount?: number;
  deadline?: string;
  matterId?: string;
  invoiceId?: string;
  proformaId?: string;
}

export interface ThisWeekDeadline {
  matterId: string;
  title: string;
  deadline: string;
  daysRemaining: number;
  status: MatterStatus;
  clientName: string;
}

export interface FinancialSnapshot {
  outstandingFees: {
    amount: number;
    count: number;
  };
  wipValue: {
    amount: number;
    count: number;
  };
  monthInvoiced: {
    amount: number;
    count: number;
  };
}

export interface ActiveMatterWithProgress {
  matter: Matter;
  completionPercentage: number;
  lastActivity: string;
  isStale: boolean;
  deadline?: string;
  budget?: number;
  amountUsed: number;
}

export interface PendingActions {
  newRequests: number;
  proformaApprovals: number;
  scopeAmendments: number;
  readyToInvoice: number;
}

export interface QuickStats {
  mattersCompleted30d: number;
  invoiced30d: number;
  paymentsReceived30d: number;
  avgTimeToInvoice: number;
}

export interface DashboardMetrics {
  urgentAttention: UrgentAttentionItem[];
  thisWeekDeadlines: ThisWeekDeadline[];
  financialSnapshot: FinancialSnapshot;
  activeMatters: ActiveMatterWithProgress[];
  pendingActions: PendingActions;
  quickStats: QuickStats;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DashboardService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get all dashboard metrics with caching
   */
  async getMetrics(advocateId: string): Promise<DashboardMetrics> {
    const cacheKey = `metrics_${advocateId}`;
    const cached = this.getFromCache<DashboardMetrics>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch all metrics in parallel for better performance
    const [
      urgentAttention,
      thisWeekDeadlines,
      financialSnapshot,
      activeMatters,
      pendingActions,
      quickStats
    ] = await Promise.all([
      this.getUrgentAttention(advocateId),
      this.getThisWeekDeadlines(advocateId),
      this.getFinancialSnapshot(advocateId),
      this.getActiveMattersWithProgress(advocateId),
      this.getPendingActions(advocateId),
      this.getQuickStats(advocateId)
    ]);

    const metrics: DashboardMetrics = {
      urgentAttention,
      thisWeekDeadlines,
      financialSnapshot,
      activeMatters,
      pendingActions,
      quickStats
    };

    this.setCache(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get urgent attention items
   * - Matters with deadlines today
   * - Invoices overdue 45+ days
   * - Pro forma requests pending 5+ days
   */
  async getUrgentAttention(advocateId: string): Promise<UrgentAttentionItem[]> {
    const items: UrgentAttentionItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    try {
      // Get matters with deadlines today
      const { data: mattersToday, error: mattersError } = await supabase
        .from('matters')
        .select('id, title, expected_completion_date, client_name')
        .eq('advocate_id', advocateId)
        .eq('expected_completion_date', todayStr)
        .in('status', ['active', 'pending']);

      if (!mattersError && mattersToday) {
        mattersToday.forEach(matter => {
          items.push({
            type: 'deadline_today',
            id: matter.id,
            title: matter.title,
            description: `Matter deadline is today for ${matter.client_name}`,
            deadline: matter.expected_completion_date,
            matterId: matter.id
          });
        });
      }

      // Get invoices overdue 45+ days
      const fortyFiveDaysAgo = new Date();
      fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
      const fortyFiveDaysAgoStr = fortyFiveDaysAgo.toISOString().split('T')[0];

      const { data: overdueInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, amount_paid, due_date, matter_id')
        .eq('advocate_id', advocateId)
        .lte('due_date', fortyFiveDaysAgoStr)
        .neq('status', 'paid')
        .neq('status', 'cancelled');

      if (!invoicesError && overdueInvoices) {
        overdueInvoices.forEach(invoice => {
          const dueDate = new Date(invoice.due_date);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const outstanding = invoice.total_amount - (invoice.amount_paid || 0);

          items.push({
            type: 'overdue_invoice',
            id: invoice.id,
            title: `Invoice ${invoice.invoice_number}`,
            description: `Overdue by ${daysOverdue} days`,
            daysOverdue,
            amount: outstanding,
            invoiceId: invoice.id,
            matterId: invoice.matter_id || undefined
          });
        });
      }

      // Get pro forma requests pending 5+ days
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const { data: pendingProformas, error: proformasError } = await supabase
        .from('proforma_requests')
        .select('id, title, created_at, estimated_fee')
        .eq('advocate_id', advocateId)
        .eq('status', 'sent')
        .lte('created_at', fiveDaysAgo.toISOString());

      if (!proformasError && pendingProformas) {
        pendingProformas.forEach(proforma => {
          const createdDate = new Date(proforma.created_at);
          const daysPending = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

          items.push({
            type: 'pending_proforma',
            id: proforma.id,
            title: proforma.title || 'Pro Forma Request',
            description: `Awaiting response for ${daysPending} days`,
            daysOverdue: daysPending,
            amount: proforma.estimated_fee || undefined,
            proformaId: proforma.id
          });
        });
      }

      // Sort by urgency (overdue days, then by type priority)
      items.sort((a, b) => {
        const priorityOrder = { 'deadline_today': 1, 'overdue_invoice': 2, 'pending_proforma': 3 };
        if (a.type !== b.type) {
          return priorityOrder[a.type] - priorityOrder[b.type];
        }
        return (b.daysOverdue || 0) - (a.daysOverdue || 0);
      });

      return items;
    } catch (error) {
      console.error('Error fetching urgent attention items:', error);
      return [];
    }
  }

  /**
   * Get matters due within 7 days
   */
  async getThisWeekDeadlines(advocateId: string): Promise<ThisWeekDeadline[]> {
    try {
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const { data: matters, error } = await supabase
        .from('matters')
        .select('id, title, expected_completion_date, status, client_name')
        .eq('advocate_id', advocateId)
        .gte('expected_completion_date', today.toISOString().split('T')[0])
        .lte('expected_completion_date', sevenDaysFromNow.toISOString().split('T')[0])
        .in('status', ['active', 'pending'])
        .order('expected_completion_date', { ascending: true });

      if (error || !matters) {
        return [];
      }

      return matters.map(matter => {
        const deadline = new Date(matter.expected_completion_date);
        const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          matterId: matter.id,
          title: matter.title,
          deadline: matter.expected_completion_date,
          daysRemaining,
          status: matter.status as MatterStatus,
          clientName: matter.client_name
        };
      });
    } catch (error) {
      console.error('Error fetching this week deadlines:', error);
      return [];
    }
  }

  /**
   * Get financial snapshot
   * - Outstanding fees (total and count)
   * - WIP value (total and count)
   * - Month invoiced (total and count)
   */
  async getFinancialSnapshot(advocateId: string): Promise<FinancialSnapshot> {
    try {
      // Get outstanding fees from unpaid invoices
      const { data: unpaidInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('advocate_id', advocateId)
        .neq('status', 'paid')
        .neq('status', 'cancelled');

      let outstandingFees = { amount: 0, count: 0 };
      if (!invoicesError && unpaidInvoices) {
        outstandingFees = {
          amount: unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount - (inv.amount_paid || 0)), 0),
          count: unpaidInvoices.length
        };
      }

      // Get WIP value from active matters
      const { data: activeMatters, error: mattersError } = await supabase
        .from('matters')
        .select('wip_value')
        .eq('advocate_id', advocateId)
        .in('status', ['active', 'pending']);

      let wipValue = { amount: 0, count: 0 };
      if (!mattersError && activeMatters) {
        wipValue = {
          amount: activeMatters.reduce((sum, matter) => sum + (matter.wip_value || 0), 0),
          count: activeMatters.length
        };
      }

      // Get current month invoiced amount
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: monthInvoices, error: monthError } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('advocate_id', advocateId)
        .gte('invoice_date', monthStart.toISOString().split('T')[0])
        .lte('invoice_date', monthEnd.toISOString().split('T')[0])
        .neq('status', 'cancelled');

      let monthInvoiced = { amount: 0, count: 0 };
      if (!monthError && monthInvoices) {
        monthInvoiced = {
          amount: monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
          count: monthInvoices.length
        };
      }

      return {
        outstandingFees,
        wipValue,
        monthInvoiced
      };
    } catch (error) {
      console.error('Error fetching financial snapshot:', error);
      return {
        outstandingFees: { amount: 0, count: 0 },
        wipValue: { amount: 0, count: 0 },
        monthInvoiced: { amount: 0, count: 0 }
      };
    }
  }

  /**
   * Get active matters with progress calculation
   * Returns top 5 most recently active matters
   */
  async getActiveMattersWithProgress(advocateId: string): Promise<ActiveMatterWithProgress[]> {
    try {
      // Get active matters with their time entries
      const { data: matters, error: mattersError } = await supabase
        .from('matters')
        .select(`
          *,
          time_entries(id, created_at),
          logged_services(id, created_at)
        `)
        .eq('advocate_id', advocateId)
        .in('status', ['active', 'pending'])
        .order('updated_at', { ascending: false })
        .limit(5);

      if (mattersError || !matters) {
        return [];
      }

      const now = new Date();
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(now.getDate() - 14);

      return matters.map(matter => {
        // Calculate completion percentage based on WIP vs estimated fee
        let completionPercentage = 0;
        if (matter.estimated_fee && matter.estimated_fee > 0) {
          completionPercentage = Math.min(100, Math.round((matter.wip_value / matter.estimated_fee) * 100));
        }

        // Find last activity from time entries or logged services
        const timeEntries = (matter.time_entries || []) as any[];
        const loggedServices = (matter.logged_services || []) as any[];
        const allActivities = [
          ...timeEntries.map(te => new Date(te.created_at)),
          ...loggedServices.map(ls => new Date(ls.created_at)),
          new Date(matter.updated_at)
        ];
        const lastActivity = allActivities.length > 0 
          ? new Date(Math.max(...allActivities.map(d => d.getTime())))
          : new Date(matter.updated_at);

        // Check if matter is stale (no activity in 14+ days)
        const isStale = lastActivity < fourteenDaysAgo;

        return {
          matter: matter as Matter,
          completionPercentage,
          lastActivity: lastActivity.toISOString(),
          isStale,
          deadline: matter.expected_completion_date || undefined,
          budget: matter.estimated_fee || undefined,
          amountUsed: matter.wip_value || 0
        };
      });
    } catch (error) {
      console.error('Error fetching active matters with progress:', error);
      return [];
    }
  }

  /**
   * Get pending actions counts
   * - New matter requests from attorneys
   * - Pro forma approvals needed
   * - Scope amendments awaiting attorney approval
   * - Completed matters ready to invoice
   */
  async getPendingActions(advocateId: string): Promise<PendingActions> {
    try {
      // Get new matter requests
      const { count: newRequests } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('advocate_id', advocateId)
        .eq('status', 'new_request');

      // Get pro forma requests awaiting response
      const { count: proformaApprovals } = await supabase
        .from('proforma_requests')
        .select('*', { count: 'exact', head: true })
        .eq('advocate_id', advocateId)
        .eq('status', 'sent');

      // Get scope amendments awaiting approval
      const { count: scopeAmendments } = await supabase
        .from('scope_amendments')
        .select('*', { count: 'exact', head: true })
        .eq('advocate_id', advocateId)
        .eq('status', 'pending');

      // Get completed matters ready to invoice (have WIP but no invoice)
      const { data: completedMatters } = await supabase
        .from('matters')
        .select('id, wip_value')
        .eq('advocate_id', advocateId)
        .eq('status', 'completed')
        .gt('wip_value', 0);

      // Filter out matters that already have invoices
      let readyToInvoice = 0;
      if (completedMatters) {
        for (const matter of completedMatters) {
          const { count } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('matter_id', matter.id)
            .neq('status', 'cancelled');

          if (count === 0) {
            readyToInvoice++;
          }
        }
      }

      return {
        newRequests: newRequests || 0,
        proformaApprovals: proformaApprovals || 0,
        scopeAmendments: scopeAmendments || 0,
        readyToInvoice
      };
    } catch (error) {
      console.error('Error fetching pending actions:', error);
      return {
        newRequests: 0,
        proformaApprovals: 0,
        scopeAmendments: 0,
        readyToInvoice: 0
      };
    }
  }

  /**
   * Get quick stats for last 30 days
   * - Matters completed
   * - Total invoiced amount
   * - Total payments received
   * - Average time to invoice
   */
  async getQuickStats(advocateId: string): Promise<QuickStats> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Get matters completed in last 30 days
      const { count: mattersCompleted30d } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('advocate_id', advocateId)
        .eq('status', 'completed')
        .gte('date_closed', thirtyDaysAgoStr);

      // Get invoices created in last 30 days
      const { data: invoices30d, error: invoicesError } = await supabase
        .from('invoices')
        .select('total_amount, invoice_date, matter_id')
        .eq('advocate_id', advocateId)
        .gte('invoice_date', thirtyDaysAgoStr)
        .neq('status', 'cancelled');

      let invoiced30d = 0;
      if (!invoicesError && invoices30d) {
        invoiced30d = invoices30d.reduce((sum, inv) => sum + inv.total_amount, 0);
      }

      // Get payments received in last 30 days
      const { data: payments30d, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('advocate_id', advocateId)
        .gte('payment_date', thirtyDaysAgoStr);

      let paymentsReceived30d = 0;
      if (!paymentsError && payments30d) {
        paymentsReceived30d = payments30d.reduce((sum, payment) => sum + payment.amount, 0);
      }

      // Calculate average time to invoice
      let avgTimeToInvoice = 0;
      if (invoices30d && invoices30d.length > 0) {
        const timeDifferences: number[] = [];

        for (const invoice of invoices30d) {
          if (invoice.matter_id) {
            const { data: matter } = await supabase
              .from('matters')
              .select('date_commenced')
              .eq('id', invoice.matter_id)
              .single();

            if (matter && matter.date_commenced) {
              const commenced = new Date(matter.date_commenced);
              const invoiced = new Date(invoice.invoice_date);
              const daysDiff = Math.floor((invoiced.getTime() - commenced.getTime()) / (1000 * 60 * 60 * 24));
              if (daysDiff >= 0) {
                timeDifferences.push(daysDiff);
              }
            }
          }
        }

        if (timeDifferences.length > 0) {
          avgTimeToInvoice = Math.round(
            timeDifferences.reduce((sum, days) => sum + days, 0) / timeDifferences.length
          );
        }
      }

      return {
        mattersCompleted30d: mattersCompleted30d || 0,
        invoiced30d,
        paymentsReceived30d,
        avgTimeToInvoice
      };
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return {
        mattersCompleted30d: 0,
        invoiced30d: 0,
        paymentsReceived30d: 0,
        avgTimeToInvoice: 0
      };
    }
  }

  /**
   * Clear cache for specific advocate or all cache
   */
  clearCache(advocateId?: string): void {
    if (advocateId) {
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.includes(advocateId)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set data in cache with timestamp
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
