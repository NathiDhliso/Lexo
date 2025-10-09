import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  attachments?: EmailAttachment[];
}

class AWSEmailService {
  private sesClient: SESClient | null = null;
  private fromEmail: string;
  private region: string;

  constructor() {
    this.fromEmail = import.meta.env.VITE_AWS_SES_FROM_EMAIL || '';
    this.region = import.meta.env.VITE_AWS_SES_REGION || 'us-east-1';

    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

    if (!this.fromEmail || !accessKeyId || !secretAccessKey) {
      console.warn('AWS SES credentials not configured. Email delivery will be simulated.');
      return;
    }

    try {
      this.sesClient = new SESClient({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } catch (error) {
      console.error('Failed to initialize AWS SES client:', error);
    }
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, htmlBody, textBody } = params;

    if (!this.sesClient) {
      console.log('[MOCK] Email would be sent:', { to, subject });
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }

    try {
      const recipients = Array.isArray(to) ? to : [to];

      const emailParams: SendEmailCommandInput = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: recipients,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            ...(textBody && {
              Text: {
                Data: textBody,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      };

      const command = new SendEmailCommand(emailParams);
      const response = await this.sesClient.send(command);

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error) {
      console.error('Failed to send email via AWS SES:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendInvoiceEmail(params: {
    recipientEmail: string;
    recipientName: string;
    invoiceNumber: string;
    invoiceAmount: number;
    dueDate: string;
    downloadUrl?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientEmail, recipientName, invoiceNumber, invoiceAmount, dueDate, downloadUrl } = params;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9fafb; }
            .invoice-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice from LexoHub</h1>
            </div>
            <div class="content">
              <p>Dear ${recipientName},</p>
              <p>Please find your invoice details below:</p>
              
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Invoice Number:</span>
                  <span class="detail-value">${invoiceNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Due:</span>
                  <span class="detail-value amount">R ${invoiceAmount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Due Date:</span>
                  <span class="detail-value">${dueDate}</span>
                </div>
              </div>

              ${downloadUrl ? `<a href="${downloadUrl}" class="button">Download Invoice PDF</a>` : ''}

              <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
              
              <p>Thank you for your business.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from LexoHub</p>
              <p>&copy; ${new Date().getFullYear()} LexoHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
Invoice from LexoHub

Dear ${recipientName},

Please find your invoice details below:

Invoice Number: ${invoiceNumber}
Amount Due: R ${invoiceAmount.toFixed(2)}
Due Date: ${dueDate}

${downloadUrl ? `Download Invoice: ${downloadUrl}` : ''}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business.

This is an automated message from LexoHub
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoiceNumber} - R ${invoiceAmount.toFixed(2)}`,
      htmlBody,
      textBody,
    });
  }

  async sendProFormaEmail(params: {
    recipientEmail: string;
    recipientName: string;
    proFormaNumber: string;
    estimatedAmount: number;
    matterTitle: string;
    validUntil?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientEmail, recipientName, proFormaNumber, estimatedAmount, matterTitle, validUntil } = params;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9fafb; }
            .quote-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .amount { font-size: 24px; font-weight: bold; color: #059669; }
            .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pro Forma Quote from LexoHub</h1>
            </div>
            <div class="content">
              <p>Dear ${recipientName},</p>
              <p>Thank you for your inquiry. Please find your pro forma quote below:</p>
              
              <div class="quote-details">
                <div class="detail-row">
                  <span class="detail-label">Quote Number:</span>
                  <span class="detail-value">${proFormaNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Matter:</span>
                  <span class="detail-value">${matterTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Estimated Amount:</span>
                  <span class="detail-value amount">R ${estimatedAmount.toFixed(2)}</span>
                </div>
                ${validUntil ? `
                <div class="detail-row">
                  <span class="detail-label">Valid Until:</span>
                  <span class="detail-value">${validUntil}</span>
                </div>
                ` : ''}
              </div>

              <p>This is an estimated quote for the legal services described. The final invoice may vary based on actual time spent and expenses incurred.</p>
              
              <p>If you would like to proceed or have any questions, please contact us.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from LexoHub</p>
              <p>&copy; ${new Date().getFullYear()} LexoHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
Pro Forma Quote from LexoHub

Dear ${recipientName},

Thank you for your inquiry. Please find your pro forma quote below:

Quote Number: ${proFormaNumber}
Matter: ${matterTitle}
Estimated Amount: R ${estimatedAmount.toFixed(2)}
${validUntil ? `Valid Until: ${validUntil}` : ''}

This is an estimated quote for the legal services described. The final invoice may vary based on actual time spent and expenses incurred.

If you would like to proceed or have any questions, please contact us.

This is an automated message from LexoHub
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Pro Forma Quote ${proFormaNumber} - ${matterTitle}`,
      htmlBody,
      textBody,
    });
  }

  async sendPaymentReminderEmail(params: {
    recipientEmail: string;
    recipientName: string;
    invoiceNumber: string;
    amountDue: number;
    dueDate: string;
    daysOverdue: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientEmail, recipientName, invoiceNumber, amountDue, dueDate, daysOverdue } = params;

    const urgency = daysOverdue > 30 ? 'urgent' : daysOverdue > 14 ? 'important' : 'friendly';
    const headerColor = urgency === 'urgent' ? '#dc2626' : urgency === 'important' ? '#f59e0b' : '#2563eb';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9fafb; }
            .reminder-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .amount { font-size: 24px; font-weight: bold; color: ${headerColor}; }
            .overdue-badge { display: inline-block; padding: 6px 12px; background-color: #fee2e2; color: #dc2626; border-radius: 4px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${recipientName},</p>
              <p>This is a ${urgency} reminder regarding the following invoice:</p>
              
              <div class="reminder-details">
                <div class="detail-row">
                  <span class="detail-label">Invoice Number:</span>
                  <span class="detail-value">${invoiceNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Due:</span>
                  <span class="detail-value amount">R ${amountDue.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Due Date:</span>
                  <span class="detail-value">${dueDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value"><span class="overdue-badge">${daysOverdue} days overdue</span></span>
                </div>
              </div>

              <p>${urgency === 'urgent' 
                ? 'This invoice is significantly overdue. Please arrange payment as soon as possible to avoid further action.' 
                : urgency === 'important'
                ? 'This invoice is now overdue. Please arrange payment at your earliest convenience.'
                : 'We kindly request that you settle this invoice at your earliest convenience.'
              }</p>
              
              <p>If you have already made payment, please disregard this reminder. If you have any questions or concerns, please contact us.</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from LexoHub</p>
              <p>&copy; ${new Date().getFullYear()} LexoHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
Payment Reminder

Dear ${recipientName},

This is a ${urgency} reminder regarding the following invoice:

Invoice Number: ${invoiceNumber}
Amount Due: R ${amountDue.toFixed(2)}
Due Date: ${dueDate}
Status: ${daysOverdue} days overdue

${urgency === 'urgent' 
  ? 'This invoice is significantly overdue. Please arrange payment as soon as possible to avoid further action.' 
  : urgency === 'important'
  ? 'This invoice is now overdue. Please arrange payment at your earliest convenience.'
  : 'We kindly request that you settle this invoice at your earliest convenience.'
}

If you have already made payment, please disregard this reminder. If you have any questions or concerns, please contact us.

This is an automated reminder from LexoHub
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Payment Reminder: Invoice ${invoiceNumber} - ${daysOverdue} days overdue`,
      htmlBody,
      textBody,
    });
  }

  isConfigured(): boolean {
    return this.sesClient !== null;
  }
}

export const awsEmailService = new AWSEmailService();
