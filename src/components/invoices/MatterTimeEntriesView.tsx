import React, { useState, useEffect } from 'react';
import { Clock, FileText, DollarSign, Calendar, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { TimeEntryService } from '../../services/api/time-entries.service';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import { UnifiedInvoiceWizard } from './UnifiedInvoiceWizard';

interface TimeEntry {
  id: string;
  matter_id: string;
  entry_date: string;
  description: string;
  hours: number;
  hourly_rate: number;
  amount: number;
  is_billed: boolean;
  matter?: {
    id: string;
    title: string;
    client_name: string;
    bar: string;
    matter_type?: string;
  };
}

interface MatterGroup {
  matterId: string;
  matterTitle: string;
  clientName: string;
  bar: string;
  matterType?: string;
  entries: TimeEntry[];
  totalHours: number;
  totalAmount: number;
}

export const MatterTimeEntriesView: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBilled, setFilterBilled] = useState<'all' | 'billed' | 'unbilled'>('unbilled');
  const [selectedMatter, setSelectedMatter] = useState<MatterGroup | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    loadTimeEntries();
  }, [filterBilled]);

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const result = await TimeEntryService.getTimeEntries({
        sortBy: 'entry_date',
        sortOrder: 'desc'
      });
      
      setTimeEntries(result.data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const groupByMatter = (): MatterGroup[] => {
    const filtered = timeEntries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.matter?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.matter?.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBilled = filterBilled === 'all' || 
        (filterBilled === 'billed' && entry.is_billed) ||
        (filterBilled === 'unbilled' && !entry.is_billed);

      return matchesSearch && matchesBilled;
    });

    const grouped = filtered.reduce((acc, entry) => {
      const matterId = entry.matter_id;
      if (!acc[matterId]) {
        acc[matterId] = {
          matterId,
          matterTitle: entry.matter?.title || 'Unknown Matter',
          clientName: entry.matter?.client_name || 'Unknown Client',
          bar: entry.matter?.bar || 'johannesburg',
          matterType: entry.matter?.matter_type,
          entries: [],
          totalHours: 0,
          totalAmount: 0
        };
      }
      acc[matterId].entries.push(entry);
      acc[matterId].totalHours += entry.hours;
      acc[matterId].totalAmount += entry.amount;
      return acc;
    }, {} as Record<string, MatterGroup>);

    return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const handleGenerateInvoice = (matterGroup: MatterGroup) => {
    setSelectedMatter(matterGroup);
    setShowWizard(true);
  };

  const handleInvoiceGenerated = () => {
    setShowWizard(false);
    setSelectedMatter(null);
    loadTimeEntries();
    toast.success('Invoice generated successfully!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const matterGroups = groupByMatter();
  const totalUnbilled = timeEntries.filter(e => !e.is_billed).reduce((sum, e) => sum + e.amount, 0);
  const totalUnbilledHours = timeEntries.filter(e => !e.is_billed).reduce((sum, e) => sum + e.hours, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Unbilled Hours</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {totalUnbilledHours.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Unbilled Amount</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(totalUnbilled)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Matters with Time</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {matterGroups.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by matter, client, or description..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-neutral-400" />
          {['all', 'unbilled', 'billed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBilled(filter as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBilled === filter
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {matterGroups.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
            <Clock className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No time entries found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchTerm ? 'Try adjusting your search or filters' : 'Time entries will appear here once added to matters'}
            </p>
          </div>
        ) : (
          matterGroups.map((matterGroup) => (
            <div
              key={matterGroup.matterId}
              className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      {matterGroup.matterTitle}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {matterGroup.clientName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {formatRand(matterGroup.totalAmount)}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {matterGroup.totalHours.toFixed(1)} hours • {matterGroup.entries.length} {matterGroup.entries.length === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                </div>

                {matterGroup.entries.some(e => !e.is_billed) && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleGenerateInvoice(matterGroup)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Invoice
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-metallic-gray-700">
                {matterGroup.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 ${entry.is_billed ? 'bg-neutral-50 dark:bg-metallic-gray-800 opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Calendar className="w-4 h-4" />
                            {formatDate(entry.entry_date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            <Clock className="w-4 h-4" />
                            {entry.hours.toFixed(1)} hours
                          </div>
                          {entry.is_billed && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                              Billed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">{entry.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatRand(entry.amount)}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          @ {formatRand(entry.hourly_rate)}/hr
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showWizard && selectedMatter && (
        <UnifiedInvoiceWizard
          matter={{
            id: selectedMatter.matterId,
            title: selectedMatter.matterTitle,
            clientName: selectedMatter.clientName,
            bar: selectedMatter.bar,
            wipValue: selectedMatter.totalAmount,
            disbursements: 0,
            matterType: selectedMatter.matterType
          }}
          onClose={() => {
            setShowWizard(false);
            setSelectedMatter(null);
          }}
          onGenerate={handleInvoiceGenerated}
        />
      )}
    </div>
  );
};
