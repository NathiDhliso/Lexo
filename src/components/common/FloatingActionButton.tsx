import React, { useState } from 'react';
import { Plus, X, Briefcase, FileText, Clock } from 'lucide-react';
import { Button } from '../design-system/components';

interface FABAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  primaryAction?: FABAction;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  primaryAction
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrimaryClick = () => {
    if (primaryAction) {
      primaryAction.onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        {isOpen && actions.length > 0 && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 px-4 py-3 rounded-full theme-shadow-lg hover:theme-shadow-xl transition-all min-h-[56px] border border-neutral-200 dark:border-metallic-gray-700"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <Button
          variant="primary"
          onClick={handlePrimaryClick}
          className="h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center p-0"
          aria-label={primaryAction ? primaryAction.label : "Quick actions"}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : primaryAction ? (
            <primaryAction.icon className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
