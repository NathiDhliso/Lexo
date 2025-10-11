-- ============================================================================
-- FIX AUTH TRIGGER TO PREVENT 500 ERRORS
-- This migration fixes the handle_new_user trigger to be more robust
-- ============================================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
  practice_num TEXT;
  user_full_name TEXT;
  user_initials TEXT;
  user_bar bar_association;
  user_year INTEGER;
  user_rate DECIMAL;
  user_role_type user_role;
BEGIN
  -- Safely extract metadata
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
  
  -- Validate email exists
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE WARNING 'User % has no email, skipping advocate creation', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Check if advocate already exists
  IF EXISTS (SELECT 1 FROM public.advocates WHERE id = NEW.id) THEN
    RAISE NOTICE 'Advocate record already exists for user %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Prepare values with safe defaults
  user_full_name := COALESCE(user_metadata->>'full_name', 'New Advocate');
  
  -- Generate initials safely
  user_initials := COALESCE(
    user_metadata->>'initials',
    UPPER(SUBSTRING(user_full_name, 1, 1)) || UPPER(SUBSTRING(SPLIT_PART(user_full_name, ' ', 2), 1, 1))
  );
  IF user_initials = '' THEN
    user_initials := 'NA';
  END IF;
  
  -- Generate practice number
  practice_num := COALESCE(
    user_metadata->>'practice_number',
    'TEMP-' || TO_CHAR(NOW(), 'YYYY-DDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Determine bar association
  BEGIN
    user_bar := CASE 
      WHEN user_metadata->>'bar' = 'cape_town' THEN 'cape_town'::bar_association
      WHEN user_metadata->>'bar' = 'johannesburg' THEN 'johannesburg'::bar_association
      ELSE 'johannesburg'::bar_association
    END;
  EXCEPTION
    WHEN OTHERS THEN
      user_bar := 'johannesburg'::bar_association;
  END;
  
  -- Determine year admitted
  BEGIN
    user_year := COALESCE((user_metadata->>'year_admitted')::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER);
  EXCEPTION
    WHEN OTHERS THEN
      user_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  END;
  
  -- Determine hourly rate
  BEGIN
    user_rate := COALESCE((user_metadata->>'hourly_rate')::DECIMAL, 1500.00);
  EXCEPTION
    WHEN OTHERS THEN
      user_rate := 1500.00;
  END;
  
  -- Determine user role
  BEGIN
    user_role_type := CASE 
      WHEN user_metadata->>'user_type' = 'senior' THEN 'senior_advocate'::user_role
      WHEN user_metadata->>'user_type' = 'junior' THEN 'junior_advocate'::user_role
      ELSE 'junior_advocate'::user_role
    END;
  EXCEPTION
    WHEN OTHERS THEN
      user_role_type := 'junior_advocate'::user_role;
  END;
  
  -- Insert into advocates table with all safety checks
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
      user_role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      user_full_name,
      user_initials,
      practice_num,
      user_bar,
      user_year,
      user_rate,
      user_role_type,
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Successfully created advocate record for user %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Advocate record already exists for user % (race condition)', NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth operation
      RAISE WARNING 'Failed to create advocate record for user %: % (SQLSTATE: %)', 
        NEW.id, SQLERRM, SQLSTATE;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comment
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates an advocate record when a new user signs up (with robust error handling)';

-- Ensure permissions are correct
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT SELECT ON auth.users TO postgres, service_role;
