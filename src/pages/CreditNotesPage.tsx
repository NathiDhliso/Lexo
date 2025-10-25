/**
 * Credit Notes Page
 * Manage credit notes and refunds
 */
import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRand } from '../lib/currency';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Button, Input, Select } from '../components/design-system/components';
import { exportToCSV } from '../utils/export.utils';

interface CreditNote {
  id: string;
  credit_note_number: string;
  invoice_id: string;
  amount: number;
  reason: string;
  description: string;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
  issued_at: string;
  created_at: string;
  invoices?: {
    invoice_number: string;
    client_name: string;
    matters?: {
      title: string;
    };
  };
}

export const CreditNotesPage: React.FC = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    issued: 0,
    applied: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadCreditNotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [creditNotes, searchTerm, statusFilter]);

  const loadCreditNotes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('credit_notes')
        .select(`
          *,
          invoices (
            invoice_number,
            client_name,
            matters (
              title
            )
          )
        `)
        .eq('issued_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCreditNotes(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading credit notes:', error);
      toast.error('Failed to load credit notes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notes: CreditNote[]) => {
    setStats({
      total: notes.length,
      issued: notes.filter(n => n.status === 'issued').length,
      applied: notes.filter(n => n.status === 'applied').length,
      totalAmount: notes.reduce((sum, n) => sum + (n.amount || 0), 0),
    });
  };

  const applyFilters = () => {
    let filtered = [...creditNotes];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(note => note.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.credit_note_number.toLowerCase().includes(searchLower) ||
        note.invoices?.invoice_number.toLowerCase().includes(searchLower) ||
        note.invoices?.client_name.toLowerCase().includes(searchLower) ||
        note.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredNotes(filtered);
  };

  const handleExportCSV = () => {
    const exportData = filteredNotes.map(note => ({
      'Credit Note': note.credit_note_number,
      'Invoice': note.invoices?.invoice_number || 'N/A',
      'Client': note.invoices?.client_name || 'N/A',
      'Matter': note.invoices?.matters?.title || 'N/A',
      'Amount': note.amount,
      'Reason': note.reason.replace(/_/g, ' ').toUpperCase(),
      'Status': note.status.toUpperCase(),
      'Issued Date': new Date(note.issued_at || note.created_at).toLocaleDateString(),
      'Description': note.description,
    }));

    exportToCSV(exportData, 'credit-notes');
    toast.success('Credit notes exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'applied':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      billing_error: 'Billing Error',
      dispute_resolution: 'Dispute Resolution',
      overpayment: 'Overpayment',
      goodwill: 'Goodwill Gesture',
      service_issue: 'Service Issue',
      other: 'Other',
    };
    return labels[reason] || reason;
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
            Credit Notes
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage credit notes and refunds
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          disabled={filteredNotes.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Credit Notes</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Issued</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.issued}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Applied</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.applied}</p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRand(stats.totalAmount)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-neutral-400" />
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
                placeholder="Search by credit note, invoice, or client..."
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
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="applied">Applied</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matching credit notes' : 'No credit notes yet'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Credit notes will appear here when issued'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} hoverable>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {note.credit_note_number}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(note.status)}`}>
                        {note.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Invoice:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {note.invoices?.invoice_number || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {note.invoices?.client_name || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Reason:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {getReasonLabel(note.reason)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Issued:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {new Date(note.issued_at || note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {note.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {note.description}
                      </p>
                    )}

                    {note.invoices?.matters?.title && (
                      <div className="text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Matter:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {note.invoices.matters.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-status-error-600 dark:text-status-error-400">
                      {formatRand(note.amount)}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Credit Amount
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

export default CreditNotesPage;
