-- Enable RLS on attorney_users table
ALTER TABLE attorney_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read their own attorney profile
CREATE POLICY "Users can read own attorney profile"
ON attorney_users
FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = attorney_users.email
));

-- Policy: Allow authenticated users to check if an email exists (for login validation)
CREATE POLICY "Allow email lookup for authentication"
ON attorney_users
FOR SELECT
USING (true);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update own attorney profile"
ON attorney_users
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = attorney_users.email
));

-- Policy: Allow service role to insert (for registration)
CREATE POLICY "Service role can insert attorney users"
ON attorney_users
FOR INSERT
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON attorney_users TO authenticated;
GRANT SELECT ON attorney_users TO anon;
GRANT INSERT ON attorney_users TO authenticated;
GRANT UPDATE ON attorney_users TO authenticated;

-- Add comment
COMMENT ON TABLE attorney_users IS 'Attorney (client) users who access the client portal';
