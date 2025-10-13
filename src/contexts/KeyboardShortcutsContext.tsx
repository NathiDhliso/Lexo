import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface ShortcutAction {
  id: string;
  label: string;
  shortcut: string;
  action: () => void;
  description?: string;
}

interface KeyboardShortcutsContextType {
  registerAction: (action: ShortcutAction) => void;
  unregisterAction: (id: string) => void;
  getActions: () => ShortcutAction[];
  showShortcutsHelp: boolean;
  toggleShortcutsHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<Map<string, ShortcutAction>>(new Map());
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const registerAction = useCallback((action: ShortcutAction) => {
    setActions(prev => new Map(prev).set(action.id, action));
  }, []);

  const unregisterAction = useCallback((id: string) => {
    setActions(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const getActions = useCallback(() => {
    return Array.from(actions.values());
  }, [actions]);

  const toggleShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp(prev => !prev);
  }, []);

  // Global shortcut to show help
  useKeyboardShortcuts([
    {
      key: '?',
      shiftKey: true,
      action: toggleShortcutsHelp,
      description: 'Show keyboard shortcuts'
    }
  ]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        registerAction,
        unregisterAction,
        getActions,
        showShortcutsHelp,
        toggleShortcutsHelp
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcutsContext = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
};
