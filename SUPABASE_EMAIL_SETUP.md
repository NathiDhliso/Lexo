# Supabase Email Configuration Setup

## Quick Fix Steps

### 1. Configure Supabase Dashboard (REQUIRED)

Visit: https://ecaamkrcsjrcjmcjshlu.supabase.co/project/ecaamkrcsjrcjmcjshlu/auth/url-configuration

#### Add These Redirect URLs:
```
http://localhost:3000/#/login
http://localhost:3000/#/login?confirmed=true
http://localhost:3000/#/reset-password
http://localhost:5173/#/login
http://localhost:5173/#/login?confirmed=true
http://localhost:5173/#/reset-password
```

#### Set Site URL:
```
http://localhost:3000
```

### 2. Check Email Provider Settings

Visit: https://ecaamkrcsjrcjmcjshlu.supabase.co/project/ecaamkrcsjrcjmcjshlu/settings/auth

#### Verify:
- ✅ Email provider is enabled
- ✅ SMTP is configured (or using Supabase's default)
- ✅ "Confirm email" is enabled (or disabled for testing)

### 3. Check Email Templates

Visit: https://ecaamkrcsjrcjmcjshlu.supabase.co/project/ecaamkrcsjrcjmcjshlu/auth/templates

#### Verify Templates:
- ✅ Confirm signup template is active
- ✅ Magic Link template is active
- ✅ Reset password template is active

### 4. For Development: Disable Email Confirmation (Optional)

Visit: https://ecaamkrcsjrcjmcjshlu.supabase.co/project/ecaamkrcsjrcjmcjshlu/auth/providers

1. Click on "Email" provider
2. Toggle OFF "Confirm email"
3. Save changes

**Note:** This allows immediate login without email confirmation. Re-enable for production!

## Testing the Fix

### Test 1: Sign Up
1. Clear browser cache and localStorage
2. Go to http://localhost:3000
3. Click "Sign Up"
4. Enter email and password
5. Check console for: `[Auth] Sign up redirect URL: http://localhost:3000`
6. Check email inbox (and spam folder)

### Test 2: Magic Link
1. Go to login page
2. Click "Forgot password?"
3. Enter email
4. Check console for: `[Auth] Magic link redirect URL: http://localhost:3000`
5. Check email inbox (and spam folder)

### Test 3: Check Supabase Logs
1. Go to: https://ecaamkrcsjrcjmcjshlu.supabase.co/project/ecaamkrcsjrcjmcjshlu/logs/auth-logs
2. Look for recent email events
3. Check for any errors

## Common Issues & Solutions

### Issue: Still not receiving emails

**Solution 1: Check Supabase Email Quota**
- Free tier: 3 emails per hour per user
- Wait an hour and try again

**Solution 2: Use a Different Email**
- Try with a Gmail or Outlook address
- Some email providers block automated emails

**Solution 3: Check Supabase Email Service Status**
```bash
# Check if emails are being sent in Supabase logs
# Dashboard → Logs → Auth Logs
```

### Issue: Email link expired

**Solution:**
- Email confirmation links expire after 24 hours
- Magic links expire after 1 hour
- Request a new link

### Issue: Wrong redirect URL in email

**Solution:**
- Verify the redirect URLs in Supabase dashboard match your local URL
- Clear browser cache
- Request a new email

## Alternative: Manual User Verification (Development Only)

If you need to test immediately without email:

### Option 1: Use Supabase SQL Editor
```sql
-- Verify user manually
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your-email@example.com';
```

### Option 2: Use Supabase Dashboard
1. Go to Authentication → Users
2. Find your user
3. Click on the user
4. Manually verify the email

## Production Checklist

Before deploying to production:

- [ ] Update `VITE_APP_URL` in `.env` to production domain
- [ ] Add production URLs to Supabase redirect URLs
- [ ] Enable email confirmation
- [ ] Configure custom SMTP (recommended)
- [ ] Test email delivery in production
- [ ] Set up email monitoring/logging

## Need Help?

Check these resources:
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Email Configuration: https://supabase.com/docs/guides/auth/auth-email
- Troubleshooting: https://supabase.com/docs/guides/auth/troubleshooting
