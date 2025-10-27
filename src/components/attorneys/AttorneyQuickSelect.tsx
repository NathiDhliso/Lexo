/**
 * AttorneyQuickSelect Component
 * Two-mode selector: Quick Select (recurring attorneys) vs Manual Entry
 * Features:
 * - Shows recurring attorneys with usage stats
 * - Auto-fills firm details for recurring attorneys
 * - Optional portal invitation checkbox
 * - Manual entry without requiring registration
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, UserPlus, Star, Clock, TrendingUp, Mail } from 'lucide-react';
import { FormSelect } from '../ui/FormSelect';
import { FormInput } from '../ui/FormInput';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export interface AttorneyQuickSelectProps {
  value: {
    firm_id?: string;
    firm_name: string;
    attorney_id?: string;
    attorney_name: string;
    attorney_email: string;
    attorney_phone?: string;
    send_portal_invitation?: boolean;
  };
  onChange: (value: any) => void;
  advocateId: string;
}

interface RecurringAttorney {
  attorney_id: string;
  attorney_name: string;
  email: string;
  phone?: string;
  firm_id: string;
  firm_name: string;
  matter_count: number;
  last_worked_with: string;
  days_since_last_worked: number;
  is_registered: boolean;
  portal_invitation_sent: boolean;
}

interface Firm {
  id: string;
  firm_name: string;
}

interface Attorney {
  id: string;
  attorney_name: string;
  email: string;
  phone?: string;
  firm_id: string;
}

export const AttorneyQuickSelect: React.FC<AttorneyQuickSelectProps> = ({
  value,
  onChange,
  advocateId
}) => {
  const [mode, setMode] = useState<'quick' | 'manual'>('quick');
  const [recurringAttorneys, setRecurringAttorneys] = useState<RecurringAttorney[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendInvitation, setSendInvitation] = useState(false);

  const loadRecurringAttorneys = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_attorneys_view')
        .select('*')
        .eq('advocate_id', advocateId)
        .limit(10);

      if (error) throw error;
      setRecurringAttorneys(data || []);
    } catch (error) {
      console.error('Error loading recurring attorneys:', error);
    } finally {
      setLoading(false);
    }
  }, [advocateId]);

  const loadFirms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('id, firm_name')
        .eq('advocate_id', advocateId)
        .order('firm_name');

      if (error) throw error;
      setFirms(data || []);
    } catch (error) {
      console.error('Error loading firms:', error);
    }
  }, [advocateId]);

  useEffect(() => {
    if (advocateId) {
      loadRecurringAttorneys();
      loadFirms();
    }
  }, [advocateId, loadRecurringAttorneys, loadFirms]);

  useEffect(() => {
    if (value.firm_id && mode === 'manual') {
      loadAttorneys(value.firm_id);
    }
  }, [value.firm_id, mode]);



  const loadAttorneys = async (firmId: string) => {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('id, attorney_name, email, phone, firm_id')
        .eq('firm_id', firmId)
        .order('attorney_name');

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error loading attorneys:', error);
    }
  };

  const handleSelectRecurringAttorney = (attorney: RecurringAttorney) => {
    onChange({
      firm_id: attorney.firm_id,
      firm_name: attorney.firm_name,
      attorney_id: attorney.attorney_id,
      attorney_name: attorney.attorney_name,
      attorney_email: attorney.email,
      attorney_phone: attorney.phone,
      send_portal_invitation: false // Already registered or invited
    });
  };

  const handleManualSelect = () => {
    const selectedFirm = firms.find(f => f.id === value.firm_id);
    const selectedAttorney = attorneys.find(a => a.id === value.attorney_id);
    
    if (selectedAttorney) {
      onChange({
        firm_id: value.firm_id,
        firm_name: selectedFirm?.firm_name || '',
        attorney_id: selectedAttorney.id,
        attorney_name: selectedAttorney.attorney_name,
        attorney_email: selectedAttorney.email,
        attorney_phone: selectedAttorney.phone,
        send_portal_invitation: sendInvitation
      });
    }
  };



  const formatLastWorked = (daysAgo: number): string => {
    if (daysAgo < 1) return 'Today';
    if (daysAgo < 2) return 'Yesterday';
    if (daysAgo < 7) return `${Math.floor(daysAgo)} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`;
    return `${Math.floor(daysAgo / 365)} years ago`;
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg">
        <button
          onClick={() => setMode('quick')}
          className={cn(
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            mode === 'quick'
              ? 'bg-white dark:bg-metallic-gray-700 text-judicial-blue-600 dark:text-judicial-blue-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          )}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Quick Select
        </button>
        <button
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            mode === 'manual'
              ? 'bg-white dark:bg-metallic-gray-700 text-judicial-blue-600 dark:text-judicial-blue-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          )}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Manual Entry
        </button>
      </div>

      {/* Quick Select Mode */}
      {mode === 'quick' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Frequently Used Attorneys
            </h4>
            {recurringAttorneys.length > 0 && (
              <span className="text-xs text-neutral-500">
                Top {recurringAttorneys.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-blue-600 mx-auto"></div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Loading attorneys...</p>
            </div>
          ) : recurringAttorneys.length === 0 ? (
            <div className="text-center py-8 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-metallic-gray-600">
              <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                No recurring attorneys yet
              </p>
              <p className="text-xs text-neutral-500">
                Switch to Manual Entry to add your first attorney
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recurringAttorneys.map((attorney) => (
                <button
                  key={attorney.attorney_id}
                  onClick={() => handleSelectRecurringAttorney(attorney)}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 transition-all text-left',
                    value.attorney_id === attorney.attorney_id
                      ? 'border-judicial-blue-500 bg-judicial-blue-50 dark:bg-judicial-blue-900/20'
                      : 'border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-800 hover:border-judicial-blue-300'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {attorney.attorney_name}
                        </p>
                        {attorney.is_registered && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Registered
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {attorney.firm_name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {attorney.matter_count} matter{attorney.matter_count !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatLastWorked(attorney.days_since_last_worked)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Mode */}
      {mode === 'manual' && (
        <div className="space-y-4">
          {/* Firm Selection */}
          <FormSelect
            label="Law Firm"
            value={value.firm_id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const selectedFirm = firms.find(f => f.id === e.target.value);
              onChange({
                ...value,
                firm_id: e.target.value,
                firm_name: selectedFirm?.firm_name || '',
                attorney_id: undefined
              });
            }}
          >
            <option value="">Select a firm or enter manually below</option>
            {firms.map((firm) => (
              <option key={firm.id} value={firm.id}>
                {firm.firm_name}
              </option>
            ))}
          </FormSelect>

          {/* If firm selected, show attorney dropdown */}
          {value.firm_id && (
            <FormSelect
              label="Attorney"
              value={value.attorney_id || ''}
              onChange={(_e: React.ChangeEvent<HTMLSelectElement>) => {
                handleManualSelect();
              }}
            >
              <option value="">Select an attorney</option>
              {attorneys.map((attorney) => (
                <option key={attorney.id} value={attorney.id}>
                  {attorney.attorney_name}
                </option>
              ))}
            </FormSelect>
          )}

          {/* Manual Entry Fields */}
          <div className="pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Or enter manually:
            </p>

            <div className="space-y-3">
              <FormInput
                label="Firm Name"
                value={value.firm_name || ''}
                onChange={(e) => onChange({ ...value, firm_name: e.target.value })}
                placeholder="Smith & Associates Attorneys"
              />

              <FormInput
                label="Attorney Name"
                value={value.attorney_name || ''}
                onChange={(e) => onChange({ ...value, attorney_name: e.target.value })}
                placeholder="John Smith"
                required
              />

              <FormInput
                label="Attorney Email"
                type="email"
                value={value.attorney_email || ''}
                onChange={(e) => onChange({ ...value, attorney_email: e.target.value })}
                placeholder="john@smithlaw.com"
                required
              />

              <FormInput
                label="Attorney Phone (Optional)"
                type="tel"
                value={value.attorney_phone || ''}
                onChange={(e) => onChange({ ...value, attorney_phone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
              />

              {/* Portal Invitation Checkbox */}
              <div className="p-3 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInvitation}
                    onChange={(e) => {
                      setSendInvitation(e.target.checked);
                      onChange({ ...value, send_portal_invitation: e.target.checked });
                    }}
                    className="mt-1 h-4 w-4 text-judicial-blue-600 focus:ring-judicial-blue-500 border-neutral-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-judicial-blue-600 dark:text-judicial-blue-400" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Send Portal Invitation
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Invite this attorney to register for the client portal. They can view matters and invoices online.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttorneyQuickSelect;
