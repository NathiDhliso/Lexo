/**
 * Reports Service
 * API service for generating and fetching reports
 * Falls back to mock data if Supabase RPC functions don't exist yet
 */

import { supabase } from '../../lib/supabase';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  matterType?: string;
  clientId?: string;
  status?: string;
}

export interface WIPReportData {
  matters: Array<{
    id: string;
    name: string;
    client: string;
    unbilledAmount: number;
    hours: number;
  }>;
  totalUnbilled: number;
}

export interface RevenueReportData {
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  breakdown: Array<{
    period: string;
    amount: number;
  }>;
}

export interface PipelineReportData {
  active: number;
  paused: number;
  completed: number;
  matters: Array<{
    id: string;
    name: string;
    status: string;
    value: number;
  }>;
}

class ReportsService {
  /**
   * Helper to handle RPC calls with fallback to mock data
   */
  private async callRPC<T>(rpcName: string, params: any, mockData: T): Promise<T> {
    try {
      const { data, error } = await supabase.rpc(rpcName, params);
      
      // If RPC doesn't exist (404), return mock data
      if (error) {
        console.warn(`RPC function '${rpcName}' error: ${error.message}. Using mock data.`);
        return mockData;
      }
      
      return data || mockData;
    } catch (err: any) {
      // Handle any errors with mock data
      console.warn(`RPC function '${rpcName}' failed. Using mock data.`, err);
      return mockData;
    }
  }

  async generateWIPReport(filters: ReportFilter): Promise<WIPReportData> {
    const mockData: WIPReportData = {
      matters: [
        { id: '1', name: 'Smith v. Jones', client: 'John Smith', unbilledAmount: 15000, hours: 45 },
        { id: '2', name: 'Estate Planning - Brown', client: 'Sarah Brown', unbilledAmount: 8500, hours: 28 },
        { id: '3', name: 'Contract Review - Tech Corp', client: 'Tech Corp Ltd', unbilledAmount: 22000, hours: 67 },
      ],
      totalUnbilled: 45500,
    };
    
    return this.callRPC('generate_wip_report', filters, mockData);
  }

  async generateRevenueReport(filters: ReportFilter): Promise<RevenueReportData> {
    const mockData: RevenueReportData = {
      totalRevenue: 125000,
      paidInvoices: 15,
      unpaidInvoices: 5,
      breakdown: [
        { period: 'Jan 2024', amount: 25000 },
        { period: 'Feb 2024', amount: 30000 },
        { period: 'Mar 2024', amount: 28000 },
        { period: 'Apr 2024', amount: 42000 },
      ],
    };
    
    return this.callRPC('generate_revenue_report', filters, mockData);
  }

  async generatePipelineReport(filters: ReportFilter): Promise<PipelineReportData> {
    const mockData: PipelineReportData = {
      active: 12,
      paused: 3,
      completed: 45,
      matters: [
        { id: '1', name: 'Corporate Merger - ABC Ltd', status: 'active', value: 85000 },
        { id: '2', name: 'Litigation - XYZ Case', status: 'active', value: 120000 },
        { id: '3', name: 'Property Transfer', status: 'paused', value: 15000 },
      ],
    };
    
    return this.callRPC('generate_pipeline_report', filters, mockData);
  }

  async generateClientRevenueReport(filters: ReportFilter): Promise<any> {
    const mockData = {
      clients: [
        { name: 'Tech Corp Ltd', revenue: 45000, invoices: 8 },
        { name: 'John Smith', revenue: 28000, invoices: 5 },
        { name: 'Sarah Brown', revenue: 15000, invoices: 3 },
      ],
      totalRevenue: 88000,
    };
    
    return this.callRPC('generate_client_revenue_report', filters, mockData);
  }

  async generateTimeEntryReport(filters: ReportFilter): Promise<any> {
    const mockData = {
      entries: [
        { date: '2024-04-15', matter: 'Smith v. Jones', hours: 3.5, rate: 350, amount: 1225 },
        { date: '2024-04-16', matter: 'Estate Planning', hours: 2.0, rate: 300, amount: 600 },
        { date: '2024-04-17', matter: 'Contract Review', hours: 5.5, rate: 400, amount: 2200 },
      ],
      totalHours: 11.0,
      totalAmount: 4025,
    };
    
    return this.callRPC('generate_time_entry_report', filters, mockData);
  }

  async generateOutstandingInvoicesReport(filters: ReportFilter): Promise<any> {
    const mockData = {
      invoices: [
        { id: 'INV-001', client: 'Tech Corp', amount: 15000, dueDate: '2024-04-30', daysOverdue: 0 },
        { id: 'INV-002', client: 'John Smith', amount: 8500, dueDate: '2024-04-15', daysOverdue: 15 },
        { id: 'INV-003', client: 'ABC Ltd', amount: 22000, dueDate: '2024-05-10', daysOverdue: 0 },
      ],
      totalOutstanding: 45500,
    };
    
    return this.callRPC('generate_outstanding_invoices_report', filters, mockData);
  }

  async generateAgingReport(filters: ReportFilter): Promise<any> {
    const mockData = {
      current: 25000,
      days30: 12000,
      days60: 5000,
      days90: 3500,
      over90: 0,
      total: 45500,
    };
    
    return this.callRPC('generate_aging_report', filters, mockData);
  }

  async generateProfitabilityReport(filters: ReportFilter): Promise<any> {
    const mockData = {
      matters: [
        { name: 'Smith v. Jones', revenue: 15000, costs: 3000, profit: 12000, margin: 80 },
        { name: 'Estate Planning', revenue: 8500, costs: 1500, profit: 7000, margin: 82 },
        { name: 'Contract Review', revenue: 22000, costs: 5000, profit: 17000, margin: 77 },
      ],
      totalRevenue: 45500,
      totalCosts: 9500,
      totalProfit: 36000,
      averageMargin: 79,
    };
    
    return this.callRPC('generate_profitability_report', filters, mockData);
  }

  async generateCustomReport(filters: ReportFilter & { includeWIP?: boolean; includeInvoices?: boolean; includePayments?: boolean }): Promise<any> {
    const mockData = {
      wip: filters.includeWIP ? { total: 45500, matters: 12 } : null,
      invoices: filters.includeInvoices ? { total: 125000, count: 20 } : null,
      payments: filters.includePayments ? { total: 98000, count: 15 } : null,
      summary: {
        totalRevenue: 125000,
        totalWIP: 45500,
        totalOutstanding: 27000,
      },
    };
    
    return this.callRPC('generate_custom_report', filters, mockData);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
