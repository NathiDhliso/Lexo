import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Video, MapPin, Users } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import { useAuth } from '../contexts/AuthContext';
import { calendarService, CalendarEvent } from '../services/calendar.service';
import type { Page } from '../types';

interface CalendarPageProps {
  onNavigate?: (page: Page) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const loadedEvents = await calendarService.getEvents(startOfMonth, endOfMonth);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventTypeColor = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'court':
        return 'bg-judicial-blue-100 text-judicial-blue-800';
      case 'consultation':
        return 'bg-mpondo-gold-100 text-mpondo-gold-800';
      case 'meeting':
        return 'bg-status-info-100 text-status-info-800';
      case 'deadline':
        return 'bg-status-error-100 text-status-error-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const stats = calendarService.getEventStats(events);

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Calendar</h1>
          <p className="text-neutral-600 mt-1">Manage your schedule and appointments</p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          <Icon icon={Plus} className="w-4 h-4 mr-2" noGradient />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Calendar} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">{stats.today}</h3>
            <p className="text-sm text-neutral-600">Events Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Clock} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">{stats.court}</h3>
            <p className="text-sm text-neutral-600">Court Appearances</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Users} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">{stats.consultations}</h3>
            <p className="text-sm text-neutral-600">Consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Video} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">{stats.meetings}</h3>
            <p className="text-sm text-neutral-600">Virtual Meetings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">{monthName}</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1 text-sm rounded-l-lg ${
                      view === 'month' ? 'bg-mpondo-gold-100 text-mpondo-gold-800' : 'text-neutral-600'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1 text-sm ${
                      view === 'week' ? 'bg-mpondo-gold-100 text-mpondo-gold-800' : 'text-neutral-600'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('day')}
                    className={`px-3 py-1 text-sm rounded-r-lg ${
                      view === 'day' ? 'bg-mpondo-gold-100 text-mpondo-gold-800' : 'text-neutral-600'
                    }`}
                  >
                    Day
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <Icon icon={ChevronLeft} className="w-4 h-4" noGradient />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <Icon icon={ChevronRight} className="w-4 h-4" noGradient />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-neutral-600 py-2">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const isToday = new Date().getDate() === day && 
                                  new Date().getMonth() === currentDate.getMonth() &&
                                  new Date().getFullYear() === currentDate.getFullYear();
                  const dayEvents = getEventsForDay(day);
                  
                  return (
                    <div
                      key={day}
                      className={`aspect-square p-2 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors ${
                        isToday ? 'bg-mpondo-gold-50 border-mpondo-gold-500' : 'border-neutral-200'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-mpondo-gold-600' : 'text-neutral-900'}`}>
                        {day}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.event_type)}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-neutral-500">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-neutral-900">Upcoming Events</h2>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">{event.title}</h4>
                        {event.matter_title && (
                          <p className="text-xs text-neutral-500 mt-1">{event.matter_title}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.start_date)} - {formatTime(event.end_date)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-neutral-600 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      )}
                      {event.virtual_meeting_link && (
                        <p className="text-sm text-neutral-600 flex items-center gap-2">
                          <Video className="w-3 h-3" />
                          Virtual Meeting
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon={Calendar} className="w-12 h-12 mx-auto mb-3 text-neutral-300" noGradient />
                <p className="text-neutral-600 mb-4">No upcoming events</p>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Icon icon={Plus} className="w-4 h-4 mr-2" noGradient />
                  Schedule Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
