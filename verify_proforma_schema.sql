-- Verify Pro Forma Invoice Schema Changes

-- 1. Check if matter_id is nullable in invoices table
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'invoices' 
AND column_name = 'matter_id';

-- 2. Check if the constraint exists
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'invoices'
AND constraint_name = 'invoices_matter_or_proforma_check';

-- 3. Check if the view exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'pro_forma_invoices_with_requests';

-- 4. Check if indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'invoices'
AND (indexname LIKE '%proforma%' OR indexname LIKE '%advocate%');

-- 5. First, let's see all column names in invoices table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- 6. Test query - Get any existing pro forma invoices
SELECT 
    id,
    invoice_number,
    matter_id,
    advocate_id,
    is_pro_forma,
    external_id,
    internal_notes,
    fees_amount,
    vat_amount,
    total_amount,
    status,
    created_at
FROM invoices
WHERE is_pro_forma = true
ORDER BY created_at DESC
LIMIT 5;
