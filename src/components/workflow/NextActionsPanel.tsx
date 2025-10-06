import React from 'react';
import { Zap, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '../../design-system/components';

export interface NextAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
}

interface NextActionsPanelProps {
  actions: NextAction[];
  title?: string;
  showPriority?: boolean;
  maxActions?: number;
  className?: string;
}

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'bg-status-error-100 text-status-error-700 border-status-error-200';
    case 'medium':
      return 'bg-mpondo-gold-100 text-mpondo-gold-700 border-mpondo-gold-200';
    case 'low':
      return 'bg-judicial-blue-100 text-judicial-blue-700 border-judicial-blue-200';
  }
};

const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return AlertCircle;
    case 'medium':
      return Clock;
    case 'low':
      return Zap;
  }
};

export const NextActionsPanel: React.FC<NextActionsPanelProps> = ({
  actions,
  title = 'Suggested Next Actions',
  showPriority = true,
  maxActions = 5,
  className = ''
}) => {
  const displayActions = actions.slice(0, maxActions);

  if (displayActions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-mpondo-gold-600" />
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        </div>

        <div className="space-y-3">
          {displayActions.map((action) => {
            const PriorityIcon = getPriorityIcon(action.priority);
            const ActionIcon = action.icon || ArrowRight;

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  action.disabled
                    ? 'bg-neutral-50 border-neutral-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-neutral-200 hover:border-mpondo-gold-300 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <ActionIcon className="w-5 h-5 text-mpondo-gold-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {action.title}
                      </h4>
                      {showPriority && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            action.priority
                          )}`}
                        >
                          <PriorityIcon className="w-3 h-3" />
                          {action.priority}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-neutral-600 mb-2">
                      {action.description}
                    </p>

                    {action.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Clock className="w-3 h-3" />
                        <span>{action.estimatedTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {actions.length > maxActions && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              View {actions.length - maxActions} more actions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const useSmartActions = (context: {
  matters?: any[];
  proformas?: any[];
  invoices?: any[];
  userId?: string;
}): NextAction[] => {
  const actions: NextAction[] = [];

  if (context.matters) {
    const activeMatters = context.matters.filter(m => m.status === 'active');
    const mattersWithoutProForma = activeMatters.filter(m => !m.has_proforma);

    if (mattersWithoutProForma.length > 0) {
      actions.push({
        id: 'create-proforma',
        title: `Create Pro Forma for ${mattersWithoutProForma.length} Matter(s)`,
        description: 'Generate pro forma invoices for active matters without quotes',
        priority: 'medium',
        estimatedTime: '5 min',
        onClick: () => {}
      });
    }
  }

  if (context.proformas) {
    const acceptedProFormas = context.proformas.filter(p => p.status === 'accepted');

    if (acceptedProFormas.length > 0) {
      actions.push({
        id: 'convert-proforma',
        title: `Convert ${acceptedProFormas.length} Accepted Pro Forma(s)`,
        description: 'Convert accepted pro formas to final invoices',
        priority: 'high',
        estimatedTime: '10 min',
        onClick: () => {}
      });
    }

    const expiringSoon = context.proformas.filter(p => {
      const daysUntilExpiry = Math.floor(
        (new Date(p.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0 && p.status === 'sent';
    });

    if (expiringSoon.length > 0) {
      actions.push({
        id: 'follow-up-proforma',
        title: `Follow Up on ${expiringSoon.length} Expiring Pro Forma(s)`,
        description: 'Pro formas expiring within 7 days need attention',
        priority: 'high',
        estimatedTime: '15 min',
        onClick: () => {}
      });
    }
  }

  if (context.invoices) {
    const overdueInvoices = context.invoices.filter(i => i.status === 'overdue');

    if (overdueInvoices.length > 0) {
      actions.push({
        id: 'chase-overdue',
        title: `Chase ${overdueInvoices.length} Overdue Invoice(s)`,
        description: 'Send payment reminders for overdue invoices',
        priority: 'high',
        estimatedTime: '10 min',
        onClick: () => {}
      });
    }

    const draftInvoices = context.invoices.filter(i => i.status === 'draft');

    if (draftInvoices.length > 0) {
      actions.push({
        id: 'send-drafts',
        title: `Send ${draftInvoices.length} Draft Invoice(s)`,
        description: 'Finalize and send draft invoices to clients',
        priority: 'medium',
        estimatedTime: '5 min',
        onClick: () => {}
      });
    }
  }

  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};
