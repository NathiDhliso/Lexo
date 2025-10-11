# Email Authentication Fix - Summary

## Problem
- Error: `otp_expired` - Email link invalid or expired
- No emails being received
- Redirect URL mismatch between development and production

## Root Cause
The `.env` file had `VITE_APP_URL=https://your-production-domain.com`, but the app runs on `http://localhost:3000`. This caused:
1. Supabase to send emails with production URLs
2. Links not working on localhost
3. Possible rejection of redirect URLs by Supabase

## Changes Made

### 1. Updated `src/services/auth.service.ts`
Added intelligent URL detection for development vs production:

```typescript
// Now automatically uses localhost in development
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const redirectUrl = isDevelopment ? window.location.origin : (import.meta.env.VITE_APP_URL || window.location.origin);
```

This was applied to:
- `signUp()` - Email confirmation links
- `signInWithMagicLink()` - Magic link authentication
- `resetPassword()` - Password reset links

### 2. Added Console Logging
Each auth method now logs the redirect URL being used for debugging:
```typescript
console.log('[Auth] Sign up redirect URL:', redirectUrl);
```

## Required Supabase Configuration

### CRITICAL: Add Redirect URLs in Supabase Dashboard

Visit your Supabase project → Authentication → URL Configuration and add:

```
http://localhost:3000/#/login
http://localhost:3000/#/login?confirmed=true
http://localhost:3000/#/reset-password
http://localhost:5173/#/login
http://localhost:5173/#/login?confirmed=true
http://localhost:5173/#/reset-password
```

**Direct Link:** https://ecaamkrcsjrcjmcjshlu.supabase.co/project/ecaamkrcsjrcjmcjshlu/auth/url-configuration

### Set Site URL
Set to: `http://localhost:3000`

### Optional: Disable Email Confirmation for Testing
For faster development testing:
1. Go to Authentication → Providers → Email
2. Toggle OFF "Confirm email"
3. Remember to re-enable for production!

## Testing Steps

1. **Clear browser data:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Try signing up:**
   - Open browser console
   - Look for: `[Auth] Sign up redirect URL: http://localhost:3000`
   - Check email (including spam folder)

4. **Check Supabase logs:**
   - Dashboard → Logs → Auth Logs
   - Look for email sending events

## Common Issues

### Still not receiving emails?

**Check email quota:**
- Supabase free tier: 3 emails/hour per user
- Wait and try again

**Try different email:**
- Use Gmail or Outlook
- Some providers block automated emails

**Check Supabase email service:**
- Dashboard → Settings → Auth
- Verify SMTP configuration

### Email link still wrong?

**Verify Supabase configuration:**
- Check redirect URLs are added
- Verify Site URL is set correctly
- Clear browser cache

**Check console logs:**
- Should show `http://localhost:3000` not production URL

## Alternative Solutions

### For Immediate Testing (Development Only)

**Option 1: Disable email confirmation** (see above)

**Option 2: Manually verify user in Supabase:**
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your-email@example.com';
```

**Option 3: Use Supabase Dashboard:**
- Authentication → Users → Select user → Verify email

## Production Deployment

Before going to production:

1. Update `.env`:
   ```env
   VITE_APP_URL=https://your-actual-domain.com
   ```

2. Add production URLs to Supabase:
   ```
   https://your-actual-domain.com/#/login
   https://your-actual-domain.com/#/login?confirmed=true
   https://your-actual-domain.com/#/reset-password
   ```

3. Re-enable email confirmation

4. Consider custom SMTP for better deliverability

## Files Modified
- ✅ `src/services/auth.service.ts` - Smart URL detection
- ✅ `EMAIL_TROUBLESHOOTING.md` - Detailed troubleshooting guide
- ✅ `SUPABASE_EMAIL_SETUP.md` - Step-by-step setup instructions

## Next Steps

1. Configure Supabase dashboard (REQUIRED)
2. Test sign up flow
3. Check browser console for redirect URLs
4. Check email inbox (and spam)
5. Review Supabase auth logs if issues persist
