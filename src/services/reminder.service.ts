/**
 * Reminder Service - Minimal implementation for 3-step workflow
 */

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
    // Minimal implementation for 3-step workflow
    return {
      totalOutstanding: 0,
      overdueAmount: 0,
      averageDaysToPayment: 0,
      collectionRate: 0,
      upcomingDue: 0
    };
  }

  async sendPaymentReminder(invoiceId: string, type: 'initial' | 'follow_up' | 'final'): Promise<PaymentReminder> {
    // Minimal implementation for 3-step workflow
    throw new Error('Payment reminders not available in simplified workflow');
  }

  async getRemindersForInvoice(invoiceId: string): Promise<PaymentReminder[]> {
    // Minimal implementation for 3-step workflow
    return [];
  }

  async scheduleAutomaticReminders(invoiceId: string): Promise<void> {
    // Minimal implementation for 3-step workflow
    console.log('Automatic reminders not available in simplified workflow');
  }
}

export { ReminderService };
export const reminderService = new ReminderService();
