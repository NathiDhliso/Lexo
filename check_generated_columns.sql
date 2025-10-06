-- Check which columns are generated in the invoices table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_generated,
    generation_expression
FROM information_schema.columns
WHERE table_name = 'invoices'
AND is_generated = 'ALWAYS'
ORDER BY ordinal_position;
