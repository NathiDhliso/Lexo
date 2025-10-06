INSERT INTO advocates (
    id, 
    email, 
    full_name, 
    initials,
    practice_number,
    bar,
    year_admitted,
    hourly_rate,
    created_at, 
    updated_at
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    COALESCE(
        raw_user_meta_data->>'initials',
        LEFT(COALESCE(raw_user_meta_data->>'full_name', email), 2)
    ) as initials,
    COALESCE(raw_user_meta_data->>'practice_number', 'TEMP-' || LEFT(id::text, 8)) as practice_number,
    COALESCE((raw_user_meta_data->>'bar')::bar_association, 'johannesburg'::bar_association) as bar,
    COALESCE((raw_user_meta_data->>'year_admitted')::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer) as year_admitted,
    COALESCE((raw_user_meta_data->>'hourly_rate')::decimal, 1500.00) as hourly_rate,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM advocates)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.advocates (
        id, 
        email,
        full_name, 
        initials,
        practice_number,
        bar,
        year_admitted,
        hourly_rate,
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(
            NEW.raw_user_meta_data->>'initials',
            LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 2)
        ),
        COALESCE(NEW.raw_user_meta_data->>'practice_number', 'TEMP-' || LEFT(NEW.id::text, 8)),
        COALESCE((NEW.raw_user_meta_data->>'bar')::bar_association, 'johannesburg'::bar_association),
        COALESCE((NEW.raw_user_meta_data->>'year_admitted')::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer),
        COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::decimal, 1500.00),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

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

ALTER TABLE pro_forma_requests 
ALTER COLUMN token DROP DEFAULT;

ALTER TABLE pro_forma_requests 
ALTER COLUMN token SET DEFAULT gen_random_uuid()::text;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pro_forma_requests' 
        AND column_name = 'requested_action'
    ) THEN
        ALTER TABLE pro_forma_requests 
        ADD COLUMN requested_action pro_forma_action;
    END IF;
END $$;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_name TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_firm TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_email TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_phone TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS matter_title TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(15,2);

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS additional_notes TEXT;
