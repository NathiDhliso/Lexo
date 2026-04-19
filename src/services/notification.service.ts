/**
 * Notification Service — Section 9.12
 *
 * Unified notification system replacing the basic AlertsDropdown.
 * Supports in-app, email, and WhatsApp (coming soon) channels.
 */

import { supabase } from '../lib/supabase';

export type NotificationType =
  | 'payment_received'
  | 'invoice_overdue'
  | 'quote_approved'
  | 'quote_declined'
  | 'document_uploaded'
  | 'diary_reminder'
  | 'trust_balance_low'
  | 'conflict_check_result'
  | 'system_announcement'
  | 'support_ticket_update'
  | 'fee_agreement_signed'
  | 'matter_status_change'
  | 'pa_action'
  | 'impersonation_alert'
  | 'onboarding_nudge';

export type NotificationChannel = 'in_app' | 'email' | 'whatsapp' | 'push';

export interface AppNotification {
  id: string;
  advocate_id: string;
  type: NotificationType;
  title: string;
  message: string;
  matter_id?: string;
  matter_title?: string;
  data?: Record<string, any>;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreference {
  type: NotificationType;
  in_app: boolean;
  email: boolean;
  whatsapp: boolean;
  push: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  is_read?: boolean;
  matter_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface CreateNotificationRequest {
  advocate_id: string;
  type: NotificationType;
  title: string;
  message: string;
  matter_id?: string;
  matter_title?: string;
  data?: Record<string, any>;
}

class NotificationService {
  private unsubscribeRealtime: (() => void) | null = null;
  private listeners: Set<(notifications: AppNotification[]) => void> = new Set();
  private countListeners: Set<(count: number) => void> = new Set();
  private cachedNotifications: AppNotification[] = [];

  /**
   * Get notifications with optional filters and pagination.
   */
  async getNotifications(
    filters?: NotificationFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: AppNotification[]; total: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { notifications: [], total: 0 };

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('advocate_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.is_read !== undefined) query = query.eq('is_read', filters.is_read);
    if (filters?.matter_id) query = query.eq('matter_id', filters.matter_id);
    if (filters?.from_date) query = query.gte('created_at', filters.from_date);
    if (filters?.to_date) query = query.lte('created_at', filters.to_date);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], total: 0 };
    }

    this.cachedNotifications = (data ?? []) as AppNotification[];
    return { notifications: this.cachedNotifications, total: count ?? 0 };
  }

  /**
   * Get unread notification count.
   */
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('advocate_id', user.id)
      .eq('is_read', false)
      .eq('is_archived', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
    return count ?? 0;
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) console.error('Failed to mark notification as read:', error);
    this.notifyCountChange();
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('advocate_id', user.id)
      .eq('is_read', false);

    if (error) console.error('Failed to mark all as read:', error);
    this.notifyCountChange();
  }

  /**
   * Archive a notification (soft delete — 90 day retention).
   */
  async archiveNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) console.error('Failed to archive notification:', error);
  }

  /**
   * Create a notification. Used by other services when events occur.
   */
  async createNotification(request: CreateNotificationRequest): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        ...request,
        is_read: false,
        is_archived: false,
        created_at: new Date().toISOString(),
      });

    if (error) console.error('Failed to create notification:', error);
  }

  /**
   * Send a broadcast notification to multiple users.
   * Super Admin only.
   */
  async sendBroadcast(
    title: string,
    message: string,
    targetUserIds: string[],
    data?: Record<string, any>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of targetUserIds) {
      try {
        await this.createNotification({
          advocate_id: userId,
          type: 'system_announcement',
          title,
          message,
          data,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Get notification preferences for the current user.
   */
  async getPreferences(): Promise<NotificationPreference[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this.getDefaultPreferences();

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('advocate_id', user.id);

    if (error || !data || data.length === 0) {
      return this.getDefaultPreferences();
    }

    return data as NotificationPreference[];
  }

  /**
   * Update notification preferences.
   */
  async updatePreference(
    type: NotificationType,
    channel: NotificationChannel,
    enabled: boolean
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('advocate_id', user.id)
      .eq('type', type)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('notification_preferences')
        .update({ [channel]: enabled })
        .eq('advocate_id', user.id)
        .eq('type', type);
    } else {
      const defaults = { in_app: true, email: true, whatsapp: false, push: false };
      await supabase
        .from('notification_preferences')
        .insert({
          advocate_id: user.id,
          type,
          ...defaults,
          [channel]: enabled,
        });
    }
  }

  /**
   * Subscribe to real-time notification updates.
   */
  subscribeToRealtime(callback: (notification: AppNotification) => void): () => void {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `advocate_id=eq.${user.id}`,
          },
          (payload) => {
            callback(payload.new as AppNotification);
            this.notifyCountChange();
          }
        )
        .subscribe();

      this.unsubscribeRealtime = () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();

    return () => {
      this.unsubscribeRealtime?.();
    };
  }

  /**
   * Subscribe to unread count changes.
   */
  onUnreadCountChange(callback: (count: number) => void): () => void {
    this.countListeners.add(callback);
    return () => this.countListeners.delete(callback);
  }

  private async notifyCountChange(): Promise<void> {
    const count = await this.getUnreadCount();
    this.countListeners.forEach(cb => cb(count));
  }

  private getDefaultPreferences(): NotificationPreference[] {
    const types: NotificationType[] = [
      'payment_received', 'invoice_overdue', 'quote_approved', 'quote_declined',
      'document_uploaded', 'diary_reminder', 'trust_balance_low',
      'conflict_check_result', 'system_announcement', 'support_ticket_update',
      'fee_agreement_signed', 'matter_status_change', 'pa_action',
      'impersonation_alert', 'onboarding_nudge',
    ];

    return types.map(type => ({
      type,
      in_app: true,
      email: ['payment_received', 'invoice_overdue', 'impersonation_alert', 'system_announcement'].includes(type),
      whatsapp: false, // Coming in Sprint 2
      push: false,
    }));
  }
}

export const notificationService = new NotificationService();
