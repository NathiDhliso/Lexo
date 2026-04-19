/**
 * Statement of Account Service — Section 9.6
 * Generate and schedule per-attorney statements showing all invoices, payments, and balances.
 */
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type ScheduleType = 'none' | 'weekly' | 'monthly' | 'on_invoice';

export interface StatementSchedule {
  id: string;
  advocate_id: string;
  attorney_id?: string;
  schedule_type: ScheduleType;
  day_of_week?: number;
  day_of_month?: number;
  delivery_channels: string[];
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
}

export interface StatementLine {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface StatementData {
  attorney_name: string;
  attorney_email: string;
  advocate_name: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  total_invoiced: number;
  total_payments: number;
  total_credit_notes: number;
  lines: StatementLine[];
}

class StatementService {
  async generateStatement(attorneyId: string, periodStart: string, periodEnd: string): Promise<StatementData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      // Fetch invoices for this attorney in the period
      const { data: invoices } = await supabase.from('invoices').select('*')
        .eq('advocate_id', user.id).eq('attorney_id', attorneyId)
        .gte('created_at', periodStart).lte('created_at', periodEnd)
        .order('created_at');

      // Fetch payments
      const { data: payments } = await supabase.from('payments').select('*')
        .eq('advocate_id', user.id)
        .gte('created_at', periodStart).lte('created_at', periodEnd)
        .order('created_at');

      const lines: StatementLine[] = [];
      let runningBalance = 0;

      for (const inv of (invoices ?? [])) {
        runningBalance += inv.total_amount;
        lines.push({
          date: inv.created_at, description: `Invoice: ${inv.title ?? inv.invoice_number}`,
          reference: inv.invoice_number, debit: inv.total_amount, credit: 0, balance: runningBalance,
        });
      }

      for (const pay of (payments ?? [])) {
        runningBalance -= pay.amount;
        lines.push({
          date: pay.created_at, description: `Payment received`,
          reference: pay.reference ?? pay.id, debit: 0, credit: pay.amount, balance: runningBalance,
        });
      }

      lines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        attorney_name: '', attorney_email: '', advocate_name: '',
        period_start: periodStart, period_end: periodEnd,
        opening_balance: 0, closing_balance: runningBalance,
        total_invoiced: (invoices ?? []).reduce((s, i) => s + i.total_amount, 0),
        total_payments: (payments ?? []).reduce((s, p) => s + p.amount, 0),
        total_credit_notes: 0, lines,
      };
    } catch (err) {
      console.error('Failed to generate statement:', err);
      return null;
    }
  }

  async getSchedules(): Promise<StatementSchedule[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('statement_schedules').select('*').eq('advocate_id', user.id);
    if (error) return [];
    return data ?? [];
  }

  async upsertSchedule(schedule: Omit<StatementSchedule, 'id' | 'created_at'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('statement_schedules').upsert({
      ...schedule, advocate_id: user.id,
    }, { onConflict: 'advocate_id,attorney_id' });

    if (error) toast.error('Failed to save schedule');
    else toast.success('Statement schedule saved');
  }
}

export const statementService = new StatementService();
