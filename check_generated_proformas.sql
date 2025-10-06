-- Check if pro forma invoices were created for these requests
SELECT 
    i.id,
    i.invoice_number,
    i.matter_id,
    i.is_pro_forma,
    i.external_id,
    i.internal_notes,
    i.fees_amount,
    i.total_amount,
    i.status,
    i.created_at,
    -- Try to match with pro forma requests
    pfr.matter_title,
    pfr.client_name
FROM invoices i
LEFT JOIN pro_forma_requests pfr ON i.external_id = pfr.id::text
WHERE i.advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
AND i.is_pro_forma = true
ORDER BY i.created_at DESC;

-- Also check by internal_notes
SELECT 
    id,
    invoice_number,
    is_pro_forma,
    external_id,
    internal_notes,
    fees_amount,
    total_amount,
    created_at
FROM invoices
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
AND (
    internal_notes LIKE '%pro_forma_request:%'
    OR external_id IN (
        '4fd19ca4-0ef5-4991-b97e-dec76dc6c958',
        '11d131de-7f30-4600-a53d-dc01d0d099e3',
        'a34ffe7e-dac5-478a-bd4d-f488c16a756d'
    )
)
ORDER BY created_at DESC;

-- Reset the requests back to 'submitted' status so they show up again
UPDATE pro_forma_requests
SET 
    status = 'submitted',
    processed_at = NULL
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
AND status = 'processed';

-- Verify the reset
SELECT 
    id,
    matter_title,
    status,
    processed_at
FROM pro_forma_requests
WHERE advocate_id = '207b0dd4-3c0f-4fd9-8f5c-c40f712d61d3'
ORDER BY created_at DESC;
