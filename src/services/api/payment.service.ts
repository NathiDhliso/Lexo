import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * Payment Service
 * Handles recording and managing payments against invoices
 * Requirements: 1.2, 1.3, 1.4, 1.10
 */

export interface Payment {
  id: string;
  invoice_id: string;
  advocate_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  payment_type?: string;
  allocated_amount?: number;
  payment_reference?: string;
  created_at: string;
}

export interface PaymentCreate {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

export interface PaymentHistory {
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
  payments: Payment[];
}

export class PaymentService {
  /**
   * Record a new payment against an invoice
   * Requirements: 1.2, 1.3, 1.4
   */
  static async recordPayment(data: PaymentCreate): Promise<Payment> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate payment amount
      if (data.amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }

      // Get current invoice to check outstanding balance
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, total_amount, amount_paid, outstanding_balance, advocate_id')
        .eq('id', data.invoice_id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Verify user owns this invoice
      if (invoice.advocate_id !== user.id) {
        throw new Error('Unauthorized: You can only record payments for your own invoices');
      }

      // Check if payment exceeds outstanding balance (warning, not error)
      const currentOutstanding = invoice.outstanding_balance || (invoice.total_amount - (invoice.amount_paid || 0));
      if (data.amount > currentOutstanding) {
        toast('Warning: Payment amount exceeds outstanding balance', {
          icon: '⚠️',
          duration: 5000
        });
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: data.invoice_id,
          advocate_id: user.id,
          amount: data.amount,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          reference_number: data.reference_number,
          notes: data.notes,
          payment_type: data.amount >= currentOutstanding ? 'full' : 'partial'
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment creation error:', paymentError);
        throw new Error(`Failed to record payment: ${paymentError.message}`);
      }

      // Trigger will automatically update invoice balances and status
      
      // Create audit log entry
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'payment',
        entity_id: payment.id,
        action: 'create',
        changes: {
          invoice_id: data.invoice_id,
          amount: data.amount,
          payment_date: data.payment_date,
          payment_method: data.payment_method
        }
      });

      toast.success('Payment recorded successfully');
      return payment as Payment;

    } catch (error) {
      console.error('Error recording payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get payment history for an invoice
   * Requirements: 1.9
   */
  static async getPaymentHistory(invoiceId: string): Promise<PaymentHistory> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, amount_paid, outstanding_balance, payment_status, advocate_id')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Verify user owns this invoice
      if (invoice.advocate_id !== user.id) {
        throw new Error('Unauthorized');
      }

      // Get all payments for this invoice
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });

      if (paymentsError) {
        throw new Error(`Failed to fetch payments: ${paymentsError.message}`);
      }

      return {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid || 0,
        outstanding_balance: invoice.outstanding_balance || 0,
        payment_status: invoice.payment_status as any,
        payments: (payments || []) as Payment[]
      };

    } catch (error) {
      console.error('Error fetching payment history:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch payment history';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Update an existing payment (with audit trail)
   * Requirements: 1.10
   */
  static async updatePayment(paymentId: string, updates: Partial<PaymentCreate>): Promise<Payment> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get existing payment
      const { data: existingPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*, invoices!inner(advocate_id)')
        .eq('id', paymentId)
        .single();

      if (fetchError || !existingPayment) {
        throw new Error('Payment not found');
      }

      // Verify user owns this payment's invoice
      if ((existingPayment.invoices as any).advocate_id !== user.id) {
        throw new Error('Unauthorized');
      }

      // Validate amount if being updated
      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }

      // Update payment
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update payment: ${updateError.message}`);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'payment',
        entity_id: paymentId,
        action: 'update',
        changes: {
          before: existingPayment,
          after: updates
        }
      });

      toast.success('Payment updated successfully');
      return updatedPayment as Payment;

    } catch (error) {
      console.error('Error updating payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to update payment';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Delete a payment (soft delete with audit trail)
   * Requirements: 1.10
   */
  static async deletePayment(paymentId: string, reason: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get existing payment
      const { data: existingPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*, invoices!inner(advocate_id)')
        .eq('id', paymentId)
        .single();

      if (fetchError || !existingPayment) {
        throw new Error('Payment not found');
      }

      // Verify user owns this payment's invoice
      if ((existingPayment.invoices as any).advocate_id !== user.id) {
        throw new Error('Unauthorized');
      }

      // Delete payment (trigger will recalculate invoice balances)
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) {
        throw new Error(`Failed to delete payment: ${deleteError.message}`);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'payment',
        entity_id: paymentId,
        action: 'delete',
        changes: {
          deleted_payment: existingPayment,
          reason: reason
        }
      });

      toast.success('Payment deleted successfully');

    } catch (error) {
      console.error('Error deleting payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete payment';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get all payments for the current user
   */
  static async getPayments(options: {
    page?: number;
    pageSize?: number;
    invoiceId?: string;
  } = {}): Promise<{ data: Payment[]; total: number }> {
    try {
      const { page = 1, pageSize = 50, invoiceId } = options;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .eq('advocate_id', user.id);

      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      query = query
        .order('payment_date', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }

      return {
        data: (data || []) as Payment[],
        total: count || 0
      };

    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService;
