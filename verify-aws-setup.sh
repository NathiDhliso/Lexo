#!/bin/bash

echo "🔍 LexoHub AWS Setup Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS CLI
echo "1. Checking AWS CLI..."
if command -v aws &> /dev/null; then
    echo -e "${GREEN}✓ AWS CLI installed${NC}"
    aws --version
else
    echo -e "${RED}✗ AWS CLI not installed${NC}"
    echo "  Install: https://aws.amazon.com/cli/"
fi
echo ""

# Check credentials
echo "2. Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✓ AWS credentials configured${NC}"
    aws sts get-caller-identity
else
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "  Run: aws configure"
fi
echo ""

# Check S3 bucket
echo "3. Checking S3 bucket (lexohub-documents)..."
if aws s3 ls s3://lexohub-documents &> /dev/null; then
    echo -e "${GREEN}✓ S3 bucket exists${NC}"
    echo "  Bucket: lexohub-documents"
else
    echo -e "${YELLOW}⚠ S3 bucket not found${NC}"
    echo "  Create: aws s3 mb s3://lexohub-documents --region us-east-1"
fi
echo ""

# Check SES
echo "4. Checking SES email verification..."
SES_STATUS=$(aws ses get-identity-verification-attributes \
    --identities noreply@lexohub.co.za \
    --region us-east-1\
    --query 'VerificationAttributes."noreply@lexohub.co.za".VerificationStatus' \
    --output text 2>/dev/null)

if [ "$SES_STATUS" == "Success" ]; then
    echo -e "${GREEN}✓ SES email verified${NC}"
    echo "  Email: noreply@lexohub.co.za"
elif [ "$SES_STATUS" == "Pending" ]; then
    echo -e "${YELLOW}⚠ SES email verification pending${NC}"
    echo "  Check your email for verification link"
else
    echo -e "${YELLOW}⚠ SES email not verified${NC}"
    echo "  Verify: aws ses verify-email-identity --email-address noreply@lexohub.co.za --region us-east-1"
fi
echo ""

# Check Bedrock access
echo "5. Checking Bedrock model access..."
BEDROCK_MODELS=$(aws bedrock list-foundation-models \
    --region us-east-1 \
    --query 'modelSummaries[?contains(modelId, `claude-3-sonnet`)].modelId' \
    --output text 2>/dev/null)

if [ -n "$BEDROCK_MODELS" ]; then
    echo -e "${GREEN}✓ Bedrock Claude 3 Sonnet available${NC}"
    echo "  Model: anthropic.claude-3-sonnet-20240229-v1:0"
else
    echo -e "${YELLOW}⚠ Bedrock model access not confirmed${NC}"
    echo "  Request access: AWS Console → Bedrock → Model access"
fi
echo ""

# Check Textract
echo "6. Checking Textract availability..."
if aws textract detect-document-text \
    --document '{"S3Object":{"Bucket":"lexohub-documents","Name":"test.txt"}}' \
    --region us-east-1 &> /dev/null; then
    echo -e "${GREEN}✓ Textract available${NC}"
else
    echo -e "${YELLOW}⚠ Textract test failed (may need test document)${NC}"
    echo "  Service should be available with your credentials"
fi
echo ""

# Summary
echo "=================================="
echo "📋 Summary"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. If any checks failed, follow the instructions above"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "4. Test document upload in the app"
echo ""
echo "For detailed setup instructions, see:"
echo "  - AWS_SETUP_CHECKLIST.md"
echo "  - AWS_INTEGRATION_GUIDE.md"
echo ""
