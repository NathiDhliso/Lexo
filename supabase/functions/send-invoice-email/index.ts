/**
 * Supabase Edge Function: Send Invoice Email
 * Purpose: Send invoice PDF to attorney via email
 * Requirements: 8.5, 8.6
 * 
 * Deploy with: supabase functions deploy send-invoice-email
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InvoiceEmailRequest {
  to: string
  attorney_name: string
  advocate_name: string
  matter_title: string
  invoice_number: string
  pdf_attachment: string // base64
  include_portal_link: boolean
  invoice_id: string
}

// Email service configuration (use SendGrid, Resend, or any SMTP provider)
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'invoices@lexohub.com'
const FROM_NAME = Deno.env.get('FROM_NAME') || 'LexoHub Invoicing'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const {
      to,
      attorney_name,
      advocate_name,
      matter_title,
      invoice_number,
      pdf_attachment,
      include_portal_link,
      invoice_id,
    }: InvoiceEmailRequest = await req.json()

    // Validate inputs
    if (!to || !attorney_name || !invoice_number || !pdf_attachment) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build email HTML
    const portalLinkHtml = include_portal_link
      ? `
        <div style="background-color: #EBF5FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2962FF;">Access Your Client Portal</h3>
          <p>You've been invited to access the LexoHub client portal where you can:</p>
          <ul>
            <li>View all your matters</li>
            <li>Download invoices</li>
            <li>Track payment status</li>
            <li>Communicate securely</li>
          </ul>
          <a href="${Deno.env.get('PORTAL_URL')}/attorney/register?invoice=${invoice_id}"
             style="display: inline-block; background-color: #2962FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Register for Portal Access
          </a>
        </div>
      `
      : ''

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice_number}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #2962FF; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Invoice Received</h1>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Dear ${attorney_name},</p>
    
    <p>You have received an invoice from <strong>${advocate_name}</strong> for the following matter:</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 6px; border-left: 4px solid #2962FF; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Invoice Number:</td>
          <td style="padding: 8px 0;">${invoice_number}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Matter:</td>
          <td style="padding: 8px 0;">${matter_title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">From:</td>
          <td style="padding: 8px 0;">${advocate_name}</td>
        </tr>
      </table>
    </div>
    
    <p>Please find the invoice attached as a PDF document.</p>
    
    ${portalLinkHtml}
    
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      If you have any questions about this invoice, please contact ${advocate_name} directly.
    </p>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
    <p>This is an automated email from LexoHub. Please do not reply to this email.</p>
  </div>
</body>
</html>
    `

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to, name: attorney_name }],
          },
        ],
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: `Invoice ${invoice_number} - ${matter_title}`,
        content: [
          {
            type: 'text/html',
            value: emailHtml,
          },
        ],
        attachments: [
          {
            content: pdf_attachment,
            filename: `Invoice_${invoice_number}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      }),
    })

    if (!sendGridResponse.ok) {
      const error = await sendGridResponse.text()
      console.error('SendGrid error:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invoice sent to ${to}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-invoice-email function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
