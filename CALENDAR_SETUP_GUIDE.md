# Calendar Setup Guide

## 🎯 What This Does

Transforms your calendar from an empty placeholder into a **fully functional scheduling system** with:
- ✅ Court appearances
- ✅ Client consultations  
- ✅ Meetings
- ✅ Deadlines
- ✅ Sample events pre-loaded

---

## 📋 Quick Setup (2 Minutes)

### **Step 1: Run SQL Migration**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/xfmvvxhvjqwpqpxqvkqp
2. **Navigate to**: SQL Editor (left sidebar)
3. **Click**: "New Query"
4. **Open file**: `supabase/migrations/20251011000000_add_calendar_events.sql`
5. **Copy all contents** and paste into SQL Editor
6. **Click**: "Run" or press `Ctrl+Enter`

### **Step 2: Refresh Your App**

1. Go to Calendar page
2. You should see:
   - **4 sample events** created
   - **Stats showing** event counts
   - **Events on calendar** grid
   - **Upcoming events** list

---

## ✨ Features Now Available

### **1. Calendar Grid**
- Month/Week/Day views
- Events displayed on dates
- Color-coded by type:
  - 🔵 **Court** - Blue
  - 🟡 **Consultation** - Gold
  - 🟢 **Meeting** - Green
  - 🔴 **Deadline** - Red

### **2. Event Stats**
- Events Today
- Court Appearances
- Consultations
- Virtual Meetings

### **3. Upcoming Events List**
- Next 5 events
- Shows time, location
- Virtual meeting links
- Matter association

### **4. Event Types**
- **Court**: Court appearances and hearings
- **Consultation**: Client meetings
- **Meeting**: Internal meetings
- **Deadline**: Filing deadlines
- **Other**: Miscellaneous events

---

## 📊 Sample Events Created

After running the SQL, you'll have 4 sample events:

### **1. High Court Hearing**
- **Type**: Court
- **Date**: 3 days from now
- **Time**: 09:00 - 11:00
- **Location**: Johannesburg High Court, Court Room 5A

### **2. Client Consultation**
- **Type**: Consultation
- **Date**: Tomorrow
- **Time**: 14:00 - 15:00
- **Location**: Virtual Meeting
- **Link**: Google Meet

### **3. Filing Deadline**
- **Type**: Deadline
- **Date**: 7 days from now
- **All Day**: Yes
- **Title**: Notice of Appeal

### **4. Chambers Meeting**
- **Type**: Meeting
- **Date**: 5 days from now
- **Time**: 10:00 - 11:00
- **Location**: Chambers Conference Room
- **Attendees**: Senior Counsel, Junior Counsel, Clerk

---

## 🎨 Calendar Features

### **Navigation**
- **Month/Week/Day** toggle
- **Previous/Next** month buttons
- **Today** button to jump to current date

### **Event Display**
- Events shown on calendar dates
- Up to 2 events visible per day
- "+X more" indicator for additional events
- Click date to see all events

### **Event Details**
- Title and description
- Start and end times
- Location (physical or virtual)
- Virtual meeting links
- Associated matter
- Attendees list

---

## 🔧 Database Structure

### **Table: `calendar_events`**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| advocate_id | UUID | Your advocate ID |
| matter_id | UUID | Linked matter (optional) |
| title | TEXT | Event title |
| description | TEXT | Event description |
| event_type | VARCHAR | court, consultation, meeting, deadline, other |
| start_date | TIMESTAMPTZ | Start date/time |
| end_date | TIMESTAMPTZ | End date/time |
| all_day | BOOLEAN | All-day event flag |
| location | TEXT | Physical location |
| location_type | VARCHAR | physical, virtual, phone |
| virtual_meeting_link | TEXT | Meeting URL |
| attendees | JSONB | Array of attendees |
| reminder_minutes | INTEGER | Reminder time (default 30) |
| status | VARCHAR | scheduled, completed, cancelled |

---

## 🚀 Future Enhancements

### **Phase 2: Event Creation**
- Create new events from UI
- Edit existing events
- Delete events
- Drag-and-drop rescheduling

### **Phase 3: Reminders**
- Email reminders
- SMS reminders
- Push notifications
- Customizable reminder times

### **Phase 4: Integration**
- Sync with Google Calendar
- Sync with Outlook
- iCal export
- Calendar sharing

### **Phase 5: Advanced Features**
- Recurring events
- Event templates
- Conflict detection
- Availability sharing

---

## ✅ Verification

After running the SQL, verify it worked:

```sql
-- Check events table exists
SELECT COUNT(*) FROM calendar_events;
-- Should return: 4

-- View your events
SELECT title, event_type, start_date, location 
FROM calendar_events 
ORDER BY start_date;
```

---

## 🎯 What You Can Do Now

1. **View Events**: See all your scheduled events
2. **Navigate Calendar**: Browse months and dates
3. **See Stats**: Quick overview of upcoming events
4. **View Details**: Click events to see full information

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify RLS policies are enabled
3. Confirm you're authenticated
4. Check browser console for errors

---

*Priority: High - Makes calendar fully functional*
*Estimated Time: 2 minutes to run SQL*
*Status: Ready to deploy*
