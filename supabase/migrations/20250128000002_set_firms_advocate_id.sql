-- ============================================================================
-- SET ADVOCATE_ID FOR EXISTING FIRMS
-- Run this AFTER the main migration to set the correct advocate_id
-- Replace 'YOUR_USER_ID' with your actual advocate ID
-- ============================================================================

-- Your user ID from the console error: dcea3d54-621b-4f9e-ae63-596b98ebd984
-- Update all existing firms to belong to this advocate
UPDATE firms 
SET advocate_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984'
WHERE advocate_id IS NULL;

-- Verify the update
SELECT 
  id,
  firm_name,
  attorney_name,
  email,
  advocate_id
FROM firms
ORDER BY created_at DESC;
