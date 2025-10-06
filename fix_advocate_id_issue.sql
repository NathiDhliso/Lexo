-- REMOTE DATABASE FIX: advocate_id column issue
-- Run this script in your Supabase Dashboard SQL Editor
-- This will diagnose and fix the missing advocate_id column error

-- Step 1: Check if calendar_events table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'calendar_events'
    ) THEN
        RAISE NOTICE 'calendar_events table does not exist. Creating it now...';
        
        -- Create calendar_events table
        CREATE TABLE calendar_events (
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

        -- Create trigger function if it doesn't exist
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ language 'plpgsql';

        -- Add trigger for updated_at
        CREATE TRIGGER update_calendar_events_updated_at 
          BEFORE UPDATE ON calendar_events
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'calendar_events table created successfully with advocate_id column';
    ELSE
        RAISE NOTICE 'calendar_events table already exists';
        
        -- Check if advocate_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'calendar_events' 
            AND column_name = 'advocate_id'
        ) THEN
            RAISE NOTICE 'advocate_id column missing. Adding it now...';
            ALTER TABLE calendar_events ADD COLUMN advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE;
            CREATE INDEX idx_calendar_events_advocate_id ON calendar_events(advocate_id);
            RAISE NOTICE 'advocate_id column added successfully';
        ELSE
            RAISE NOTICE 'advocate_id column already exists in calendar_events table';
        END IF;
    END IF;
END $$;

-- Step 2: Verify the fix
SELECT 
    'calendar_events' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'calendar_events'
    ) AS table_exists,
    EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'calendar_events' 
        AND column_name = 'advocate_id'
    ) AS advocate_id_column_exists;

-- Step 3: Show table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'calendar_events'
ORDER BY ordinal_position;

-- Step 4: Test the fix with a simple query
SELECT 'Test query successful - advocate_id column is accessible' as status
FROM calendar_events 
WHERE advocate_id IS NOT NULL 
LIMIT 1;