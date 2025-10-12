# Fix CORS Error - Quick Solution

## Problem Identified

Your app runs on `localhost:5174` but the S3 CORS configuration only allows:
- `localhost:5175`
- `localhost:5180`
- `localhost:5173`
- `localhost:3000`

**Missing**: `localhost:5174` ❌

## Solution

I've updated `s3-cors-config.json` to include port 5174.

### Apply the Fix

Run this command in PowerShell:

```powershell
.\apply-s3-cors.ps1
```

This will:
1. Show current CORS config
2. Ask for confirmation
3. Apply the updated config with port 5174
4. Verify the change

### Alternative: Manual Fix (AWS Console)

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/lexohub-documents

2. Click "Permissions" tab

3. Scroll to "Cross-origin resource sharing (CORS)"

4. Click "Edit"

5. Replace with:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5180",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click "Save changes"

### After Applying

1. **Clear browser cache**:
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

2. **Test upload again**:
   - Upload a document
   - Should work now! ✅

### Verify It Worked

Run verification script:
```powershell
.\verify-aws-setup.ps1
```

Should show port 5174 in allowed origins.

---

**This is the only thing preventing document upload from working!** 🎯
