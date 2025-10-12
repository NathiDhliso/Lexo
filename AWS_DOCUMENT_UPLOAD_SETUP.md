# AWS Document Upload Setup Guide

## Current Status

✅ AWS credentials are configured in `.env`  
⚠️ S3 CORS policy needs to be updated  
⚠️ IAM permissions need verification  

## Step-by-Step Setup

### Step 1: Update S3 CORS Policy

Your S3 bucket `lexohub-documents` needs a CORS policy to allow uploads from your application.

#### Option A: AWS Console (Recommended)

1. **Go to AWS S3 Console**
   - Navigate to: https://s3.console.aws.amazon.com/s3/buckets/lexohub-documents
   - Or search for "S3" in AWS Console

2. **Open Permissions Tab**
   - Click on your bucket: `lexohub-documents`
   - Click the "Permissions" tab
   - Scroll down to "Cross-origin resource sharing (CORS)"

3. **Edit CORS Configuration**
   - Click "Edit"
   - Replace with the configuration below
   - Click "Save changes"

#### CORS Configuration (Copy This)

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
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

**Important**: Replace `https://your-production-domain.com` with your actual production domain.

#### Option B: AWS CLI

If you prefer using the CLI:

```bash
# Save CORS configuration to a file
cat > cors-config.json << 'EOF'
{
  "CORSRules": [
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
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket lexohub-documents \
  --cors-configuration file://cors-config.json \
  --region us-east-1
```

### Step 2: Verify IAM Permissions

Your IAM user needs these permissions:

#### Required Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3DocumentUpload",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:GetObjectAcl",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::lexohub-documents/*"
    },
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketCors"
      ],
      "Resource": "arn:aws:s3:::lexohub-documents"
    },
    {
      "Sid": "BedrockInvoke",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/us.anthropic.claude-3-5-sonnet-20241022-v2:0"
      ]
    }
  ]
}
```

#### How to Check/Update IAM Permissions

1. **Go to IAM Console**
   - Navigate to: https://console.aws.amazon.com/iam/
   - Click "Users" in the left sidebar

2. **Find Your User**
   - Look for the user associated with `AKIAS6MXOAIIKCVLFVV3`
   - Click on the username

3. **Check Permissions**
   - Click "Permissions" tab
   - Look for policies that grant S3 and Bedrock access

4. **Add Missing Permissions** (if needed)
   - Click "Add permissions" → "Create inline policy"
   - Switch to JSON tab
   - Paste the policy above
   - Name it: `LexoDocumentProcessing`
   - Click "Create policy"

### Step 3: Update Bedrock Model ID

Your `.env` has:
```
VITE_AWS_BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0
```

This should work, but if you get errors, try:
```
VITE_AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

### Step 4: Enable Bedrock Model Access

1. **Go to Bedrock Console**
   - Navigate to: https://console.aws.amazon.com/bedrock/
   - Select region: `us-east-1`

2. **Request Model Access**
   - Click "Model access" in the left sidebar
   - Find "Claude 3.5 Sonnet"
   - Click "Request model access" if not already enabled
   - Accept terms and conditions
   - Wait for approval (usually instant)

3. **Verify Access**
   - Status should show "Access granted" with a green checkmark

### Step 5: Test the Configuration

After completing the above steps:

1. **Restart Your Development Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

2. **Test Document Upload**
   - Open the pro forma request page
   - Click "Upload Document"
   - Upload a PDF file
   - Should process successfully ✅

## Troubleshooting

### Error: "CORS policy error"

**Cause**: S3 CORS not configured correctly

**Solution**:
1. Double-check CORS configuration in S3
2. Ensure your localhost URL is in AllowedOrigins
3. Clear browser cache and try again

### Error: "Access Denied"

**Cause**: IAM permissions insufficient

**Solution**:
1. Verify IAM policy includes S3 and Bedrock permissions
2. Check the bucket name is correct: `lexohub-documents`
3. Ensure credentials in `.env` are correct

### Error: "Model not found"

**Cause**: Bedrock model not enabled or wrong model ID

**Solution**:
1. Go to Bedrock console and enable Claude 3.5 Sonnet
2. Try alternative model ID in `.env`
3. Verify region is `us-east-1`

### Error: "Failed to fetch"

**Cause**: Network or CORS issue

**Solution**:
1. Check browser console for detailed error
2. Verify CORS configuration
3. Try in incognito mode (clears cache)

## Security Best Practices

### 1. Bucket Policy (Optional but Recommended)

Add this bucket policy for additional security:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAuthenticatedUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::lexohub-documents/*"
    }
  ]
}
```

### 2. Enable S3 Encryption

1. Go to S3 bucket properties
2. Enable "Default encryption"
3. Choose "SSE-S3" (Amazon S3 managed keys)

### 3. Enable Versioning

1. Go to S3 bucket properties
2. Enable "Bucket Versioning"
3. Protects against accidental deletions

### 4. Set Lifecycle Rules

1. Go to S3 bucket management
2. Create lifecycle rule
3. Delete old documents after 90 days (optional)

## Cost Considerations

### S3 Storage
- **First 50 TB**: $0.023 per GB/month
- **Example**: 1000 documents × 1MB = 1GB = $0.023/month

### Bedrock API
- **Claude 3.5 Sonnet**: ~$3 per 1M input tokens
- **Example**: 100 documents/month = ~$0.30/month

### Total Estimated Cost
- **Light usage** (100 docs/month): ~$0.50/month
- **Medium usage** (1000 docs/month): ~$5/month
- **Heavy usage** (10000 docs/month): ~$50/month

## Testing Checklist

After configuration, test these scenarios:

- [ ] Upload PDF document
- [ ] Upload Word document
- [ ] Extract client name
- [ ] Extract email address
- [ ] Extract phone number
- [ ] Extract case description
- [ ] Form auto-populates correctly
- [ ] Can edit extracted data
- [ ] Can submit form successfully

## Quick Verification Script

Run this to verify your AWS configuration:

```bash
# Test S3 access
aws s3 ls s3://lexohub-documents/ --region us-east-1

# Test Bedrock access
aws bedrock list-foundation-models --region us-east-1 | grep claude

# Check CORS configuration
aws s3api get-bucket-cors --bucket lexohub-documents --region us-east-1
```

## Support

If you encounter issues:

1. Check AWS CloudWatch Logs
2. Review browser console errors
3. Verify all environment variables
4. Test with AWS CLI first
5. Contact AWS Support if needed

## Summary

**Required Steps**:
1. ✅ Update S3 CORS policy (most important)
2. ✅ Verify IAM permissions
3. ✅ Enable Bedrock model access
4. ✅ Test document upload

**Time Required**: 10-15 minutes

**Difficulty**: Easy (mostly point-and-click in AWS Console)

---

**Once configured, document upload will work seamlessly with AI extraction!** 🚀
