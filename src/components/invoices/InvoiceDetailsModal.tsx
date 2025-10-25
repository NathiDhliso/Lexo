import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Building, 
  Download,
  Send,
  CheckCircle,
  AlertTriangle,
  Edit3,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from '../design-system/components';
import { formatRand } from '../../lib/currency';
import { InvoiceService } from '../../services/api/invoices.service';
import { invoicePDFService } from '../../services/invoice-pdf.service';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Invoice } from '../../types';
import { InvoiceStatus } from '../../types';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  onClose: () => void;
  onInvoiceUpdated?: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  onClose,
  onInvoiceUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNarrative, setEditedNarrative] = useState(invoice.fee_narrative || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [creditNoteAmount, setCreditNoteAmount] = useState('');
  const [creditNoteReason, setCreditNoteReason] = useState('');
  const [creditNoteCategory, setCreditNoteCategory] = useState<'billing_error' | 'service_issue' | 'client_dispute' | 'goodwill' | 'other'>('billing_error');

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return { color: 'bg-neutral-100 text-neutral-700', icon: FileText, label: 'Draft' };
      case InvoiceStatus.SENT:
        return { color: 'bg-judicial-blue-100 text-judicial-blue-700', icon: Send, label: 'Sent' };
      case InvoiceStatus.PAID:
        return { color: 'bg-status-success-100 text-status-success-700', icon: CheckCircle, label: 'Paid' };
      case InvoiceStatus.OVERDUE:
        return { color: 'bg-status-error-100 text-status-error-700', icon: AlertTriangle, label: 'Overdue' };
      default:
        return { color: 'bg-neutral-100 text-neutral-700', icon: FileText, label: String(status) };
    }
  };

  const handleSendInvoice = async () => {
    const loadingToast = toast.loading('Sending invoice...');
    
    try {
      setIsLoading(true);
      await InvoiceService.sendInvoice(invoice.id);
      toast.success(`Invoice ${invoice.invoice_number} sent successfully`, { 
        id: loadingToast,
        duration: 4000 
      });
      onInvoiceUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice. Please try again.', { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const loadingToast = toast.loading('Generating PDF...');
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated. Please sign in again.', { 
          id: loadingToast,
          duration: 4000 
        });
        return;
      }

      const { data: advocate, error: advocateError } = await supabase
        .from('user_profiles')
        .select('full_name, practice_number, email, phone')
        .eq('user_id', user.id)
        .single();

      if (advocateError || !advocate) {
        toast.error('Failed to load advocate information', { 
          id: loadingToast,
          duration: 5000 
        });
        return;
      }

      const { data: matter } = await supabase
        .from('matters')
        .select('title, client_name, reference_number')
        .eq('id', invoice.matterId || (invoice as any).matter_id)
        .single();

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('invoice_id', invoice.id);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('invoice_id', invoice.id);

      const { data: services } = await supabase
        .from('matter_services')
        .select(`
          *,
          services (
            service_name,
            description,
            service_category,
            pricing_type,
            unit_price,
            estimated_hours
          )
        `)
        .eq('matter_id', invoice.matterId || (invoice as any).matter_id);

      const invoiceWithDetails = {
        ...invoice,
        matter: matter || undefined,
        time_entries: timeEntries || [],
        expenses: expenses || [],
        services: services || [],
      };

      await invoicePDFService.downloadInvoicePDF(invoiceWithDetails as any, {
        full_name: advocate.full_name,
        practice_number: advocate.practice_number,
        email: advocate.email || undefined,
        phone: advocate.phone || undefined,
        advocate_id: user.id,
      });

      toast.success(`Invoice ${invoice.invoice_number} downloaded successfully`, { 
        id: loadingToast,
        duration: 3000 
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.', { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNarrative = async () => {
    const loadingToast = toast.loading('Updating narrative...');
    
    try {
      setIsLoading(true);
      await InvoiceService.updateInvoice(invoice.id, { fee_narrative: editedNarrative });
      toast.success('Invoice narrative updated successfully', { 
        id: loadingToast,
        duration: 3000 
      });
      setIsEditing(false);
      onInvoiceUpdated?.();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice narrative. Please try again.', { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueCreditNote = async () => {
    const amount = parseFloat(creditNoteAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }
    
    if (amount > invoice.balance_due) {
      toast.error('Credit amount cannot exceed balance due');
      return;
    }
    
    if (!creditNoteReason.trim()) {
      toast.error('Please provide a reason for the credit note');
      return;
    }

    const loadingToast = toast.loading('Issuing credit note...');
    
    try {
      setIsLoading(true);
      
      // Create credit note
      const { error } = await supabase
        .from('credit_notes')
        .insert({
          invoice_id: invoice.id,
          advocate_id: invoice.advocate_id,
          amount: amount,
          reason: creditNoteReason,
          reason_category: creditNoteCategory,
          status: 'issued',
          issued_at: new Date().toISOString(),
          credit_note_number: `CN-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice balance
      const newBalance = invoice.balance_due - amount;
      await InvoiceService.updateInvoice(invoice.id, { 
        balance_due: newBalance,
        amount_paid: invoice.amount_paid + amount
      });

      toast.success(`Credit note issued: ${formatRand(amount)}`, { 
        id: loadingToast,
        duration: 4000 
      });
      
      setShowCreditNoteModal(false);
      setCreditNoteAmount('');
      setCreditNoteReason('');
      onInvoiceUpdated?.();
    } catch (error) {
      console.error('Error issuing credit note:', error);
      toast.error('Failed to issue credit note', { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mpondo-gold-100 rounded-lg">
              <FileText className="w-6 h-6 text-mpondo-gold-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                {invoice.invoice_number}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Invoice Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-neutral-900">Invoice Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Date Issued</p>
                  <p className="font-medium text-neutral-900">
                    {invoice.dateIssued ? format(new Date(invoice.dateIssued), 'dd MMMM yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Due Date</p>
                  <p className="font-medium text-neutral-900">
                    {invoice.dateDue ? format(new Date(invoice.dateDue), 'dd MMMM yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Bar</p>
                  <p className="font-medium text-neutral-900 capitalize">{invoice.bar}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-neutral-900">Matter Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Matter ID</p>
                  <p className="font-medium text-neutral-900">{invoice.matter_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="font-medium text-neutral-900 mb-4">Financial Summary</h3>
          
          <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Professional Fees</span>
              <span className="font-medium text-neutral-900">
                {formatRand(invoice.fees_amount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Disbursements</span>
              <span className="font-medium text-neutral-900">
                {formatRand(invoice.disbursements_amount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium text-neutral-900">
                {formatRand(invoice.subtotal)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">VAT ({(invoice.vat_rate * 100).toFixed(0)}%)</span>
              <span className="font-medium text-neutral-900">
                {formatRand(invoice.vat_amount)}
              </span>
            </div>
            
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-900">Total Amount</span>
                <span className="font-bold text-lg text-neutral-900">
                  {formatRand(invoice.total_amount)}
                </span>
              </div>
            </div>
            
            {invoice.amount_paid > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Amount Paid</span>
                  <span className="font-medium text-status-success-600">
                    {formatRand(invoice.amount_paid)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-900">Balance Due</span>
                  <span className="font-bold text-neutral-900">
                    {formatRand(invoice.balance_due)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fee Narrative */}
        <div className="border-t border-neutral-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-900">Fee Narrative</h3>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedNarrative}
                onChange={(e) => setEditedNarrative(e.target.value)}
                className="w-full h-32 p-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500"
                placeholder="Enter fee narrative..."
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateNarrative}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedNarrative(invoice.fee_narrative || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {invoice.fee_narrative || 'No fee narrative provided.'}
              </p>
            </div>
          )}
        </div>

        {/* Payment History */}
        {invoice.reminders_sent > 0 && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-medium text-neutral-900 mb-4">Reminder History</h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-700">
                {invoice.reminders_sent} reminder{invoice.reminders_sent > 1 ? 's' : ''} sent
              </p>
              {invoice.last_reminder_date && (
                <p className="text-xs text-neutral-500 mt-1">
                  Last reminder: {invoice.last_reminder_date ? format(new Date(invoice.last_reminder_date), 'dd MMMM yyyy') : 'N/A'}
                </p>
              )}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && invoice.balance_due > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowCreditNoteModal(true)}
                disabled={isLoading}
                className="border-status-warning-500 text-status-warning-700 hover:bg-status-warning-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Issue Credit Note
              </Button>
            )}
            
            {invoice.status === InvoiceStatus.DRAFT && (
              <Button
                variant="primary"
                onClick={handleSendInvoice}
                disabled={isLoading}
                className="bg-mpondo-gold-600 hover:bg-mpondo-gold-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
            )}
          </div>
        </div>
      </ModalFooter>

      {/* Credit Note Modal */}
      {showCreditNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Issue Credit Note
                </h3>
                <button
                  onClick={() => setShowCreditNoteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg p-3">
                  <p className="text-sm text-judicial-blue-900 dark:text-judicial-blue-100">
                    <strong>Invoice Balance:</strong> {formatRand(invoice.balance_due)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Credit Amount
                  </label>
                  <Input
                    type="number"
                    value={creditNoteAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreditNoteAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max={invoice.balance_due}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Reason Category
                  </label>
                  <select
                    value={creditNoteCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreditNoteCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="billing_error">Fee Adjustment / Billing Error</option>
                    <option value="service_issue">Service Issue</option>
                    <option value="client_dispute">Client Dispute</option>
                    <option value="goodwill">Goodwill Credit</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Reason / Notes
                  </label>
                  <textarea
                    value={creditNoteReason}
                    onChange={(e) => setCreditNoteReason(e.target.value)}
                    placeholder="Explain the reason for this credit note..."
                    className="w-full h-24 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreditNoteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleIssueCreditNote}
                    disabled={isLoading}
                    className="flex-1 bg-status-warning-600 hover:bg-status-warning-700"
                  >
                    Issue Credit Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
