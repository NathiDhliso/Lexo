/**
 * NotificationCentre — Slide-out notification panel
 * PRD Section 9.12 — Replaces basic AlertsDropdown
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, X, Check, CheckCheck, Filter, Search, Trash2,
  CreditCard, AlertTriangle, FileText, Calendar, Shield,
  MessageSquare, Megaphone, ArrowRight, Clock
} from 'lucide-react';
import { notificationService, type AppNotification, type NotificationType } from '../../services/notification.service';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCentreProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, data?: any) => void;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  payment_received: CreditCard,
  invoice_overdue: AlertTriangle,
  quote_approved: Check,
  quote_declined: X,
  document_uploaded: FileText,
  diary_reminder: Calendar,
  trust_balance_low: AlertTriangle,
  conflict_check_result: Shield,
  system_announcement: Megaphone,
  support_ticket_update: MessageSquare,
  fee_agreement_signed: FileText,
  matter_status_change: ArrowRight,
  pa_action: ArrowRight,
  impersonation_alert: Shield,
  onboarding_nudge: ArrowRight,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  payment_received: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  invoice_overdue: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  quote_approved: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  quote_declined: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  trust_balance_low: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  conflict_check_result: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  impersonation_alert: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  system_announcement: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
};

const DEFAULT_COLOR = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';

export const NotificationCentre: React.FC<NotificationCentreProps> = ({ isOpen, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  useEffect(() => {
    const unsub = notificationService.subscribeToRealtime((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setTotal(prev => prev + 1);
    });
    return unsub;
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const filters = filter === 'unread' ? { is_read: false } : undefined;
      const { notifications: data, total: count } = await notificationService.getNotifications(filters);
      setNotifications(data);
      setTotal(count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.archiveNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setTotal(prev => prev - 1);
  };

  const handleClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
    }
    if (notification.matter_id) {
      onNavigate('matter-workbench', { matterId: notification.matter_id });
    }
    onClose();
  };

  const filteredNotifications = notifications.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q) || (n.matter_title ?? '').toLowerCase().includes(q);
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-metallic-gray-900 shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-mpondo-gold-600 dark:text-mpondo-gold-400 hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 rounded-lg">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
              />
            </div>
            <div className="flex bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm' : 'text-neutral-500'}`}
              >All</button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm' : 'text-neutral-500'}`}
              >Unread</button>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-mpondo-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Bell className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-metallic-gray-800">
              {filteredNotifications.map((notification) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                const colorClass = NOTIFICATION_COLORS[notification.type] || DEFAULT_COLOR;

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={`w-full text-left px-5 py-3 hover:bg-neutral-50 dark:hover:bg-metallic-gray-800/50 transition-colors group ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'font-medium text-neutral-700 dark:text-neutral-300'} truncate`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                              <button onClick={(e) => handleMarkRead(notification.id, e)} className="p-1 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 rounded" title="Mark read">
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button onClick={(e) => handleArchive(notification.id, e)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-neutral-400 hover:text-red-500" title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.matter_title && (
                            <span className="text-xs text-mpondo-gold-600 dark:text-mpondo-gold-400 truncate max-w-[150px]">
                              {notification.matter_title}
                            </span>
                          )}
                          {!notification.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-metallic-gray-700 text-center">
          <p className="text-xs text-neutral-400">{total} total notifications · Retained for 90 days</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCentre;
