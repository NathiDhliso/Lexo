import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

export const ShortcutHint: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the hint before
    const dismissed = localStorage.getItem('shortcutHintDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show hint after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('shortcutHintDismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl border border-neutral-200 dark:border-metallic-gray-700 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
            <Keyboard className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Quick Actions Available
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-neutral-100 dark:bg-metallic-gray-700 rounded">Ctrl+K</kbd> to open command bar or <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-neutral-100 dark:bg-metallic-gray-700 rounded">Shift+?</kbd> for all shortcuts
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
