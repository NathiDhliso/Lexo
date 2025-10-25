import React from 'react';
import { UserCheck, FileText, Send, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../design-system/components';

interface Activity {
  id: string;
  type: 'attorney_accepted' | 'matter_request' | 'invoice_sent' | 'proforma_approved';
  description: string;
  timestamp: Date;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  attorney_accepted: UserCheck,
  matter_request: FileText,
  invoice_sent: Send,
  proforma_approved: CheckCircle,
};

const activityColors = {
  attorney_accepted: 'text-status-success-600',
  matter_request: 'text-judicial-blue-600',
  invoice_sent: 'text-firm-primary-600',
  proforma_approved: 'text-status-success-600',
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Recent Activity
        </h3>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
};
