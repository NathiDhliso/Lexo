import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 ${className}`}
      aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {effectiveTheme === 'dark' ? (
        <Sun className="w-5 h-5 text-mpondo-gold-400 transition-transform hover:rotate-180 duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-neutral-700 transition-transform hover:-rotate-12 duration-300" />
      )}
    </button>
  );
};
