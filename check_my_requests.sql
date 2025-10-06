-- Check pro forma requests for your advocate ID
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
    expires_at
FROM pro_forma_requests
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
ORDER BY created_at DESC;

-- Count requests by status for your advocate
SELECT 
    status,
    COUNT(*) as count
FROM pro_forma_requests
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
GROUP BY status;

-- Check if there are ANY pro forma requests in the table
SELECT COUNT(*) as total_requests FROM pro_forma_requests;

-- Check the most recent 5 requests regardless of advocate
SELECT 
    id,
    advocate_id,
    status,
    client_name,
    created_at,
    submitted_at
FROM pro_forma_requests
ORDER BY created_at DESC
LIMIT 5;
