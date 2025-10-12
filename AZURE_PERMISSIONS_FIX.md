# Azure API Permissions Fix

## Problem
The API permissions show "Delegated" but haven't been granted. The app still can't authenticate users.

## Solution

### Step 1: Remove Old Permissions
1. Go to Azure Portal → Your App → **API permissions**
2. For each permission listed, click the **"..."** menu → **Remove permission**
3. Remove all existing permissions

### Step 2: Add Permissions Correctly
1. Click **"Add a permission"**
2. Select **"Microsoft Graph"**
3. Select **"Delegated permissions"**
4. Search and check these permissions:
   - ☑ `Files.ReadWrite` - Read and write user files
   - ☑ `Files.ReadWrite.All` - Read and write all files user can access  
   - ☑ `User.Read` - Sign in and read user profile
   - ☑ `offline_access` - Maintain access to data
5. Click **"Add permissions"**

### Step 3: Grant Admin Consent (Optional but Recommended)
1. Click **"Grant admin consent for [Your Organization]"**
2. Click **"Yes"** to confirm
3. The "Status" column should now show green checkmarks

**Note**: If you don't have admin rights, users will be prompted to consent when they first connect.

### Step 4: Verify Supported Account Types
1. Go to **"Overview"** in the left menu
2. Under "Essentials", check **"Supported account types"**
3. It MUST say: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts"**
4. If it says anything else, you need to create a NEW app registration (you can't change this after creation)

### Step 5: Verify Redirect URI
1. Go to **"Authentication"** in the left menu
2. Under "Platform configurations" → "Web"
3. Make sure you have: `http://localhost:5173/settings/cloud-storage/callback`
4. Click **"Save"** if you made changes

### Step 6: Test Again
1. Make sure your dev server is running with the new credentials
2. Go to Settings → Cloud Storage
3. Click "Connect" on OneDrive
4. It should work now!

## Still Getting "unauthorized_client"?

This error specifically means the app is not configured for personal Microsoft accounts. 

### The ONLY Fix:
You MUST create a brand new app registration and select the correct account type during creation:

1. Azure Portal → App Registrations → **New registration**
2. Name: `LexoHub Cloud Storage v2`
3. **Supported account types**: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"**
   - This is THE CRITICAL SETTING
   - You CANNOT change this after creation
   - If you select the wrong option, you must delete and recreate
4. Redirect URI: `http://localhost:5173/settings/cloud-storage/callback`
5. Click "Register"
6. Add API permissions as described above
7. Get new Client ID and Secret
8. Update `.env` with new credentials

## Quick Checklist

- [ ] App registration exists
- [ ] **Supported account types**: "Multitenant and personal Microsoft accounts" ← CRITICAL
- [ ] Redirect URI: `http://localhost:5173/settings/cloud-storage/callback`
- [ ] API Permissions added: Files.ReadWrite, Files.ReadWrite.All, User.Read, offline_access
- [ ] Permissions granted (green checkmarks in Status column)
- [ ] Client ID in `.env`
- [ ] Client Secret in `.env`
- [ ] Dev server restarted

## The Root Cause

The "unauthorized_client" error means:
- Your app was created with "Single tenant" or "Work/School accounts only"
- You're trying to sign in with a personal Microsoft account
- Azure blocks this because the app isn't configured to allow personal accounts

**Solution**: Create a new app with "Multitenant and personal accounts" selected during creation.
