export interface NotificationAction {
  label: string;
  action: 'navigate' | 'api_call' | 'dismiss' | 'snooze' | string;
  target?: string;
  parameters?: Record<string, any>;
}

export interface SmartNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent' | 'attention';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  actionable?: boolean;
  actions?: NotificationAction[];
  relatedId?: string;
}

export interface NotificationBadge {
  count: number;
  hasUrgent: boolean;
}

class SmartNotificationsService {
  private notifications: SmartNotification[] = [];
  private listeners: ((notifications: SmartNotification[]) => void)[] = [];

  async getNotifications(): Promise<SmartNotification[]> {
    // In a real implementation, this would fetch from the backend
    return this.notifications;
  }

  async getUnreadCount(): Promise<number> {
    return this.notifications.filter(n => !n.read).length;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  async addNotification(notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: SmartNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  async removeNotification(notificationId: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  subscribe(listener: (notifications: SmartNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  subscribeToBadges(listener: (badge: NotificationBadge) => void): () => void {
    const badgeListener = async () => {
      const badge = await this.getBadgeInfo();
      listener(badge);
    };
    
    // Call immediately to set initial state
    badgeListener();
    
    // Subscribe to notification changes
    return this.subscribe(() => badgeListener());
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  async getBadgeInfo(): Promise<NotificationBadge> {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    return {
      count: unreadNotifications.length,
      hasUrgent: unreadNotifications.some(n => n.type === 'error' || n.type === 'warning'),
    };
  }
}

export const smartNotificationsService = new SmartNotificationsService();
