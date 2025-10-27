import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Target,
  Bell
} from 'lucide-react';
import { RandIcon } from '../icons/RandIcon';
import { formatRand } from '../../lib/currency';
import { format, isToday, isTomorrow } from 'date-fns';
import { ReminderService, type PaymentTrackingMetrics } from '../../services/reminder.service';
import { InvoiceService } from '../../services/api/invoices.service';
import { toast } from 'react-hot-toast';
import type { Invoice } from '../../types';
import { InvoiceStatus } from '../../types';

interface PaymentTrackingDashboardProps {
  className?: string;
}

export const PaymentTrackingDashboard: React.FC<PaymentTrackingDashboardProps> = ({ 
  className = '' 
}) => {
  const [metrics, setMetrics] = useState<PaymentTrackingMetrics | null>(null);
  const [upcomingReminders, setUpcomingReminders] = useState<Array<{
    invoice: Invoice;
    reminderType: string;
    dueDate: Date;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reminderService = useMemo(() => new ReminderService(), []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsData, remindersData] = await Promise.all([
        reminderService.getPaymentTrackingMetrics(),
        reminderService.getUpcomingReminders()
      ]);
      
      setMetrics(metricsData);
      setUpcomingReminders(remindersData);
    } catch (err) {
      setError('Failed to load payment tracking data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [reminderService]);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const processReminders = async () => {
    try {
      await reminderService.processReminders();
      await loadDashboardData(); // Refresh data
      toast.success('Reminders processed successfully');
    } catch (err) {
      console.error('Error processing reminders:', err);
      toast.error('Failed to process reminders');
    }
  };

  const sendIndividualReminder = async (invoiceId: string) => {
    try {
      await reminderService.sendReminder(invoiceId);
      await loadDashboardData(); // Refresh data
      toast.success('Reminder sent successfully');
    } catch (err) {
      console.error('Error sending reminder:', err);
      toast.error('Failed to send reminder');
    }
  };

  const markAsPaid = async (invoiceId: string) => {
    try {
      await InvoiceService.updateInvoiceStatus(invoiceId, InvoiceStatus.PAID);
      await loadDashboardData(); // Refresh data
      toast.success('Invoice marked as paid');
    } catch (err) {
      console.error('Error updating invoice:', err);
      toast.error('Failed to update invoice status');
    }
  };

  const getStatusColor = (status: InvoiceStatus | string) => {
    const normalized = typeof status === 'string' ? status.toLowerCase() : String(status).toLowerCase();
    switch (normalized) {
      case 'pro_forma':
      case 'pro forma':
        return 'bg-purple-100 text-purple-700';
      case 'disputed':
        return 'bg-orange-100 text-orange-700';
      case 'written_off':
        return 'bg-gray-100 text-gray-700';
      case 'converted':
        return 'bg-green-100 text-green-700';
      case InvoiceStatus.PAID:
      case 'paid':
        return 'text-success-600 bg-success-100';
      case InvoiceStatus.OVERDUE:
      case 'overdue':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case InvoiceStatus.SENT:
      case InvoiceStatus.VIEWED:
      case InvoiceStatus.DRAFT:
      case 'unpaid':
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getReminderUrgency = (dueDate: Date) => {
    if (isToday(dueDate)) {
      return 'bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-700 dark:text-judicial-blue-300';
    } else if (isTomorrow(dueDate)) {
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    }
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-600"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertTriangle className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-300 mb-4">{error || 'Unable to load data'}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-judicial-blue-600 text-white rounded-lg hover:bg-judicial-blue-700 dark:bg-judicial-blue-700 dark:hover:bg-judicial-blue-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Payment Tracking</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor payment performance and stay on top of collections
          </p>
        </div>
        <button
          onClick={processReminders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-judicial-blue-600 text-white rounded-lg hover:bg-judicial-blue-700 dark:bg-judicial-blue-700 dark:hover:bg-judicial-blue-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          Send Reminders
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-metallic-gray-800 p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-judicial-blue-100 dark:bg-judicial-blue-900/30 rounded-lg">
              <RandIcon size={20} className="text-judicial-blue-600 dark:text-judicial-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Outstanding</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(metrics.totalOutstanding)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-800 p-6 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Needs Attention</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(metrics.overdueAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-800 p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <Clock className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Avg Payment Days</p>
              <p className="text-xl font-semibold text-neutral-900">
                {metrics.averagePaymentDays} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-800 p-6 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              metrics.paymentRate >= 80 ? 'bg-status-success-100 dark:bg-status-success-900/30' : 
              metrics.paymentRate >= 60 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-judicial-blue-100 dark:bg-judicial-blue-900/30'
            }`}>
              <Target className={`w-5 h-5 ${
                metrics.paymentRate >= 80 ? 'text-status-success-600 dark:text-status-success-400' : 
                metrics.paymentRate >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-judicial-blue-600 dark:text-judicial-blue-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">On-Time Rate</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {metrics.paymentRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices Needing Attention */}
        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Needs Attention ({metrics.overdueInvoices.length})
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Invoices awaiting follow-up
            </p>
          </div>
          <div className="p-4">
            {metrics.overdueInvoices.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-status-success-400 dark:text-status-success-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-300 font-medium">All caught up!</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  No invoices need follow-up. Excellent work! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {metrics.overdueInvoices.slice(0, 10).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-neutral-600">{invoice.clientName}</p>
                      <p className="text-xs text-neutral-500">
                        Due: {invoice.dateDue ? format(new Date(invoice.dateDue), 'dd MMM yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          {formatRand(invoice.amount)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => sendIndividualReminder(invoice.id)}
                          className="px-2 py-1 text-xs bg-mpondo-gold-100 text-mpondo-gold-700 rounded hover:bg-mpondo-gold-200 transition-colors"
                          title="Send Reminder"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => markAsPaid(invoice.id)}
                          className="px-2 py-1 text-xs bg-status-success-100 text-status-success-700 rounded hover:bg-status-success-200 transition-colors"
                          title="Mark as Paid"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {metrics.overdueInvoices.length > 10 && (
                  <p className="text-sm text-neutral-500 text-center py-2">
                    And {metrics.overdueInvoices.length - 10} more...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warning-600" />
              Due This Week ({metrics.upcomingDueDates.length})
            </h3>
          </div>
          <div className="p-4">
            {metrics.upcomingDueDates.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No invoices due this week</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {metrics.upcomingDueDates.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-neutral-600">{invoice.clientName}</p>
                      <p className="text-xs text-neutral-500">
                        Due: {(invoice as any).dateDue || (invoice as any).due_date ? format(new Date((invoice as any).dateDue || (invoice as any).due_date), 'dd MMM yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          {formatRand((invoice as any).totalAmount ?? (invoice as any).total_amount ?? (invoice as any).amount ?? 0)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => sendIndividualReminder(invoice.id)}
                          className="px-2 py-1 text-xs bg-judicial-blue-100 text-judicial-blue-700 rounded hover:bg-judicial-blue-200 transition-colors"
                          title="Send Early Reminder"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => markAsPaid(invoice.id)}
                          className="px-2 py-1 text-xs bg-status-success-100 text-status-success-700 rounded hover:bg-status-success-200 transition-colors"
                          title="Mark as Paid"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-mpondo-gold-600" />
              Upcoming Reminders ({upcomingReminders.length})
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingReminders.slice(0, 10).map((reminder, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">{reminder.invoice.invoiceNumber}</p>
                    <p className="text-sm text-neutral-600">{reminder.invoice.clientName}</p>
                    <p className="text-xs text-neutral-500">
                      {reminder.reminderType.charAt(0).toUpperCase() + reminder.reminderType.slice(1)} reminder
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">
                      {formatRand(reminder.invoice.amount)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReminderUrgency(reminder.dueDate)}`}>
                      {format(reminder.dueDate, 'dd MMM')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
