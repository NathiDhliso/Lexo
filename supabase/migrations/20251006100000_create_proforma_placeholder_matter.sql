-- Create a placeholder matter for pro forma invoices
-- This allows pro forma invoices to have a valid matter_id without creating real matters

-- First, ensure we have a system user (use the first advocate or create a placeholder)
DO $$
DECLARE
    system_advocate_id UUID;
BEGIN
    -- Try to get the first advocate
    SELECT id INTO system_advocate_id FROM advocates LIMIT 1;
    
    -- If no advocates exist, we'll use a placeholder UUID
    IF system_advocate_id IS NULL THEN
        system_advocate_id := '00000000-0000-0000-0000-000000000001';
    END IF;
    
    -- Insert the placeholder matter if it doesn't exist
    INSERT INTO matters (
        id,
        advocate_id,
        title,
        description,
        client_name,
        status,
        bar,
        client_type,
        fee_type,
        risk_level,
        created_at,
        updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        system_advocate_id,
        'Pro Forma Placeholder',
        'System placeholder matter for pro forma invoices without associated matters',
        'Pro Forma Requests',
        'potential',
        'johannesburg',
        'individual',
        'hourly',
        'low',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Add comment
COMMENT ON TABLE matters IS 'Matters table - includes placeholder matter (00000000-0000-0000-0000-000000000000) for pro forma invoices';
