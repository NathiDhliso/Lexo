/**
 * Interactive Onboarding Checklist Component
 * 
 * Guides new users through initial setup and first workflows
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, X, HelpCircle, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { userPreferencesService } from '../../services/api/user-preferences.service';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
  helpText?: string;
  videoUrl?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export const OnboardingChecklist: React.FC = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('setup');
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistSection[]>([]);

  // Load onboarding state from user preferences
  useEffect(() => {
    loadOnboardingState();
  }, [user?.id]);

  const loadOnboardingState = async () => {
    if (!user?.id) return;

    try {
      const response = await userPreferencesService.getCurrentUserPreferences();
      if (response.error || !response.data) return;
      
      const preferences = response.data;
      const onboardingState = preferences.onboarding_state || {};

      // Check if onboarding is complete
      if (onboardingState.completed) {
        setIsVisible(false);
        return;
      }

      // Show onboarding if not dismissed
      if (!onboardingState.dismissed) {
        setIsVisible(true);
      }

      // Initialize checklist with saved state
      setChecklist(getChecklistSections(onboardingState));
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      // Show onboarding by default if can't load state
      setIsVisible(true);
      setChecklist(getChecklistSections({}));
    }
  };

  const getChecklistSections = (savedState: any): ChecklistSection[] => {
    return [
      {
        id: 'setup',
        title: '🚀 First-Time Setup',
        description: 'Configure your system (5 minutes)',
        items: [
          {
            id: 'invoice-settings',
            title: 'Configure Invoice Settings',
            description: 'Set up invoice numbering, VAT details, and your information',
            completed: savedState.invoice_settings_configured || false,
            action: () => window.location.href = '/settings?tab=invoice',
            actionLabel: 'Go to Settings',
            helpText: 'This is required for SARS-compliant invoicing. You only need to do this once.',
          },
          {
            id: 'add-firm',
            title: 'Add Your First Attorney Firm',
            description: 'Add at least one attorney firm you work with',
            completed: savedState.first_firm_added || false,
            action: () => window.location.href = '/firms',
            actionLabel: 'Add Firm',
            helpText: 'Attorney firms are the law firms that brief you. You can add more later.',
          },
          {
            id: 'quick-brief-templates',
            title: 'Customize Quick Brief Templates (Optional)',
            description: 'Add your common practice areas and matter types',
            completed: savedState.templates_customized || false,
            action: () => window.location.href = '/settings?tab=templates',
            actionLabel: 'Customize Templates',
            helpText: 'This saves time when capturing briefs. You can skip this and use defaults.',
          },
        ],
      },
      {
        id: 'first-matter',
        title: '📋 Create Your First Matter',
        description: 'Learn the two ways to work',
        items: [
          {
            id: 'understand-paths',
            title: 'Understand Path A vs Path B',
            description: 'Learn when to quote first vs accept and work',
            completed: savedState.paths_understood || false,
            helpText: 'Path A (Quote First): For complex matters where you need approval before starting.\nPath B (Accept & Work): For routine matters with known scope.',
            videoUrl: '/videos/path-a-vs-path-b.mp4',
          },
          {
            id: 'quick-brief',
            title: 'Try Quick Brief Capture',
            description: 'Capture a brief in 2 minutes (Path B)',
            completed: savedState.quick_brief_tried || false,
            action: () => window.location.href = '/matters?action=quick-brief',
            actionLabel: 'Try It Now',
            helpText: 'Quick Brief is perfect for phone calls. You can create a test matter and delete it later.',
          },
          {
            id: 'pro-forma',
            title: 'Create a Pro Forma Estimate (Path A)',
            description: 'Build an estimate for attorney approval',
            completed: savedState.pro_forma_created || false,
            action: () => window.location.href = '/matters?action=new',
            actionLabel: 'Create Pro Forma',
            helpText: 'Pro formas are detailed estimates sent to attorneys for approval before you start work.',
          },
        ],
      },
      {
        id: 'daily-work',
        title: '⏱️ Daily Workflow',
        description: 'Learn the basics (8 minutes admin)',
        items: [
          {
            id: 'log-time',
            title: 'Log a Time Entry',
            description: 'Track your work as you go',
            completed: savedState.time_logged || false,
            helpText: 'Log time entries as you work for accurate billing. Don\'t wait until invoicing time.',
          },
          {
            id: 'log-disbursement',
            title: 'Log a Disbursement',
            description: 'Track expenses like travel, expert reports, etc.',
            completed: savedState.disbursement_logged || false,
            helpText: 'Disbursements are expenses you incur on behalf of the client. Include VAT.',
          },
          {
            id: 'generate-invoice',
            title: 'Generate Your First Invoice',
            description: 'Create an invoice with sequential numbering',
            completed: savedState.invoice_generated || false,
            helpText: 'System automatically assigns sequential numbers (e.g., INV-2025-001) for SARS compliance.',
          },
          {
            id: 'record-payment',
            title: 'Record a Payment',
            description: 'Track when attorneys pay you',
            completed: savedState.payment_recorded || false,
            helpText: 'Record payments as you receive them. System supports partial payments.',
          },
        ],
      },
      {
        id: 'reports',
        title: '📊 Financial Reports',
        description: 'Understand your numbers',
        items: [
          {
            id: 'dashboard',
            title: 'Explore the Dashboard',
            description: 'Your command center for daily work',
            completed: savedState.dashboard_explored || false,
            action: () => window.location.href = '/dashboard',
            actionLabel: 'View Dashboard',
            helpText: 'Dashboard shows urgent items, deadlines, financial snapshot, and active matters.',
          },
          {
            id: 'outstanding-fees',
            title: 'Check Outstanding Fees Report',
            description: 'See who owes you money',
            completed: savedState.outstanding_fees_checked || false,
            action: () => window.location.href = '/reports?type=outstanding',
            actionLabel: 'View Report',
            helpText: 'This report shows all unpaid invoices with aging and partial payment tracking.',
          },
          {
            id: 'wip-report',
            title: 'Review WIP Report',
            description: 'See unbilled work ready to invoice',
            completed: savedState.wip_checked || false,
            action: () => window.location.href = '/reports?type=wip',
            actionLabel: 'View Report',
            helpText: 'WIP (Work in Progress) shows all logged time and disbursements not yet invoiced.',
          },
        ],
      },
    ];
  };

  const markItemComplete = async (sectionId: string, itemId: string) => {
    if (!user?.id) return;

    try {
      // Update local state
      setChecklist((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, completed: true } : item
                ),
              }
            : section
        )
      );

      // Save to backend
      const response = await userPreferencesService.getCurrentUserPreferences();
      if (response.data && user?.id) {
        const preferences = response.data;
        const onboardingState = (preferences as any).onboarding_state || {};
        onboardingState[itemId] = true;

        await userPreferencesService.upsertUserPreferences(user.id, {
          onboarding_state: onboardingState,
        } as any);
      }
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  };

  const dismissOnboarding = async () => {
    if (!user?.id) return;

    try {
      const response = await userPreferencesService.getCurrentUserPreferences();
      if (response.data) {
        const preferences = response.data;
        await userPreferencesService.upsertUserPreferences(user.id, {
          onboarding_state: {
            ...(preferences as any).onboarding_state,
            dismissed: true,
          },
        } as any);
      }
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to dismiss onboarding:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return;

    try {
      const response = await userPreferencesService.getCurrentUserPreferences();
      if (response.data) {
        const preferences = response.data;
        await userPreferencesService.upsertUserPreferences(user.id, {
          onboarding_state: {
            ...(preferences as any).onboarding_state,
            completed: true,
          },
        } as any);
      }
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const calculateProgress = () => {
    const totalItems = checklist.reduce((sum, section) => sum + section.items.length, 0);
    const completedItems = checklist.reduce(
      (sum, section) => sum + section.items.filter((item) => item.completed).length,
      0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  if (!isVisible) return null;

  const progress = calculateProgress();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-64' : 'w-96 max-h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {progress}%
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Getting Started</h3>
            <p className="text-xs text-gray-600">{progress}% complete</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform ${isMinimized ? '' : 'rotate-90'}`}
            />
          </button>
          <button
            onClick={dismissOnboarding}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMinimized && (
        <div className="px-4 pt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {!isMinimized && (
        <div className="overflow-y-auto max-h-[450px] p-4 space-y-4">
          {checklist.map((section) => {
            const sectionProgress = section.items.filter((item) => item.completed).length;
            const sectionTotal = section.items.length;
            const isExpanded = expandedSection === section.id;

            return (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{section.title.split(' ')[0]}</div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">
                        {section.title.substring(section.title.indexOf(' ') + 1)}
                      </h4>
                      <p className="text-xs text-gray-600">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">
                      {sectionProgress}/{sectionTotal}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="p-3 space-y-3 bg-white">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-3 ${
                          item.completed
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => markItemComplete(section.id, item.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {item.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h5
                              className={`font-medium ${
                                item.completed ? 'text-green-900 line-through' : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>

                            {/* Help Text */}
                            {item.helpText && (
                              <div className="mt-2">
                                <button
                                  onClick={() =>
                                    setExpandedHelp(expandedHelp === item.id ? null : item.id)
                                  }
                                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <HelpCircle className="w-3 h-3" />
                                  <span>
                                    {expandedHelp === item.id ? 'Hide help' : 'Show help'}
                                  </span>
                                </button>
                                {expandedHelp === item.id && (
                                  <p className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded whitespace-pre-line">
                                    {item.helpText}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Action Button */}
                            {item.action && !item.completed && (
                              <Button
                                onClick={item.action}
                                size="sm"
                                variant="secondary"
                                className="mt-2"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                {item.actionLabel || 'Start'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Complete Button */}
          {progress === 100 && (
            <div className="pt-4 border-t border-gray-200">
              <Button onClick={completeOnboarding} className="w-full" variant="primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Onboarding
              </Button>
              <p className="text-xs text-center text-gray-600 mt-2">
                You can always access help from the menu
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
