-- Add missing columns to matters table
-- These columns are used by Quick Brief Capture and Matter Request workflows

-- Create urgency enum type
CREATE TYPE matter_urgency AS ENUM ('routine', 'standard', 'urgent', 'emergency');

-- Add urgency column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS urgency matter_urgency DEFAULT 'standard';

-- Add practice area column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS practice_area TEXT;

-- Add deadline date column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS deadline_date DATE;

-- Add creation source column (tracks how the matter was created)
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS creation_source TEXT;

-- Add quick create flag
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS is_quick_create BOOLEAN DEFAULT false;

-- Add date accepted column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS date_accepted TIMESTAMPTZ;

-- Add date commenced column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS date_commenced TIMESTAMPTZ;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matters_urgency ON matters(urgency);
CREATE INDEX IF NOT EXISTS idx_matters_practice_area ON matters(practice_area);
CREATE INDEX IF NOT EXISTS idx_matters_deadline_date ON matters(deadline_date);
CREATE INDEX IF NOT EXISTS idx_matters_creation_source ON matters(creation_source);

-- Add comments
COMMENT ON COLUMN matters.urgency IS 'Urgency level of the matter: routine, standard, urgent, or emergency';
COMMENT ON COLUMN matters.practice_area IS 'Practice area or legal specialty for the matter';
COMMENT ON COLUMN matters.deadline_date IS 'Deadline date for the matter';
COMMENT ON COLUMN matters.creation_source IS 'Source of matter creation (e.g., quick_brief_capture, attorney_request)';
COMMENT ON COLUMN matters.is_quick_create IS 'Flag indicating if matter was created via quick create workflow';
COMMENT ON COLUMN matters.date_accepted IS 'Date when the matter was accepted by the advocate';
COMMENT ON COLUMN matters.date_commenced IS 'Date when work on the matter commenced';
