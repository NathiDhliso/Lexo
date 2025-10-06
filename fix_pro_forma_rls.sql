DROP POLICY IF EXISTS "Advocates can insert pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Advocates can view their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Advocates can update their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Advocates can delete their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Public can view pro_forma_requests by token" ON pro_forma_requests;
DROP POLICY IF EXISTS "Public can submit pending pro_forma_requests" ON pro_forma_requests;

CREATE POLICY "Advocates can insert pro_forma_requests"
ON pro_forma_requests FOR INSERT
WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "Advocates can view their own pro_forma_requests"
ON pro_forma_requests FOR SELECT
USING (auth.uid() = advocate_id);

CREATE POLICY "Advocates can update their own pro_forma_requests"
ON pro_forma_requests FOR UPDATE
USING (auth.uid() = advocate_id);

CREATE POLICY "Advocates can delete their own pro_forma_requests"
ON pro_forma_requests FOR DELETE
USING (auth.uid() = advocate_id);

CREATE POLICY "Public can view pro_forma_requests by token"
ON pro_forma_requests FOR SELECT
USING (expires_at > NOW());

CREATE POLICY "Public can submit pending pro_forma_requests"
ON pro_forma_requests FOR UPDATE
USING (status = 'pending' AND expires_at > NOW())
WITH CHECK (
  (status = 'submitted' AND expires_at > NOW()) OR
  (status = 'pending' AND expires_at > NOW())
);
