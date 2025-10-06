-- Check all enum values for matters table
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('matter_status', 'fee_type', 'client_type', 'risk_level', 'bar_association')
ORDER BY t.typname, e.enumsortorder;
