import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Mail, Settings, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

interface FirmAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface FirmActionsMenuProps {
  onInviteAttorney: () => void;
  onManageFirm: () => void;
  onViewMatters: () => void;
  className?: string;
}

export const FirmActionsMenu: React.FC<FirmActionsMenuProps> = ({
  onInviteAttorney,
  onManageFirm,
  onViewMatters,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const actions: FirmAction[] = [
    {
      id: 'invite',
      label: 'Invite Attorney',
      icon: <Mail className="w-4 h-4" />,
      onClick: () => {
        onInviteAttorney();
        setIsOpen(false);
      },
    },
    {
      id: 'manage',
      label: 'Manage Firm',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        onManageFirm();
        setIsOpen(false);
      },
    },
    {
      id: 'matters',
      label: 'View Matters',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        onViewMatters();
        setIsOpen(false);
      },
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Firm actions menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="p-2"
      >
        <MoreVertical className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div
          className="
            absolute right-0 top-full mt-2 w-56
            bg-white dark:bg-metallic-gray-800
            border border-neutral-200 dark:border-metallic-gray-700
            rounded-lg shadow-lg
            py-1 z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          role="menu"
          aria-orientation="vertical"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`
                w-full px-4 py-2.5 text-left
                flex items-center gap-3
                text-sm font-medium
                transition-colors
                ${
                  action.variant === 'danger'
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700'
                }
              `}
              role="menuitem"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
