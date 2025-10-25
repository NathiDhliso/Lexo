/**
 * WIP Tracker Page
 * Real-time Work in Progress tracking and management
 * Track time entries, expenses, and unbilled work for active matters
 */
import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, FileText, Plus, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRand } from '../lib/currency';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent, Button, Input } from '../components/design-system/components';
import { TimeEntryModal } from '../components/time-entries/TimeEntryModal';
import { QuickDisbursementModal } from '../components/expenses/QuickDisbursementModal';
import { RequestScopeAmendmentModal } from '../components/matters/RequestScopeAmendmentModal';
import { exportToCSV } from '../utils/export.utils';
import type { Matter } from '../types';

interface WIPLineItem {
  id: string;
  date: string;
  description: string;
  type: 'time' | 'expense' | 'service';
  hours?: number;
  rate?: number;
  amount: number;
  billable: boolean;
  matter_id: string;
}

export const WIPTrackerPage: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [wipItems, setWipItems] = useState<WIPLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalWIP: 0,
    totalHours: 0,
    activeMatters: 0,
    avgHourlyRate: 0,
  });

  useEffect(() => {
    loadActiveMatters();
  }, []);

  useEffect(() => {
    if (selectedMatter) {
      loadWIPItems(selectedMatter.id);
    }
  }, [selectedMatter]);

  const loadActiveMatters = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('status', 'active')
        .gt('wip_value', 0)
        .order('wip_value', { ascending: false });

      if (error) throw error;

      setMatters(data || []);
      if (data && data.length > 0) {
        setSelectedMatter(data[0]);
      }

      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading matters:', error);
      toast.error('Failed to load active matters');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (matterList: Matter[]) => {
    const totalWIP = matterList.reduce((sum, m) => sum + (m.wip_value || 0), 0);
    const activeCount = matterList.length;

    setStats({
      totalWIP,
      totalHours: 0, // Will be calculated from time entries
      activeMatters: activeCount,
      avgHourlyRate: 0,
    });
  };

  const loadWIPItems = async (matterId: string) => {
    try {
      // Load time entries
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('matter_id', matterId)
        .is('invoice_id', null) // Only unbilled
        .order('entry_date', { ascending: false });

      if (timeError) throw timeError;

      // Load expenses
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('matter_id', matterId)
        .is('invoice_id', null) // Only unbilled
        .order('expense_date', { ascending: false });

      if (expenseError) throw expenseError;

      // Load logged services
      const { data: services, error: serviceError } = await supabase
        .from('logged_services')
        .select('*')
        .eq('matter_id', matterId)
        .is('invoice_id', null) // Only unbilled
        .order('service_date', { ascending: false });

      if (serviceError) throw serviceError;

      // Combine all WIP items
      const items: WIPLineItem[] = [
        ...(timeEntries || []).map((t: any) => ({
          id: t.id,
          date: t.entry_date,
          description: t.description,
          type: 'time' as const,
          hours: t.hours_worked,
          rate: t.hourly_rate,
          amount: (t.hours_worked || 0) * (t.hourly_rate || 0),
          billable: !t.is_billed,
          matter_id: t.matter_id,
        })),
        ...(expenses || []).map((e: any) => ({
          id: e.id,
          date: e.expense_date,
          description: e.description,
          type: 'expense' as const,
          amount: e.amount,
          billable: !e.is_billed,
          matter_id: e.matter_id,
        })),
        ...(services || []).map((s: any) => ({
          id: s.id,
          date: s.service_date,
          description: s.description,
          type: 'service' as const,
          hours: s.hours,
          rate: s.rate,
          amount: s.amount,
          billable: true,
          matter_id: s.matter_id,
        })),
      ];

      // Sort by date
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setWipItems(items);
    } catch (error) {
      console.error('Error loading WIP items:', error);
      toast.error('Failed to load WIP items');
    }
  };

  const handleExportWIP = () => {
    if (!selectedMatter || wipItems.length === 0) {
      toast.error('No WIP items to export');
      return;
    }

    const exportData = wipItems.map(item => ({
      'Date': new Date(item.date).toLocaleDateString(),
      'Type': item.type.toUpperCase(),
      'Description': item.description,
      'Hours': item.hours || '-',
      'Rate': item.rate ? formatRand(item.rate) : '-',
      'Amount': formatRand(item.amount),
      'Billable': item.billable ? 'Yes' : 'No',
    }));

    exportToCSV(exportData, `wip-${selectedMatter.title.replace(/\s+/g, '-').toLowerCase()}`);
    toast.success('WIP items exported successfully');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'time':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'expense':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'service':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'time':
        return <Clock className="w-4 h-4" />;
      case 'expense':
        return <DollarSign className="w-4 h-4" />;
      case 'service':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredMatters = matters.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            WIP Tracker
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track unbilled work in progress for active matters
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total WIP</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRand(stats.totalWIP)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Matters</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.activeMatters}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">This Matter</p>
                <p className="text-2xl font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
                  {selectedMatter ? formatRand(selectedMatter.wip_value || 0) : '-'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-judicial-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Line Items</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {wipItems.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matter List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Active Matters
            </h3>
          </CardHeader>
          <CardContent>
              <Input
                type="text"
                placeholder="Search matters..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="mb-4"
              />            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredMatters.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No active matters with WIP
                  </p>
                </div>
              ) : (
                filteredMatters.map((matter) => (
                  <button
                    key={matter.id}
                    onClick={() => setSelectedMatter(matter)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedMatter?.id === matter.id
                        ? 'border-judicial-blue-500 bg-judicial-blue-50 dark:bg-judicial-blue-900/20'
                        : 'border-neutral-200 dark:border-metallic-gray-700 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
                    }`}
                  >
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                      {matter.title}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {matter.client_name}
                    </div>
                    <div className="text-sm font-semibold text-judicial-blue-600 dark:text-judicial-blue-400">
                      {formatRand(matter.wip_value || 0)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* WIP Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {selectedMatter ? selectedMatter.title : 'Select a matter'}
              </h3>
              {selectedMatter && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTimeModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Time
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExpenseModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Expense
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScopeModal(true)}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Scope Amendment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportWIP}
                    disabled={wipItems.length === 0}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedMatter ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  Select a matter to view WIP details
                </p>
              </div>
            ) : wipItems.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  No unbilled work for this matter
                </p>
                <Button onClick={() => setShowTimeModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {wipItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {item.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-900 dark:text-neutral-100 mb-2">
                          {item.description}
                        </p>
                        {item.hours && (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {item.hours}h × {formatRand(item.rate || 0)}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatRand(item.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedMatter && (
        <>
          <TimeEntryModal
            isOpen={showTimeModal}
            matterId={selectedMatter.id}
            matterTitle={selectedMatter.title}
            onClose={() => setShowTimeModal(false)}
            onSave={() => {
              setShowTimeModal(false);
              loadWIPItems(selectedMatter.id);
              loadActiveMatters(); // Refresh WIP totals
            }}
          />

          <QuickDisbursementModal
            isOpen={showExpenseModal}
            matterId={selectedMatter.id}
            onClose={() => setShowExpenseModal(false)}
            onSuccess={() => {
              setShowExpenseModal(false);
              loadWIPItems(selectedMatter.id);
              loadActiveMatters();
            }}
          />

          <RequestScopeAmendmentModal
            isOpen={showScopeModal}
            matter={selectedMatter}
            onClose={() => setShowScopeModal(false)}
            onSuccess={() => {
              setShowScopeModal(false);
              toast.success('Scope amendment request sent');
            }}
          />
        </>
      )}
    </div>
  );
};

export default WIPTrackerPage;
