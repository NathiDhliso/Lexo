import React from 'react';
import { 
  FileText, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Download,
  Mail
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';
import { Card, CardHeader, CardContent, Button } from '../design-system/components';
import { RandIcon } from '../icons/RandIcon';
import { formatRand } from '../../lib/currency';
import type { Invoice } from '@/types';
import { InvoiceStatus, BarAssociation } from '@/types';

interface InvoiceCardProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onUpdateStatus?: (status: InvoiceStatus) => void;
  onDelete?: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onView,
  onSend,
  onDownload,
  onRecordPayment,
  onUpdateStatus,
  onDelete
}) => {
  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return {
          color: 'bg-neutral-100 text-neutral-700',
          icon: FileText,
          label: 'Draft'
        };
      case InvoiceStatus.SENT:
        return {
          color: 'bg-blue-100 text-blue-700',
          icon: Send,
          label: 'Sent'
        };
      case InvoiceStatus.PAID:
        return {
          color: 'bg-success-100 text-success-700',
          icon: CheckCircle,
          label: 'Paid'
        };
      case InvoiceStatus.OVERDUE:
        return {
          color: 'bg-error-100 text-error-700',
          icon: AlertTriangle,
          label: 'Overdue'
        };
      default:
        return {
          color: 'bg-neutral-100 text-neutral-700',
          icon: FileText,
          label: String(status)
        };
    }
  };

  const getDaysOverdue = () => {
    if (!invoice.dateDue) return 0;
    const dueDate = new Date(invoice.dateDue);
    const today = new Date();
    return isAfter(today, dueDate) ? differenceInDays(today, dueDate) : 0;
  };

  const getPaymentProgress = () => {
    const total = invoice.totalAmount ?? invoice.total_amount ?? 0;
    const paid = invoice.amountPaid ?? invoice.amount_paid ?? 0;
    if (!total || total === 0) return 0;
    return (paid / total) * 100;
  };

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;
  const daysOverdue = getDaysOverdue();
  const paymentProgress = getPaymentProgress();

  return (
    <Card variant="default" hoverable className="p-6">
      <CardHeader className="p-0 mb-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-mpondo-gold/10 rounded-lg">
              <FileText className="w-5 h-5 text-mpondo-gold-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {invoice.invoiceNumber ?? (invoice as any).invoice_number ?? '—'}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {invoice.matterTitle ?? (invoice as any).matter_title ?? '—'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {invoice.clientName ?? (invoice as any).client_name ?? '—'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
            
            <div className="relative group">
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  {onView && (
                    <button
                      onClick={() => onView(invoice)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  )}
                  
                  {onSend && invoice.status === InvoiceStatus.DRAFT && (
                    <button
                      onClick={() => onSend(invoice)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                    >
                      <Mail className="w-4 h-4" />
                      Send Invoice
                    </button>
                  )}
                  
                  {onDownload && (
                    <button
                      onClick={() => onDownload(invoice)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}
                  
                  {onRecordPayment && invoice.status !== InvoiceStatus.PAID && (
                    <button
                      onClick={() => onRecordPayment(invoice)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                    >
                      <RandIcon size={16} />
                      Record Payment
                    </button>
                  )}
                  
                  {onUpdateStatus && (
                    <>
                      <div className="border-t border-neutral-200 dark:border-metallic-gray-700 my-1"></div>
                      <div className="px-3 py-1">
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Update Status
                        </p>
                      </div>
                      
                      {invoice.status === InvoiceStatus.DRAFT && (
                        <button
                          onClick={() => onUpdateStatus(InvoiceStatus.SENT)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                        >
                          <Send className="w-4 h-4" />
                          Mark as Sent
                        </button>
                      )}
                      
                      {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                        <button
                          onClick={() => onUpdateStatus(InvoiceStatus.PAID)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Paid
                        </button>
                      )}
                      
                      {invoice.status !== InvoiceStatus.OVERDUE && invoice.status !== InvoiceStatus.PAID && (
                        <button
                          onClick={() => onUpdateStatus(InvoiceStatus.OVERDUE)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Mark as Overdue
                        </button>
                      )}
                    </>
                  )}
                  
                  {onDelete && (
                    <>
                      <div className="border-t border-neutral-200 dark:border-metallic-gray-700 my-1"></div>
                      <button
                        onClick={onDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-status-error-600 dark:text-error-400 hover:bg-status-error-50 dark:hover:bg-error-900/30"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Delete Invoice
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Amount and Dates */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Amount</p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatRand(invoice.totalAmount ?? (invoice as any).total_amount ?? 0)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Date Issued</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {invoice.dateIssued ? format(new Date(invoice.dateIssued), 'dd MMM yyyy') : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Due Date</p>
            <p className={`text-sm ${
              daysOverdue > 0 ? 'text-error-600 dark:text-error-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
            }`}>
              {invoice.dateDue ? format(new Date(invoice.dateDue), 'dd MMM yyyy') : 'N/A'}
              {daysOverdue > 0 && (
                <span className="block text-xs text-error-500 dark:text-error-400">
                  {daysOverdue} days overdue
                </span>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Bar</p>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                invoice.bar === BarAssociation.JOHANNESBURG ? 'bg-mpondo-gold-500' : 'bg-judicial-blue-500'
              }`}></div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{invoice.bar === BarAssociation.JOHANNESBURG ? 'Johannesburg' : invoice.bar === BarAssociation.CAPE_TOWN ? 'Cape Town' : (typeof invoice.bar === 'string' ? invoice.bar : 'N/A')}</p>
            </div>
          </div>
        </div>

        {/* Payment Progress (if partially paid) */}
        {paymentProgress > 0 && paymentProgress < 100 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Payment Progress</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {formatRand((invoice.amountPaid ?? invoice.amount_paid ?? 0))} / {formatRand((invoice.totalAmount ?? invoice.total_amount ?? 0))}
              </p>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
              <div 
                className="bg-success-500 dark:bg-success-400 h-2 rounded-full transition-all"
                style={{ width: `${paymentProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Reminders Info */}
        {invoice.remindersSent && invoice.remindersSent > 0 && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Clock className="w-3 h-3" />
            <span>
              {invoice.remindersSent} reminder{invoice.remindersSent > 1 ? 's' : ''} sent
            </span>
            {invoice.lastReminderDate && (
              <span>
                • Last: {format(new Date(invoice.lastReminderDate), 'dd MMM')}
              </span>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-metallic-gray-800">
          {invoice.status === InvoiceStatus.DRAFT && onSend && (
            <button
              onClick={() => onSend(invoice)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-mpondo-gold-700 dark:text-mpondo-gold-400 bg-mpondo-gold/10 dark:bg-mpondo-gold-900/30 rounded-lg hover:bg-mpondo-gold/20 dark:hover:bg-mpondo-gold-900/50 transition-colors"
            >
              <Send className="w-3 h-3" />
              Send
            </button>
          )}
          
          {invoice.status !== InvoiceStatus.PAID && onRecordPayment && (
            <button
              onClick={() => onRecordPayment(invoice)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-success-700 dark:text-success-400 bg-success/10 dark:bg-success-900/30 rounded-lg hover:bg-success/20 dark:hover:bg-success-900/50 transition-colors"
            >
              <RandIcon size={12} />
              Payment
            </button>
          )}
          
          {onView && (
            <button
              onClick={() => onView(invoice)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 transition-colors"
            >
              <Eye className="w-3 h-3" />
              View
            </button>
          )}
          
          {onDownload && (
            <button
              onClick={() => onDownload(invoice)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-judicial-blue-700 dark:text-judicial-blue-400 bg-judicial-blue/10 dark:bg-judicial-blue-900/30 rounded-lg hover:bg-judicial-blue/20 dark:hover:bg-judicial-blue-900/50 transition-colors"
            >
              <Download className="w-3 h-3" />
              PDF
            </button>
          )}
          
          <div className="flex-1"></div>
          
          {invoice.datePaid && (
            <div className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
              <CheckCircle className="w-3 h-3" />
              Paid {format(new Date(invoice.datePaid), 'dd MMM')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
