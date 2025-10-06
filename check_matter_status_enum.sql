-- Check valid matter_status enum values
SELECT 
    enumlabel as status_value
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'matter_status'
)
ORDER BY enumsortorder;
