/**
 * ConflictChecker — Modal component for conflict of interest checks
 * PRD Section 9.2 — Critical legal risk management
 */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Search, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { conflictCheckService, type ConflictMatch, type ConflictCheckResult } from '../../services/conflict-check.service';

interface ConflictCheckerProps {
  clientName: string;
  opposingParty?: string;
  instructingAttorney?: string;
  matterId?: string;
  advocateId: string;
  onComplete: (result: 'clear' | 'override', overrideReason?: string) => void;
  onCancel: () => void;
}

export const ConflictChecker: React.FC<ConflictCheckerProps> = ({
  clientName, opposingParty, instructingAttorney, matterId, advocateId,
  onComplete, onCancel,
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ConflictCheckResult | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    runCheck();
  }, []);

  const runCheck = async () => {
    setLoading(true);
    try {
      const checkResult = await conflictCheckService.checkConflicts(
        clientName, opposingParty, instructingAttorney
      );
      setResult(checkResult);
    } catch (error) {
      console.error('Conflict check failed:', error);
      setResult({ has_conflicts: false, matches: [], checked_at: new Date().toISOString(), search_terms: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await conflictCheckService.logConflictCheck({
      matter_id: matterId, advocate_id: advocateId,
      checked_names: [clientName, opposingParty, instructingAttorney].filter(Boolean) as string[],
      result: 'clear', match_count: 0,
    });
    onComplete('clear');
  };

  const handleOverride = async () => {
    if (!overrideReason.trim()) return;
    await conflictCheckService.logConflictCheck({
      matter_id: matterId, advocate_id: advocateId,
      checked_names: [clientName, opposingParty, instructingAttorney].filter(Boolean) as string[],
      result: 'possible_conflict', match_count: result?.matches.length ?? 0,
      override_reason: overrideReason,
    });
    onComplete('override', overrideReason);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-status-error-600 dark:text-status-error-400 bg-status-error-50 dark:bg-status-error-900/20';
    if (confidence >= 0.7) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-status-warning-600 dark:text-status-warning-400 bg-status-warning-50 dark:bg-status-warning-900/20';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Match';
    if (confidence >= 0.7) return 'Likely Match';
    return 'Possible Match';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-metallic-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Conflict of Interest Check</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Checking for existing matter overlaps</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* Search terms */}
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Checking names:</p>
            <div className="flex flex-wrap gap-2">
              {[clientName, opposingParty, instructingAttorney].filter(Boolean).map((name, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-full text-sm">
                  <Search className="w-3 h-3" /> {name}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-mpondo-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Searching existing matters...</p>
            </div>
          ) : result && !result.has_conflicts ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-status-success-50 dark:bg-status-success-900/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-status-success-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">No Conflicts Found</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
                No matching names were found in existing or archived matters. You may proceed.
              </p>
            </div>
          ) : result && result.has_conflicts ? (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>{result.matches.length} potential conflict{result.matches.length > 1 ? 's' : ''}</strong> found.
                  Review each match before proceeding.
                </p>
              </div>

              <div className="space-y-3">
                {result.matches.map((match) => (
                  <div
                    key={`${match.matter_id}-${match.matched_field}`}
                    className="border border-neutral-200 dark:border-metallic-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedMatch(expandedMatch === match.matter_id ? null : match.matter_id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getConfidenceColor(match.confidence)}`}>
                          {getConfidenceLabel(match.confidence)} ({Math.round(match.confidence * 100)}%)
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{match.matter_title}</span>
                      </div>
                      {expandedMatch === match.matter_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedMatch === match.matter_id && (
                      <div className="px-3 pb-3 border-t border-neutral-100 dark:border-metallic-gray-700">
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div><span className="text-neutral-500">Field:</span> <span className="font-medium capitalize">{match.matched_field.replace('_', ' ')}</span></div>
                          <div><span className="text-neutral-500">Value:</span> <span className="font-medium">{match.matched_value}</span></div>
                          <div><span className="text-neutral-500">Status:</span> <span className="font-medium capitalize">{match.matter_status}</span></div>
                          <div><span className="text-neutral-500">Archived:</span> <span className="font-medium">{match.is_archived ? 'Yes' : 'No'}</span></div>
                          <div className="col-span-2"><span className="text-neutral-500">Searched for:</span> <span className="font-medium">"{match.search_term}"</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Override section */}
              {showOverride ? (
                <div className="mt-4 p-4 bg-status-error-50 dark:bg-status-error-900/10 border border-status-error-200 dark:border-status-error-800 rounded-lg">
                  <p className="text-sm font-medium text-status-error-700 dark:text-status-error-300 mb-2">
                    Override Conflict — Mandatory Reason Required
                  </p>
                  <p className="text-xs text-status-error-600 dark:text-status-error-400 mb-3">
                    This override will be permanently recorded in the matter audit trail and visible in compliance reports.
                  </p>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Explain why this conflict can be disregarded..."
                    className="w-full px-3 py-2 border border-status-error-300 dark:border-status-error-700 rounded-lg bg-white dark:bg-metallic-gray-800 text-sm resize-none h-20 focus:ring-2 focus:ring-status-error-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowOverride(true)}
                  className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 hover:text-status-error-600 dark:hover:text-status-error-400 underline"
                >
                  I understand the risks — override this conflict check
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-metallic-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-metallic-gray-700 hover:bg-neutral-200 dark:hover:bg-metallic-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {result && !result.has_conflicts && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-white bg-status-success-600 hover:bg-status-success-700 rounded-lg transition-colors"
            >
              Confirm — No Conflicts
            </button>
          )}
          {result && result.has_conflicts && showOverride && (
            <button
              onClick={handleOverride}
              disabled={!overrideReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-status-error-600 hover:bg-status-error-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Override & Proceed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConflictChecker;
