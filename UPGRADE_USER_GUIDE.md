# Upgrade User to Senior Counsel

## Quick Steps

### Option 1: Run SQL Script (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste contents of `upgrade-user-to-senior-counsel.sql`
3. Click "Run"
4. User is now on Senior Counsel tier!

### Option 2: Manual SQL Command
Run this single command in Supabase SQL Editor:

```sql
-- Quick upgrade command
UPDATE subscriptions
SET 
  tier = 'senior_counsel',
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  cancel_at_period_end = FALSE,
  updated_at = NOW()
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';

-- If no subscription exists, create one
INSERT INTO subscriptions (user_id, tier, status, current_period_start, current_period_end)
SELECT 'dcea3d54-621b-4f9e-ae63-596b98ebd984', 'senior_counsel', 'active', NOW(), NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984');
```

## What This Does

### Upgrades User To:
- **Tier**: Senior Counsel
- **Status**: Active
- **Duration**: 30 days from now
- **Additional Users**: 0 (can be increased later)

### Senior Counsel Features:
- ✅ **Unlimited** active matters
- ✅ Up to **5 team members** (+ additional users)
- ✅ Advanced analytics
- ✅ Priority support
- ✅ Custom branding
- ✅ API access
- ✅ White-label options

## Verification

After running the script, verify with:

```sql
SELECT 
  user_id,
  tier,
  status,
  current_period_end,
  additional_users
FROM subscriptions
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';
```

Expected result:
- `tier`: `senior_counsel`
- `status`: `active`
- `current_period_end`: 30 days from now

## User Experience

After upgrade, the user will:
1. See "Senior Counsel" badge in their profile
2. Have access to all premium features
3. Be able to create unlimited matters
4. Be able to invite up to 5 team members
5. See advanced analytics and reports

## Adjusting Additional Users

To add more team member slots:

```sql
UPDATE subscriptions
SET additional_users = 3  -- Add 3 more slots (total: 5 + 3 = 8)
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';
```

## Extending Subscription Period

To extend for another month:

```sql
UPDATE subscriptions
SET current_period_end = current_period_end + INTERVAL '30 days'
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';
```

## Downgrading (If Needed)

To downgrade back to a lower tier:

```sql
-- Downgrade to Advocate
UPDATE subscriptions
SET tier = 'advocate'
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';

-- Downgrade to Admission
UPDATE subscriptions
SET tier = 'admission'
WHERE user_id = 'dcea3d54-621b-4f9e-ae63-596b98ebd984';
```

## Notes

- The script is idempotent (safe to run multiple times)
- Creates subscription if it doesn't exist
- Logs change in subscription_history table
- Sets 30-day period from current time
- User will see changes immediately after refresh
