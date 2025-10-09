import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { matterApiService } from '../../services/api/matter-api.service';
import { TimeEntryService } from '../../services/api/time-entries.service';
import { proformaRequestService } from '../../services/api/proforma-request.service';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface Matter {
  id: string;
  title: string;
  client_name: string;
  bar: string;
  matter_type?: string;
  source_proforma_id?: string;
  wip_value?: number;
}

interface MatterWithBillingData extends Matter {
  unbilledHours: number;
  unbilledAmount: number;
  timeEntriesCount: number;
  hasProForma: boolean;
  proFormaAmount?: number;
}

interface MatterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatterSelected: (matter: MatterWithBillingData) => void;
}

export const MatterSelectionModal: React.FC<MatterSelectionModalProps> = ({
  isOpen,
  onClose,
  onMatterSelected
}) => {
  const [matters, setMatters] = useState<MatterWithBillingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMatters();
    }
  }, [isOpen]);

  const loadMatters = async () => {
    setLoading(true);
    try {
      const mattersResponse = await matterApiService.getAll();
      const mattersData = mattersResponse.data || [];

      const mattersWithBilling = await Promise.all(
        mattersData.map(async (matter: Matter) => {
          const timeEntriesResult = await TimeEntryService.getTimeEntries({
            matterId: matter.id,
            sortBy: 'entry_date',
            sortOrder: 'desc'
          });

          const unbilledEntries = (timeEntriesResult.data || []).filter((entry: any) => !entry.is_billed);
          const unbilledHours = unbilledEntries.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0);
          const unbilledAmount = unbilledEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);

          let proFormaAmount = 0;
          if (matter.source_proforma_id) {
            const proForma = await proformaRequestService.getById(matter.source_proforma_id);
            proFormaAmount = proForma?.estimated_amount || 0;
          }

          return {
            ...matter,
            unbilledHours,
            unbilledAmount,
            timeEntriesCount: unbilledEntries.length,
            hasProForma: !!matter.source_proforma_id,
            proFormaAmount
          };
        })
      );

      setMatters(mattersWithBilling.filter(m => m.unbilledAmount > 0 || m.hasProForma));
    } catch (error) {
      console.error('Error loading matters:', error);
      toast.error('Failed to load matters');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatters = matters.filter(matter =>
    matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matter.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMatter = (matter: MatterWithBillingData) => {
    onMatterSelected(matter);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Select Matter</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Choose a matter to generate an invoice
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by matter title or client name..."
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredMatters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                No matters available
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm
                  ? 'No matters match your search'
                  : 'No matters with unbilled time or pro forma data found'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatters.map((matter) => (
                <button
                  key={matter.id}
                  onClick={() => handleSelectMatter(matter)}
                  className="w-full text-left p-4 border-2 border-neutral-200 dark:border-metallic-gray-700 rounded-lg hover:border-amber-500 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        {matter.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {matter.client_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {formatRand(matter.unbilledAmount + (matter.proFormaAmount || 0))}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Total billable
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {matter.hasProForma && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatRand(matter.proFormaAmount || 0)}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">Pro Forma</div>
                        </div>
                      </div>
                    )}

                    {matter.timeEntriesCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                          <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {matter.unbilledHours.toFixed(1)}h
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {matter.timeEntriesCount} {matter.timeEntriesCount === 1 ? 'entry' : 'entries'}
                          </div>
                        </div>
                      </div>
                    )}

                    {matter.unbilledAmount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                          <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatRand(matter.unbilledAmount)}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">Time Value</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {matter.hasProForma && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>Linked to Pro Forma Request</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <AlertCircle className="w-4 h-4" />
            <span>
              Select a matter to automatically import its pro forma data and unbilled time entries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
