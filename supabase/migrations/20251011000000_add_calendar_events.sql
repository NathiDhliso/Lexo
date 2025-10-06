-- Create calendar events table for advocates
-- Enables scheduling of court appearances, consultations, meetings, and deadlines

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('court', 'consultation', 'meeting', 'deadline', 'other')),
  
  -- Date and time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  
  -- Location
  location TEXT,
  location_type VARCHAR(50) CHECK (location_type IN ('physical', 'virtual', 'phone')),
  virtual_meeting_link TEXT,
  
  -- Attendees
  attendees JSONB DEFAULT '[]'::jsonb,
  
  -- Reminders
  reminder_minutes INTEGER DEFAULT 30,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_reminder CHECK (reminder_minutes >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_advocate_id ON calendar_events(advocate_id);
CREATE INDEX idx_calendar_events_matter_id ON calendar_events(matter_id);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_end_date ON calendar_events(end_date);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Advocates can view their own events" ON calendar_events
  FOR SELECT USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can insert their own events" ON calendar_events
  FOR INSERT WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own events" ON calendar_events
  FOR UPDATE USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own events" ON calendar_events
  FOR DELETE USING (advocate_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at 
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for upcoming events
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
  e.*,
  m.title as matter_title,
  m.client_name
FROM calendar_events e
LEFT JOIN matters m ON e.matter_id = m.id
WHERE e.start_date >= NOW()
  AND e.status = 'scheduled'
ORDER BY e.start_date ASC;

-- Add comments
COMMENT ON TABLE calendar_events IS 'Calendar events for advocates including court appearances, consultations, and meetings';
COMMENT ON COLUMN calendar_events.title IS 'Event title (e.g., "High Court Hearing - Smith v Jones")';
COMMENT ON COLUMN calendar_events.event_type IS 'Type of event: court, consultation, meeting, deadline, or other';
COMMENT ON COLUMN calendar_events.start_date IS 'Event start date and time';
COMMENT ON COLUMN calendar_events.end_date IS 'Event end date and time';
COMMENT ON COLUMN calendar_events.all_day IS 'Whether this is an all-day event';
COMMENT ON COLUMN calendar_events.location IS 'Physical location or meeting details';
COMMENT ON COLUMN calendar_events.attendees IS 'JSON array of attendee names/emails';
COMMENT ON COLUMN calendar_events.reminder_minutes IS 'Minutes before event to send reminder (default 30)';

-- Insert sample events for testing
DO $$
DECLARE
  v_advocate_id UUID;
  v_matter_id UUID;
BEGIN
  -- Get first advocate
  SELECT id INTO v_advocate_id FROM advocates LIMIT 1;
  
  IF v_advocate_id IS NOT NULL THEN
    -- Get first matter for this advocate
    SELECT id INTO v_matter_id FROM matters WHERE advocate_id = v_advocate_id LIMIT 1;
    
    -- Insert sample court appearance
    INSERT INTO calendar_events (
      advocate_id,
      matter_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      location_type,
      status
    ) VALUES (
      v_advocate_id,
      v_matter_id,
      'High Court Hearing',
      'Motion hearing for preliminary objections',
      'court',
      NOW() + INTERVAL '3 days' + INTERVAL '9 hours',
      NOW() + INTERVAL '3 days' + INTERVAL '11 hours',
      'Johannesburg High Court, Court Room 5A',
      'physical',
      'scheduled'
    );
    
    -- Insert sample consultation
    INSERT INTO calendar_events (
      advocate_id,
      matter_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      location_type,
      virtual_meeting_link,
      status
    ) VALUES (
      v_advocate_id,
      v_matter_id,
      'Client Consultation',
      'Initial consultation regarding commercial dispute',
      'consultation',
      NOW() + INTERVAL '1 day' + INTERVAL '14 hours',
      NOW() + INTERVAL '1 day' + INTERVAL '15 hours',
      'Virtual Meeting',
      'virtual',
      'https://meet.google.com/abc-defg-hij',
      'scheduled'
    );
    
    -- Insert sample deadline
    INSERT INTO calendar_events (
      advocate_id,
      matter_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      all_day,
      status
    ) VALUES (
      v_advocate_id,
      v_matter_id,
      'Filing Deadline - Notice of Appeal',
      'Last day to file notice of appeal',
      'deadline',
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '7 days',
      TRUE,
      'scheduled'
    );
    
    -- Insert sample meeting
    INSERT INTO calendar_events (
      advocate_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      location_type,
      attendees,
      status
    ) VALUES (
      v_advocate_id,
      'Chambers Meeting',
      'Monthly chambers meeting to discuss administrative matters',
      'meeting',
      NOW() + INTERVAL '5 days' + INTERVAL '10 hours',
      NOW() + INTERVAL '5 days' + INTERVAL '11 hours',
      'Chambers Conference Room',
      'physical',
      '["Senior Counsel", "Junior Counsel", "Clerk"]'::jsonb,
      'scheduled'
    );
    
    RAISE NOTICE '✓ Sample events created for advocate %', v_advocate_id;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Calendar events table created successfully!';
  RAISE NOTICE '✓ RLS policies configured';
  RAISE NOTICE '✓ Indexes created for performance';
  RAISE NOTICE '✓ Sample events inserted for testing';
END $$;
