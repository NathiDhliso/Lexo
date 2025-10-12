# OneDrive Quick Start

## 🚀 5-Minute Setup

### 1. Azure Portal Setup
```
1. Go to: https://portal.azure.com
2. Search: "App registrations"
3. Click: "New registration"
4. Name: "LexoHub Cloud Storage"
5. Account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: http://localhost:5173/settings/cloud-storage/callback
7. Click: "Register"
```

### 2. Get Credentials
```
Overview Tab:
  → Copy "Application (client) ID"

Certificates & secrets Tab:
  → Click "New client secret"
  → Copy the "Value" (you can't see it again!)
```

### 3. Set Permissions
```
API permissions Tab:
  → Add permission → Microsoft Graph → Delegated permissions
  → Add: Files.ReadWrite, Files.ReadWrite.All, User.Read, offline_access
  → Click "Add permissions"
```

### 4. Update .env
```env
VITE_ONEDRIVE_CLIENT_ID=paste-your-client-id-here
VITE_ONEDRIVE_CLIENT_SECRET=paste-your-secret-here
VITE_ONEDRIVE_AUTHORITY=https://login.microsoftonline.com/common
```

### 5. Restart & Test
```bash
# Restart your dev server
npm run dev

# Then test:
# 1. Go to Settings → Cloud Storage
# 2. Click "Connect" on OneDrive
# 3. Sign in with your Microsoft account
# 4. Done! ✅
```

## 📋 Checklist

- [ ] Created Azure App Registration
- [ ] Copied Client ID to .env
- [ ] Created & copied Client Secret to .env
- [ ] Added API permissions (Files.ReadWrite, User.Read, offline_access)
- [ ] Added redirect URI: `http://localhost:5173/settings/cloud-storage/callback`
- [ ] Restarted dev server
- [ ] Tested connection in app

## ⚠️ Common Issues

**"redirect_uri_mismatch"**
→ Check redirect URI matches exactly (no trailing slash)

**"invalid_client"**
→ Double-check Client ID and Secret (no extra spaces)

**"onedrive is not configured"**
→ Restart dev server after updating .env

## 🔒 Security

- ✅ Each user connects their own OneDrive
- ✅ OAuth tokens stored securely in database
- ✅ You never see user passwords
- ✅ Users can disconnect anytime

## 📚 Full Guide

See `ONEDRIVE_SETUP_GUIDE.md` for detailed instructions and troubleshooting.
