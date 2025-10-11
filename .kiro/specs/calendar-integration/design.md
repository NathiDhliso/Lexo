# Design Document: Calendar Integration

## Overview

The Calendar Integration feature provides a simple, universal way for advocates to export LexoHub events to their personal calendars using the iCalendar (.ics) standard format. This design avoids complex OAuth integrations while providing immediate value through one-click calendar exports.

### Design Philosophy

- **Simplicity First**: Generate .ics files, let the OS/browser handle the rest
- **Universal Compatibility**: Works with all calendar applications
- **Zero Configuration**: No setup, authentication, or account linking required
- **Standards Compliant**: Follow RFC 5545 iCalendar specification exactly

### Key Design Decisions

1. **Use .ics Format**: Universal standard supported by all calendar applications
2. **One-Way Export**: Simple download rather than complex two-way sync
3. **Client-Side Generation**: Generate .ics files in browser when possible
4. **Sensible Defaults**: Pre-configure reminders based on event type
5. **Rich Descriptions**: Include all relevant context in event descriptions

## Architecture

### Component Structure

```
Calendar Integration
├── ICSGeneratorService (utility)
│   ├── generateCourtDateEvent()
│   ├── generateDeadlineEvent()
│   ├── generateMeetingEvent()
│   ├── generatePaymentReminderEvent()
│   └── generateBulkEvents()
│
├── CalendarButton Component
│   └── Renders "Add to Calendar" button
│
├── BulkExportModal Component
│   └── Date range selector and preview
│
└── CalendarSettingsPanel Component
    └── Reminder preferences configuration
```

### Data Flow

```
User clicks "Add to Calendar"
         ↓
Component calls ICSGeneratorService
         ↓
Service generates .ics file content
         ↓
Browser triggers file download
         ↓
User opens .ics file
         ↓
OS opens default calendar app
         ↓
Event added to calendar
```

## ICS File Generation

### ICSGeneratorService

```typescript
export class ICSGeneratorService {
  /**
   * Generate .ics file for court date
   */
  static generateCourtDateEvent(matter: Matter): string {
    const event = {
      uid: `court-${matter.id}-${Date.now()}@lexohub.com`,
      summary: `Court Date: ${matter.title}`,
      description: this.formatCourtDateDescription(matter),
      location: matter.court_location || '',
      dtstart: this.formatDate(matter.court_date, matter.court_time),
      dtend: this.formatDate(matter.court_date, matter.court_time, 2), // 2 hour duration
      alarm: this.formatAlarm(1, 'days'), // 1 day before
      status: 'CONFIRMED',
      transp: 'OPAQUE' // Show as busy
    };
    
    return this.buildICSFile([event]);
  }

  /**
   * Generate .ics file for deadline
   */
  static generateDeadlineEvent(
    matter: Matter,
    deadline: { date: string; type: string; description?: string }
  ): string {
    const event = {
      uid: `deadline-${matter.id}-${deadline.type}-${Date.now()}@lexohub.com`,
      summary: `Deadline: ${matter.title} - ${deadline.type}`,
      description: this.formatDeadlineDescription(matter, deadline),
      dtstart: this.formatDate(deadline.date),
      dtend: this.formatDate(deadline.date),
      alarm: [
        this.formatAlarm(3, 'days'), // 3 days before
        this.formatAlarm(1, 'days')  // 1 day before
      ],
      status: 'CONFIRMED',
      transp: 'TRANSPARENT' // Don't block time
    };
    
    return this.buildICSFile([event]);
  }

  /**
   * Generate .ics file for meeting
   */
  static generateMeetingEvent(meeting: {
    matter: Matter;
    title: string;
    date: string;
    time: string;
    duration?: number;
    location?: string;
    description?: string;
  }): string {
    const event = {
      uid: `meeting-${meeting.matter.id}-${Date.now()}@lexohub.com`,
      summary: `Meeting: ${meeting.matter.client_name} - ${meeting.title}`,
      description: this.formatMeetingDescription(meeting),
      location: meeting.location || '',
      dtstart: this.formatDate(meeting.date, meeting.time),
      dtend: this.formatDate(meeting.date, meeting.time, meeting.duration || 1),
      alarm: this.formatAlarm(1, 'hours'), // 1 hour before
      status: 'CONFIRMED',
      transp: 'OPAQUE' // Show as busy
    };
    
    return this.buildICSFile([event]);
  }

  /**
   * Generate .ics file for payment reminder
   */
  static generatePaymentReminderEvent(invoice: Invoice, matter: Matter): string {
    const event = {
      uid: `payment-${invoice.id}-${Date.now()}@lexohub.com`,
      summary: `Payment Due: ${matter.client_name} - Invoice #${invoice.invoice_number}`,
      description: this.formatPaymentReminderDescription(invoice, matter),
      dtstart: this.formatDate(invoice.due_date),
      dtend: this.formatDate(invoice.due_date),
      alarm: this.formatAlarm(3, 'days'), // 3 days before
      status: 'CONFIRMED',
      transp: 'TRANSPARENT'
    };
    
    return this.buildICSFile([event]);
  }

  /**
   * Generate bulk .ics file with multiple events
   */
  static generateBulkEvents(events: Array<{
    type: 'court' | 'deadline' | 'meeting' | 'payment';
    data: any;
  }>): string {
    const icsEvents = events.map(event => {
      switch (event.type) {
        case 'court':
          return this.parseEventFromMatter(event.data, 'court');
        case 'deadline':
          return this.parseEventFromMatter(event.data, 'deadline');
        case 'meeting':
          return this.parseEventFromMeeting(event.data);
        case 'payment':
          return this.parseEventFromInvoice(event.data);
      }
    });
    
    return this.buildICSFile(icsEvents);
  }

  /**
   * Build complete .ics file from events
   */
  private static buildICSFile(events: any[]): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LexoHub//Calendar Integration//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:LexoHub Events',
      'X-WR-TIMEZONE:Africa/Johannesburg'
    ];
    
    events.forEach(event => {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.uid}`);
      lines.push(`DTSTAMP:${this.formatDateTimeUTC(new Date())}`);
      lines.push(`DTSTART:${event.dtstart}`);
      lines.push(`DTEND:${event.dtend}`);
      lines.push(`SUMMARY:${this.escapeText(event.summary)}`);
      
      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeText(event.description)}`);
      }
      
      if (event.location) {
        lines.push(`LOCATION:${this.escapeText(event.location)}`);
      }
      
      if (event.status) {
        lines.push(`STATUS:${event.status}`);
      }
      
      if (event.transp) {
        lines.push(`TRANSP:${event.transp}`);
      }
      
      // Add alarms
      if (Array.isArray(event.alarm)) {
        event.alarm.forEach((alarm: string) => {
          lines.push('BEGIN:VALARM');
          lines.push('ACTION:DISPLAY');
          lines.push(`DESCRIPTION:${this.escapeText(event.summary)}`);
          lines.push(`TRIGGER:${alarm}`);
          lines.push('END:VALARM');
        });
      } else if (event.alarm) {
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${this.escapeText(event.summary)}`);
        lines.push(`TRIGGER:${event.alarm}`);
        lines.push('END:VALARM');
      }
      
      lines.push('END:VEVENT');
    });
    
    lines.push('END:VCALENDAR');
    
    return lines.join('\r\n');
  }

  /**
   * Format date for .ics file
   */
  private static formatDate(date: string, time?: string, durationHours?: number): string {
    const d = new Date(date);
    
    if (time) {
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes));
      
      if (durationHours) {
        d.setHours(d.getHours() + durationHours);
      }
      
      // Return with timezone
      return this.formatDateTimeWithTZ(d);
    } else {
      // All-day event
      return this.formatDateOnly(d);
    }
  }

  /**
   * Format date-time with timezone
   */
  private static formatDateTimeWithTZ(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  /**
   * Format date-time in UTC
   */
  private static formatDateTimeUTC(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Format date only (for all-day events)
   */
  private static formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
  }

  /**
   * Format alarm/reminder
   */
  private static formatAlarm(value: number, unit: 'days' | 'hours' | 'minutes'): string {
    const unitMap = {
      days: 'D',
      hours: 'H',
      minutes: 'M'
    };
    
    return `-PT${value}${unitMap[unit]}`;
  }

  /**
   * Escape special characters for .ics format
   */
  private static escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  /**
   * Format court date description
   */
  private static formatCourtDateDescription(matter: Matter): string {
    const parts = [
      `Matter: ${matter.title}`,
      `Client: ${matter.client_name}`,
      `Case Number: ${matter.court_case_number || 'N/A'}`,
      `Reference: ${matter.reference_number}`,
      '',
      `View in LexoHub: ${window.location.origin}/matters/${matter.id}`
    ];
    
    return parts.join('\\n');
  }

  /**
   * Format deadline description
   */
  private static formatDeadlineDescription(
    matter: Matter,
    deadline: { type: string; description?: string }
  ): string {
    const parts = [
      `Deadline Type: ${deadline.type}`,
      `Matter: ${matter.title}`,
      `Client: ${matter.client_name}`,
      `Reference: ${matter.reference_number}`,
    ];
    
    if (deadline.description) {
      parts.push('', `Details: ${deadline.description}`);
    }
    
    parts.push('', `View in LexoHub: ${window.location.origin}/matters/${matter.id}`);
    
    return parts.join('\\n');
  }

  /**
   * Format meeting description
   */
  private static formatMeetingDescription(meeting: any): string {
    const parts = [
      `Meeting: ${meeting.title}`,
      `Client: ${meeting.matter.client_name}`,
      `Matter: ${meeting.matter.title}`,
    ];
    
    if (meeting.description) {
      parts.push('', `Agenda: ${meeting.description}`);
    }
    
    parts.push('', `View in LexoHub: ${window.location.origin}/matters/${meeting.matter.id}`);
    
    return parts.join('\\n');
  }

  /**
   * Format payment reminder description
   */
  private static formatPaymentReminderDescription(invoice: Invoice, matter: Matter): string {
    const parts = [
      `Invoice: #${invoice.invoice_number}`,
      `Amount: R${invoice.total_amount?.toLocaleString()}`,
      `Client: ${matter.client_name}`,
      `Matter: ${matter.title}`,
      '',
      `View Invoice: ${window.location.origin}/invoices/${invoice.id}`
    ];
    
    return parts.join('\\n');
  }

  /**
   * Trigger download of .ics file
   */
  static downloadICSFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}
```

## Components

### 1. CalendarButton Component

**Purpose**: Reusable button for adding events to calendar

**Props**:
```typescript
interface CalendarButtonProps {
  eventType: 'court' | 'deadline' | 'meeting' | 'payment';
  eventData: any;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}
```

**Visual Design**:
```
[📅 Add to Calendar]  (button with calendar icon)
```

**Implementation**:
```typescript
export const CalendarButton: React.FC<CalendarButtonProps> = ({
  eventType,
  eventData,
  variant = 'secondary',
  size = 'md',
  label = 'Add to Calendar'
}) => {
  const handleClick = () => {
    let icsContent: string;
    let filename: string;
    
    switch (eventType) {
      case 'court':
        icsContent = ICSGeneratorService.generateCourtDateEvent(eventData);
        filename = `court-date-${eventData.reference_number}`;
        break;
      case 'deadline':
        icsContent = ICSGeneratorService.generateDeadlineEvent(
          eventData.matter,
          eventData.deadline
        );
        filename = `deadline-${eventData.matter.reference_number}`;
        break;
      case 'meeting':
        icsContent = ICSGeneratorService.generateMeetingEvent(eventData);
        filename = `meeting-${eventData.matter.reference_number}`;
        break;
      case 'payment':
        icsContent = ICSGeneratorService.generatePaymentReminderEvent(
          eventData.invoice,
          eventData.matter
        );
        filename = `payment-reminder-${eventData.invoice.invoice_number}`;
        break;
    }
    
    ICSGeneratorService.downloadICSFile(icsContent, filename);
    toast.success('Calendar event downloaded. Open the file to add to your calendar.');
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      icon={<CalendarIcon />}
    >
      {label}
    </Button>
  );
};
```

### 2. BulkExportModal Component

**Purpose**: Modal for bulk exporting upcoming deadlines

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Export Upcoming Deadlines                          [×]      │
├─────────────────────────────────────────────────────────────┤
│  Select date range:                                          │
│  From: [2024-10-11]  To: [2024-11-10]                       │
│                                                              │
│  Event types to include:                                     │
│  ☑ Court dates (3)                                          │
│  ☑ Filing deadlines (5)                                     │
│  ☑ Expected completion dates (8)                            │
│  ☑ Payment due dates (4)                                    │
│                                                              │
│  Preview (20 events):                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 2024-10-15  Court Date: Smith v Jones                │  │
│  │ 2024-10-18  Deadline: Estate Matter - Filing        │  │
│  │ 2024-10-20  Payment Due: John Smith - INV-001       │  │
│  │ ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│                              [Cancel]  [Export Events]       │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### 3. CalendarSettingsPanel Component

**Purpose**: Settings panel for configuring reminder preferences

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Calendar Integration Settings                               │
├─────────────────────────────────────────────────────────────┤
│  Default Reminders:                                          │
│                                                              │
│  Court Dates:                                                │
│  ☑ 1 day before                                             │
│  ☐ 1 week before                                            │
│                                                              │
│  Filing Deadlines:                                           │
│  ☑ 3 days before                                            │
│  ☑ 1 day before                                             │
│                                                              │
│  Client Meetings:                                            │
│  ☑ 1 hour before                                            │
│  ☐ 1 day before                                             │
│                                                              │
│  Payment Reminders:                                          │
│  ☑ 3 days before due date                                   │
│                                                              │
│                                            [Save Settings]    │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### Matter Detail Page

Add CalendarButton next to dates:

```typescript
// In MatterDetailPage.tsx
{matter.court_date && (
  <div className="flex items-center gap-2">
    <span>Court Date: {formatDate(matter.court_date)}</span>
    <CalendarButton
      eventType="court"
      eventData={matter}
      variant="icon"
      size="sm"
    />
  </div>
)}
```

### Dashboard

Add bulk export button:

```typescript
// In DashboardPage.tsx
<Button
  onClick={() => setShowBulkExportModal(true)}
  icon={<CalendarIcon />}
>
  Export Upcoming Deadlines
</Button>
```

### Invoice Detail Page

Add payment reminder button:

```typescript
// In InvoiceDetailPage.tsx
{invoice.due_date && (
  <CalendarButton
    eventType="payment"
    eventData={{ invoice, matter }}
    label="Add Payment Reminder"
  />
)}
```

## Mobile Support

### iOS

```typescript
// Detect iOS and use different approach
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
  // iOS can open .ics files directly
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  window.location.href = dataUrl;
} else {
  // Standard download for other platforms
  ICSGeneratorService.downloadICSFile(icsContent, filename);
}
```

### Android

Android handles .ics files through the download manager, so standard download works.

## Error Handling

1. **Download Blocked**: Show message with instructions to allow downloads
2. **Invalid Date**: Validate dates before generating .ics
3. **Missing Required Fields**: Provide sensible defaults
4. **File Generation Error**: Log error and show user-friendly message

## Testing Strategy

### Unit Tests
- Test .ics file generation for each event type
- Test date formatting functions
- Test text escaping
- Test alarm/reminder formatting

### Integration Tests
- Test CalendarButton click handling
- Test bulk export flow
- Test settings persistence

### Compatibility Tests
- Test .ics files with Google Calendar
- Test .ics files with Outlook
- Test .ics files with Apple Calendar
- Test on iOS devices
- Test on Android devices

## Performance

- Generate .ics files client-side (no server load)
- Cache reminder settings in localStorage
- Debounce bulk export preview

## Success Metrics

- 70%+ adoption within first month
- 5+ exports per user per week
- <5% compatibility issues
- 85%+ user satisfaction
