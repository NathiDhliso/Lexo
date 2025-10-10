import React, { useState } from 'react';
import { Card, CardContent, Button } from '../../components/design-system/components';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export const AttorneyNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'Pro forma request received', read: false, timestamp: new Date().toISOString() },
    { id: '2', message: 'Invoice issued', read: false, timestamp: new Date().toISOString() },
    { id: '3', message: 'Payment reminder', read: false, timestamp: new Date().toISOString() },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Notifications
        </h1>
        <div className="flex items-center gap-4">
          <span data-unread-count={unreadCount} className="text-sm text-neutral-600">
            {unreadCount} unread
          </span>
          <Button onClick={markAllAsRead} variant="secondary">
            Mark All as Read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map(notification => (
          <Card key={notification.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Bell className={`w-5 h-5 ${notification.read ? 'text-neutral-400' : 'text-primary-600'}`} />
                <div>
                  <p className={`font-medium ${notification.read ? 'text-neutral-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AttorneyNotificationsPage;
