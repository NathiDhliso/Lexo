# Invoice Email Delivery - Edge Function Setup

## Overview
Supabase Edge Function for sending invoice PDFs to attorneys via email.

## Configuration

### Environment Variables
Set these in your Supabase project settings:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# Email Settings
FROM_EMAIL=invoices@lexohub.com
FROM_NAME=LexoHub Invoicing

# Portal URL
PORTAL_URL=https://yourdomain.com
```

## Deployment

### 1. Deploy the function
```bash
supabase functions deploy send-invoice-email
```

### 2. Set environment secrets
```bash
supabase secrets set SENDGRID_API_KEY=your_api_key_here
supabase secrets set FROM_EMAIL=invoices@lexohub.com
supabase secrets set FROM_NAME="LexoHub Invoicing"
supabase secrets set PORTAL_URL=https://yourdomain.com
```

### 3. Test the function
```bash
curl -i --location --request POST 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-invoice-email' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "attorney@lawfirm.com",
    "attorney_name": "John Smith",
    "advocate_name": "Jane Advocate",
    "matter_title": "Test Matter",
    "invoice_number": "INV-2025-001",
    "pdf_attachment": "base64_encoded_pdf_here",
    "include_portal_link": true,
    "invoice_id": "uuid-here"
  }'
```

## Email Providers

### SendGrid (Current)
- Sign up at https://sendgrid.com
- Create API key with Mail Send permissions
- Set `SENDGRID_API_KEY` environment variable

### Alternative: Resend
Replace the SendGrid code with:
```typescript
const resendResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: FROM_EMAIL,
    to: [to],
    subject: `Invoice ${invoice_number} - ${matter_title}`,
    html: emailHtml,
    attachments: [{
      filename: `Invoice_${invoice_number}.pdf`,
      content: pdf_attachment,
    }],
  }),
})
```

### Alternative: AWS SES
```typescript
// Use AWS SDK for SES
import { SESClient, SendRawEmailCommand } from 'https://deno.land/x/aws_sdk@v3.32.0-1/client-ses/mod.ts'
```

## Features
- ✅ PDF attachment
- ✅ Professional HTML email template
- ✅ Optional portal registration link
- ✅ Matter details in email body
- ✅ CORS support
- ✅ Error handling and logging

## Usage in Frontend

```typescript
import { supabase } from './lib/supabase'
import { invoiceEmailDeliveryService } from './services/api/invoice-email-delivery.service'

// Send invoice to unregistered attorney
await invoiceEmailDeliveryService.sendInvoiceToAttorney({
  invoice_id: 'uuid',
  attorney_email: 'attorney@firm.com',
  attorney_name: 'John Smith',
  advocate_name: 'Jane Advocate',
  matter_title: 'Case XYZ',
  invoice_number: 'INV-2025-001',
  include_portal_link: true
})
```

## Monitoring
Check function logs:
```bash
supabase functions logs send-invoice-email
```

## Testing
Use the Supabase dashboard to test the function with sample data.
