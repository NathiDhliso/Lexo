/**
 * Attorney Invoices Page
 * View invoices related to attorney's matters
 */
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Eye,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Button, Input, Select } from '../../components/design-system/components';

interface Invoice {
  id: string;
  invoice_number: string;
  matter_id: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'paid' | 'unpaid' | 'partially_paid' | 'overdue';
  invoice_date: string;
  due_date: string;
  created_at: string;
  matters?: {
    title: string;
    client_name: string;
  };
}

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, searchTerm, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get matters where user is the instructing attorney
      const { data: userMatters, error: mattersError } = await supabase
        .from('matters')
        .select('id')
        .eq('instructing_attorney', user.email);

      if (mattersError) throw mattersError;

      const matterIds = userMatters?.map(m => m.id) || [];

      if (matterIds.length === 0) {
        setInvoices([]);
        return;
      }

      // Get invoices for those matters
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          matters (
            title,
            client_name
          )
        `)
        .in('matter_id', matterIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoiceList: Invoice[]) => {
    const totalAmount = invoiceList.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paidAmount = invoiceList.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
    const outstandingAmount = invoiceList.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);

    setStats({
      total: invoiceList.length,
      paid: invoiceList.filter(inv => inv.payment_status === 'paid').length,
      unpaid: invoiceList.filter(inv => inv.payment_status === 'unpaid' || inv.payment_status === 'partially_paid').length,
      totalAmount,
      paidAmount,
      outstandingAmount
    });
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        invoice.matters?.title.toLowerCase().includes(searchLower) ||
        invoice.matters?.client_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'partially_paid':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'unpaid':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleViewInvoice = (invoiceId: string) => {
    // TODO: Implement invoice viewing
    toast('Invoice viewing feature coming soon');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    toast('Invoice download feature coming soon');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            My Invoices
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Invoices for matters where you are the instructing attorney
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Invoices</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {formatRand(stats.totalAmount)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Paid</p>
                <p className="text-2xl font-bold text-status-success-600 dark:text-status-success-400">{stats.paid}</p>
                <p className="text-sm text-status-success-600 dark:text-status-success-400 mt-1">
                  {formatRand(stats.paidAmount)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-status-success-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Outstanding</p>
                <p className="text-2xl font-bold text-status-error-600 dark:text-status-error-400">{stats.unpaid}</p>
                <p className="text-sm text-status-error-600 dark:text-status-error-400 mt-1">
                  {formatRand(stats.outstandingAmount)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-status-error-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by invoice, matter, or client..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="pl-10"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matching invoices' : 'No invoices yet'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Invoices will appear here when created for your matters'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} hoverable>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {invoice.invoice_number}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.payment_status)}`}>
                        {invoice.payment_status.replace('_', ' ').toUpperCase()}
                      </span>
                      {isOverdue(invoice.due_date) && invoice.payment_status !== 'paid' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                          {getDaysOverdue(invoice.due_date)} DAYS OVERDUE
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Matter:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {invoice.matters?.title || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {invoice.matters?.client_name || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Invoice Date:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Due Date:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Progress */}
                    {invoice.payment_status === 'partially_paid' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Payment Progress</span>
                          <span className="text-neutral-900 dark:text-neutral-100">
                            {formatRand(invoice.amount_paid)} / {formatRand(invoice.total_amount)}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
                          <div 
                            className="bg-status-success-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(invoice.amount_paid / invoice.total_amount) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {formatRand(invoice.total_amount)}
                      </div>
                      {invoice.balance_due > 0 && (
                        <div className="text-sm text-status-error-600 dark:text-status-error-400">
                          {formatRand(invoice.balance_due)} outstanding
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewInvoice(invoice.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;