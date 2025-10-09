# AWS SES Setup Guide for LexoHub

## 🎯 Overview
This guide will help you set up AWS Simple Email Service (SES) with your new `noreply@lexo.co.za` domain to enable professional email functionality in LexoHub.

## 📧 Email Domain Configuration
Your email hosting provider has configured:
- **Email Address**: `noreply@lexo.co.za`
- **Password**: `@A!#t1Wmdxf8`
- **Alternative Email**: `lexohubza@gmail.com`

## 🔧 AWS SES Setup Steps

### Step 1: Verify Your Domain in AWS SES

1. **Log into AWS Console** and navigate to SES
2. **Add Domain**: Go to "Verified identities" → "Create identity"
3. **Enter Domain**: `lexo.co.za`
4. **Choose Verification Method**: DKIM (recommended)

### Step 2: Add DNS Records
AWS will provide DNS records to add to your domain. Based on your hosting setup, add these to your DNS:

#### Required SES Verification Records:
```
# AWS will provide these - add them to your DNS
TXT record: _amazonses.lexo.co.za
CNAME records: For DKIM verification
```

#### Your Current DNS Records (Already Configured):
```
# MX Records (Email Routing)
lexo.co.za IN MX us2.mx1.mailhostbox.com.
lexo.co.za IN MX us2.mx2.mailhostbox.com.
lexo.co.za IN MX us2.mx3.mailhostbox.com.

# SPF Record (Already configured)
lexo.co.za IN TXT "v=spf1 redirect=_spf.mailhostbox.com"

# DKIM Record (Already configured)
20250930._domainkey.lexo.co.za IN TXT "v=DKIM1; g=*; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCjTk2mEEh+4LV9Z09zudijQ3g1q+ENvLAywJL+BGnDqqGZhMhR6McSQlf+qWfw/g/RTNPVqI9PjiV2wSKrBXfELts/dG1u7LR8QTtzTOT0jl3tf1ZxKTXncRbQl4gif8BHCLG+hA6YgI34Maex7SSyId7RUSC/v0Kn4JWjxCrKMwIDAQAB"
```

### Step 3: Configure AWS Credentials

1. **Create IAM User** with SES permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail",
           "ses:GetSendQuota",
           "ses:GetSendStatistics"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

2. **Update your `.env` file**:
   ```env
   # AWS Configuration
   VITE_AWS_REGION=us-east-1
   VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id
   VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   
   # AWS SES Configuration
   VITE_AWS_SES_FROM_EMAIL=noreply@lexo.co.za
   VITE_AWS_SES_REGION=us-east-1
   ```

### Step 4: Request Production Access

1. **Move out of Sandbox**: By default, SES is in sandbox mode
2. **Submit Request**: Go to "Account dashboard" → "Request production access"
3. **Provide Details**:
   - Use case: Legal practice management system
   - Email types: Transactional (invoices, reminders, notifications)
   - Expected volume: Start with 200 emails/day

## 🧪 Testing Your Setup

### Test Email Functionality
Once configured, your LexoHub application can send:

1. **Invoice Emails**: Professional invoices with PDF attachments
2. **Payment Reminders**: Automated reminder system
3. **Pro Forma Requests**: Estimate requests to attorneys
4. **System Notifications**: Account and matter updates

### Test Commands
```bash
# Test the email service in your application
npm run dev
# Navigate to Invoices → Send Test Email
```

## 📋 Email Templates Available

Your application includes professional templates for:

- ✅ **Invoice Delivery**: Branded invoice emails with payment instructions
- ✅ **Payment Reminders**: Escalating reminder sequence
- ✅ **Pro Forma Requests**: Professional estimate requests
- ✅ **System Notifications**: Account and matter updates

## 🔒 Security Best Practices

1. **Use IAM Roles**: Limit SES permissions to minimum required
2. **Monitor Usage**: Set up CloudWatch alarms for unusual activity
3. **Validate Recipients**: Implement email validation
4. **Rate Limiting**: Respect SES sending limits

## 📊 Monitoring & Analytics

AWS SES provides:
- **Delivery Statistics**: Track email delivery rates
- **Bounce Handling**: Automatic bounce management
- **Complaint Handling**: Manage unsubscribe requests
- **Reputation Monitoring**: Track sender reputation

## 🚀 Next Steps

1. Complete AWS SES domain verification
2. Update your `.env` file with AWS credentials
3. Test email functionality in development
4. Request production access
5. Monitor email delivery and engagement

## 📞 Support

- **AWS SES Documentation**: https://docs.aws.amazon.com/ses/
- **LexoHub Email Service**: Check `src/services/aws-email.service.ts`
- **DNS Configuration**: Contact your hosting provider if needed

---

**Note**: Your email hosting is already configured. This guide focuses on adding AWS SES for application-generated emails while maintaining your existing email infrastructure.