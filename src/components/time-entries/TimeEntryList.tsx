import React, { useState, useEffect } from 'react';
import { Clock, Edit, Trash2, Plus, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../design-system/components';
import { TimeEntryModal } from './TimeEntryModal';
import { TimeEntryService } from '../../services/api/time-entries.service';
import type { TimeEntry } from '../../types';

interface TimeEntryListProps {
  matterId: string;
  matterTitle: string;
  defaultRate?: number;
  isInternalOnly?: boolean;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  matterId,
  matterTitle,
  defaultRate = 2000,
  isInternalOnly = false
}) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const result = await TimeEntryService.getTimeEntries({
        matterId,
        sortBy: 'entry_date',
        sortOrder: 'desc'
      });
      setTimeEntries(result.data);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeEntries();
  }, [matterId]);

  const handleAdd = () => {
    setSelectedEntry(null);
    setShowModal(true);
  };

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleDelete = async (entry: TimeEntry) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      await TimeEntryService.deleteTimeEntry(entry.id);
      loadTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  const handleSave = () => {
    loadTimeEntries();
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const mins = Math.round((hours % 1) * 60);
    if (wholeHours > 0 && mins > 0) {
      return `${wholeHours}h ${mins}m`;
    } else if (wholeHours > 0) {
      return `${wholeHours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTotal = () => {
    return timeEntries.reduce((sum, entry) => {
      return sum + (entry.amount || 0);
    }, 0);
  };

  const calculateTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Time Entries</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {timeEntries.length} {timeEntries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Time
        </Button>
      </div>

      {timeEntries.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Hours</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatDuration(calculateTotalHours())}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                R{calculateTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {timeEntries.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <Clock className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">No time entries yet</p>
          <Button variant="primary" onClick={handleAdd} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Your First Time Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {timeEntries.map((entry) => {
            const hours = entry.hours || 0;
            const rate = entry.hourly_rate || 0;
            const amount = entry.amount || 0;

            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 hover:border-blue-300 dark:hover:border-blue-700 p-4 transition-colors"
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
                        {formatDuration(hours)}
                      </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-2">
                      {entry.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600 dark:text-neutral-400">
                        R{rate.toLocaleString('en-ZA')}/hr
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        R{amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TimeEntryModal
        matterId={matterId}
        matterTitle={matterTitle}
        timeEntry={selectedEntry}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        defaultRate={defaultRate}
      />
    </div>
  );
};
