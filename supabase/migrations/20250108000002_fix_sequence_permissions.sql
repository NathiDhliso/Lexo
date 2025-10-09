-- Fix permissions for quote_number_seq sequence and generate_quote_number function
-- This resolves the "permission denied for sequence quote_number_seq" error

-- Grant permissions on the sequence to authenticated users
GRANT USAGE, SELECT ON SEQUENCE quote_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE quote_number_seq TO service_role;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION generate_quote_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_quote_number() TO service_role;