import React from 'react';

interface ShortcutBadgeProps {
  keys: string[];
  className?: string;
}

export const ShortcutBadge: React.FC<ShortcutBadgeProps> = ({ keys, className = '' }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-metallic-gray-700 border border-neutral-200 dark:border-metallic-gray-600 rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] mx-0.5">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
