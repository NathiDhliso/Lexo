import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

export interface RecordPaymentRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export interface PaymentSummary {
  totalPaid: number;
  balanceDue: number;
  paymentCount: number;
  lastPaymentDate: string | null;
  isFullyPaid: boolean;
  isPartiallyPaid: boolean;
}

export class PaymentService {
  static async recordPayment(request: RecordPaymentRequest): Promise<Payment> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid, payment_status')
        .eq('id', request.invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      const currentPaid = invoice.amount_paid || 0;
      const newTotalPaid = currentPaid + request.amount;
      const isPartial = newTotalPaid < invoice.total_amount;

      const paymentData: PaymentInsert = {
        invoice_id: request.invoiceId,
        advocate_id: user.id,
        amount: request.amount,
        payment_date: request.paymentDate,
        payment_method: request.paymentMethod,
        reference: request.reference,
        notes: request.notes,
        is_partial: isPartial
      };

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      const newStatus = isPartial ? 'partial' : 'paid';

      await supabase
        .from('invoices')
        .update({
          amount_paid: newTotalPaid,
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.invoiceId);

      toast.success(isPartial ? 'Partial payment recorded' : 'Payment recorded - invoice fully paid');
      return data;
    } catch (error) {
      console.error('Error recording payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(message);
      throw error;
    }
  }

  static async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  static async getPaymentSummary(invoiceId: string): Promise<PaymentSummary> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      const payments = await this.getPaymentsByInvoice(invoiceId);

      const totalPaid = invoice.amount_paid || 0;
      const balanceDue = invoice.total_amount - totalPaid;
      const lastPayment = payments.length > 0 ? payments[0] : null;

      return {
        totalPaid,
        balanceDue,
        paymentCount: payments.length,
        lastPaymentDate: lastPayment?.payment_date || null,
        isFullyPaid: balanceDue <= 0,
        isPartiallyPaid: totalPaid > 0 && balanceDue > 0
      };
    } catch (error) {
      console.error('Error getting payment summary:', error);
      throw error;
    }
  }

  static async deletePayment(paymentId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('invoice_id, amount')
        .eq('id', paymentId)
        .single();

      if (fetchError || !payment) {
        throw new Error('Payment not found');
      }

      const { error } = await supabase
        .from('payments')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('amount_paid, total_amount')
        .eq('id', payment.invoice_id)
        .single();

      if (!invoiceError && invoice) {
        const newTotalPaid = (invoice.amount_paid || 0) - payment.amount;
        const newStatus = newTotalPaid >= invoice.total_amount ? 'paid' : 
                         newTotalPaid > 0 ? 'partial' : 'pending';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newTotalPaid,
            payment_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.invoice_id);
      }

      toast.success('Payment deleted');
    } catch (error) {
      console.error('Error deleting payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete payment';
      toast.error(message);
      throw error;
    }
  }

  static async getRecentPayments(limit: number = 10): Promise<Payment[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payments')
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
        .is('deleted_at', null)
        .order('payment_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw error;
    }
  }

  static async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payments')
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
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
        .is('deleted_at', null)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments by date range:', error);
      throw error;
    }
  }

  static calculatePaymentPlan(totalAmount: number, installments: number): {
    installmentAmount: number;
    finalInstallment: number;
    schedule: Array<{ installment: number; amount: number }>;
  } {
    const installmentAmount = Math.floor((totalAmount / installments) * 100) / 100;
    const totalOfInstallments = installmentAmount * (installments - 1);
    const finalInstallment = totalAmount - totalOfInstallments;

    const schedule = [];
    for (let i = 1; i <= installments; i++) {
      schedule.push({
        installment: i,
        amount: i === installments ? finalInstallment : installmentAmount
      });
    }

    return {
      installmentAmount,
      finalInstallment,
      schedule
    };
  }
}

export const paymentService = new PaymentService();
