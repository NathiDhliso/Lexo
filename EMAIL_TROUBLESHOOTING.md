# Email Authentication Troubleshooting Guide

## Current Issue
- Error: `access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`
- No email received

## Root Causes

### 1. **Redirect URL Mismatch**
Your `.env` file has:
```
VITE_APP_URL=https://your-production-domain.com
```

But you're running on `http://localhost:3000`. This causes:
- Supabase sends emails with links to `https://your-production-domain.com`
- The links don't work on localhost
- Supabase may reject the redirect URL

### 2. **Supabase Email Configuration**
Supabase needs to be configured to:
- Allow your redirect URLs (both localhost and production)
- Have email templates enabled
- Have SMTP configured (or use Supabase's default email service)

### 3. **Email Delivery Issues**
- Supabase's free tier has email rate limits
- Emails might be going to spam
- Email service might not be configured in Supabase dashboard

## Solutions

### Immediate Fix: Update .env for Local Development

Update your `.env` file:
```env
# For local development, use localhost
VITE_APP_URL=http://localhost:3000

# Or comment it out to use window.location.origin
# VITE_APP_URL=https://your-production-domain.com
```

### Configure Supabase Dashboard

1. **Go to Supabase Dashboard** → Your Project → Authentication → URL Configuration

2. **Add Redirect URLs:**
   ```
   http://localhost:3000/#/login
   http://localhost:3000/#/login?confirmed=true
   http://localhost:3000/#/reset-password
   http://localhost:5173/#/login
   http://localhost:5173/#/login?confirmed=true
   http://localhost:5173/#/reset-password
   ```

3. **Site URL:** Set to `http://localhost:3000` for development

4. **Check Email Settings:**
   - Go to Authentication → Email Templates
   - Verify "Confirm signup" template is enabled
   - Check "Magic Link" template is enabled
   - Verify SMTP settings or use Supabase's email service

### Alternative: Disable Email Confirmation for Development

In Supabase Dashboard:
1. Go to Authentication → Providers → Email
2. Toggle OFF "Confirm email"
3. This allows immediate login without email confirmation (development only!)

### Check Email Delivery

1. **Check Spam Folder**
2. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for email sending events
3. **Verify Email Provider:**
   - Dashboard → Project Settings → Auth
   - Check if SMTP is configured

### Test with Magic Link Instead

For testing, you can use the magic link feature which doesn't require password:
1. Click "Forgot password?" on login page
2. Enter your email
3. Check for magic link email

## Code Changes Needed

### Update auth.service.ts for Better Development Experience

The current code uses `VITE_APP_URL` which might not be set correctly. Here's a better approach:
