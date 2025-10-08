# Environment Setup Guide

## Issue Found
Your application is missing the `VITE_SUPABASE_ANON_KEY` environment variable, which is causing 401 Unauthorized errors.

## Quick Fix Steps

### 1. Get Your Supabase Keys
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (you already have this)
   - **anon/public key** (this is what you're missing)

### 2. Create/Update Your .env File
Create a `.env` file in your project root (if it doesn't exist) or update it with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ecaamkrcsjrcjmcjshlu.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Application Configuration
VITE_APP_NAME=lexo
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_VOICE_CAPTURE=true
VITE_ENABLE_AI_SUGGESTIONS=false
VITE_ENABLE_ANALYTICS=true

# Demo Mode Users
VITE_DEMO_JUNIOR_EMAIL=demo.junior@lexo.co.za
VITE_DEMO_SENIOR_EMAIL=demo.senior@lexo.co.za

# Auth Rate Limiting
VITE_AUTH_SIGNIN_MAX_ATTEMPTS=5
```

### 3. Restart Your Development Server
After updating the `.env` file:
1. Stop your current dev server (Ctrl+C)
2. Run `npm run dev` again
3. The environment variables will be loaded

### 4. Run the Database Fix
After fixing the environment variables, run the updated `quick-fix-permissions.sql` script in your Supabase SQL Editor.

## Verification
After completing these steps:
1. Run the `client-diagnostic.js` script again in your browser console
2. All checks should now pass
3. Try accessing rate cards and service templates in your application

## Security Note
- Never commit your `.env` file to version control
- The `.env` file should already be in your `.gitignore`
- Only share these keys with authorized team members