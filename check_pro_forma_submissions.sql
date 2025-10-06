-- Check all pro forma requests
SELECT 
    id,
    token,
    advocate_id,
    status,
    client_name,
    client_email,
    instructing_attorney_name,
    instructing_attorney_email,
    matter_title,
    matter_description,
    requested_action,
    created_at,
    submitted_at,
    processed_at
FROM pro_forma_requests
ORDER BY created_at DESC
LIMIT 20;

-- Count by status
SELECT 
    status,
    COUNT(*) as count
FROM pro_forma_requests
GROUP BY status;

-- Check recent submitted requests
SELECT 
    id,
    token,
    status,
    client_name,
    instructing_attorney_name,
    matter_title,
    submitted_at,
    created_at
FROM pro_forma_requests
WHERE status = 'submitted'
ORDER BY submitted_at DESC
LIMIT 10;

-- Check if advocate exists
SELECT 
    id,
    email,
    full_name,
    initials,
    practice_number
FROM advocates
LIMIT 5;

-- Check pro forma requests for specific advocate (replace with actual advocate_id)
-- SELECT * FROM pro_forma_requests WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3';
