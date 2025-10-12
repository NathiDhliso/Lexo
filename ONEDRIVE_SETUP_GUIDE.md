# OneDrive OAuth Setup Guide

This guide will walk you through setting up OneDrive integration so users can connect their personal OneDrive accounts.

## Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Search for "App registrations" in the top search bar
4. Click "New registration"

## Step 2: Configure App Registration

### Basic Information:
- **Name**: `LexoHub Cloud Storage` (or your app name)
- **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
  - This allows both personal OneDrive and business OneDrive accounts
- **Redirect URI**: 
  - Platform: `Web`
  - URI: `http://localhost:5173/settings/cloud-storage/callback` (for development)

Click "Register"

## Step 3: Add Production Redirect URI

After registration:
1. Go to "Authentication" in the left menu
2. Under "Web" → "Redirect URIs", click "Add URI"
3. Add your production URL: `https://your-domain.com/settings/cloud-storage/callback`
4. Click "Save"

## Step 4: Get Client ID

1. Go to "Overview" in the left menu
2. Copy the "Application (client) ID" - this is your `VITE_ONEDRIVE_CLIENT_ID`

## Step 5: Create Client Secret

1. Go to "Certificates & secrets" in the left menu
2. Click "New client secret"
3. Add a description: `LexoHub Production Secret`
4. Choose expiration: `24 months` (recommended)
5. Click "Add"
6. **IMPORTANT**: Copy the "Value" immediately - this is your `VITE_ONEDRIVE_CLIENT_SECRET`
   - You won't be able to see it again!

## Step 6: Configure API Permissions

1. Go to "API permissions" in the left menu
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Files.ReadWrite` - Read and write user files
   - `Files.ReadWrite.All` - Read and write all files user can access
   - `User.Read` - Sign in and read user profile
   - `offline_access` - Maintain access to data you have given it access to

6. Click "Add permissions"
7. Click "Grant admin consent" (if you're an admin) - this is optional but recommended

## Step 7: Update Your .env File

Add the credentials to your `.env` file:

```env
# Microsoft OneDrive OAuth Configuration
VITE_ONEDRIVE_CLIENT_ID=your-application-client-id-here
VITE_ONEDRIVE_CLIENT_SECRET=your-client-secret-value-here
VITE_ONEDRIVE_AUTHORITY=https://login.microsoftonline.com/common
```

## Step 8: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 9: Test the Integration

1. Navigate to your app: `http://localhost:5173`
2. Go to Settings → Cloud Storage
3. Click "Connect" on the OneDrive card
4. You should be redirected to Microsoft login
5. Sign in with your Microsoft account
6. Grant permissions
7. You'll be redirected back to your app with the connection established

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Azure exactly matches: `http://localhost:5173/settings/cloud-storage/callback`
- No trailing slash
- Check for http vs https

### Error: "invalid_client"
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces
- Verify the secret hasn't expired

### Error: "AADSTS700016: Application not found"
- The Client ID is incorrect
- Make sure you copied the Application (client) ID, not the Object ID

### Error: "onedrive is not configured"
- The environment variables aren't loaded
- Restart your dev server after updating .env
- Check that the variable names match exactly

## Security Notes

1. **Never commit secrets to Git**: The `.env` file should be in `.gitignore`
2. **Use different secrets for dev/prod**: Create separate app registrations for development and production
3. **Rotate secrets regularly**: Set reminders to rotate your client secrets before they expire
4. **Store production secrets securely**: Use environment variables in your hosting platform (Vercel, Netlify, etc.)

## What Happens Next?

Once configured:
1. Users click "Connect OneDrive"
2. They're redirected to Microsoft login
3. They sign in with **their own** Microsoft account
4. They grant permission for your app to access their OneDrive
5. OAuth tokens are securely stored in your database
6. Documents can now be synced to their personal OneDrive

Each user's documents go to **their own** OneDrive account - you never have access to their files directly!

## Production Deployment

When deploying to production:

1. Create a new App Registration for production (recommended)
2. Add your production redirect URI
3. Add the production credentials to your hosting platform's environment variables
4. Never use development credentials in production

## Need Help?

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/overview)
- [OneDrive API Documentation](https://docs.microsoft.com/en-us/onedrive/developer/)
