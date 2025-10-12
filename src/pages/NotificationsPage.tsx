/**
 * Notifications Page
 * Displays user notifications and alerts
 */
import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Notifications
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Stay updated with your latest activities
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-8 text-center">
        <Bell className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No notifications yet
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          You'll see notifications here when there's activity on your matters
        </p>
      </div>
    </div>
  );
};

export default NotificationsPage;
