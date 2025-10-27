-- Create advocate_billing_preferences table
-- This table stores billing preferences and workflow settings for advocates

CREATE TABLE IF NOT EXISTS public.advocate_billing_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advocate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Billing preferences
    default_billing_model TEXT NOT NULL DEFAULT 'brief-fee' CHECK (default_billing_model IN ('brief-fee', 'time-based', 'quick-opinion')),
    primary_workflow TEXT DEFAULT 'brief-fee' CHECK (primary_workflow IN ('brief-fee', 'time-based', 'mixed')),
    
    -- Dashboard preferences
    dashboard_widgets JSONB DEFAULT '["active-matters", "pending-invoices", "recent-activity"]'::jsonb,
    show_time_tracking_by_default BOOLEAN DEFAULT false,
    auto_create_milestones BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(advocate_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advocate_billing_preferences_advocate_id ON public.advocate_billing_preferences(advocate_id);

-- Enable RLS
ALTER TABLE public.advocate_billing_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own billing preferences" ON public.advocate_billing_preferences
    FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "Users can insert their own billing preferences" ON public.advocate_billing_preferences
    FOR INSERT WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "Users can update their own billing preferences" ON public.advocate_billing_preferences
    FOR UPDATE USING (auth.uid() = advocate_id);

CREATE POLICY "Users can delete their own billing preferences" ON public.advocate_billing_preferences
    FOR DELETE USING (auth.uid() = advocate_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_advocate_billing_preferences_updated_at
    BEFORE UPDATE ON public.advocate_billing_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.advocate_billing_preferences IS 'Stores billing preferences and workflow settings for advocates';