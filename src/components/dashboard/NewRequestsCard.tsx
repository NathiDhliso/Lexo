import React from 'react';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../design-system/components';

interface MatterRequest {
  id: string;
  title: string;
  firmName: string;
  submittedAt: Date;
}

interface NewRequestsCardProps {
  newRequestsCount: number;
  recentRequests: MatterRequest[];
  onViewAll: () => void;
}

export const NewRequestsCard: React.FC<NewRequestsCardProps> = ({
  newRequestsCount,
  recentRequests,
  onViewAll,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-status-warning-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-status-warning-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              New Requests
            </h3>
          </div>
          {newRequestsCount > 0 && (
            <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 text-sm font-semibold rounded-full bg-status-warning-500 text-white">
              {newRequestsCount}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recentRequests.length > 0 ? (
          <div className="space-y-2 mb-4">
            {recentRequests.slice(0, 2).map((request) => (
              <div
                key={request.id}
                className="p-3 rounded-lg bg-status-warning-50 dark:bg-status-warning-900/20 border border-status-warning-200 dark:border-status-warning-800"
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  {request.title}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                  <span>{request.firmName}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            No new requests
          </p>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewAll}
          className="w-full"
        >
          View All Requests
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
