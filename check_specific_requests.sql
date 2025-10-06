-- Check the specific requests from your console logs
SELECT 
    id,
    token,
    advocate_id,
    status,
    client_name,
    client_email,
    instructing_attorney_name,
    instructing_attorney_firm,
    instructing_attorney_email,
    matter_title,
    matter_description,
    matter_type,
    urgency_level,
    requested_action,
    created_at,
    submitted_at,
    processed_at,
    expires_at
FROM pro_forma_requests
WHERE token IN (
    '1da2a2e6-6a55-4c1c-88b9-98a3f499e3a0',
    '4b47d638-5585-4211-8e0b-6c4747e5eb7e'
);

-- Get the advocate info for these requests
SELECT 
    pfr.token,
    pfr.status,
    pfr.client_name,
    pfr.submitted_at,
    a.email as advocate_email,
    a.full_name as advocate_name
FROM pro_forma_requests pfr
LEFT JOIN advocates a ON pfr.advocate_id = a.id
WHERE pfr.token IN (
    '1da2a2e6-6a55-4c1c-88b9-98a3f499e3a0',
    '4b47d638-5585-4211-8e0b-6c4747e5eb7e'
);

-- Check all columns for these specific requests
SELECT * FROM pro_forma_requests
WHERE token IN (
    '1da2a2e6-6a55-4c1c-88b9-98a3f499e3a0',
    '4b47d638-5585-4211-8e0b-6c4747e5eb7e'
);
