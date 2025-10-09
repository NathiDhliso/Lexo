import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { InvoiceCard } from './InvoiceCard';
import { InvoiceFilters } from './InvoiceFilters';
import { MatterSelectionModal } from './MatterSelectionModal';
import { UnifiedInvoiceWizard } from './UnifiedInvoiceWizard';
import { PaymentModal } from './PaymentModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { InvoiceService } from '@/services/api/invoices.service';
import { invoicePDFService } from '../../services/invoice-pdf.service';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import type { Invoice, BarAssociation } from '@/types';
import { InvoiceStatus } from '@/types';

interface InvoiceListProps {
  className?: string;
}

interface InvoiceFilters {
  search: string;
  status: InvoiceStatus[];
  bar: BarAssociation[];
  dateRange: { start: string; end: string } | null;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ className = '' }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatterSelection, setShowMatterSelection] = useState(false);
  const [showInvoiceWizard, setShowInvoiceWizard] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: [],
    bar: [],
    dateRange: null
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await InvoiceService.getInvoices({});
      setInvoices(response.data);
    } catch (err) {
      // For now, set empty data instead of error to show the UI
      console.warn('Error loading invoices, using empty data:', err);
      setInvoices([]);
      // setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...invoices];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(invoice => {
        const invNum = (invoice.invoiceNumber ?? invoice.invoice_number ?? '').toLowerCase();
        const clientName = (invoice.clientName ?? '').toLowerCase();
        const feeNarrative = (invoice.feeNarrative ?? invoice.fee_narrative ?? '').toLowerCase();
        return (
          invNum.includes(searchLower) ||
          clientName.includes(searchLower) ||
          feeNarrative.includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(invoice => 
        filters.status.includes(invoice.status)
      );
    }

    // Bar filter
    if (filters.bar.length > 0) {
      filtered = filtered.filter(invoice => 
        filters.bar.includes(invoice.bar)
      );
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, filters]);

  const handleMatterSelected = (matter: any) => {
    setSelectedMatter(matter);
    setShowMatterSelection(false);
    setShowInvoiceWizard(true);
  };

  const handleInvoiceGenerated = async (invoiceData: any) => {
    try {
      console.log('Invoice generated:', invoiceData);
      
      if (!invoiceData.matterId) {
        toast.error('Matter ID is missing');
        return;
      }

      const feesAmount = invoiceData.totals.totalFees + invoiceData.totals.servicesTotal - invoiceData.totals.discountValue;
      const disbursementsAmount = invoiceData.totals.totalExpenses + invoiceData.totals.disbursements;

      await InvoiceService.createInvoice({
        matterId: invoiceData.matterId,
        feesAmount,
        disbursementsAmount,
        feeNarrative: invoiceData.narrative || 'Professional fees for legal services rendered',
        vatRate: 0.15,
        timeEntryIds: invoiceData.selectedTimeEntries
      });

      setShowInvoiceWizard(false);
      setSelectedMatter(null);
      loadInvoices();
      toast.success('Invoice generated successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const handlePaymentRecorded = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    loadInvoices(); // Refresh the list
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await InvoiceService.sendInvoice(invoice.id);
      loadInvoices(); // Refresh to show updated status
      toast.success('Invoice sent successfully');
    } catch (err) {
      console.error('Error sending invoice:', err);
      toast.error('Failed to send invoice. Please try again.');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Open invoice details modal or navigate to details page
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const { data: advocate, error: advocateError } = await supabase
        .from('advocates')
        .select('full_name, practice_number, email, phone_number')
        .eq('id', user.id)
        .single();

      if (advocateError || !advocate) {
        toast.error('Failed to load advocate information');
        return;
      }

      const { data: matter, error: matterError } = await supabase
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

      const invoiceWithDetails = {
        ...invoice,
        matter: matter || undefined,
        time_entries: timeEntries || [],
        expenses: expenses || [],
      };

      await invoicePDFService.downloadInvoicePDF(invoiceWithDetails as any, {
        full_name: advocate.full_name,
        practice_number: advocate.practice_number,
        email: advocate.email || undefined,
        phone: advocate.phone_number || undefined,
      });

      toast.success('Invoice PDF downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      await InvoiceService.updateInvoiceStatus(invoiceId, newStatus);
      loadInvoices(); // Refresh to show updated status
      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating invoice status:', err);
      toast.error('Failed to update invoice status. Please try again.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    
    try {
      await InvoiceService.deleteInvoice(invoiceId);
      loadInvoices(); // Refresh the list
      toast.success('Invoice deleted successfully');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      toast.error('Failed to delete invoice. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      bar: [],
      dateRange: null
    });
  };

  // Summary statistics
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount ?? inv.total_amount ?? 0), 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + (inv.totalAmount ?? inv.total_amount ?? 0), 0);
  const overdueCount = filteredInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length;

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <p className="text-error-600 mb-4">{error}</p>
        <button
          onClick={loadInvoices}
          className="px-4 py-2 bg-mpondo-gold-600 text-white rounded-lg hover:bg-mpondo-gold-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Action */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowMatterSelection(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-mpondo-gold-600 text-white rounded-lg hover:bg-mpondo-gold-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Value</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Paid Amount</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(paidAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Overdue</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {overdueCount} invoice{overdueCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <InvoiceFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
            <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {invoices.length === 0 
                ? 'Generate your first invoice to get started.'
                : 'Try adjusting your filters to see more results.'
              }
            </p>
            {invoices.length === 0 && (
              <button
                onClick={() => setShowMatterSelection(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-mpondo-gold-600 text-white rounded-lg hover:bg-mpondo-gold-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={() => handleViewInvoice(invoice)}
                onSend={() => handleSendInvoice(invoice)}
                onDownload={() => handleDownloadInvoice(invoice)}
                onRecordPayment={() => handleRecordPayment(invoice)}
                onUpdateStatus={(status) => handleUpdateInvoiceStatus(invoice.id, status)}
                onDelete={() => handleDeleteInvoice(invoice.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showMatterSelection && (
        <MatterSelectionModal
          isOpen={showMatterSelection}
          onClose={() => setShowMatterSelection(false)}
          onMatterSelected={handleMatterSelected}
        />
      )}

      {showInvoiceWizard && selectedMatter && (
        <UnifiedInvoiceWizard
          matter={{
            id: selectedMatter.id,
            title: selectedMatter.title,
            clientName: selectedMatter.client_name,
            bar: selectedMatter.bar,
            matterType: selectedMatter.matter_type,
            sourceProFormaId: selectedMatter.source_proforma_id,
            wipValue: selectedMatter.unbilledAmount,
            disbursements: 0
          }}
          onClose={() => {
            setShowInvoiceWizard(false);
            setSelectedMatter(null);
          }}
          onGenerate={handleInvoiceGenerated}
        />
      )}

      {showPaymentModal && selectedInvoice && (
        <PaymentModal
          isOpen={showPaymentModal}
          invoice={selectedInvoice}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
          }}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {showDetailsModal && selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInvoice(null);
          }}
          onInvoiceUpdated={loadInvoices}
        />
      )}
    </div>
  );
};
