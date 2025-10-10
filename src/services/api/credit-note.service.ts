import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type CreditNote = Database['public']['Tables']['credit_notes']['Row'];
type CreditNoteInsert = Database['public']['Tables']['credit_notes']['Insert'];

export interface CreateCreditNoteRequest {
  invoiceId: string;
  disputeId?: string;
  amount: number;
  reason: string;
  reasonCategory?: 'dispute_resolution' | 'billing_error' | 'goodwill' | 'discount' | 'other';
}

export class CreditNoteService {
  static async create(request: CreateCreditNoteRequest): Promise<CreditNote> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', request.invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      if (request.amount > invoice.total_amount) {
        throw new Error('Credit note amount cannot exceed invoice total');
      }

      const creditNoteData: CreditNoteInsert = {
        invoice_id: request.invoiceId,
        dispute_id: request.disputeId,
        advocate_id: user.id,
        amount: request.amount,
        reason: request.reason,
        reason_category: request.reasonCategory || 'other',
        status: 'draft'
      };

      const { data, error } = await supabase
        .from('credit_notes')
        .insert(creditNoteData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Credit note ${data.credit_note_number} created`);
      return data;
    } catch (error) {
      console.error('Error creating credit note:', error);
      const message = error instanceof Error ? error.message : 'Failed to create credit note';
      toast.error(message);
      throw error;
    }
  }

  static async issue(creditNoteId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('credit_notes')
        .update({
          status: 'issued',
          issued_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', creditNoteId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Credit note issued');
    } catch (error) {
      console.error('Error issuing credit note:', error);
      const message = error instanceof Error ? error.message : 'Failed to issue credit note';
      toast.error(message);
      throw error;
    }
  }

  static async apply(creditNoteId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: creditNote, error: fetchError } = await supabase
        .from('credit_notes')
        .select('invoice_id, amount, status')
        .eq('id', creditNoteId)
        .single();

      if (fetchError || !creditNote) {
        throw new Error('Credit note not found');
      }

      if (creditNote.status !== 'issued') {
        throw new Error('Credit note must be issued before applying');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', creditNote.invoice_id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      const newTotal = invoice.total_amount - creditNote.amount;
      const currentPaid = invoice.amount_paid || 0;
      const newStatus = currentPaid >= newTotal ? 'paid' : 
                       currentPaid > 0 ? 'partial' : 'pending';

      await supabase
        .from('invoices')
        .update({
          total_amount: newTotal,
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditNote.invoice_id);

      await supabase
        .from('credit_notes')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', creditNoteId);

      toast.success('Credit note applied to invoice');
    } catch (error) {
      console.error('Error applying credit note:', error);
      const message = error instanceof Error ? error.message : 'Failed to apply credit note';
      toast.error(message);
      throw error;
    }
  }

  static async cancel(creditNoteId: string, reason: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('credit_notes')
        .update({
          status: 'cancelled',
          reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditNoteId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Credit note cancelled');
    } catch (error) {
      console.error('Error cancelling credit note:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel credit note';
      toast.error(message);
      throw error;
    }
  }

  static async getByInvoiceId(invoiceId: string): Promise<CreditNote[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('credit_notes')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching credit notes:', error);
      throw error;
    }
  }

  static async getByDisputeId(disputeId: string): Promise<CreditNote[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('credit_notes')
        .select('*')
        .eq('dispute_id', disputeId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false});

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching credit notes by dispute:', error);
      throw error;
    }
  }

  static async getById(creditNoteId: string): Promise<CreditNote> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('credit_notes')
        .select(`
          *,
          invoices (
            invoice_number,
            total_amount,
            matters (
              title,
              client_name
            )
          )
        `)
        .eq('id', creditNoteId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching credit note:', error);
      throw error;
    }
  }

  static async listCreditNotes(options: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    data: CreditNote[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { page = 1, pageSize = 20, status } = options;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('credit_notes')
        .select(`
          *,
          invoices (
            invoice_number,
            matters (
              title,
              client_name
            )
          )
        `, { count: 'exact' })
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };
    } catch (error) {
      console.error('Error listing credit notes:', error);
      throw error;
    }
  }

  static async getTotalCreditedAmount(invoiceId: string): Promise<number> {
    try {
      const creditNotes = await this.getByInvoiceId(invoiceId);
      
      const appliedNotes = creditNotes.filter(cn => cn.status === 'applied');
      const total = appliedNotes.reduce((sum, cn) => sum + (cn.amount || 0), 0);
      
      return total;
    } catch (error) {
      console.error('Error calculating total credited amount:', error);
      return 0;
    }
  }
}

export const creditNoteService = new CreditNoteService();
