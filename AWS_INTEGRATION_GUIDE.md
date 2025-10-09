# AWS Integration Guide - LexoHub

## Overview

LexoHub uses AWS services to enhance the **3-step workflow** (Pro Forma → Matter → Invoice) with intelligent document processing, email delivery, and secure storage.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LexoHub Frontend                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Pro Forma   │  │    Matter    │  │   Invoice    │    │
│  │   (Step 1)   │→ │   (Step 2)   │→ │   (Step 3)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ↓                  ↓                  ↓
┌─────────────────────────────────────────────────────────────┐
│                      AWS Services                           │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │   SES    │    │    S3    │    │ Textract │            │
│  │  Email   │    │ Storage  │    │   OCR    │            │
│  └──────────┘    └──────────┘    └──────────┘            │
│                                                             │
│  ┌──────────────────────────────────────────┐             │
│  │         Bedrock (Claude AI)              │             │
│  │   Intelligent Document Parsing           │             │
│  └──────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Services Implemented

### 1. AWS S3 (Simple Storage Service)
**Purpose:** Secure document storage  
**Used in:** Step 2 (Matter Creation)

**Features:**
- Uploads attorney briefs and legal documents
- Stores files with metadata (matter ID, upload timestamp)
- Generates secure URLs for document access
- Automatic fallback to mock URLs in development

**Integration Points:**
- `aws-document-processing.service.ts` - Main upload logic
- `NewMatterMultiStep.tsx` - Matter creation form
- `DocumentUploadWithProcessing.tsx` - Document upload component

### 2. AWS Textract
**Purpose:** Intelligent OCR and text extraction  
**Used in:** Step 2 (Matter Creation)

**Features:**
- Extracts text from PDF, DOC, DOCX files
- Detects lines, words, and document structure
- Handles scanned documents and images
- Returns structured text for AI analysis

**Integration Points:**
- `aws-document-processing.service.ts` - Text extraction logic
- Works in tandem with Bedrock for intelligent parsing

### 3. AWS Bedrock (Claude AI)
**Purpose:** Intelligent document data extraction  
**Used in:** Step 2 (Matter Creation)

**Features:**
- Analyzes extracted text using Claude 3 Sonnet
- Identifies and extracts structured legal data:
  - Client name, email, phone, address
  - Law firm and attorney details
  - Case title and reference numbers
  - Dates, amounts, deadlines
  - Matter description and urgency
  - Involved parties
- Returns structured JSON for form auto-population
- Graceful fallback to regex parsing if unavailable

**Integration Points:**
- `aws-document-processing.service.ts` - AI parsing logic
- Automatically pre-populates matter forms

### 4. AWS SES (Simple Email Service)
**Purpose:** Professional email delivery  
**Used in:** Steps 1 & 3 (Pro Forma & Invoice)

**Features:**
- Sends pro forma quotes to attorneys
- Delivers invoices to clients
- Sends payment reminders for overdue invoices
- HTML email templates with branding
- Delivery tracking and error handling

**Integration Points:**
- `aws-email.service.ts` - Email delivery service
- `invoices.service.ts` - Invoice email integration
- `reminder.service.ts` - Payment reminder emails

## Environment Variables

Add these to your `.env` file:

```env
# AWS Core Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key

# S3 Configuration
VITE_AWS_S3_BUCKET=lexohub-documents
VITE_AWS_S3_REGION=us-east-1

# SES Configuration
VITE_AWS_SES_FROM_EMAIL=noreply@yourdomain.com
VITE_AWS_SES_REGION=us-east-1

# Textract Configuration
VITE_AWS_TEXTRACT_REGION=us-east-1

# Bedrock Configuration
VITE_AWS_BEDROCK_REGION=us-east-1
VITE_AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Optional: CloudWatch, EventBridge, Secrets Manager
VITE_AWS_CLOUDWATCH_LOG_GROUP=/aws/lexohub/application
VITE_AWS_CLOUDWATCH_REGION=us-east-1
VITE_AWS_EVENTBRIDGE_REGION=us-east-1
VITE_AWS_SECRETS_MANAGER_REGION=us-east-1
```

## AWS Setup Instructions

### Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed

### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://lexohub-documents --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket lexohub-documents \
  --versioning-configuration Status=Enabled

# Set CORS policy
aws s3api put-bucket-cors \
  --bucket lexohub-documents \
  --cors-configuration file://s3-cors.json
```

**s3-cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Step 2: Configure SES
```bash
# Verify your sender email
aws ses verify-email-identity \
  --email-address noreply@yourdomain.com \
  --region us-east-1

# Move out of sandbox (production)
# Request via AWS Console: SES > Account Dashboard > Request Production Access
```

### Step 3: Enable Bedrock Model Access
1. Go to AWS Console → Bedrock
2. Navigate to "Model access"
3. Request access to "Anthropic Claude 3 Sonnet"
4. Wait for approval (usually instant)

### Step 4: Create IAM User with Permissions
```bash
# Create IAM user
aws iam create-user --user-name lexohub-app

# Attach policies
aws iam attach-user-policy \
  --user-name lexohub-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name lexohub-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonTextractFullAccess

aws iam attach-user-policy \
  --user-name lexohub-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam attach-user-policy \
  --user-name lexohub-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# Create access keys
aws iam create-access-key --user-name lexohub-app
```

Save the `AccessKeyId` and `SecretAccessKey` to your `.env` file.

## Document Processing Flow

### Complete Workflow (Step 2 - Matter Creation)

```
1. User uploads attorney's brief (PDF/DOC/DOCX)
   ↓
2. File uploads to S3
   - Bucket: lexohub-documents
   - Path: documents/{timestamp}-{filename}
   - Metadata: matter_id, upload_date
   ↓
3. AWS Textract extracts raw text
   - OCR processing for scanned documents
   - Text extraction for digital documents
   - Returns structured blocks of text
   ↓
4. AWS Bedrock (Claude AI) analyzes text
   - Identifies client information
   - Extracts case details
   - Determines urgency
   - Structures data as JSON
   ↓
5. Form auto-populates with extracted data
   - Client name, email, phone
   - Case description
   - Dates and amounts
   - Zero re-entry for user
```

### Example Extracted Data

**Input Document:**
```
LEGAL MATTER BRIEF

Client: John Smith
Email: john.smith@example.com
Phone: +27 11 123 4567
Law Firm: Smith & Associates

Case Number: SM-2025-001
Date of Incident: 15/01/2025

Matter Description:
This is an urgent commercial dispute involving a breach of contract.
The client requires immediate legal assistance. Estimated value: R 250,000.
```

**Bedrock AI Output:**
```json
{
  "clientName": "John Smith",
  "clientEmail": "john.smith@example.com",
  "clientPhone": "+27 11 123 4567",
  "lawFirm": "Smith & Associates",
  "caseNumber": "SM-2025-001",
  "dateOfIncident": "15/01/2025",
  "description": "Urgent commercial dispute involving a breach of contract",
  "urgency": "high",
  "estimatedAmount": 250000
}
```

## Email Templates

### Invoice Email
Sent when invoice is marked as "sent" in Step 3.

**Features:**
- Professional HTML template
- Invoice details (number, amount, due date)
- Download link (if available)
- Branded with LexoHub colors

### Pro Forma Email
Sent when pro forma quote is sent to attorney in Step 1.

**Features:**
- Quote details and estimated amount
- Matter description
- Validity period
- Professional formatting

### Payment Reminder Email
Sent for overdue invoices in Step 3.

**Features:**
- Urgency-based styling (friendly/important/urgent)
- Days overdue calculation
- Outstanding amount
- Payment instructions

## Development Mode

All AWS services have **graceful fallbacks** for development:

### Without AWS Credentials:
- **S3:** Returns mock URLs (`https://mock-bucket.s3.amazonaws.com/...`)
- **Textract:** Returns sample extracted text
- **Bedrock:** Falls back to regex parsing
- **SES:** Logs email to console (mock mode)

### Benefits:
- ✅ Develop without AWS account
- ✅ Test full workflow locally
- ✅ No AWS costs during development
- ✅ Seamless transition to production

## Production Deployment

### Security Best Practices

1. **Never commit credentials**
   - Use `.env` files (gitignored)
   - Use AWS Secrets Manager for production

2. **Use IAM roles for EC2/ECS**
   - Avoid hardcoded credentials
   - Rotate access keys regularly

3. **Enable CloudWatch logging**
   - Monitor API usage
   - Track errors and performance

4. **Set up billing alerts**
   - Monitor AWS costs
   - Set budget thresholds

### Cost Optimization

**Estimated Monthly Costs (100 users, 500 documents/month):**
- S3 Storage: ~$5/month (100GB)
- Textract: ~$75/month (500 pages)
- Bedrock: ~$150/month (500 AI calls)
- SES: ~$10/month (10,000 emails)
- **Total: ~$240/month**

**Cost Reduction Tips:**
- Use S3 lifecycle policies to archive old documents
- Batch Textract requests when possible
- Cache Bedrock responses for similar documents
- Use SES in production mode (cheaper)

## Troubleshooting

### Issue: "AWS credentials not configured"
**Solution:** Add credentials to `.env` file and restart dev server

### Issue: "Textract extraction failed"
**Solution:** Check:
- S3 bucket permissions
- Textract service availability in your region
- File format (PDF, DOC, DOCX only)

### Issue: "Bedrock model access denied"
**Solution:** 
- Request model access in AWS Console
- Wait for approval (usually instant)
- Verify IAM permissions

### Issue: "Email not sending"
**Solution:**
- Verify sender email in SES
- Check SES sandbox status
- Request production access for unlimited sending

## Support

For AWS-specific issues:
- AWS Documentation: https://docs.aws.amazon.com
- AWS Support: https://console.aws.amazon.com/support

For LexoHub integration issues:
- Check service logs in browser console
- Verify environment variables
- Test with mock mode first

## Summary

LexoHub's AWS integration provides:
- ✅ **Intelligent document processing** (S3 + Textract + Bedrock)
- ✅ **Professional email delivery** (SES)
- ✅ **Zero re-entry workflow** (AI-powered form population)
- ✅ **Production-ready architecture** (scalable and secure)
- ✅ **Development-friendly** (works without AWS setup)

All services directly support the **3-step workflow** and enhance user productivity.
