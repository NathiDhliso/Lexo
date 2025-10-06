-- Create a view for pro forma invoices with their associated request details
CREATE OR REPLACE VIEW pro_forma_invoices_with_requests AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.advocate_id,
  i.matter_title,
  i.client_name,
  i.invoice_date,
  i.due_date,
  i.amount,
  i.vat_amount,
  i.total_amount,
  i.fee_narrative,
  i.status,
  i.created_at,
  i.updated_at,
  -- Extract request ID from internal_notes
  CASE 
    WHEN i.internal_notes LIKE 'pro_forma_request:%' 
    THEN SUBSTRING(i.internal_notes FROM 'pro_forma_request:(.*)$')::UUID
    ELSE NULL
  END as request_id,
  -- Join with pro_forma_requests if available
  pfr.instructing_attorney_name,
  pfr.instructing_attorney_firm,
  pfr.instructing_attorney_email,
  pfr.matter_description,
  pfr.submitted_at as request_submitted_at
FROM invoices i
LEFT JOIN pro_forma_requests pfr ON 
  CASE 
    WHEN i.internal_notes LIKE 'pro_forma_request:%' 
    THEN SUBSTRING(i.internal_notes FROM 'pro_forma_request:(.*)$')::UUID
    ELSE NULL
  END = pfr.id
WHERE i.internal_notes LIKE 'pro_forma%';

-- Add comment
COMMENT ON VIEW pro_forma_invoices_with_requests IS 
'View combining pro forma invoices with their originating request details';

-- Create index on internal_notes for faster pro forma queries
CREATE INDEX IF NOT EXISTS idx_invoices_internal_notes_proforma 
ON invoices(internal_notes) 
WHERE internal_notes LIKE 'pro_forma%';

-- Add index on advocate_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_invoices_advocate_id 
ON invoices(advocate_id);
