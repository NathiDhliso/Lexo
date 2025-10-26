import React, { useState, useEffect } from 'react';
import {
    Zap,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    Save,
    RotateCcw,
    Info,
    TrendingUp,
    Activity,
    Award,
    Sparkles
} from 'lucide-react';
import { Button } from '../design-system/components';
import { toast } from 'react-hot-toast';
import type { QuickAction, UserTier } from '../../types';

interface QuickActionsSettingsProps {
    userTier?: UserTier;
}

export const QuickActionsSettings: React.FC<QuickActionsSettingsProps> = () => {
    const [actions, setActions] = useState<QuickAction[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load saved quick actions from localStorage or use defaults
    useEffect(() => {
        loadQuickActions();
    }, []);

    const loadQuickActions = () => {
        try {
            const saved = localStorage.getItem('quickActions');
            if (saved) {
                setActions(JSON.parse(saved));
            } else {
                // Set default actions
                setActions(getDefaultActions());
            }
        } catch (error) {
            console.error('Error loading quick actions:', error);
            setActions(getDefaultActions());
        }
    };

    const getDefaultActions = (): QuickAction[] => {
        return [
            {
                id: 'create-proforma',
                label: 'Create Pro Forma',
                description: 'Generate a new pro forma invoice',
                icon: 'FileText' as any,
                shortcut: 'Ctrl+Shift+P',
                page: 'proforma-requests',
                minTier: 'junior_start' as UserTier,
                usageCount: 0,
                isEnabled: true
            },
            {
                id: 'add-matter',
                label: 'New Matter',
                description: 'Add a new matter to your portfolio',
                icon: 'FolderPlus' as any,
                shortcut: 'Ctrl+Shift+M',
                page: 'matters',
                minTier: 'junior_start' as UserTier,
                usageCount: 0,
                isEnabled: true
            },
            {
                id: 'analyze-brief',
                label: 'Analyze Brief',
                description: 'AI-powered brief analysis',
                icon: 'Brain' as any,
                shortcut: 'Ctrl+Shift+A',
                minTier: 'advocate_pro' as UserTier,
                usageCount: 0,
                isEnabled: true
            },
            {
                id: 'quick-invoice',
                label: 'Quick Invoice',
                description: 'Generate an invoice quickly',
                icon: 'Receipt' as any,
                shortcut: 'Ctrl+Shift+I',
                page: 'invoices',
                minTier: 'junior_start' as UserTier,
                usageCount: 0,
                isEnabled: true
            }
        ];
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate network delay for better UX feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            localStorage.setItem('quickActions', JSON.stringify(actions));
            toast.success('Quick Actions settings saved successfully');
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving quick actions:', error);
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleAction = (actionId: string) => {
        setActions(prev => prev.map(action =>
            action.id === actionId
                ? { ...action, isEnabled: !action.isEnabled }
                : action
        ));
        setHasChanges(true);
    };

    const handleResetToDefaults = () => {
        if (window.confirm('Are you sure you want to reset to default quick actions? This will discard all your customizations.')) {
            setActions(getDefaultActions());
            setHasChanges(true);
            toast.success('Reset to default quick actions successfully');
        }
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newActions = [...actions];
        [newActions[index - 1], newActions[index]] = [newActions[index], newActions[index - 1]];
        setActions(newActions);
        setHasChanges(true);
    };

    const handleMoveDown = (index: number) => {
        if (index === actions.length - 1) return;
        const newActions = [...actions];
        [newActions[index], newActions[index + 1]] = [newActions[index + 1], newActions[index]];
        setActions(newActions);
        setHasChanges(true);
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header Section */}
            <div className="border-b border-gray-200 dark:border-metallic-gray-700 pb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-gradient-to-br from-mpondo-gold-100 to-mpondo-gold-200 dark:from-mpondo-gold-900/30 dark:to-mpondo-gold-900/50 rounded-xl shadow-sm">
                                <Zap className="h-7 w-7 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Quick Actions Configuration
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                                    Customize your quick actions menu and keyboard shortcuts for optimal workflow efficiency
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="md"
                        onClick={handleResetToDefaults}
                        className="flex items-center gap-2"
                        disabled={isSaving}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset to Defaults
                    </Button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl shadow-sm">
                            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            Productivity Tips
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                Pro Tips
                            </span>
                        </h3>
                        <ul className="space-y-2.5 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold mt-0.5">1</span>
                                <span>Press <kbd className="px-2 py-1 bg-white dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded text-xs font-mono mx-1 shadow-sm">Ctrl+Shift+N</kbd> to open quick actions menu</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold mt-0.5">2</span>
                                <span>Reorder actions by dragging or using arrow buttons - place frequently used actions at the top</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold mt-0.5">3</span>
                                <span>Disable unused actions to maintain a clean, focused interface</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Actions List Section */}
            <div className="bg-white dark:bg-metallic-gray-800 border-2 border-gray-200 dark:border-metallic-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-metallic-gray-900 dark:to-metallic-gray-850 border-b-2 border-gray-200 dark:border-metallic-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="h-6 w-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                        Available Actions
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-700 dark:text-mpondo-gold-400">
                            {actions.length} total
                        </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1.5">
                        Manage and prioritize your quick actions
                    </p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-metallic-gray-700">
                    {actions.map((action, index) => (
                        <div
                            key={action.id}
                            className={`
                flex items-center gap-4 px-6 py-5 transition-all duration-200
                ${action.isEnabled
                                    ? 'bg-white dark:bg-metallic-gray-800 hover:bg-gray-50 dark:hover:bg-metallic-gray-750'
                                    : 'bg-gray-50 dark:bg-metallic-gray-900 opacity-60'
                                }
              `}
                        >
                            {/* Priority Badge */}
                            <div className="flex-shrink-0">
                                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow-sm
                  ${action.isEnabled
                                        ? 'bg-gradient-to-br from-mpondo-gold-100 to-mpondo-gold-200 dark:from-mpondo-gold-900/30 dark:to-mpondo-gold-900/50 text-mpondo-gold-700 dark:text-mpondo-gold-400 border-2 border-mpondo-gold-300 dark:border-mpondo-gold-700'
                                        : 'bg-gray-200 dark:bg-metallic-gray-700 text-gray-500 dark:text-neutral-500 border-2 border-gray-300 dark:border-metallic-gray-600'
                                    }
                `}>
                                    {index + 1}
                                </div>
                            </div>

                            {/* Action Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                        {action.label}
                                    </h4>
                                    {action.usageCount && action.usageCount > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full shadow-sm">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            {action.usageCount} uses
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2.5">
                                    {action.description}
                                </p>
                                {action.shortcut && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-neutral-500">Shortcut:</span>
                                        <kbd className="px-2.5 py-1.5 text-xs font-mono font-bold bg-gray-100 dark:bg-metallic-gray-700 border-2 border-gray-300 dark:border-metallic-gray-600 rounded shadow-sm">
                                            {action.shortcut}
                                        </kbd>
                                    </div>
                                )}
                            </div>

                            {/* Action Controls */}
                            <div className="flex items-center gap-3">
                                {/* Reorder Buttons */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0 || isSaving}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-gray-300 dark:hover:border-metallic-gray-600"
                                        title="Move up"
                                        aria-label="Move action up"
                                    >
                                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-neutral-400" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === actions.length - 1 || isSaving}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-gray-300 dark:hover:border-metallic-gray-600"
                                        title="Move down"
                                        aria-label="Move action down"
                                    >
                                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-neutral-400" />
                                    </button>
                                </div>

                                {/* Toggle Button */}
                                <button
                                    onClick={() => handleToggleAction(action.id)}
                                    disabled={isSaving}
                                    className={`
                    p-3 rounded-xl transition-all font-medium shadow-sm border-2
                    ${action.isEnabled
                                            ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-900/50 text-green-700 dark:text-green-400 hover:from-green-200 hover:to-green-300 dark:hover:from-green-900/50 dark:hover:to-green-900/70 border-green-300 dark:border-green-700'
                                            : 'bg-gray-100 dark:bg-metallic-gray-700 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-metallic-gray-600 border-gray-300 dark:border-metallic-gray-600'
                                        }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                                    title={action.isEnabled ? 'Disable action' : 'Enable action'}
                                    aria-label={action.isEnabled ? 'Disable action' : 'Enable action'}
                                >
                                    {action.isEnabled ? (
                                        <Eye className="h-5 w-5" />
                                    ) : (
                                        <EyeOff className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage Statistics Section */}
            <div className="bg-white dark:bg-metallic-gray-800 border-2 border-gray-200 dark:border-metallic-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-metallic-gray-900 dark:to-metallic-gray-850 border-b-2 border-gray-200 dark:border-metallic-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="h-6 w-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                        Usage Analytics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1.5">
                        Track your productivity and action usage patterns
                    </p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                    Total Actions
                                </p>
                                <div className="p-2.5 bg-blue-200 dark:bg-blue-800 rounded-lg shadow-sm">
                                    <Zap className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-blue-900 dark:text-blue-100">
                                {actions.length}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-6 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                    Enabled
                                </p>
                                <div className="p-2.5 bg-green-200 dark:bg-green-800 rounded-lg shadow-sm">
                                    <Eye className="h-5 w-5 text-green-700 dark:text-green-300" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-green-900 dark:text-green-100">
                                {actions.filter(a => a.isEnabled).length}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                                    Total Uses
                                </p>
                                <div className="p-2.5 bg-purple-200 dark:bg-purple-800 rounded-lg shadow-sm">
                                    <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-purple-900 dark:text-purple-100">
                                {actions.reduce((sum, a) => sum + (a.usageCount || 0), 0)}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                                    Most Used
                                </p>
                                <div className="p-2.5 bg-amber-200 dark:bg-amber-800 rounded-lg shadow-sm">
                                    <Award className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                </div>
                            </div>
                            <p className="text-lg font-black text-amber-900 dark:text-amber-100 truncate">
                                {actions.reduce((max, a) =>
                                    (a.usageCount || 0) > (max.usageCount || 0) ? a : max,
                                    actions[0]
                                )?.label || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Actions Bar */}
            {hasChanges && (
                <div className="sticky bottom-4 bg-white dark:bg-metallic-gray-800 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-900/50 rounded-xl shadow-sm">
                                <Info className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    Unsaved Changes
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 shadow-sm">
                                        {actions.filter(a => a.isEnabled).length} active
                                    </span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                                    You have unsaved changes to your quick actions configuration
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => {
                                    if (window.confirm('Discard all unsaved changes?')) {
                                        loadQuickActions();
                                        setHasChanges(false);
                                        toast.success('Changes discarded');
                                    }
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleSave}
                                disabled={isSaving}
                                loading={isSaving}
                                className="min-w-[180px]"
                            >
                                {!isSaving && <Save className="h-5 w-5 mr-2" />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
