SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pro_forma_requests'
ORDER BY ordinal_position;

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'pro_forma_requests';

SELECT COUNT(*) as total_records FROM pro_forma_requests;

SELECT token, COUNT(*) as count 
FROM pro_forma_requests 
GROUP BY token 
HAVING COUNT(*) > 1;
