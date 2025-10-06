-- Allow null matter_id for pro forma invoices generated from requests
-- This enables tracking of pro forma invoices that don't have an associated matter yet

ALTER TABLE invoices 
ALTER COLUMN matter_id DROP NOT NULL;

-- Add a check constraint to ensure either matter_id exists OR it's marked as pro forma
ALTER TABLE invoices 
ADD CONSTRAINT invoices_matter_or_proforma_check 
CHECK (
  matter_id IS NOT NULL 
  OR internal_notes LIKE 'pro_forma%'
);

-- Add comment explaining the nullable matter_id
COMMENT ON COLUMN invoices.matter_id IS 
'Matter ID - nullable for pro forma invoices generated from requests without an associated matter';
