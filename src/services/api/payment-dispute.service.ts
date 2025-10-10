import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type PaymentDispute = Database['public']['Tables']['payment_disputes']['Row'];
type PaymentDisputeInsert = Database['public']['Tables']['payment_disputes']['Insert'];

export interface CreateDisputeRequest {
  invoiceId: string;
  disputeReason: string;
  disputeType: 'amount_incorrect' | 'work_not_done' | 'quality_issue' | 'billing_error' | 'other';
  disputedAmount?: number;
  evidenceUrls?: string[];
  clientNotes?: string;
}

export interface ResolveDisputeRequest {
  disputeId: string;
  resolutionType: 'credit_note' | 'write_off' | 'payment_plan' | 'settled' | 'withdrawn';
  resolution: string;
  resolvedAmount?: number;
}

export class PaymentDisputeService {
  static async createDispute(request: CreateDisputeRequest): Promise<PaymentDispute> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, payment_status')
        .eq('id', request.invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      const disputeData: PaymentDisputeInsert = {
        invoice_id: request.invoiceId,
        advocate_id: user.id,
        dispute_reason: request.disputeReason,
        dispute_type: request.disputeType,
        disputed_amount: request.disputedAmount || invoice.total_amount,
        evidence_urls: request.evidenceUrls,
        client_notes: request.clientNotes,
        status: 'open'
      };

      const { data, error } = await supabase
        .from('payment_disputes')
        .insert(disputeData)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('invoices')
        .update({ 
          payment_status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.invoiceId);

      toast.success('Payment dispute opened');
      return data;
    } catch (error) {
      console.error('Error creating dispute:', error);
      const message = error instanceof Error ? error.message : 'Failed to create dispute';
      toast.error(message);
      throw error;
    }
  }

  static async updateStatus(disputeId: string, status: 'open' | 'investigating' | 'resolved' | 'escalated' | 'closed'): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('payment_disputes')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success(`Dispute status updated to ${status}`);
    } catch (error) {
      console.error('Error updating dispute status:', error);
      const message = error instanceof Error ? error.message : 'Failed to update dispute status';
      toast.error(message);
      throw error;
    }
  }

  static async resolveDispute(request: ResolveDisputeRequest): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: dispute, error: fetchError } = await supabase
        .from('payment_disputes')
        .select('invoice_id, disputed_amount')
        .eq('id', request.disputeId)
        .single();

      if (fetchError || !dispute) {
        throw new Error('Dispute not found');
      }

      const { error } = await supabase
        .from('payment_disputes')
        .update({
          status: 'resolved',
          resolution: request.resolution,
          resolution_type: request.resolutionType,
          resolved_amount: request.resolvedAmount,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.disputeId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      if (request.resolutionType === 'settled' || request.resolutionType === 'withdrawn') {
        await supabase
          .from('invoices')
          .update({ 
            payment_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', dispute.invoice_id);
      }

      toast.success('Dispute resolved');
    } catch (error) {
      console.error('Error resolving dispute:', error);
      const message = error instanceof Error ? error.message : 'Failed to resolve dispute';
      toast.error(message);
      throw error;
    }
  }

  static async getByInvoiceId(invoiceId: string): Promise<PaymentDispute[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payment_disputes')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('opened_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching disputes:', error);
      throw error;
    }
  }

  static async getPendingDisputes(): Promise<PaymentDispute[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payment_disputes')
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
        .eq('advocate_id', user.id)
        .in('status', ['open', 'investigating'])
        .is('deleted_at', null)
        .order('opened_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending disputes:', error);
      throw error;
    }
  }

  static async addEvidence(disputeId: string, evidenceUrl: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: dispute, error: fetchError } = await supabase
        .from('payment_disputes')
        .select('evidence_urls')
        .eq('id', disputeId)
        .single();

      if (fetchError || !dispute) {
        throw new Error('Dispute not found');
      }

      const updatedUrls = [...(dispute.evidence_urls || []), evidenceUrl];

      const { error } = await supabase
        .from('payment_disputes')
        .update({ 
          evidence_urls: updatedUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Evidence added to dispute');
    } catch (error) {
      console.error('Error adding evidence:', error);
      const message = error instanceof Error ? error.message : 'Failed to add evidence';
      toast.error(message);
      throw error;
    }
  }

  static async escalateDispute(disputeId: string, escalationNotes: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('payment_disputes')
        .update({
          status: 'escalated',
          resolution: escalationNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Dispute escalated');
    } catch (error) {
      console.error('Error escalating dispute:', error);
      const message = error instanceof Error ? error.message : 'Failed to escalate dispute';
      toast.error(message);
      throw error;
    }
  }
}

export const paymentDisputeService = new PaymentDisputeService();
