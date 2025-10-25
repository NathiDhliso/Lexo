import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { getKeyboardShortcutLabel, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
}

/**
 * KeyboardShortcutsHelp - Component displaying available keyboard shortcuts
 * 
 * Shows a help dialog with all available keyboard shortcuts in the current context.
 * Triggered by pressing '?' or clicking the keyboard icon.
 * 
 * Features:
 * - Grouped shortcuts by category
 * - Platform-specific key labels (Cmd on Mac, Ctrl on Windows)
 * - Accessible modal dialog
 * - Escape to close
 * 
 * @example
 * ```tsx
 * const shortcuts: KeyboardShortcut[] = [
 *   { key: 'n', ctrlKey: true, description: 'New matter', handler: createMatter },
 *   { key: 's', ctrlKey: true, description: 'Save', handler: save },
 * ];
 * 
 * <KeyboardShortcutsHelp shortcuts={shortcuts} />
 * ```
 */
export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for '?' key to open help
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '?' && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 p-3 bg-white dark:bg-metallic-gray-800 border border-neutral-300 dark:border-metallic-gray-600 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl border border-neutral-200 dark:border-metallic-gray-700"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-800 z-10">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
            <h2
              id="shortcuts-title"
              className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {shortcuts.length === 0 ? (
            <p className="text-center text-neutral-600 dark:text-neutral-400 py-8">
              No keyboard shortcuts available in this context.
            </p>
          ) : (
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-metallic-gray-700/50 transition-colors"
                >
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {shortcut.description}
                  </span>
                  <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 shadow-sm">
                    {getKeyboardShortcutLabel(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {/* Universal shortcuts */}
          <div className="pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
              Universal Shortcuts
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Show this help
                </span>
                <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 shadow-sm">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Close modal or dialog
                </span>
                <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 shadow-sm">
                  Escape
                </kbd>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Navigate forward
                </span>
                <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 shadow-sm">
                  Tab
                </kbd>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Navigate backward
                </span>
                <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded text-sm font-mono font-semibold text-neutral-900 dark:text-neutral-100 shadow-sm">
                  Shift+Tab
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900/50 text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Press <kbd className="px-2 py-1 bg-neutral-200 dark:bg-metallic-gray-800 rounded text-xs font-mono">Escape</kbd> or click outside to close
          </p>
        </div>
      </div>
    </>
  );
};
