import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, Save, Calendar, DollarSign } from 'lucide-react';
import { Button, Input, Textarea } from '../design-system/components';
import { TimeEntryService } from '../../services/api/time-entries.service';
import type { TimeEntry } from '../../types';

interface TimeEntryModalProps {
  matterId: string;
  matterTitle: string;
  timeEntry?: TimeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  defaultRate?: number;
  isInternalOnly?: boolean;
}

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  matterId,
  matterTitle,
  timeEntry,
  isOpen,
  onClose,
  onSave,
  defaultRate = 2000,
  isInternalOnly = false
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    description: '',
    rate: defaultRate,
    billable: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (timeEntry) {
      const totalHours = timeEntry.hours || 0;
      setFormData({
        date: timeEntry.entry_date || new Date().toISOString().split('T')[0],
        hours: Math.floor(totalHours),
        minutes: Math.round((totalHours % 1) * 60),
        description: timeEntry.description || '',
        rate: timeEntry.hourly_rate || defaultRate,
        billable: !(timeEntry.is_billed ?? false)
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        minutes: 0,
        description: '',
        rate: defaultRate,
        billable: true
      });
    }
  }, [timeEntry, defaultRate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    const totalMinutes = formData.hours * 60 + formData.minutes;
    if (totalMinutes <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (!formData.description || formData.description.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    if (formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Memoized handlers to prevent input focus loss
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  }, []);

  const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }));
  }, []);

  const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }));
  }, []);

  const handleBillableChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, billable: e.target.checked }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[TimeEntryModal] Form submitted', formData);

    if (!validate()) {
      console.log('[TimeEntryModal] Validation failed', errors);
      return;
    }

    setIsSaving(true);
    try {
      const durationMinutes = formData.hours * 60 + formData.minutes;

      console.log('[TimeEntryModal] Creating time entry:', {
        matterId,
        date: formData.date,
        durationMinutes,
        description: formData.description,
        rate: formData.rate
      });

      if (timeEntry) {
        await TimeEntryService.updateTimeEntry(timeEntry.id, {
          date: formData.date,
          durationMinutes,
          description: formData.description,
          rate: formData.rate,
          billable: formData.billable
        });
      } else {
        await TimeEntryService.createTimeEntry({
          matterId,
          date: formData.date,
          durationMinutes,
          description: formData.description,
          rate: formData.rate,
          billable: formData.billable,
          recordingMethod: 'manual'
        });
      }

      console.log('[TimeEntryModal] Time entry saved successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('[TimeEntryModal] Error saving time entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAmount = () => {
    const totalHours = formData.hours + formData.minutes / 60;
    return totalHours * formData.rate;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600 dark:text-mpondo-gold-400" />
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {timeEntry ? 'Edit Time Entry' : 'Add Time Entry'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{matterTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.date}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      value={formData.hours}
                      onChange={handleHoursChange}
                      placeholder="Hours"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={formData.minutes}
                      onChange={handleMinutesChange}
                      placeholder="Minutes"
                    />
                  </div>
                </div>
                {errors.duration && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.duration}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Describe the work performed..."
                rows={4}
                error={errors.description}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Hourly Rate (R) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.rate}
                  onChange={handleRateChange}
                  error={errors.rate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Calculated Amount
                </label>
                <div className="h-10 px-3 py-2 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg flex items-center">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    R{calculateAmount().toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billable"
                checked={formData.billable}
                onChange={handleBillableChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="billable" className="text-sm text-neutral-700 dark:text-neutral-300">
                Billable (include in invoices)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : timeEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
