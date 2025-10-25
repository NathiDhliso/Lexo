import React from 'react';
import { UserPlus, Mail, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../design-system/components';

interface Invitation {
  id: string;
  email: string;
  sentAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

interface AttorneyInvitationsCardProps {
  pendingCount: number;
  recentInvitations: Invitation[];
  onInviteAttorney: () => void;
  onManage: () => void;
}

export const AttorneyInvitationsCard: React.FC<AttorneyInvitationsCardProps> = ({
  pendingCount,
  recentInvitations,
  onInviteAttorney,
  onManage,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-firm-secondary-500" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Pending Invitations
            </h3>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 text-sm font-semibold rounded-full bg-firm-secondary-500 text-white">
              {pendingCount}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recentInvitations.length > 0 ? (
          <div className="space-y-2 mb-4">
            {recentInvitations.slice(0, 2).map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-metallic-gray-800"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {invitation.email}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(invitation.sentAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            No pending invitations
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onInviteAttorney}
            className="flex-1"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Attorney
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onManage}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
