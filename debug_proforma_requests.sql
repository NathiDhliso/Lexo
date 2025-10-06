-- Debug: Check all pro forma requests for your advocate
SELECT 
    id,
    advocate_id,
    status,
    matter_title,
    client_name,
    instructing_attorney_name,
    requested_action,
    created_at,
    submitted_at,
    processed_at
FROM pro_forma_requests
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
ORDER BY created_at DESC;

-- Check count by status
SELECT 
    status,
    COUNT(*) as count
FROM pro_forma_requests
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
GROUP BY status;

-- Check if any were marked as processed
SELECT 
    id,
    matter_title,
    status,
    processed_at
FROM pro_forma_requests
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
AND status = 'processed'
ORDER BY processed_at DESC;
