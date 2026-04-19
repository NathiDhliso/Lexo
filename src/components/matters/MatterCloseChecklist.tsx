/**
 * Matter Close Checklist — Section 9.13
 */
import React, { useState } from 'react';
import { CheckCircle, Circle, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export type MatterOutcome = 'won' | 'lost' | 'settled' | 'withdrawn' | 'other';

interface ChecklistItem { id: string; label: string; required: boolean; checked: boolean; }

const DEFAULT_ITEMS: Omit<ChecklistItem, 'checked'>[] = [
  { id: 'time_recorded', label: 'All time entries recorded', required: true },
  { id: 'disbursements', label: 'All disbursements captured', required: true },
  { id: 'final_invoice', label: 'Final invoice generated', required: true },
  { id: 'payments_clear', label: 'No outstanding payments', required: true },
  { id: 'trust_refunded', label: 'Trust balance refunded', required: true },
  { id: 'docs_filed', label: 'Documents filed and tagged', required: false },
  { id: 'conflict_updated', label: 'Conflict register updated', required: false },
  { id: 'client_notified', label: 'Client notified of closure', required: false },
  { id: 'file_archived', label: 'Physical file archived', required: false },
];

interface Props {
  matterId: string;
  matterTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (outcome: MatterOutcome, notes: string) => void;
  existingChecklist?: Record<string, boolean>;
}

export const MatterCloseChecklist: React.FC<Props> = ({
  matterId, matterTitle, isOpen, onClose, onComplete, existingChecklist,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(
    DEFAULT_ITEMS.map(i => ({ ...i, checked: existingChecklist?.[i.id] ?? false }))
  );
  const [outcome, setOutcome] = useState<MatterOutcome | ''>('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const allRequiredDone = items.filter(i => i.required).every(i => i.checked);
  const done = items.filter(i => i.checked).length;

  const toggle = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  const handleComplete = async () => {
    if (!outcome) { toast.error('Select outcome'); return; }
    if (!allRequiredDone) { toast.error('Complete required items'); return; }
    setSaving(true);
    try {
      const data = Object.fromEntries(items.map(i => [i.id, i.checked]));
      await supabase.from('matters').update({
        status: 'closed', close_outcome: outcome, close_notes: notes,
        close_checklist: data, updated_at: new Date().toISOString(),
      }).eq('id', matterId);
      toast.success('Matter closed');
      onComplete(outcome as MatterOutcome, notes);
    } catch { toast.error('Failed to close'); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-metallic-gray-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-metallic-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Close Matter</h2>
            <p className="text-sm text-neutral-500 truncate max-w-[300px]">{matterTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-neutral-100 dark:bg-metallic-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-status-success-500 rounded-full transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
            </div>
            <span className="text-xs font-medium text-neutral-500">{done}/{items.length}</span>
          </div>

          {items.map(item => (
            <button key={item.id} onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border ${
                item.checked ? 'bg-status-success-50 dark:bg-status-success-900/10 border-status-success-200 dark:border-status-success-800' : 'bg-neutral-50 dark:bg-metallic-gray-900 border-neutral-200 dark:border-metallic-gray-700'
              }`}>
              {item.checked ? <CheckCircle className="w-5 h-5 text-status-success-500" /> : <Circle className="w-5 h-5 text-neutral-400" />}
              <span className={`text-sm ${item.checked ? 'line-through text-status-success-700 dark:text-status-success-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {item.label} {item.required && <span className="text-status-error-500 text-xs">*</span>}
              </span>
            </button>
          ))}

          <div className="pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
            <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-neutral-100">Outcome *</label>
            <div className="flex flex-wrap gap-2">
              {(['won', 'lost', 'settled', 'withdrawn', 'other'] as MatterOutcome[]).map(o => (
                <button key={o} onClick={() => setOutcome(o)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize ${outcome === o ? 'bg-mpondo-gold-600 text-white' : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-700 dark:text-neutral-300'}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Closure notes..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-metallic-gray-700 rounded-lg bg-white dark:bg-metallic-gray-900 h-16" />
          {!allRequiredDone && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-300">Complete required items (*) first.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 dark:border-metallic-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-neutral-100 dark:bg-metallic-gray-700 rounded-lg">Cancel</button>
          <button onClick={handleComplete} disabled={!allRequiredDone || !outcome || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-status-error-600 hover:bg-status-error-700 disabled:opacity-50 rounded-lg">
            {saving ? 'Closing...' : 'Close Matter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatterCloseChecklist;
