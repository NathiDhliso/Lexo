import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type EventType = 'court' | 'consultation' | 'meeting' | 'deadline' | 'other';
export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type LocationType = 'physical' | 'virtual' | 'phone';

export interface CalendarEvent {
  id: string;
  user_id: string;
  matter_id?: string;
  title: string;
  description?: string;
  event_type?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  metadata?: any;
  external_id?: string;
  sync_source?: string;
  created_at?: string;
  updated_at?: string;
  matter_title?: string;
  client_name?: string;
}

export interface CreateEventRequest {
  matter_id?: string;
  title: string;
  description?: string;
  event_type?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  metadata?: any;
  external_id?: string;
  sync_source?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}

class CalendarService {
  private static instance: CalendarService;

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  async getEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // First, try to get events with matters join
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }

      const { data: events, error } = await query;

      if (error) throw error;

      // If we have events, try to get matter details separately
      const eventsWithMatterDetails = await Promise.all(
        (events || []).map(async (event) => {
          let matter_title = undefined;
          let client_name = undefined;

          if (event.matter_id) {
            try {
              const { data: matter } = await supabase
                .from('matters')
                .select('title, client_name')
                .eq('id', event.matter_id)
                .eq('user_id', user.id)
                .single();
              
              if (matter) {
                matter_title = matter.title;
                client_name = matter.client_name;
              }
            } catch (matterError) {
              // Ignore matter fetch errors - event will just not have matter details
              console.warn('Could not fetch matter details for event:', event.id);
            }
          }

          return {
            ...event,
            matter_title,
            client_name,
            attendees: event.attendees || []
          };
        })
      );

      return eventsWithMatterDetails;
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load calendar events');
      return [];
    }
  }

  async getUpcomingEvents(limit: number = 10): Promise<CalendarEvent[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(event => ({
        ...event,
        matter_title: event.matters?.title,
        client_name: event.matters?.client_name,
        attendees: event.attendees || []
      }));
    } catch (error) {
      console.error('Error loading upcoming events:', error);
      return [];
    }
  }

  async getEventsByType(eventType: EventType): Promise<CalendarEvent[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', eventType)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(event => ({
        ...event,
        matter_title: event.matters?.title,
        client_name: event.matters?.client_name,
        attendees: event.attendees || []
      }));
    } catch (error) {
      console.error('Error loading events by type:', error);
      return [];
    }
  }

  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEvents(today, tomorrow);
  }

  async createEvent(eventData: CreateEventRequest): Promise<CalendarEvent | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          ...eventData
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Event created successfully');
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return null;
    }
  }

  async updateEvent(eventId: string, updates: UpdateEventRequest): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Event updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  }

  async markEventComplete(eventId: string): Promise<boolean> {
    return this.updateEvent(eventId, { status: 'completed' });
  }

  async cancelEvent(eventId: string): Promise<boolean> {
    return this.updateEvent(eventId, { status: 'cancelled' });
  }

  getEventStats(events: CalendarEvent[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      total: events.length,
      today: events.filter(e => {
        const eventDate = new Date(e.start_time);
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDay.getTime() === today.getTime();
      }).length,
      court: events.filter(e => e.event_type === 'court' && e.status === 'scheduled').length,
      consultations: events.filter(e => e.event_type === 'consultation' && e.status === 'scheduled').length,
      meetings: events.filter(e => e.event_type === 'meeting' && e.status === 'scheduled').length,
      deadlines: events.filter(e => e.event_type === 'deadline' && e.status === 'scheduled').length
    };
  }
}

export const calendarService = CalendarService.getInstance();
