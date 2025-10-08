-- ============================================================================
-- AUTO-CREATE ADVOCATE RECORDS ON USER SIGNUP
-- This migration adds a trigger to automatically create an advocate record
-- when a new user signs up through Supabase Auth
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
  practice_num TEXT;
BEGIN
  -- Get user metadata from the auth.users table
  user_metadata := NEW.raw_user_meta_data;
  
  -- Generate a practice number if not provided
  practice_num := COALESCE(
    user_metadata->>'practice_number',
    'TEMP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Insert into advocates table
  INSERT INTO public.advocates (
    id,
    email,
    full_name,
    initials,
    practice_number,
    bar,
    year_admitted,
    hourly_rate,
    user_role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(user_metadata->>'full_name', 'New Advocate'),
    COALESCE(
      user_metadata->>'initials',
      UPPER(LEFT(SPLIT_PART(COALESCE(user_metadata->>'full_name', 'N A'), ' ', 1), 1)) || 
      UPPER(LEFT(SPLIT_PART(COALESCE(user_metadata->>'full_name', 'N A'), ' ', 2), 1))
    ),
    practice_num,
    CASE 
      WHEN user_metadata->>'bar' = 'cape_town' THEN 'cape_town'::bar_association
      ELSE 'johannesburg'::bar_association
    END,
    COALESCE((user_metadata->>'year_admitted')::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER),
    COALESCE((user_metadata->>'hourly_rate')::DECIMAL, 1500.00),
    CASE 
      WHEN user_metadata->>'user_type' = 'senior' THEN 'senior_advocate'::user_role
      ELSE 'junior_advocate'::user_role
    END,
    true,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create advocate record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON auth.users TO postgres, service_role;

-- Update existing users who don't have advocate records
INSERT INTO public.advocates (
  id,
  email,
  full_name,
  initials,
  practice_number,
  bar,
  year_admitted,
  hourly_rate,
  user_role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Existing User'),
  COALESCE(
    au.raw_user_meta_data->>'initials',
    'EU'
  ),
  'MIGRATED-' || SUBSTRING(au.id::TEXT, 1, 8),
  'johannesburg'::bar_association,
  COALESCE((au.raw_user_meta_data->>'year_admitted')::INTEGER, 2024),
  COALESCE((au.raw_user_meta_data->>'hourly_rate')::DECIMAL, 1500.00),
  CASE 
    WHEN au.raw_user_meta_data->>'user_type' = 'senior' THEN 'senior_advocate'::user_role
    ELSE 'junior_advocate'::user_role
  END,
  true,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.advocates a ON a.id = au.id
WHERE a.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates an advocate record when a new user signs up';