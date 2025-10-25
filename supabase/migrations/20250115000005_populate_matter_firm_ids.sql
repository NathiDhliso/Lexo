-- Populate firm_id on matters table
-- Maps existing matters to firms based on instructing_attorney_user_id

-- Update matters with firm_id based on attorney_user_id mapping
UPDATE matters m
SET firm_id = f.id,
    updated_at = NOW()
FROM firms f
WHERE m.instructing_attorney_user_id = f.id
  AND m.firm_id IS NULL;

-- Log results
DO $$
DECLARE
  updated_count INTEGER;
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count 
  FROM matters 
  WHERE firm_id IS NOT NULL;
  
  SELECT COUNT(*) INTO null_count 
  FROM matters 
  WHERE firm_id IS NULL AND deleted_at IS NULL;
  
  RAISE NOTICE 'Matters updated with firm_id: %', updated_count;
  RAISE NOTICE 'Matters still without firm_id: %', null_count;
  
  IF null_count > 0 THEN
    RAISE WARNING 'There are % matters without a firm_id. These may need manual review.', null_count;
  END IF;
END $$;

-- For matters without a matching firm, try to match by email if available
-- This handles cases where instructing_attorney_user_id might be NULL
UPDATE matters m
SET firm_id = f.id,
    updated_at = NOW()
FROM firms f
WHERE m.firm_id IS NULL
  AND m.instructing_attorney_email IS NOT NULL
  AND m.instructing_attorney_email = f.email
  AND m.deleted_at IS NULL;

-- Final count
DO $$
DECLARE
  final_null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO final_null_count 
  FROM matters 
  WHERE firm_id IS NULL AND deleted_at IS NULL;
  
  IF final_null_count > 0 THEN
    RAISE WARNING 'After email matching, % matters still without firm_id', final_null_count;
    RAISE NOTICE 'These matters may need manual assignment or a default firm';
  ELSE
    RAISE NOTICE 'All active matters successfully mapped to firms!';
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN matters.firm_id IS 'Foreign key to firms table - populated from instructing_attorney_user_id';

