import React, { useState } from 'react';
import { Bell, Filter, Check } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../components/design-system/components';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'proforma', message: 'Pro forma request', read: false, timestamp: new Date().toISOString() },
    { id: '2', type: 'invoice', message: 'Invoice issued', read: false, timestamp: new Date().toISOString() },
    { id: '3', type: 'payment', message: 'Payment received', read: false, timestamp: new Date().toISOString() },
    { id: '4', type: 'retainer', message: 'Retainer low balance', read: false, timestamp: new Date().toISOString() },
    { id: '5', type: 'invoice', message: 'Invoice overdue', read: false, timestamp: new Date().toISOString() },
  ]);

  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const filterNotifications = () => {
    if (!filterType) return notifications;
    return notifications.filter(n => n.type === filterType);
  };

  const filteredNotifications = filterNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Notifications
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <Button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              variant="secondary"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter by Type
            </Button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-metallic-gray-800 rounded-lg theme-theme-shadow-lg border border-gray-200 dark:border-metallic-gray-700 z-10">
                <button
                  onClick={() => {
                    setFilterType('invoice');
                    setShowFilterMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Invoice Notifications
                </button>
                <button
                  onClick={() => {
                    setFilterType('proforma');
                    setShowFilterMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Pro Forma Notifications
                </button>
                <button
                  onClick={() => {
                    setFilterType(null);
                    setShowFilterMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  All Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.map(notification => (
          <Card
            key={notification.id}
            data-notification-read={notification.read}
            className="cursor-pointer hover:theme-theme-shadow-md transition-shadow"
          >
            <CardContent className="flex items-center justify-between p-4">
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
              {!notification.read && (
                <Button
                  onClick={() => markAsRead(notification.id)}
                  variant="secondary"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
