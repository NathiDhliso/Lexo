# AWS Document Upload Setup - Ready to Configure

## 📋 What I've Prepared for You

I've created everything you need to enable AI-powered document upload:

### 1. Configuration Files ✅
- `s3-cors-config.json` - CORS policy for S3 bucket
- `verify-aws-setup.ps1` - Script to check your configuration
- `apply-s3-cors.ps1` - Script to apply CORS automatically

### 2. Documentation ✅
- `AWS_QUICK_START.md` - 5-minute setup guide
- `AWS_DOCUMENT_UPLOAD_SETUP.md` - Comprehensive guide
- `PRO_FORMA_DOCUMENT_UPLOAD_NOTE.md` - Feature overview

### 3. Current Status

✅ **Already Configured** (in your `.env`):
```
VITE_AWS_S3_BUCKET=lexohub-documents
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAS6MXOAIIKCVLFVV3
VITE_AWS_SECRET_ACCESS_KEY=***
VITE_AWS_BEDROCK_REGION=us-east-1
VITE_AWS_BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0
```

⚠️ **Needs Configuration**:
- S3 CORS policy (main issue causing errors)
- Bedrock model access verification
- IAM permissions verification

## 🚀 Quick Setup Steps

### Step 1: Run Verification Script

Open PowerShell in your project directory and run:

```powershell
.\verify-aws-setup.ps1
```

This will check:
- ✓ AWS CLI installation
- ✓ AWS credentials
- ✓ S3 bucket access
- ✓ S3 CORS configuration
- ✓ Bedrock access
- ✓ Environment variables

### Step 2: Apply CORS Configuration

If CORS check fails, run:

```powershell
.\apply-s3-cors.ps1
```

This will:
- Show current CORS config
- Ask for confirmation
- Apply new CORS policy
- Verify the change

### Step 3: Verify Again

Run verification again to confirm:

```powershell
.\verify-aws-setup.ps1
```

All checks should pass! ✅

### Step 4: Test in Application

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open pro forma request page

3. Click "Upload Document"

4. Upload a PDF file

5. Should process successfully! 🎉

## 📊 What Will Work After Setup

### Document Upload Features

✅ **Upload PDF or Word documents**
- Drag and drop or click to browse
- Progress indicator during upload
- File size validation (max 10MB)

✅ **AI Extraction with Claude 3.5 Sonnet**
- Extracts client name
- Extracts email address
- Extracts phone number
- Extracts law firm name
- Extracts case title
- Extracts case description
- Determines urgency level
- Identifies deadlines

✅ **Auto-Population**
- Form fields automatically filled
- User can review and edit
- Confidence score displayed
- Processing time shown

✅ **Graceful Fallback**
- If upload fails, switches to manual entry
- No functionality lost
- User-friendly error messages

## 🔧 Troubleshooting

### If Scripts Don't Work

**Manual CORS Setup** (AWS Console):

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/lexohub-documents

2. Click "Permissions" tab

3. Scroll to "Cross-origin resource sharing (CORS)"

4. Click "Edit"

5. Paste this:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-production-domain.com"
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

7. Done! ✅

### If Bedrock Doesn't Work

1. Go to: https://console.aws.amazon.com/bedrock/

2. Select region: `us-east-1`

3. Click "Model access" in sidebar

4. Find "Claude 3.5 Sonnet"

5. Click "Request model access"

6. Accept terms

7. Wait for approval (usually instant)

### If IAM Permissions Are Missing

See detailed instructions in `AWS_DOCUMENT_UPLOAD_SETUP.md`

## 💰 Cost Estimate

Based on typical usage:

| Usage Level | Documents/Month | Estimated Cost |
|-------------|----------------|----------------|
| Light       | 100            | $0.50/month    |
| Medium      | 1,000          | $5/month       |
| Heavy       | 10,000         | $50/month      |

**Breakdown**:
- S3 storage: $0.023 per GB/month
- Bedrock API: ~$3 per 1M tokens
- Data transfer: Usually free (within AWS)

## 🎯 Expected Results

### Before Configuration
```
User uploads document
→ CORS error
→ Shows error message
→ Switches to manual entry
→ User fills form manually
```

### After Configuration
```
User uploads document
→ Uploads to S3 ✅
→ AI extracts information ✅
→ Form auto-populated ✅
→ User reviews and submits ✅
```

## 📝 Next Steps

1. **Run verification script** to see current status
2. **Apply CORS configuration** if needed
3. **Test document upload** in application
4. **Enjoy AI-powered extraction!** 🎉

## 📚 Documentation Reference

- **Quick Start**: `AWS_QUICK_START.md` (5 minutes)
- **Full Guide**: `AWS_DOCUMENT_UPLOAD_SETUP.md` (detailed)
- **Feature Info**: `PRO_FORMA_DOCUMENT_UPLOAD_NOTE.md`

## ✅ Checklist

Before you start:
- [ ] AWS CLI installed
- [ ] PowerShell available
- [ ] Project directory open in terminal

Configuration steps:
- [ ] Run `verify-aws-setup.ps1`
- [ ] Run `apply-s3-cors.ps1`
- [ ] Verify all checks pass
- [ ] Restart dev server
- [ ] Test document upload

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Document uploads without CORS errors
- ✅ AI extracts information from PDF
- ✅ Form fields auto-populate
- ✅ Confidence score shows (e.g., 85%)
- ✅ Processing time displays (e.g., 3.2s)

---

## Ready to Start?

Run this command to begin:

```powershell
.\verify-aws-setup.ps1
```

Then follow the instructions based on the results!

**Good luck! The setup should take about 5-10 minutes.** 🚀
