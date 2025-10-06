-- Check if you have any matters
SELECT 
    id,
    advocate_id,
    title,
    client_name,
    status,
    fee_type,
    client_type,
    risk_level
FROM matters
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
LIMIT 1;

-- If no matters exist, manually create the placeholder
INSERT INTO matters (
    id,
    advocate_id,
    reference_number,
    title,
    description,
    client_name,
    instructing_attorney,
    matter_type,
    status,
    bar,
    fee_type,
    risk_level,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3',
    'PF-PLACEHOLDER',
    'Pro Forma Placeholder',
    'System placeholder matter for pro forma invoices',
    'Pro Forma Requests',
    'System',
    'civil',
    'active',
    'johannesburg',
    'standard',
    'low',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify it was created
SELECT * FROM matters WHERE id = '00000000-0000-0000-0000-000000000000';
