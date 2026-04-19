/**
 * Court Diary & Docket Calendar — Section 9.5
 * Per-matter calendar entries with prescription date tracking.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  Clock, MapPin, AlertTriangle, CheckCircle, Filter, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isBefore, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

export type DiaryEntryType = 'appearance' | 'consultation' | 'filing_deadline' | 'prescription_date' | 'general_task';

export interface DiaryEntry {
  id: string;
  matter_id: string;
  advocate_id: string;
  entry_type: DiaryEntryType;
  title: string;
  description?: string;
  entry_date: string;
  entry_time?: string;
  end_time?: string;
  location?: string;
  reminder_days: number[];
  is_all_day: boolean;
  is_completed: boolean;
  completed_at?: string;
  matter_title?: string;
}

const ENTRY_TYPE_CONFIG: Record<DiaryEntryType, { label: string; color: string; icon: React.ElementType }> = {
  appearance: { label: 'Court Appearance', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: CalendarIcon },
  consultation: { label: 'Consultation', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: Clock },
  filing_deadline: { label: 'Filing Deadline', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: AlertTriangle },
  prescription_date: { label: 'Prescription Date', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: AlertTriangle },
  general_task: { label: 'General Task', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700', icon: CheckCircle },
};

interface CourtDiaryPageProps {
  matterId?: string;
}

export const CourtDiaryPage: React.FC<CourtDiaryPageProps> = ({ matterId }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState<DiaryEntryType | 'all'>('all');

  useEffect(() => { loadEntries(); }, [currentMonth]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      let query = supabase
        .from('diary_entries')
        .select('*, matters(title)')
        .eq('advocate_id', user.id)
        .gte('entry_date', start)
        .lte('entry_date', end)
        .order('entry_date');

      if (matterId) query = query.eq('matter_id', matterId);

      const { data, error } = await query;
      if (error) throw error;
      setEntries((data ?? []).map((e: any) => ({ ...e, matter_title: e.matters?.title })));
    } catch (err) {
      console.error('Failed to load diary entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getEntriesForDate = (date: Date) =>
    entries.filter(e => isSameDay(new Date(e.entry_date), date));

  const filteredEntries = filterType === 'all' ? entries : entries.filter(e => e.entry_type === filterType);

  const upcomingPrescriptions = entries
    .filter(e => e.entry_type === 'prescription_date' && !e.is_completed)
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  const handleToggleComplete = async (entry: DiaryEntry) => {
    const { error } = await supabase
      .from('diary_entries')
      .update({ is_completed: !entry.is_completed, completed_at: !entry.is_completed ? new Date().toISOString() : null })
      .eq('id', entry.id);
    if (error) toast.error('Failed to update entry');
    else { toast.success(entry.is_completed ? 'Entry reopened' : 'Entry completed'); loadEntries(); }
  };

  const generateICalUrl = () => {
    // Generate iCal data for calendar integration
    const icalData = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LexoHub//Court Diary//EN',
      ...entries.map(e => [
        'BEGIN:VEVENT',
        `DTSTART:${format(new Date(e.entry_date), "yyyyMMdd")}`,
        `SUMMARY:${e.title}`,
        `DESCRIPTION:${e.description ?? ''}`,
        e.location ? `LOCATION:${e.location}` : '',
        'END:VEVENT',
      ].filter(Boolean).join('\n')),
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icalData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lexohub-diary-${format(currentMonth, 'yyyy-MM')}.ics`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Calendar exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Court Diary</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Track appearances, deadlines, and prescription dates</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={generateICalUrl} className="flex items-center gap-2 px-3 py-2 text-sm bg-neutral-100 dark:bg-metallic-gray-800 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export iCal
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-mpondo-gold-600 hover:bg-mpondo-gold-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {/* Prescription Warning Banner */}
      {upcomingPrescriptions.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">Prescription Dates Warning</h3>
          </div>
          <div className="space-y-1">
            {upcomingPrescriptions.slice(0, 3).map(p => (
              <p key={p.id} className="text-sm text-purple-600 dark:text-purple-400">
                <strong>{p.title}</strong> — {format(new Date(p.entry_date), 'dd MMM yyyy')}
                {isBefore(new Date(p.entry_date), addDays(new Date(), 30)) && <span className="ml-2 text-xs font-medium bg-purple-200 dark:bg-purple-800 px-1.5 py-0.5 rounded">Within 30 days</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-metallic-gray-800 rounded-xl border border-neutral-200 dark:border-metallic-gray-700 p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{format(currentMonth, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Pad start of month */}
            {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`pad-${i}`} className="h-20" />
            ))}
            {days.map(day => {
              const dayEntries = getEntriesForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 p-1 rounded-lg text-left transition-colors border ${
                    isSelected ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/10' :
                    isToday(day) ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10' :
                    'border-transparent hover:bg-neutral-50 dark:hover:bg-metallic-gray-700/50'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEntries.slice(0, 2).map(entry => (
                      <div key={entry.id} className={`text-[10px] px-1 py-0.5 rounded truncate border ${ENTRY_TYPE_CONFIG[entry.entry_type].color}`}>
                        {entry.title}
                      </div>
                    ))}
                    {dayEntries.length > 2 && (
                      <span className="text-[10px] text-neutral-500">+{dayEntries.length - 2} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar — Selected Date Details / Upcoming */}
        <div className="space-y-4">
          {/* Filter */}
          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl border border-neutral-200 dark:border-metallic-gray-700 p-4">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter by Type
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterType('all')} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${filterType === 'all' ? 'bg-mpondo-gold-600 text-white' : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-300'}`}>
                All
              </button>
              {(Object.entries(ENTRY_TYPE_CONFIG) as [DiaryEntryType, any][]).map(([type, config]) => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${filterType === type ? 'bg-mpondo-gold-600 text-white' : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-300'}`}>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date Entries */}
          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl border border-neutral-200 dark:border-metallic-gray-700 p-4">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Upcoming Entries'}
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(selectedDate ? getEntriesForDate(selectedDate) : filteredEntries.slice(0, 10)).map(entry => {
                const config = ENTRY_TYPE_CONFIG[entry.entry_type];
                const IconComp = config.icon;
                return (
                  <div key={entry.id} className={`p-3 rounded-lg border ${config.color} ${entry.is_completed ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <IconComp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className={`text-sm font-medium ${entry.is_completed ? 'line-through' : ''}`}>{entry.title}</p>
                          {entry.matter_title && <p className="text-xs opacity-75">{entry.matter_title}</p>}
                          {entry.entry_time && <p className="text-xs opacity-75 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{entry.entry_time}</p>}
                          {entry.location && <p className="text-xs opacity-75 flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.location}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleToggleComplete(entry)} className="p-1 hover:opacity-75" title={entry.is_completed ? 'Reopen' : 'Complete'}>
                        <CheckCircle className={`w-4 h-4 ${entry.is_completed ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {((selectedDate ? getEntriesForDate(selectedDate) : filteredEntries).length === 0) && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">No entries</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDiaryPage;
