# AWS Credentials Fix

## Problem
Your AWS credentials are invalid, causing the following errors:
- **S3 Upload**: `InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records`
- **Bedrock**: `UnrecognizedClientException: The security token included in the request is invalid`

## Root Causes
1. The AWS Access Key ID (`AKIAS6MXOAIIGCEDUUS5E`) is invalid or has been deactivated
2. The `VITE_AWS_BEDROCK_API_KEY` was incorrectly configured - AWS Bedrock uses IAM credentials, not API keys

## What I Fixed
1. ✅ Cleared invalid AWS credentials from `.env`
2. ✅ Removed the incorrect `VITE_AWS_BEDROCK_API_KEY` configuration
3. ✅ Updated `.env.example` to reflect correct configuration
4. ✅ Removed unused API key authentication code from the service
5. ✅ Simplified the service to only use IAM credentials (Access Key + Secret Key)

## What You Need to Do

### Step 1: Generate New AWS Credentials
1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/
2. Navigate to **Users** → Select your user (or create a new one)
3. Go to **Security credentials** tab
4. Click **Create access key**
5. Choose **Application running outside AWS**
6. Copy the **Access Key ID** and **Secret Access Key**

### Step 2: Set Required IAM Permissions
Ensure your IAM user has these policies attached:
- `AmazonS3FullAccess` (or custom S3 policy for your bucket)
- `AmazonTextractFullAccess` (for document text extraction)
- `AmazonBedrockFullAccess` (for AI parsing with Claude)

### Step 3: Update Your .env File
Open `.env` and add your new credentials:

```env
VITE_AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY_ID
VITE_AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_ACCESS_KEY
```

### Step 4: Verify Your S3 Bucket
Ensure the bucket `lexohub-documents` exists in `us-east-1` region, or update:
```env
VITE_AWS_S3_BUCKET=your-actual-bucket-name
VITE_AWS_S3_REGION=your-bucket-region
```

### Step 5: Restart Your Development Server
After updating `.env`, restart your dev server:
```bash
npm run dev
```

## Current Fallback Behavior
Until you add valid credentials, the application will:
- ✅ Use **mock uploads** instead of S3
- ✅ Use **mock text extraction** instead of Textract
- ✅ Use **regex parsing** instead of Bedrock AI

This allows development to continue without AWS, but with limited functionality.

## Testing AWS Integration
After adding credentials, test by:
1. Uploading a document through the UI
2. Check browser console for success messages:
   - `✅ AWS Document Processing Service initialized successfully`
   - `✅ AWS Bedrock configured with IAM credentials`
3. Verify no error messages about invalid credentials

## Security Best Practices
- ⚠️ Never commit `.env` to version control
- ⚠️ Use IAM users with minimal required permissions
- ⚠️ Rotate credentials regularly
- ⚠️ Consider using AWS Secrets Manager for production
