import { supabase } from '../lib/supabase';
import { awsEmailService } from './aws-email.service';
import { differenceInDays, format } from 'date-fns';

export interface PaymentTrackingMetrics {
  totalOutstanding: number;
  overdueAmount: number;
  averageDaysToPayment: number;
  collectionRate: number;
  upcomingDue: number;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  type: 'initial' | 'follow_up' | 'final';
  sentAt: Date;
  status: 'sent' | 'delivered' | 'opened' | 'failed';
}

class ReminderService {
  async getPaymentTrackingMetrics(): Promise<PaymentTrackingMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('advocate_id', user.id)
        .in('status', ['sent', 'overdue']);

      if (!invoices) {
        return {
          totalOutstanding: 0,
          overdueAmount: 0,
          averageDaysToPayment: 0,
          collectionRate: 0,
          upcomingDue: 0
        };
      }

      const now = new Date();
      const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.total_amount - (inv.amount_paid || 0)), 0);
      const overdueAmount = invoices
        .filter(inv => new Date(inv.due_date) < now)
        .reduce((sum, inv) => sum + (inv.total_amount - (inv.amount_paid || 0)), 0);

      const upcomingDue = invoices
        .filter(inv => {
          const daysUntilDue = differenceInDays(new Date(inv.due_date), now);
          return daysUntilDue > 0 && daysUntilDue <= 7;
        })
        .reduce((sum, inv) => sum + (inv.total_amount - (inv.amount_paid || 0)), 0);

      return {
        totalOutstanding,
        overdueAmount,
        averageDaysToPayment: 0,
        collectionRate: 0,
        upcomingDue
      };
    } catch (error) {
      console.error('Error getting payment tracking metrics:', error);
      return {
        totalOutstanding: 0,
        overdueAmount: 0,
        averageDaysToPayment: 0,
        collectionRate: 0,
        upcomingDue: 0
      };
    }
  }

  async sendPaymentReminder(invoiceId: string, type: 'initial' | 'follow_up' | 'final'): Promise<PaymentReminder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, matters(client_name, client_email)')
        .eq('id', invoiceId)
        .eq('advocate_id', user.id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      const matter = invoice.matters as any;
      const clientEmail = matter?.client_email;
      const clientName = matter?.client_name || 'Valued Client';

      if (!clientEmail) {
        throw new Error('Client email not found');
      }

      const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
      const amountDue = invoice.total_amount - (invoice.amount_paid || 0);

      const emailResult = await awsEmailService.sendPaymentReminderEmail({
        recipientEmail: clientEmail,
        recipientName: clientName,
        invoiceNumber: invoice.invoice_number,
        amountDue,
        dueDate: format(new Date(invoice.due_date), 'dd MMM yyyy'),
        daysOverdue: Math.max(0, daysOverdue)
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send reminder email');
      }

      const reminderHistory = invoice.reminder_history || [];
      reminderHistory.push({
        type,
        sentAt: new Date().toISOString(),
        messageId: emailResult.messageId
      });

      await supabase
        .from('invoices')
        .update({
          reminders_sent: (invoice.reminders_sent || 0) + 1,
          reminder_history: reminderHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      return {
        id: emailResult.messageId || `reminder-${Date.now()}`,
        invoiceId,
        type,
        sentAt: new Date(),
        status: 'sent'
      };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  }

  async getRemindersForInvoice(invoiceId: string): Promise<PaymentReminder[]> {
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('reminder_history')
        .eq('id', invoiceId)
        .single();

      if (!invoice || !invoice.reminder_history) {
        return [];
      }

      return (invoice.reminder_history as any[]).map((reminder, index) => ({
        id: `${invoiceId}-${index}`,
        invoiceId,
        type: reminder.type,
        sentAt: new Date(reminder.sentAt),
        status: 'sent' as const
      }));
    } catch (error) {
      console.error('Error getting reminders for invoice:', error);
      return [];
    }
  }

  async scheduleAutomaticReminders(invoiceId: string): Promise<void> {
    console.log('Automatic reminder scheduling for invoice:', invoiceId);
  }

  /**
   * Send reminder for invoice - wrapper method for UI compatibility
   */
  async sendReminder(invoiceId: string): Promise<void> {
    try {
      await this.sendPaymentReminder(invoiceId, 'follow_up');
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }
}

export { ReminderService };
export const reminderService = new ReminderService();
