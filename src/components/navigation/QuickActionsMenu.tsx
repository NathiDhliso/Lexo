import React, { useState, useRef, useEffect } from 'react';
import { Plus, FileText, FolderPlus, Brain, Receipt, Zap, Clock } from 'lucide-react';
import { QuickAction, QuickActionsState, UserTier } from '../../types';
import { Button, Icon } from '../design-system/components';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface QuickActionsMenuProps {
  onAction: (actionId: string) => void;
  userTier: UserTier;
  className?: string;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  onAction,
  userTier,
  className = ''
}) => {
  const [state, setState] = useState<QuickActionsState>({
    isOpen: false,
    actions: [],
    customActions: [],
    defaultActions: []
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load quick actions from user preferences (localStorage) or use defaults
  const getDefaultActions = (): QuickAction[] => [
    {
      id: 'create-proforma',
      label: 'Create Pro Forma',
      description: 'Generate a new pro forma invoice',
      icon: FileText,
      shortcut: 'Ctrl+Shift+P',
      page: 'proforma-requests',
      minTier: UserTier.JUNIOR_START,
      usageCount: 0,
      isEnabled: true
    },
    {
      id: 'add-matter',
      label: 'New Matter',
      description: 'Add a new matter to your portfolio',
      icon: FolderPlus,
      shortcut: 'Ctrl+Shift+M',
      page: 'matters',
      minTier: UserTier.JUNIOR_START,
      usageCount: 0,
      isEnabled: true
    },
    {
      id: 'analyze-brief',
      label: 'Analyze Brief',
      description: 'AI-powered brief analysis',
      icon: Brain,
      shortcut: 'Ctrl+Shift+A',
      minTier: UserTier.ADVOCATE_PRO,
      usageCount: 0,
      isEnabled: true
    },
    {
      id: 'quick-invoice',
      label: 'Quick Invoice',
      description: 'Generate an invoice quickly',
      icon: Receipt,
      shortcut: 'Ctrl+Shift+I',
      page: 'invoices',
      minTier: UserTier.JUNIOR_START,
      usageCount: 0,
      isEnabled: true
    }
  ];

  const loadActionsFromStorage = (): QuickAction[] => {
    try {
      const saved = localStorage.getItem('quickActions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Map icon names back to components
        return parsed.map((action: any) => ({
          ...action,
          icon: getIconComponent(action.icon)
        }));
      }
    } catch (error) {
      console.error('Error loading quick actions from storage:', error);
    }
    return getDefaultActions();
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      FileText,
      FolderPlus,
      Brain,
      Receipt
    };
    return iconMap[iconName] || FileText;
  };

  const defaultActions: QuickAction[] = loadActionsFromStorage();

  // Filter actions based on user tier and enabled status
  const getFilteredActions = () => {
    return defaultActions.filter(action => {
      // Check if action is enabled
      if (action.isEnabled === false) return false;
      
      const tierOrder = {
        [UserTier.JUNIOR_START]: 0,
        [UserTier.ADVOCATE_PRO]: 1,
        [UserTier.SENIOR_ADVOCATE]: 2,
        [UserTier.CHAMBERS_ENTERPRISE]: 3
      };
      
      return tierOrder[userTier] >= tierOrder[action.minTier || UserTier.JUNIOR_START];
    });
  };

  // Initialize actions on mount
  useEffect(() => {
    const filteredActions = getFilteredActions();
    setState(prev => ({
      ...prev,
      defaultActions: filteredActions,
      actions: filteredActions
    }));
  }, [userTier]);

  // Keyboard shortcuts for quick actions
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      shiftKey: true,
      description: 'Open quick actions',
      action: () => toggleMenu()
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      description: 'Create pro forma',
      action: () => handleActionClick('create-proforma')
    },
    {
      key: 'm',
      ctrlKey: true,
      shiftKey: true,
      description: 'Add new matter',
      action: () => handleActionClick('add-matter')
    },
    {
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      description: 'Analyze brief',
      action: () => handleActionClick('analyze-brief')
    },
    {
      key: 'i',
      ctrlKey: true,
      shiftKey: true,
      description: 'Quick invoice',
      action: () => handleActionClick('quick-invoice')
    }
  ]);

  const toggleMenu = () => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const closeMenu = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const handleActionClick = (actionId: string) => {
    const action = state.actions.find(a => a.id === actionId);
    if (action) {
      // Update usage count in state
      setState(prev => ({
        ...prev,
        actions: prev.actions.map(a => 
          a.id === actionId 
            ? { ...a, usageCount: (a.usageCount || 0) + 1, lastUsed: new Date().toISOString() }
            : a
        )
      }));

      // Update usage count in localStorage
      try {
        const saved = localStorage.getItem('quickActions');
        if (saved) {
          const actions = JSON.parse(saved);
          const updated = actions.map((a: any) => 
            a.id === actionId 
              ? { ...a, usageCount: (a.usageCount || 0) + 1, lastUsed: new Date().toISOString() }
              : a
          );
          localStorage.setItem('quickActions', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Error updating usage count:', error);
      }

      // Execute action
      if (action.action) {
        action.action();
      } else if (action.page) {
        onAction(action.page);
      }
    }
    
    closeMenu();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.isOpen]);

  // Sort actions by usage count for better UX
  const sortedActions = [...state.actions].sort((a, b) => {
    const aUsage = a.usageCount || 0;
    const bUsage = b.usageCount || 0;
    return bUsage - aUsage;
  });

  return (
    <div className={`relative ${className}`}>
      {/* Quick Actions Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 rounded-lg transition-colors"
        aria-label="Quick Actions (Ctrl+Shift+N)"
        aria-expanded={state.isOpen}
        aria-haspopup="menu"
        title="Quick Actions"
      >
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Quick</span>
      </button>

      {/* Quick Actions Dropdown */}
      {state.isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
          role="menu"
          aria-label="Quick Actions Menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick Actions</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Boost your productivity with keyboard shortcuts
            </p>
          </div>

          {/* Actions List */}
          <div className="py-2 max-h-80 overflow-y-auto">
            {sortedActions.map((action, index) => {
              const IconComponent = action.icon;
              const isAccessible = !action.minTier || 
                Object.values(UserTier).indexOf(userTier) >= Object.values(UserTier).indexOf(action.minTier);

              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  disabled={!isAccessible}
                  className={`w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700 transition-colors flex items-center gap-3 group ${
                    !isAccessible ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  role="menuitem"
                  tabIndex={state.isOpen ? 0 : -1}
                >
                  <div className={`p-2 rounded-lg ${
                    isAccessible 
                      ? 'bg-judicial-blue-50 dark:bg-judicial-blue-900/30 group-hover:bg-judicial-blue-100 dark:group-hover:bg-judicial-blue-900/50' 
                      : 'bg-neutral-100 dark:bg-metallic-gray-700'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {action.label}
                      </span>
                      {action.isNew && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-mpondo-gold-100 text-mpondo-gold-800">
                          New
                        </span>
                      )}
                      {action.usageCount && action.usageCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                          <Clock className="h-3 w-3" />
                          <span>{action.usageCount}</span>
                        </div>
                      )}
                    </div>
                    {action.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {action.description}
                      </p>
                    )}
                  </div>

                  {action.shortcut && isAccessible && (
                    <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono bg-neutral-100 dark:bg-metallic-gray-700 px-2 py-1 rounded">
                      {action.shortcut}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-100 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Press <kbd className="px-1 py-0.5 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded text-xs font-mono">Ctrl+Shift+N</kbd> to open this menu
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsMenu;
