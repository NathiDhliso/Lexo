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
    disbursements?: number;
    daysInWIP?: number;
  }>;
  totalUnbilled: number;
  totalDisbursements?: number;
}

export interface RevenueReportData {
  totalRevenue: number;
  creditNotes?: number;
  netRevenue?: number;
  paidInvoices: number;
  unpaidInvoices: number;
  paymentRate?: number;
  breakdown: Array<{
    period: string;
    amount: number;
    invoicedAmount?: number;
    creditNotes?: number;
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

export interface OutstandingFeesReportData {
  invoices: Array<{
    id: string;
    invoiceId: string;
    client: string;
    attorney: string;
    totalAmount: number;
    amountPaid: number;
    outstandingBalance: number;
    dueDate: string;
    invoiceDate: string;
    daysOverdue: number;
    agingBracket: string;
    paymentStatus: string;
    paymentProgress?: number;
  }>;
  totalOutstanding: number;
  agingBrackets: {
    current: number;
    days0to30: number;
    days31to60: number;
    days61to90: number;
    days90plus: number;
  };
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
    try {
      // Try to get real data from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('matters')
        .select('id, title, client_name, wip_value, created_at')
        .eq('advocate_id', user.id)
        .eq('status', 'active')
        .gt('wip_value', 0);

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data: matters, error } = await query;

      if (error) throw error;

      // Get time entries and disbursements for each matter
      const mattersWithDetails = await Promise.all(
        (matters || []).map(async (matter) => {
          // Get unbilled time entries
          const { data: timeEntries } = await supabase
            .from('time_entries')
            .select('hours_worked')
            .eq('matter_id', matter.id)
            .is('invoice_id', null); // Only unbilled time

          const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0) || 0;

          // Get unbilled disbursements (NEW!)
          const { data: disbursements } = await supabase
            .from('disbursements')
            .select('amount, vat_amount')
            .eq('matter_id', matter.id)
            .is('invoice_id', null); // Only unbilled disbursements

          const totalDisbursements = disbursements?.reduce(
            (sum, d) => sum + d.amount + (d.vat_amount || 0), 
            0
          ) || 0;

          // Calculate days in WIP (NEW!)
          const createdDate = new Date(matter.created_at);
          const today = new Date();
          const daysInWIP = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: matter.id,
            name: matter.title,
            client: matter.client_name,
            unbilledAmount: (matter.wip_value || 0) + totalDisbursements,
            hours: totalHours,
            disbursements: totalDisbursements,
            daysInWIP
          };
        })
      );

      const totalUnbilled = mattersWithDetails.reduce((sum, m) => sum + m.unbilledAmount, 0);
      const totalDisbursements = mattersWithDetails.reduce((sum, m) => sum + (m.disbursements || 0), 0);

      return {
        matters: mattersWithDetails,
        totalUnbilled,
        totalDisbursements
      };
    } catch (error) {
      console.warn('Failed to fetch real WIP data, using mock:', error);
      // Fallback to mock data
      const mockData: WIPReportData = {
        matters: [
          { id: '1', name: 'Smith v. Jones', client: 'John Smith', unbilledAmount: 15000, hours: 45, disbursements: 1200, daysInWIP: 12 },
          { id: '2', name: 'Estate Planning - Brown', client: 'Sarah Brown', unbilledAmount: 8500, hours: 28, disbursements: 500, daysInWIP: 8 },
          { id: '3', name: 'Contract Review - Tech Corp', client: 'Tech Corp Ltd', unbilledAmount: 22000, hours: 67, disbursements: 2300, daysInWIP: 21 },
        ],
        totalUnbilled: 45500,
        totalDisbursements: 4000,
      };
      return mockData;
    }
  }

  async generateRevenueReport(filters: ReportFilter): Promise<RevenueReportData> {
    try {
      // Get real data from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get all payments with proper date filtering
      let paymentsQuery = supabase
        .from('payments')
        .select('amount, payment_date, invoice_id')
        .eq('advocate_id', user.id)
        .order('payment_date', { ascending: true });

      if (filters.startDate) {
        paymentsQuery = paymentsQuery.gte('payment_date', filters.startDate);
      }
      if (filters.endDate) {
        paymentsQuery = paymentsQuery.lte('payment_date', filters.endDate);
      }

      const { data: payments, error: paymentsError } = await paymentsQuery;
      if (paymentsError) {
        console.warn('Payments query failed:', paymentsError);
        throw paymentsError;
      }

      // Get invoices with proper date filtering
      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total_amount, invoice_date, payment_status, amount_paid')
        .eq('advocate_id', user.id);

      if (filters.startDate) {
        invoicesQuery = invoicesQuery.gte('invoice_date', filters.startDate);
      }
      if (filters.endDate) {
        invoicesQuery = invoicesQuery.lte('invoice_date', filters.endDate);
      }

      const { data: invoices, error: invoicesError } = await invoicesQuery;
      if (invoicesError) {
        console.warn('Invoices query failed:', invoicesError);
        throw invoicesError;
      }

      // Get applied credit notes
      let creditNotesQuery = supabase
        .from('credit_notes')
        .select('amount, issued_at, created_at, status')
        .eq('issued_by', user.id)
        .eq('status', 'applied');

      if (filters.startDate) {
        creditNotesQuery = creditNotesQuery.gte('issued_at', filters.startDate);
      }
      if (filters.endDate) {
        creditNotesQuery = creditNotesQuery.lte('issued_at', filters.endDate);
      }

      const { data: creditNotes } = await creditNotesQuery;

      // Process the data
      const paymentsByMonth: { [key: string]: number } = {};
      const invoicesByMonth: { [key: string]: number } = {};
      const creditNotesByMonth: { [key: string]: number } = {};

      // Group payments by month
      (payments || []).forEach((payment: any) => {
        const date = new Date(payment.payment_date);
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        paymentsByMonth[monthKey] = (paymentsByMonth[monthKey] || 0) + (payment.amount || 0);
      });

      // Group invoices by month
      (invoices || []).forEach((invoice: any) => {
        const date = new Date(invoice.invoice_date);
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        invoicesByMonth[monthKey] = (invoicesByMonth[monthKey] || 0) + (invoice.total_amount || 0);
      });

      // Group credit notes by month
      (creditNotes || []).forEach((cn: any) => {
        const date = new Date(cn.issued_at || cn.created_at);
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        creditNotesByMonth[monthKey] = (creditNotesByMonth[monthKey] || 0) + (cn.amount || 0);
      });

      // Create monthly breakdown
      const allMonths = new Set([
        ...Object.keys(paymentsByMonth), 
        ...Object.keys(invoicesByMonth),
        ...Object.keys(creditNotesByMonth)
      ]);
      
      const breakdown = Array.from(allMonths).map(month => ({
        period: month,
        amount: paymentsByMonth[month] || 0,
        invoicedAmount: invoicesByMonth[month] || 0,
        creditNotes: creditNotesByMonth[month] || 0
      })).sort((a, b) => {
        // Sort by date properly
        const [monthA, yearA] = a.period.split(' ');
        const [monthB, yearB] = b.period.split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA.getTime() - dateB.getTime();
      });

      // Calculate totals
      const totalRevenue = (payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const totalCreditNotes = (creditNotes || []).reduce((sum: number, cn: any) => sum + (cn.amount || 0), 0);
      const netRevenue = totalRevenue - totalCreditNotes;
      
      const totalInvoiced = (invoices || []).reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      const paymentRate = totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0;

      const paidInvoices = (invoices || []).filter((inv: any) => inv.payment_status === 'paid').length;
      const unpaidInvoices = (invoices || []).filter((inv: any) => 
        inv.payment_status === 'unpaid' || inv.payment_status === 'partially_paid'
      ).length;

      return {
        totalRevenue,
        creditNotes: totalCreditNotes,
        netRevenue,
        paymentRate: Math.round(paymentRate * 100) / 100, // Round to 2 decimal places
        paidInvoices,
        unpaidInvoices,
        breakdown
      };
    } catch (error) {
      console.warn('Failed to fetch real revenue data, using mock:', error);
      // Enhanced fallback with realistic mock data
      const mockData: RevenueReportData = {
        totalRevenue: 125000,
        creditNotes: 5000,
        netRevenue: 120000,
        paymentRate: 79.2,
        paidInvoices: 15,
        unpaidInvoices: 5,
        breakdown: [
          { period: 'Jan 2025', amount: 25000, invoicedAmount: 28000, creditNotes: 1000 },
          { period: 'Feb 2025', amount: 30000, invoicedAmount: 35000, creditNotes: 1500 },
          { period: 'Mar 2025', amount: 28000, invoicedAmount: 32000, creditNotes: 1000 },
          { period: 'Apr 2025', amount: 42000, invoicedAmount: 50000, creditNotes: 1500 },
        ],
      };
      return mockData;
    }
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

  /**
   * Generate Outstanding Fees Report with partial payment tracking
   * NEW: Enhanced with payment progress and aging brackets
   */
  async generateOutstandingFeesReport(filters: ReportFilter): Promise<OutstandingFeesReportData> {
    try {
      // Try to get real data from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          matter_id,
          total_amount,
          amount_paid,
          balance_due,
          payment_status,
          due_date,
          invoice_date,
          status,
          matters (
            client_name,
            instructing_attorney
          )
        `)
        .eq('advocate_id', user.id)
        .gt('balance_due', 0)
        .order('due_date', { ascending: true });

      if (filters.startDate) {
        query = query.gte('due_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('due_date', filters.endDate);
      }

      const { data: invoices, error } = await query;

      if (error) throw error;

      const now = new Date();
      const formattedInvoices = (invoices || []).map((invoice: any) => {
        const dueDate = new Date(invoice.due_date);
        const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysOverdue = daysSinceDue > 0 ? daysSinceDue : 0;
        
        // Determine aging bracket
        let agingBracket = 'Current';
        if (daysOverdue > 90) {
          agingBracket = '90+ days';
        } else if (daysOverdue > 60) {
          agingBracket = '61-90 days';
        } else if (daysOverdue > 30) {
          agingBracket = '31-60 days';
        } else if (daysOverdue > 0) {
          agingBracket = '0-30 days';
        }

        // Calculate payment progress (NEW!)
        const paymentProgress = invoice.total_amount > 0
          ? ((invoice.amount_paid || 0) / invoice.total_amount) * 100
          : 0;

        return {
          id: invoice.invoice_number,
          invoiceId: invoice.id,
          client: invoice.matters?.client_name || 'Unknown',
          attorney: invoice.matters?.instructing_attorney || 'Unknown',
          totalAmount: invoice.total_amount,
          amountPaid: invoice.amount_paid || 0,
          outstandingBalance: invoice.balance_due,
          dueDate: invoice.due_date,
          invoiceDate: invoice.invoice_date,
          daysOverdue,
          agingBracket,
          paymentStatus: invoice.payment_status,
          paymentProgress
        };
      });

      const totalOutstanding = formattedInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
      
      // Calculate aging brackets totals
      const agingBrackets = {
        current: formattedInvoices.filter(inv => inv.agingBracket === 'Current').reduce((sum, inv) => sum + inv.outstandingBalance, 0),
        days0to30: formattedInvoices.filter(inv => inv.agingBracket === '0-30 days').reduce((sum, inv) => sum + inv.outstandingBalance, 0),
        days31to60: formattedInvoices.filter(inv => inv.agingBracket === '31-60 days').reduce((sum, inv) => sum + inv.outstandingBalance, 0),
        days61to90: formattedInvoices.filter(inv => inv.agingBracket === '61-90 days').reduce((sum, inv) => sum + inv.outstandingBalance, 0),
        days90plus: formattedInvoices.filter(inv => inv.agingBracket === '90+ days').reduce((sum, inv) => sum + inv.outstandingBalance, 0),
      };

      return {
        invoices: formattedInvoices,
        totalOutstanding,
        agingBrackets
      } as OutstandingFeesReportData;
    } catch (error) {
      console.warn('Failed to fetch real outstanding invoices data, using mock:', error);
      // Fallback to mock data
      const mockData: OutstandingFeesReportData = {
        invoices: [
          { 
            id: 'INV-2025-001', 
            invoiceId: '1',
            client: 'Tech Corp', 
            attorney: 'Smith & Associates',
            totalAmount: 15000,
            amountPaid: 0,
            outstandingBalance: 15000,
            dueDate: '2024-04-30', 
            invoiceDate: '2024-04-15',
            daysOverdue: 0,
            agingBracket: 'Current',
            paymentStatus: 'unpaid',
            paymentProgress: 0
          },
          { 
            id: 'INV-2025-002', 
            invoiceId: '2',
            client: 'John Smith', 
            attorney: 'Jones Inc',
            totalAmount: 10000,
            amountPaid: 1500,
            outstandingBalance: 8500,
            dueDate: '2024-04-15', 
            invoiceDate: '2024-04-01',
            daysOverdue: 15,
            agingBracket: '0-30 days',
            paymentStatus: 'partially_paid',
            paymentProgress: 15
          },
          { 
            id: 'INV-2025-003', 
            invoiceId: '3',
            client: 'ABC Ltd', 
            attorney: 'Brown & Co',
            totalAmount: 22000,
            amountPaid: 0,
            outstandingBalance: 22000,
            dueDate: '2024-05-10', 
            invoiceDate: '2024-04-25',
            daysOverdue: 0,
            agingBracket: 'Current',
            paymentStatus: 'unpaid',
            paymentProgress: 0
          },
        ],
        totalOutstanding: 45500,
        agingBrackets: {
          current: 37000,
          days0to30: 8500,
          days31to60: 0,
          days61to90: 0,
          days90plus: 0
        }
      };
      return mockData;
    }
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

  /**
   * Alias for backward compatibility
   */
  async generateOutstandingInvoicesReport(filters: ReportFilter): Promise<OutstandingFeesReportData> {
    return this.generateOutstandingFeesReport(filters);
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
