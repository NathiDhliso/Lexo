/**
 * Dashboard Configuration Utilities
 * 
 * Utilities for configuring dashboard widgets based on user billing preferences.
 */

import type { AdvocateBillingPreferences } from '../types/billing.types';

export interface DashboardWidget {
  id: string;
  name: string;
  component: string;
  isVisible: boolean;
  order: number;
  category: 'financial' | 'matters' | 'time' | 'actions';
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  showTimeTracking: boolean;
  showMilestones: boolean;
  showWIPTracker: boolean;
}

/**
 * Default widget configurations based on primary workflow
 */
const WORKFLOW_WIDGET_CONFIGS = {
  'brief-fee': [
    'active-matters',
    'fee-milestones',
    'pending-invoices',
    'recent-payments',
    'urgent-attention',
    'this-week-deadlines',
    'financial-snapshot',
    'pending-actions'
  ],
  'time-based': [
    'active-matters',
    'time-tracking',
    'wip-tracker',
    'pending-invoices',
    'recent-payments',
    'urgent-attention',
    'this-week-deadlines',
    'financial-snapshot',
    'pending-actions'
  ],
  'mixed': [
    'active-matters',
    'time-tracking',
    'fee-milestones',
    'pending-invoices',
    'recent-payments',
    'urgent-attention',
    'this-week-deadlines',
    'financial-snapshot',
    'pending-actions'
  ]
};

/**
 * All available dashboard widgets
 */
const ALL_WIDGETS: Omit<DashboardWidget, 'isVisible' | 'order'>[] = [
  {
    id: 'active-matters',
    name: 'Active Matters',
    component: 'ActiveMattersCard',
    category: 'matters'
  },
  {
    id: 'time-tracking',
    name: 'Time Tracking',
    component: 'TimeTrackingCard',
    category: 'time'
  },
  {
    id: 'fee-milestones',
    name: 'Fee Milestones',
    component: 'FeeMilestonesCard',
    category: 'financial'
  },
  {
    id: 'wip-tracker',
    name: 'WIP Tracker',
    component: 'WIPTrackerCard',
    category: 'time'
  },
  {
    id: 'pending-invoices',
    name: 'Pending Invoices',
    component: 'PendingInvoicesCard',
    category: 'financial'
  },
  {
    id: 'recent-payments',
    name: 'Recent Payments',
    component: 'RecentPaymentsCard',
    category: 'financial'
  },
  {
    id: 'urgent-attention',
    name: 'Urgent Attention',
    component: 'UrgentAttentionCard',
    category: 'actions'
  },
  {
    id: 'this-week-deadlines',
    name: 'This Week\'s Deadlines',
    component: 'ThisWeekDeadlinesCard',
    category: 'actions'
  },
  {
    id: 'financial-snapshot',
    name: 'Financial Snapshot',
    component: 'FinancialSnapshotCards',
    category: 'financial'
  },
  {
    id: 'pending-actions',
    name: 'Pending Actions',
    component: 'PendingActionsCard',
    category: 'actions'
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    component: 'RecentActivityCard',
    category: 'actions'
  }
];

/**
 * Generate dashboard configuration based on billing preferences
 */
export function generateDashboardConfig(
  preferences?: AdvocateBillingPreferences
): DashboardConfig {
  if (!preferences) {
    // Default configuration for new users
    return {
      widgets: getDefaultWidgets('brief-fee'),
      showTimeTracking: false,
      showMilestones: true,
      showWIPTracker: false,
    };
  }

  const workflowWidgets = WORKFLOW_WIDGET_CONFIGS[preferences.primary_workflow] || 
                         WORKFLOW_WIDGET_CONFIGS['brief-fee'];
  
  // Use custom widget configuration if available, otherwise use workflow default
  const configuredWidgets = Array.isArray(preferences.dashboard_widgets) && 
                           preferences.dashboard_widgets.length > 0
    ? preferences.dashboard_widgets
    : workflowWidgets;

  const widgets = ALL_WIDGETS.map((widget, index) => ({
    ...widget,
    isVisible: configuredWidgets.includes(widget.id),
    order: configuredWidgets.indexOf(widget.id) !== -1 
      ? configuredWidgets.indexOf(widget.id) 
      : index + 100 // Put unconfigured widgets at the end
  })).sort((a, b) => a.order - b.order);

  return {
    widgets,
    showTimeTracking: preferences.show_time_tracking_by_default || 
                     preferences.primary_workflow === 'time-based',
    showMilestones: preferences.auto_create_milestones && 
                   (preferences.primary_workflow === 'brief-fee' || 
                    preferences.primary_workflow === 'mixed'),
    showWIPTracker: preferences.primary_workflow === 'time-based' || 
                   preferences.primary_workflow === 'mixed',
  };
}

/**
 * Get default widgets for a specific workflow
 */
function getDefaultWidgets(workflow: 'brief-fee' | 'time-based' | 'mixed'): DashboardWidget[] {
  const workflowWidgets = WORKFLOW_WIDGET_CONFIGS[workflow];
  
  return ALL_WIDGETS.map((widget, index) => ({
    ...widget,
    isVisible: workflowWidgets.includes(widget.id),
    order: workflowWidgets.indexOf(widget.id) !== -1 
      ? workflowWidgets.indexOf(widget.id) 
      : index + 100
  })).sort((a, b) => a.order - b.order);
}

/**
 * Check if a specific widget should be visible
 */
export function shouldShowWidget(
  widgetId: string, 
  preferences?: AdvocateBillingPreferences
): boolean {
  const config = generateDashboardConfig(preferences);
  const widget = config.widgets.find(w => w.id === widgetId);
  return widget?.isVisible ?? false;
}

/**
 * Get visible widgets in order
 */
export function getVisibleWidgets(
  preferences?: AdvocateBillingPreferences
): DashboardWidget[] {
  const config = generateDashboardConfig(preferences);
  return config.widgets.filter(w => w.isVisible);
}

/**
 * Update widget visibility
 */
export function updateWidgetVisibility(
  currentWidgets: string[],
  widgetId: string,
  isVisible: boolean
): string[] {
  if (isVisible && !currentWidgets.includes(widgetId)) {
    return [...currentWidgets, widgetId];
  } else if (!isVisible && currentWidgets.includes(widgetId)) {
    return currentWidgets.filter(id => id !== widgetId);
  }
  return currentWidgets;
}

/**
 * Reorder widgets
 */
export function reorderWidgets(
  currentWidgets: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const result = [...currentWidgets];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}