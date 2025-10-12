# OneDrive Setup Checklist

Print this or keep it open while setting up!

## ☐ Azure Portal Setup

- [ ] Go to https://portal.azure.com
- [ ] Search for "App registrations"
- [ ] Click "New registration"
- [ ] Name: "LexoHub Cloud Storage"
- [ ] Account types: "Accounts in any organizational directory and personal Microsoft accounts"
- [ ] Redirect URI (Web): `http://localhost:5173/settings/cloud-storage/callback`
- [ ] Click "Register"

## ☐ Get Client ID

- [ ] Go to "Overview" tab
- [ ] Copy "Application (client) ID"
- [ ] Paste into `.env` as `VITE_ONEDRIVE_CLIENT_ID`

## ☐ Create Client Secret

- [ ] Go to "Certificates & secrets" tab
- [ ] Click "New client secret"
- [ ] Description: "LexoHub Production"
- [ ] Expiration: 24 months
- [ ] Click "Add"
- [ ] **IMMEDIATELY** copy the "Value"
- [ ] Paste into `.env` as `VITE_ONEDRIVE_CLIENT_SECRET`

## ☐ Set API Permissions

- [ ] Go to "API permissions" tab
- [ ] Click "Add a permission"
- [ ] Select "Microsoft Graph"
- [ ] Select "Delegated permissions"
- [ ] Search and add: `Files.ReadWrite`
- [ ] Search and add: `Files.ReadWrite.All`
- [ ] Search and add: `User.Read`
- [ ] Search and add: `offline_access`
- [ ] Click "Add permissions"

## ☐ Update .env File

```env
VITE_ONEDRIVE_CLIENT_ID=paste-here
VITE_ONEDRIVE_CLIENT_SECRET=paste-here
VITE_ONEDRIVE_AUTHORITY=https://login.microsoftonline.com/common
```

- [ ] Client ID added
- [ ] Client Secret added
- [ ] Authority added
- [ ] No extra spaces or quotes
- [ ] File saved

## ☐ Database Setup

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy contents of `fix-cloud-storage-now.sql`
- [ ] Paste and run
- [ ] Verify tables created

## ☐ Test Configuration

- [ ] Run: `npx tsx test-onedrive-config.ts`
- [ ] All checks pass ✅

## ☐ Restart Dev Server

- [ ] Stop server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Server starts successfully

## ☐ Test in Browser

- [ ] Go to: http://localhost:5173
- [ ] Navigate to Settings
- [ ] Click Cloud Storage
- [ ] See OneDrive card
- [ ] Click "Connect"
- [ ] Redirected to Microsoft login
- [ ] Sign in with Microsoft account
- [ ] Grant permissions
- [ ] Redirected back to app
- [ ] Connection shows as "Connected" ✅

## ☐ Production Setup (Later)

- [ ] Create separate Azure app for production
- [ ] Add production redirect URI
- [ ] Add credentials to hosting platform
- [ ] Test in production
- [ ] Verify user connections work

---

## Quick Reference

**Azure Portal**: https://portal.azure.com
**App Registrations**: Search "App registrations" in Azure
**Redirect URI (Dev)**: `http://localhost:5173/settings/cloud-storage/callback`
**Redirect URI (Prod)**: `https://your-domain.com/settings/cloud-storage/callback`

## Need Help?

- See `ONEDRIVE_QUICK_START.md` for quick guide
- See `ONEDRIVE_SETUP_GUIDE.md` for detailed guide
- See `ONEDRIVE_READY.md` for overview
