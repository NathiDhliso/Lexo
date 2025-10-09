import { supabase } from '../lib/supabase';
import { awsEmailService } from './aws-email.service';
import { differenceInDays, format } from 'date-fns';
import type { Invoice } from '../types';

export interface PaymentTrackingMetrics {
  totalOutstanding: number;
  overdueAmount: number;
  averagePaymentDays: number;
  paymentRate: number;
  overdueInvoices: Invoice[];
  upcomingDueDates: Invoice[];
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

      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('advocate_id', user.id);

      if (!allInvoices || allInvoices.length === 0) {
        return {
          totalOutstanding: 0,
          overdueAmount: 0,
          averagePaymentDays: 0,
          paymentRate: 0,
          overdueInvoices: [],
          upcomingDueDates: []
        };
      }

      const now = new Date();
      
      const unpaidInvoices = allInvoices.filter(inv => 
        inv.status !== 'paid' && inv.status !== 'cancelled'
      );
      
      const overdueInvoices = unpaidInvoices
        .filter(inv => new Date(inv.due_date) < now)
        .map(inv => this.mapToInvoiceType(inv));

      const upcomingDueDates = unpaidInvoices
        .filter(inv => {
          const daysUntilDue = differenceInDays(new Date(inv.due_date), now);
          return daysUntilDue >= 0 && daysUntilDue <= 7;
        })
        .map(inv => this.mapToInvoiceType(inv));

      const totalOutstanding = unpaidInvoices.reduce(
        (sum, inv) => sum + (inv.total_amount - (inv.amount_paid || 0)), 
        0
      );
      
      const overdueAmount = overdueInvoices.reduce(
        (sum, inv) => sum + ((inv.totalAmount ?? inv.total_amount ?? 0) - (inv.amountPaid ?? inv.amount_paid ?? 0)), 
        0
      );

      const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
      let averagePaymentDays = 0;
      if (paidInvoices.length > 0) {
        const totalDays = paidInvoices.reduce((sum, inv) => {
          if (inv.paid_at && inv.invoice_date) {
            return sum + differenceInDays(new Date(inv.paid_at), new Date(inv.invoice_date));
          }
          return sum;
        }, 0);
        averagePaymentDays = Math.round(totalDays / paidInvoices.length);
      }

      const paidOnTime = paidInvoices.filter(inv => {
        if (inv.paid_at && inv.due_date) {
          return new Date(inv.paid_at) <= new Date(inv.due_date);
        }
        return false;
      }).length;
      
      const paymentRate = allInvoices.length > 0 
        ? Math.round((paidOnTime / allInvoices.length) * 100) 
        : 0;

      return {
        totalOutstanding,
        overdueAmount,
        averagePaymentDays,
        paymentRate,
        overdueInvoices,
        upcomingDueDates
      };
    } catch (error) {
      console.error('Error getting payment tracking metrics:', error);
      return {
        totalOutstanding: 0,
        overdueAmount: 0,
        averagePaymentDays: 0,
        paymentRate: 0,
        overdueInvoices: [],
        upcomingDueDates: []
      };
    }
  }

  private mapToInvoiceType(dbInvoice: any): Invoice {
    return {
      id: dbInvoice.id,
      matter_id: dbInvoice.matter_id,
      advocate_id: dbInvoice.advocate_id,
      invoice_number: dbInvoice.invoice_number,
      invoiceNumber: dbInvoice.invoice_number,
      matterId: dbInvoice.matter_id,
      clientName: dbInvoice.client_name,
      dateIssued: dbInvoice.invoice_date,
      dateDue: dbInvoice.due_date,
      bar: dbInvoice.bar,
      fees_amount: dbInvoice.fees_amount || 0,
      disbursements_amount: dbInvoice.disbursements_amount || 0,
      subtotal: dbInvoice.subtotal || 0,
      vat_rate: dbInvoice.vat_rate || 0.15,
      vat_amount: dbInvoice.vat_amount || 0,
      total_amount: dbInvoice.total_amount || 0,
      totalAmount: dbInvoice.total_amount || 0,
      amount: dbInvoice.fees_amount || 0,
      status: dbInvoice.status,
      amount_paid: dbInvoice.amount_paid || 0,
      amountPaid: dbInvoice.amount_paid || 0,
      balance_due: dbInvoice.balance_due || 0,
      fee_narrative: dbInvoice.fee_narrative || '',
      reminders_sent: dbInvoice.reminders_sent || 0,
      reminder_history: dbInvoice.reminder_history || [],
      created_at: dbInvoice.created_at,
      updated_at: dbInvoice.updated_at,
      days_outstanding: 0,
      is_overdue: dbInvoice.status === 'overdue'
    } as Invoice;
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

  async sendReminder(invoiceId: string): Promise<void> {
    try {
      await this.sendPaymentReminder(invoiceId, 'follow_up');
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  async getUpcomingReminders(): Promise<Array<{
    invoice: Invoice;
    reminderType: string;
    dueDate: Date;
  }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('advocate_id', user.id)
        .in('status', ['sent', 'overdue'])
        .not('next_reminder_date', 'is', null);

      if (!invoices || invoices.length === 0) {
        return [];
      }

      const now = new Date();
      const upcomingReminders = invoices
        .filter(inv => {
          if (!inv.next_reminder_date) return false;
          const reminderDate = new Date(inv.next_reminder_date);
          const daysUntilReminder = differenceInDays(reminderDate, now);
          return daysUntilReminder >= 0 && daysUntilReminder <= 7;
        })
        .map(inv => ({
          invoice: this.mapToInvoiceType(inv),
          reminderType: this.getReminderType(inv.reminders_sent || 0),
          dueDate: new Date(inv.next_reminder_date!)
        }));

      return upcomingReminders;
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  async processReminders(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('advocate_id', user.id)
        .in('status', ['sent', 'overdue'])
        .not('next_reminder_date', 'is', null);

      if (!invoices || invoices.length === 0) {
        return;
      }

      const now = new Date();
      const invoicesToRemind = invoices.filter(inv => {
        if (!inv.next_reminder_date) return false;
        return new Date(inv.next_reminder_date) <= now;
      });

      for (const invoice of invoicesToRemind) {
        try {
          const reminderType = this.getReminderType(invoice.reminders_sent || 0);
          await this.sendPaymentReminder(invoice.id, reminderType as 'initial' | 'follow_up' | 'final');
        } catch (error) {
          console.error(`Failed to send reminder for invoice ${invoice.invoice_number}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
      throw error;
    }
  }

  private getReminderType(remindersSent: number): string {
    if (remindersSent === 0) return 'initial';
    if (remindersSent < 3) return 'follow_up';
    return 'final';
  }
}

export { ReminderService };
export const reminderService = new ReminderService();
