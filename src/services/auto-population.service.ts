import { supabase } from '../lib/supabase';
import type { Matter, ProForma, Invoice } from '../types';

export class AutoPopulationService {
  static extractClientData(matter: Matter) {
    return {
      client_name: matter.client_name,
      client_email: matter.client_email,
      client_phone: matter.client_phone,
      client_address: matter.client_address,
      client_type: matter.client_type
    };
  }

  static extractAttorneyData(matter: Matter) {
    return {
      instructing_attorney: matter.instructing_attorney,
      instructing_attorney_email: matter.instructing_attorney_email,
      instructing_attorney_phone: matter.instructing_attorney_phone,
      instructing_firm: matter.instructing_firm,
      instructing_firm_ref: matter.instructing_firm_ref
    };
  }

  static prepareProFormaFromMatter(matter: Matter, unbilledAmount?: number) {
    return {
      matter_id: matter.id,
      ...this.extractClientData(matter),
      ...this.extractAttorneyData(matter),
      matter_title: matter.title,
      matter_description: matter.description,
      suggested_amount: unbilledAmount || matter.estimated_fee || 0,
      fee_narrative: `Professional fees for ${matter.title}`,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  static prepareInvoiceFromProForma(proForma: any, matter: Matter) {
    return {
      matter_id: proForma.matter_id || matter.id,
      ...this.extractClientData(matter),
      fees_amount: proForma.total_amount,
      fee_narrative: proForma.fee_narrative,
      converted_from_proforma_id: proForma.id,
      status: 'draft' as const,
      is_pro_forma: false,
      date_issued: new Date().toISOString().split('T')[0],
      date_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  static async calculateSuggestedAmount(matterId: string): Promise<number> {
    try {
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('duration, hourly_rate')
        .eq('matter_id', matterId)
        .eq('billed', false);

      if (error) {
        console.error('Error fetching time entries:', error);
        return 0;
      }

      if (!timeEntries || timeEntries.length === 0) {
        return 0;
      }

      return timeEntries.reduce((total, entry) => {
        return total + (entry.duration / 60) * entry.hourly_rate;
      }, 0);
    } catch (error) {
      console.error('Error calculating suggested amount:', error);
      return 0;
    }
  }

  static async getUnbilledExpenses(matterId: string): Promise<number> {
    try {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('matter_id', matterId)
        .eq('billed', false);

      if (error) {
        console.error('Error fetching expenses:', error);
        return 0;
      }

      if (!expenses || expenses.length === 0) {
        return 0;
      }

      return expenses.reduce((total, expense) => total + expense.amount, 0);
    } catch (error) {
      console.error('Error calculating unbilled expenses:', error);
      return 0;
    }
  }

  static async getTotalUnbilledAmount(matterId: string): Promise<number> {
    const [fees, expenses] = await Promise.all([
      this.calculateSuggestedAmount(matterId),
      this.getUnbilledExpenses(matterId)
    ]);

    return fees + expenses;
  }

  static generateDefaultNarrative(matter: Matter, amount?: number): string {
    const parts = [
      `Professional fees for ${matter.title}`,
      matter.matter_type ? `(${matter.matter_type})` : '',
      amount ? `in the amount of R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : ''
    ];

    return parts.filter(Boolean).join(' ');
  }
}
