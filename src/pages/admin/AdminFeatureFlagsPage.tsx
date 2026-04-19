/**
 * Feature Flags Admin Page — Section 10.7
 */
import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Plus, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface FeatureFlag {
  id: string;
  flag_key: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  changed_at?: string;
  created_at: string;
}

export const AdminFeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFlags(); }, []);

  const loadFlags = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('feature_flags').select('*').order('name');
    if (!error) setFlags(data ?? []);
    setLoading(false);
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ is_enabled: !flag.is_enabled, changed_at: new Date().toISOString() })
      .eq('id', flag.id);

    if (error) toast.error('Failed to toggle flag');
    else { toast.success(`${flag.name} ${!flag.is_enabled ? 'enabled' : 'disabled'}`); loadFlags(); }
  };

  const updateRollout = async (flagId: string, percentage: number) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ rollout_percentage: percentage, changed_at: new Date().toISOString() })
      .eq('id', flagId);

    if (error) toast.error('Failed to update rollout');
    else loadFlags();
  };

  const killAll = async () => {
    if (!confirm('EMERGENCY: Disable ALL feature flags? This is immediate.')) return;
    const { error } = await supabase.from('feature_flags').update({ is_enabled: false, changed_at: new Date().toISOString() }).neq('id', '');
    if (error) toast.error('Kill switch failed');
    else { toast.success('All flags disabled'); loadFlags(); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-sm text-neutral-400 mt-1">Control feature rollouts without deployments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={killAll} className="flex items-center gap-2 px-3 py-2 bg-status-error-600 hover:bg-status-error-700 text-white text-sm font-medium rounded-lg transition-colors">
            <AlertTriangle className="w-4 h-4" /> Emergency Kill All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-neutral-500">Loading flags...</div>
        ) : flags.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">No feature flags configured. Add flags via database.</div>
        ) : flags.map(flag => (
          <div key={flag.id} className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-white">{flag.name}</h3>
                  <code className="text-xs px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded">{flag.flag_key}</code>
                </div>
                {flag.description && <p className="text-xs text-neutral-400 mb-3">{flag.description}</p>}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Rollout:</span>
                    <input
                      type="range" min="0" max="100" value={flag.rollout_percentage}
                      onChange={e => updateRollout(flag.id, parseInt(e.target.value))}
                      className="w-32 h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs font-medium text-white w-8">{flag.rollout_percentage}%</span>
                  </div>
                  {flag.changed_at && (
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Changed {format(new Date(flag.changed_at), 'dd MMM HH:mm')}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => toggleFlag(flag)} className="flex-shrink-0 ml-4">
                {flag.is_enabled ? (
                  <ToggleRight className="w-10 h-10 text-status-success-400" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeatureFlagsPage;
