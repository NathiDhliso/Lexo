# AWS Document Upload - Quick Start

## 🚀 Quick Setup (5 Minutes)

Your AWS credentials are already configured! You just need to fix the CORS policy.

### Option 1: Automated Setup (Recommended)

Run these PowerShell scripts in order:

```powershell
# 1. Verify current configuration
.\verify-aws-setup.ps1

# 2. Apply CORS configuration
.\apply-s3-cors.ps1

# 3. Verify again
.\verify-aws-setup.ps1
```

### Option 2: Manual Setup (AWS Console)

1. **Go to S3 Console**
   - Open: https://s3.console.aws.amazon.com/s3/buckets/lexohub-documents
   - Click "Permissions" tab
   - Scroll to "Cross-origin resource sharing (CORS)"

2. **Edit CORS**
   - Click "Edit"
   - Copy the content from `s3-cors-config.json`
   - Paste and save

3. **Done!**
   - Restart your dev server
   - Test document upload

## Testing

After setup:

1. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Test Upload**
   - Open pro forma request page
   - Click "Upload Document"
   - Upload a PDF
   - Should work! ✅

## Troubleshooting

### Still getting CORS errors?

1. **Clear browser cache**
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

2. **Check CORS config**
   ```powershell
   aws s3api get-bucket-cors --bucket lexohub-documents --region us-east-1
   ```

3. **Verify localhost is allowed**
   - Should see `http://localhost:5174` in AllowedOrigins

### Access Denied errors?

Run the verification script:
```powershell
.\verify-aws-setup.ps1
```

It will tell you exactly what's missing.

## What Gets Configured

✅ **S3 CORS Policy**
- Allows uploads from localhost
- Allows uploads from production domain
- Enables proper headers

✅ **Already Configured** (in your .env)
- AWS credentials
- S3 bucket name
- Bedrock model ID
- All regions

## Cost

**Very low cost for typical usage:**
- S3 storage: ~$0.023 per GB/month
- Bedrock API: ~$3 per 1M tokens
- **Estimated**: $0.50-$5/month depending on usage

## Support

If you need help:
1. Run `.\verify-aws-setup.ps1` and share the output
2. Check `AWS_DOCUMENT_UPLOAD_SETUP.md` for detailed guide
3. Review browser console errors

---

**That's it! Your document upload with AI extraction will be working in 5 minutes.** 🎉
