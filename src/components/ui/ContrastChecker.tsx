import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { verifyDesignSystemContrast } from '../../utils/colorContrast.utils';

interface ContrastResult {
  name: string;
  foreground: string;
  background: string;
  ratio: number;
  aa: boolean;
  aaa: boolean;
  level: string;
}

/**
 * ContrastChecker - Development tool for verifying WCAG color contrast compliance
 * 
 * This component displays contrast ratios for all design system color combinations.
 * Only renders in development mode.
 * 
 * Features:
 * - Verifies WCAG AA and AAA compliance
 * - Shows contrast ratios for all color pairs
 * - Visual preview of each color combination
 * - Pass/fail indicators
 * 
 * @example
 * ```tsx
 * // Add to your development layout
 * {process.env.NODE_ENV === 'development' && <ContrastChecker />}
 * ```
 */
export const ContrastChecker: React.FC = () => {
  const [results, setResults] = useState<ContrastResult[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all');

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const contrastResults = verifyDesignSystemContrast();
    setResults(contrastResults);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  const filteredResults = results.filter((result: ContrastResult) => {
    if (filter === 'pass') return result.aa;
    if (filter === 'fail') return !result.aa;
    return true;
  });

  const passCount = results.filter((r: ContrastResult) => r.aa).length;
  const failCount = results.filter((r: ContrastResult) => !r.aa).length;
  const aaaCount = results.filter((r: ContrastResult) => r.aaa).length;

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'AAA':
        return <CheckCircle className="w-4 h-4 text-status-success-700" />;
      case 'AA':
        return <CheckCircle className="w-4 h-4 text-status-success-600" />;
      default:
        return <XCircle className="w-4 h-4 text-status-error-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'AAA':
        return 'bg-status-success-100 dark:bg-status-success-900/30 text-status-success-800 dark:text-status-success-300';
      case 'AA':
        return 'bg-status-success-50 dark:bg-status-success-900/20 text-status-success-700 dark:text-status-success-400';
      default:
        return 'bg-status-error-50 dark:bg-status-error-900/20 text-status-error-700 dark:text-status-error-400';
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-2xl"
      role="complementary"
      aria-label="Contrast checker"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-metallic-gray-800 border-2 border-judicial-blue-500 dark:border-judicial-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-expanded={!isMinimized}
        aria-controls="contrast-checker-panel"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400" />
          <div className="flex items-center gap-2">
            {aaaCount > 0 && (
              <span className="px-2 py-1 bg-status-success-100 dark:bg-status-success-900/30 text-status-success-700 dark:text-status-success-400 text-xs font-bold rounded">
                AAA: {aaaCount}
              </span>
            )}
            {passCount > 0 && (
              <span className="px-2 py-1 bg-status-success-50 dark:bg-status-success-900/20 text-status-success-600 dark:text-status-success-500 text-xs font-bold rounded">
                AA: {passCount}
              </span>
            )}
            {failCount > 0 && (
              <span className="px-2 py-1 bg-status-error-100 dark:bg-status-error-900/30 text-status-error-700 dark:text-status-error-400 text-xs font-bold rounded">
                Fail: {failCount}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {isMinimized ? '▼' : '▲'}
        </span>
      </button>

      {/* Checker Panel */}
      {!isMinimized && (
        <div
          id="contrast-checker-panel"
          className="mt-2 max-h-[600px] overflow-y-auto bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg"
        >
          {/* Header */}
          <div className="sticky top-0 p-4 border-b border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-800 z-10">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Color Contrast Verification (WCAG)
            </h3>
            
            {/* Filters */}
            <div className="flex gap-2">
              {(['all', 'pass', 'fail'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === filterOption
                      ? 'bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-700 dark:text-judicial-blue-300'
                      : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-metallic-gray-600'
                  }`}
                >
                  {filterOption === 'all' ? `All (${results.length})` : 
                   filterOption === 'pass' ? `Pass (${passCount})` : 
                   `Fail (${failCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="p-2 space-y-2">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No results for selected filter
                </p>
              </div>
            ) : (
              filteredResults.map((result: ContrastResult, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getLevelColor(result.level)} border-opacity-20`}
                >
                  {/* Color Preview */}
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-16 h-16 rounded-lg border border-neutral-300 dark:border-metallic-gray-600 flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{
                        backgroundColor: result.background,
                        color: result.foreground,
                      }}
                    >
                      Aa
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getLevelIcon(result.level)}
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {result.name}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                        <div className="flex items-center gap-2">
                          <span>Ratio: <strong>{result.ratio}:1</strong></span>
                          <span className={`px-2 py-0.5 rounded font-bold ${getLevelColor(result.level)}`}>
                            {result.level}
                          </span>
                        </div>
                        <div className="font-mono text-xs">
                          <span className="opacity-70">FG:</span> {result.foreground}
                          {' • '}
                          <span className="opacity-70">BG:</span> {result.background}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Details */}
                  <div className="flex gap-2 text-xs">
                    <span className={result.aa ? 'text-status-success-700' : 'text-status-error-700'}>
                      {result.aa ? '✓' : '✗'} WCAG AA
                    </span>
                    <span className={result.aaa ? 'text-status-success-700' : 'text-neutral-400'}>
                      {result.aaa ? '✓' : '✗'} WCAG AAA
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-3 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900/50">
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <p>
                <strong>WCAG AA:</strong> 4.5:1 for normal text, 3:1 for large text
              </p>
              <p>
                <strong>WCAG AAA:</strong> 7:1 for normal text, 4.5:1 for large text
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
