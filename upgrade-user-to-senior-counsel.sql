-- Upgrade User to Senior Counsel Package
-- User ID: dcea3d54-621b-4f9e-ae63-596b98ebd984
-- This script upgrades the user to the senior_counsel tier

-- ============================================================================
-- PART 1: Check if user exists and has a subscription
-- ============================================================================

-- Check current subscription status
SELECT 
  user_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  additional_users
FROM subscriptions
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';

-- ============================================================================
-- PART 2: Upgrade to Senior Counsel tier
-- ============================================================================

-- If subscription exists, update it
UPDATE subscriptions
SET 
  tier = 'senior_counsel',
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  cancel_at_period_end = FALSE,
  additional_users = 0,
  updated_at = NOW()
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';

-- If subscription doesn't exist, create it
INSERT INTO subscriptions (
  user_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  additional_users
)
SELECT
  'dcea3d54-621b-4f9e-ae63-596b98ebd984',
  'senior_counsel',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  FALSE,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions 
  WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984'
);

-- ============================================================================
-- PART 3: Log the change in subscription history
-- ============================================================================

INSERT INTO subscription_history (
  subscription_id,
  tier,
  status,
  changed_at,
  changed_by,
  reason
)
SELECT
  id,
  'senior_counsel',
  'active',
  NOW(),
  user_id,
  'Manual upgrade to Senior Counsel tier'
FROM subscriptions
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';

-- ============================================================================
-- PART 4: Verify the upgrade
-- ============================================================================

-- Check updated subscription
SELECT 
  user_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  additional_users,
  cancel_at_period_end,
  updated_at
FROM subscriptions
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';

-- Check subscription history
SELECT 
  tier,
  status,
  changed_at,
  reason
FROM subscription_history
WHERE subscription_id = (
  SELECT id FROM subscriptions 
  WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984'
)
ORDER BY changed_at DESC
LIMIT 5;

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT tier INTO v_tier
  FROM subscriptions
  WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';
  
  IF v_tier = 'senior_counsel' THEN
    RAISE NOTICE '✓ User successfully upgraded to Senior Counsel tier!';
    RAISE NOTICE '✓ Subscription is now active';
    RAISE NOTICE '✓ Period: 30 days from now';
    RAISE NOTICE '✓ Features unlocked:';
    RAISE NOTICE '  - Unlimited active matters';
    RAISE NOTICE '  - Up to 5 team members (+ additional users)';
    RAISE NOTICE '  - Advanced analytics';
    RAISE NOTICE '  - Priority support';
    RAISE NOTICE '  - Custom branding';
  ELSE
    RAISE NOTICE '⚠ Upgrade may have failed. Current tier: %', v_tier;
  END IF;
END $$;
