# OneDrive "unauthorized_client" Error Fix

## Error Message
```
unauthorized_client: The client does not exist or is not enabled for consumers.
```

## Problem
Your Azure app registration is not configured to allow personal Microsoft accounts (consumers). It's likely set to "Single tenant" or "Work/School accounts only".

## Solution

### Step 1: Go to Azure Portal
1. Open [Azure Portal](https://portal.azure.com)
2. Go to "App registrations"
3. Find your app: "LexoHub Cloud Storage" (or whatever you named it)
4. Click on it

### Step 2: Check Supported Account Types
1. Click on "Authentication" in the left menu
2. Look at "Supported account types" section
3. It should say: **"Accounts in any organizational directory and personal Microsoft accounts"**

### Step 3: Fix If Needed
If it says something else (like "Single tenant" or "Work/School only"):

1. Go back to "Overview" in the left menu
2. Look for "Supported account types"
3. Click "Change" or "Edit" next to it
4. Select: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"**
5. Click "Save"

### Step 4: Verify Redirect URI
While you're in "Authentication":
1. Check "Platform configurations" → "Web"
2. Make sure you have: `http://localhost:5173/settings/cloud-storage/callback`
3. If not, click "Add URI" and add it
4. Click "Save"

### Step 5: Test Again
1. Go back to your app
2. Navigate to Settings → Cloud Storage
3. Click "Connect" on OneDrive
4. It should now work!

## Alternative: Create New App Registration

If the above doesn't work, create a fresh app registration:

### 1. Create New Registration
- Go to Azure Portal → App Registrations
- Click "New registration"
- Name: `LexoHub Cloud Storage`
- **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
- **Redirect URI**: 
  - Platform: Web
  - URI: `http://localhost:5173/settings/cloud-storage/callback`
- Click "Register"

### 2. Get New Credentials
- Copy the new "Application (client) ID"
- Go to "Certificates & secrets"
- Create a new client secret
- Copy the secret value

### 3. Update .env
Replace the old credentials with the new ones:
```env
VITE_ONEDRIVE_CLIENT_ID=your-new-client-id
VITE_ONEDRIVE_CLIENT_SECRET=your-new-client-secret
```

### 4. Add API Permissions
- Go to "API permissions"
- Click "Add a permission"
- Select "Microsoft Graph"
- Select "Delegated permissions"
- Add:
  - `Files.ReadWrite`
  - `Files.ReadWrite.All`
  - `User.Read`
  - `offline_access`
- Click "Add permissions"

### 5. Restart Dev Server
```bash
npm run dev
```

## Common Issues

### Issue: "AADSTS700016: Application not found"
**Solution**: Wrong Client ID. Double-check you copied the Application (client) ID correctly.

### Issue: "redirect_uri_mismatch"
**Solution**: The redirect URI in Azure doesn't match exactly. Make sure it's:
- `http://localhost:5173/settings/cloud-storage/callback`
- No trailing slash
- Exact match (case-sensitive)

### Issue: "invalid_client"
**Solution**: Wrong Client Secret or it expired. Create a new client secret.

## Verification Checklist

- [ ] App registration exists in Azure Portal
- [ ] Supported account types: "Multitenant and personal accounts"
- [ ] Redirect URI added: `http://localhost:5173/settings/cloud-storage/callback`
- [ ] Client ID copied to .env correctly
- [ ] Client Secret copied to .env correctly (and hasn't expired)
- [ ] API permissions added (Files.ReadWrite, User.Read, offline_access)
- [ ] Dev server restarted after updating .env

## Still Not Working?

If you're still having issues:
1. Delete the app registration in Azure
2. Create a completely new one following the "Alternative" steps above
3. Make sure to select "Multitenant and personal accounts" during creation
4. This is the most common fix!

## Success!
Once fixed, you should be able to:
1. Click "Connect OneDrive"
2. See Microsoft login page
3. Sign in with any Microsoft account (personal or work)
4. Grant permissions
5. Get redirected back with a successful connection!
