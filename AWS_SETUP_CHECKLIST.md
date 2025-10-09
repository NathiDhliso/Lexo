# AWS Setup Checklist for LexoHub

## ✅ Credentials Configured

Your AWS credentials are now in `.env`:
- **Access Key ID:** `AKIAS6MXOAIIGCEDUUS5E`
- **Secret Access Key:** `qnwqDL96k5p+HpoAs/K735oj/sHtn1lOiQ7f1rOl`
- **Bedrock Bearer Token:** `ABSKTGV4by1hdC0yMDI3MTc5MjE4MDg6UjFhVHhSYlNualZBdjhRZ05sOU5EVjd4NlRLNXlvdGtlRE52MUViQk13QTN2NFgxaGQzRnpPWnZMYk09`

## 🔧 Required AWS Services Setup

### 1. S3 Bucket (Document Storage)
**Status:** ⚠️ Needs Setup

**Steps:**
```bash
# Create S3 bucket
aws s3 mb s3://lexohub-documents --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket lexohub-documents \
  --versioning-configuration Status=Enabled

# Set CORS policy (for browser uploads)
cat > s3-cors.json << EOF
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
EOF

aws s3api put-bucket-cors \
  --bucket lexohub-documents \
  --cors-configuration file://s3-cors.json
```

**Or via AWS Console:**
1. Go to S3 → Create bucket
2. Name: `lexohub-documents`
3. Region: `us-east-1`
4. Enable versioning
5. Add CORS policy in Permissions tab

---

### 2. SES (Email Service)
**Status:** ⚠️ Needs Setup

**Steps:**
```bash
# Verify sender email
aws ses verify-email-identity \
  --email-address noreply@lexohub.co.za \
  --region us-east-1

# Check verification status
aws ses get-identity-verification-attributes \
  --identities noreply@lexohub.co.za \
  --region us-east-1
```

**Or via AWS Console:**
1. Go to SES → Verified identities
2. Create identity → Email address
3. Enter: `noreply@lexohub.co.za`
4. Check email and click verification link

**Production Access (Important!):**
- By default, SES is in "Sandbox mode" (can only send to verified emails)
- Request production access: SES Console → Account dashboard → Request production access
- Fill out form (usually approved within 24 hours)

---

### 3. Textract (Document OCR)
**Status:** ✅ Should Work (No setup needed)

Textract is available by default with your IAM credentials. Test it by uploading a document in the app.

---

### 4. Bedrock (Claude AI)
**Status:** ⚠️ Needs Model Access

**Steps via AWS Console:**
1. Go to AWS Bedrock → Model access
2. Click "Manage model access"
3. Select: **Anthropic Claude 3 Sonnet**
4. Click "Request model access"
5. Wait for approval (usually instant)

**Verify Access:**
```bash
aws bedrock list-foundation-models --region us-east-1 | grep claude-3-sonnet
```

---

## 🧪 Testing Your Setup

### Test 1: S3 Upload
```bash
# Create test file
echo "Test document" > test.txt

# Upload to S3
aws s3 cp test.txt s3://lexohub-documents/test/test.txt

# Verify
aws s3 ls s3://lexohub-documents/test/
```

### Test 2: SES Email
```bash
# Send test email (only works after verification)
aws ses send-email \
  --from noreply@lexohub.co.za \
  --destination ToAddresses=your-email@example.com \
  --message Subject={Data="Test from LexoHub"},Body={Text={Data="This is a test"}} \
  --region us-east-1
```

### Test 3: Textract
```bash
# Upload a PDF to S3 first, then:
aws textract detect-document-text \
  --document '{"S3Object":{"Bucket":"lexohub-documents","Name":"test/sample.pdf"}}' \
  --region us-east-1
```

### Test 4: Bedrock
```bash
# Test Claude 3 Sonnet access
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}' \
  --region us-east-1 \
  output.json

cat output.json
```

---

## 🚀 Running LexoHub

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Document Processing
1. Navigate to "Matters" page
2. Click "Create New Matter"
3. Upload a PDF document
4. Watch the magic:
   - ✅ File uploads to S3
   - ✅ Textract extracts text
   - ✅ Bedrock AI parses data
   - ✅ Form auto-populates

---

## 🔒 Security Notes

### ⚠️ Important Security Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Rotate credentials regularly**
   - AWS Console → IAM → Users → Security credentials
   - Delete old keys, create new ones

3. **Use IAM roles in production**
   - For EC2/ECS deployments
   - Avoid hardcoded credentials

4. **Enable MFA on AWS account**
   - Protect against credential theft

5. **Monitor AWS costs**
   - Set up billing alerts
   - Review usage monthly

---

## 💰 Cost Estimates

**Expected monthly costs (100 users, 500 documents/month):**

| Service | Usage | Cost |
|---------|-------|------|
| S3 Storage | 100GB | ~$2.30 |
| S3 Requests | 10,000 | ~$0.05 |
| Textract | 500 pages | ~$75 |
| Bedrock (Claude 3 Sonnet) | 500 documents | ~$15 |
| SES | 10,000 emails | ~$1 |
| **Total** | | **~$93/month** |

**Cost Optimization Tips:**
- Use S3 Intelligent-Tiering for old documents
- Batch Textract requests
- Cache Bedrock responses
- Use SES production mode (cheaper than sandbox)

---

## 🐛 Troubleshooting

### Issue: "Access Denied" errors
**Solution:**
- Verify IAM user has correct policies attached
- Check policies: S3FullAccess, TextractFullAccess, BedrockFullAccess, SESFullAccess

### Issue: "Bucket does not exist"
**Solution:**
- Create S3 bucket: `aws s3 mb s3://lexohub-documents`
- Verify bucket name in `.env` matches exactly

### Issue: "Model access denied" (Bedrock)
**Solution:**
- Request model access in Bedrock console
- Wait for approval (usually instant)

### Issue: "Email not sending" (SES)
**Solution:**
- Verify sender email in SES console
- Check if in sandbox mode (can only send to verified emails)
- Request production access for unlimited sending

### Issue: "Textract failed"
**Solution:**
- Verify file is uploaded to S3 first
- Check file format (PDF, PNG, JPG only)
- Verify Textract is available in us-east-1

---

## ✅ Setup Completion Checklist

- [ ] S3 bucket created (`lexohub-documents`)
- [ ] S3 CORS policy configured
- [ ] SES sender email verified (`noreply@lexohub.co.za`)
- [ ] SES production access requested (if needed)
- [ ] Bedrock Claude 3 Sonnet access enabled
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Test document upload successful
- [ ] Form auto-population working

---

## 📞 Support

**AWS Documentation:**
- S3: https://docs.aws.amazon.com/s3/
- SES: https://docs.aws.amazon.com/ses/
- Textract: https://docs.aws.amazon.com/textract/
- Bedrock: https://docs.aws.amazon.com/bedrock/

**AWS Support:**
- Console: https://console.aws.amazon.com/support
- Forums: https://forums.aws.amazon.com/

**LexoHub Issues:**
- Check browser console for errors
- Verify `.env` configuration
- Test with mock mode first (no AWS credentials)

---

## 🎉 You're Ready!

Once all services are set up, LexoHub will provide:
- ✅ Intelligent document processing
- ✅ Automatic form population
- ✅ Professional email delivery
- ✅ Zero re-entry workflow

Start by creating your first matter with document upload!
