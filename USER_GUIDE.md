# LexoHub User Guide

**Welcome to LexoHub** - Your complete legal practice management system designed specifically for South African advocates.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [The 3-Step Workflow](#the-3-step-workflow)
3. [Dashboard](#dashboard)
4. [Pro Forma Requests (Quotes)](#pro-forma-requests-quotes)
5. [Matters Management](#matters-management)
6. [Invoicing & Billing](#invoicing--billing)
7. [Time Tracking](#time-tracking)
8. [Payment Tracking](#payment-tracking)
9. [Reports & Analytics](#reports--analytics)
10. [Settings & Configuration](#settings--configuration)
11. [Profile Management](#profile-management)
12. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### What is LexoHub?

LexoHub is a comprehensive practice management system that helps advocates manage their entire workflow from initial client quotes through to final payment collection. The system is designed around South African legal practices with built-in VAT calculations, Bar-compliant formatting, and local currency support.

### First Login

When you first log in, you'll see your Dashboard with quick access to all major features. The navigation bar at the top provides access to:
- **Dashboard** - Your practice overview
- **Pro Forma** - Quote management
- **Matters** - Active case management
- **Invoices** - Billing and payments
- **Reports** - Analytics and insights
- **Profile** - Your professional information
- **Settings** - System configuration

---

## The 3-Step Workflow

LexoHub follows a structured 3-step workflow that ensures proper documentation and billing:

```
Step 1: PRO FORMA (Quote) → Step 2: MATTER (Case) → Step 3: INVOICE (Billing)
```

### Why This Workflow?

1. **Pro Forma First**: Always start with a quote to set client expectations
2. **Matter Conversion**: Accepted quotes become active matters
3. **Automated Billing**: All work is tracked and automatically flows into invoices

**Important**: You cannot create matters directly - they must be converted from accepted pro forma requests.

---

## Dashboard

Your Dashboard provides a real-time overview of your practice.

### Key Metrics

**Invoice Metrics**
- **Total Invoices**: All invoices you've generated
- **Pro Forma Invoices**: Pending quotes awaiting acceptance
- **Overdue Invoices**: Invoices past their due date (requires attention)
- **Collected This Month**: Revenue received in the current month

**Practice Metrics**
- **Active Matters**: Currently open cases
- **Outstanding WIP**: Work in Progress value (unbilled work)
- **This Month Billing**: Revenue generated this month
- **Overdue Invoices**: Count of overdue payments

**Performance Indicators**
- **Collection Rate**: Percentage of invoices successfully collected
- **Average Bill Time**: Days between work completion and invoicing
- **Settlement Rate**: Percentage of matters successfully settled

### Quick Actions

Click the quick action buttons to:
- **Pro Formas**: View and create quotes
- **View Matters**: Access your active cases
- **Invoices**: Generate and manage invoices

### Recent Activity

- **Recent Matters**: Your 5 most recent cases with status
- **Recent Invoices**: Latest invoices with payment status
- **Practice Performance**: Key performance metrics

---

## Pro Forma Requests (Quotes)

Pro Forma requests are professional quotes you send to attorneys before starting work.

### Creating a Pro Forma

1. Click **"New Pro Forma"** button
2. Fill in the details:
   - **Work Title**: Brief description of the work
   - **Attorney Information**: Instructing attorney name and firm
   - **Work Description**: Detailed scope of work
   - **Estimated Amount**: Your quote (including VAT)
   - **Urgency**: Low, Medium, or High priority
3. Click **"Create Pro Forma"**

### Pro Forma Status

- **Draft**: Created but not yet sent
- **Sent**: Delivered to the attorney
- **Accepted**: Attorney has accepted your quote
- **Declined**: Attorney declined the quote
- **Converted**: Successfully converted to a matter
- **Expired**: Quote validity period has passed

### Actions You Can Take

**For Draft Pro Formas:**
- **Generate Link**: Create a shareable link for the attorney
- **Send Quote**: Mark as sent to attorney
- **Download PDF**: Get a professional PDF version

**For Sent Pro Formas:**
- **Mark Accepted**: When attorney accepts your quote

**For Accepted Pro Formas:**
- **Convert to Matter**: Create an active case from the quote
- **Download PDF**: Get the accepted quote document

**For Converted Pro Formas:**
- **View Matter**: Navigate to the active case
- **Reverse**: Undo the conversion (deletes the matter)

### VAT Display

All pro forma amounts automatically show:
- Subtotal (excluding VAT)
- VAT (15%)
- Total (including VAT)

---

## Matters Management

Matters are your active legal cases, converted from accepted pro forma requests.

### Creating a Matter

**Important**: Matters can only be created by converting an accepted pro forma request.

1. Go to **Pro Forma** page
2. Find an **Accepted** pro forma
3. Click **"Convert to Matter"**
4. Review and confirm the conversion

### Matter Information

Each matter displays:
- **Title**: Case name
- **Status**: Active, Pending, Settled, or Closed
- **Client Name**: Your client
- **Instructing Attorney**: The attorney who briefed you
- **Matter Type**: Category of legal work
- **WIP Value**: Current unbilled work value
- **Associated Services**: Linked service categories

### Matter Status Indicators

- **Active** (Green): Currently working on this matter
- **Pending** (Yellow): Awaiting action or information
- **Settled** (Blue): Successfully resolved
- **Closed** (Gray): Completed and archived

### Health Check Warnings

LexoHub automatically monitors your matters:

**High WIP Inactive** (Amber warning):
- Matter has over R50,000 in unbilled work
- No recent activity for 30+ days
- **Action**: Review and consider billing

**Approaching Prescription** (Clock icon):
- Matter is approaching the 3-year prescription period
- Within 6 months of prescription
- **Action**: Urgent review required

### Matter Actions

- **View**: See complete matter details
- **Edit**: Update matter information
- **Reverse**: Convert back to pro forma (if needed)

### Searching Matters

Use the search bar to find matters by:
- Matter title
- Client name
- Instructing attorney name

### Filtering Matters

- **Active Matters**: Show only active cases
- **All Matters**: Show all cases regardless of status

---

## Invoicing & Billing

The Invoices page is your complete billing hub with 4 tabs.

### Tab 1: Invoices

Generate and manage your invoices.

#### Creating an Invoice

1. Click **"Generate Invoice"** button
2. **Select Matter**: Choose the case to bill
3. **Review Auto-Imported Items**:
   - Pro forma services (if linked)
   - Time entries (unbilled only)
   - Expenses
4. **Configure Invoice**:
   - Select items to include
   - Adjust quantities or rates if needed
   - Add additional line items
5. **Generate**: Create the invoice

#### Invoice Features

- **Auto-Import**: System automatically loads all billable items
- **Matter-Centric**: Everything links through the matter
- **VAT Compliant**: Automatic 15% VAT calculations
- **Bar-Compliant**: Professional formatting for legal invoices

#### Invoice Status

- **Draft**: Created but not finalized
- **Sent**: Delivered to client
- **Paid**: Payment received
- **Overdue**: Past due date
- **Partially Paid**: Some payment received

#### Invoice Actions

- **View**: See invoice details
- **Edit**: Modify draft invoices
- **Send**: Deliver to client
- **Record Payment**: Log received payments
- **Download PDF**: Get printable version

### Tab 2: Pro Forma

View all your pro forma requests in one place:
- Filter by status
- Track conversion rates
- Monitor pending quotes

### Tab 3: Time Entries

View all time entries grouped by matter:
- See unbilled vs billed time
- Review time by matter
- Generate invoices directly from time entries

### Tab 4: Payment Tracking

Monitor your payment status:
- **Outstanding Invoices**: Unpaid amounts
- **Overdue Tracking**: Past due invoices
- **Payment History**: Received payments
- **Aging Report**: How long invoices have been outstanding

---

## Time Tracking

Track billable hours for accurate invoicing.

### Recording Time

1. Navigate to a matter
2. Click **"Add Time Entry"**
3. Enter:
   - **Date**: When work was performed
   - **Hours**: Time spent
   - **Description**: What you did
   - **Rate**: Hourly rate (auto-filled from settings)
4. Save the entry

### Time Entry Status

- **Unbilled**: Not yet invoiced
- **Billed**: Included in an invoice

### Viewing Time Entries

Go to **Invoices → Time Entries** tab to see:
- All time entries grouped by matter
- Total unbilled hours
- Total unbilled value
- Quick invoice generation

---

## Payment Tracking

Monitor and manage invoice payments.

### Payment Dashboard

The Payment Tracking tab shows:
- **Total Outstanding**: All unpaid invoice amounts
- **Overdue Amount**: Past due invoices
- **This Month Collections**: Payments received
- **Average Payment Days**: How long clients take to pay

### Recording Payments

1. Find the invoice
2. Click **"Record Payment"**
3. Enter:
   - **Amount**: Payment received
   - **Date**: When received
   - **Method**: Payment method
   - **Reference**: Transaction reference
4. Save

### Payment Status

- **Paid in Full**: Complete payment received
- **Partially Paid**: Some payment received
- **Unpaid**: No payment yet
- **Overdue**: Past due date

---

## Reports & Analytics

Generate insights about your practice.

### Available Reports

1. **WIP Report**
   - Total unbilled work
   - WIP by matter
   - Aging analysis

2. **Revenue Report**
   - Total revenue
   - Paid vs unpaid invoices
   - Revenue by matter type

3. **Matter Pipeline**
   - Active matters count
   - Paused matters
   - Completed matters

4. **Client Revenue**
   - Revenue by client
   - Top clients
   - Client profitability

5. **Time Entry Summary**
   - Total hours tracked
   - Total value
   - Billable vs non-billable

6. **Outstanding Invoices**
   - All unpaid invoices
   - Total outstanding amount
   - By client

7. **Aging Report**
   - 0-30 days outstanding
   - 31-60 days
   - 61-90 days
   - 90+ days (urgent)

8. **Matter Profitability**
   - Estimated vs actual
   - Profit margins
   - Cost analysis

9. **Custom Report**
   - Build your own report
   - Select data points
   - Custom date ranges

### Generating Reports

1. Click on a report type
2. Set date range (if applicable)
3. Apply filters
4. Click **"Generate Report"**
5. Export to CSV or PDF

---

## Settings & Configuration

Customize LexoHub to match your practice.

### Workflow Settings

Configure your 3-step workflow:

**Pro Forma Settings**
- **Auto Progress Matters**: Automatically convert accepted quotes
- **Pro Forma Expiry Days**: How long quotes remain valid (default: 30 days)

**Invoice Settings**
- **Require Approval**: Invoices need approval before sending
- **Default Hourly Rate**: Your standard rate (in ZAR)
- **Auto Time Tracking**: Automatically track time spent

### Rate Cards

Create standardized pricing for your services.

#### Creating a Rate Card

1. Go to **Settings → Rate Cards**
2. Click **"Create Rate Card"**
3. Fill in:
   - **Service Name**: e.g., "Court Appearance"
   - **Category**: Consultation, Drafting, Court Appearance, etc.
   - **Pricing Type**: Hourly or Fixed Fee
   - **Rate**: Your price
   - **Estimated Hours**: Time estimate
4. Save

#### Rate Card Benefits

- **Consistent Pricing**: Same rates across all matters
- **Quick Quoting**: Pre-filled rates for pro formas
- **Professional**: Standardized service offerings

#### Standard Service Templates

LexoHub includes pre-configured South African legal service templates:
- Consultation services
- Research and drafting
- Court appearances
- Document review
- And more

Click **"Create from Template"** to use these.

### PDF Templates

Customize your invoice and pro forma PDF appearance:
- **Header**: Your practice information
- **Logo**: Upload your logo
- **Footer**: Contact details and terms
- **Colors**: Match your branding

---

## Profile Management

Maintain your professional information.

### Profile Information

- **Name**: Your full name
- **Email**: Contact email
- **Phone**: Contact number
- **Practice Number**: Your Bar Council number
- **Chambers**: Your chambers address
- **Admission Date**: When you were admitted
- **Specializations**: Your areas of expertise

### Editing Your Profile

1. Go to **Profile**
2. Click **"Edit Profile"**
3. Update your information
4. Click **"Save Changes"**

### Professional Summary

- **Specializations**: Your practice areas
- **Experience**: Years of practice
- **Success Rate**: Case success percentage
- **Total Matters**: Lifetime matter count
- **Total Recovered**: Total amounts recovered

---

## Tips & Best Practices

### Workflow Best Practices

1. **Always Start with Pro Forma**
   - Never skip the quote step
   - Sets clear expectations
   - Protects you and the client

2. **Convert Promptly**
   - Convert accepted quotes to matters quickly
   - Start tracking time immediately
   - Maintain accurate records

3. **Regular Billing**
   - Bill monthly or at milestones
   - Don't let WIP accumulate
   - Watch for high WIP warnings

4. **Track Time Daily**
   - Record time as you work
   - Don't rely on memory
   - Include detailed descriptions

5. **Monitor Payments**
   - Check payment tracking weekly
   - Follow up on overdue invoices
   - Maintain cash flow

### Financial Management

1. **Use Rate Cards**
   - Standardize your pricing
   - Ensure consistency
   - Speed up quoting

2. **Review WIP Monthly**
   - Check unbilled work
   - Bill promptly
   - Avoid prescription issues

3. **Monitor Aging**
   - Track invoice aging
   - Follow up at 30 days
   - Escalate at 60 days

4. **Analyze Reports**
   - Review monthly reports
   - Identify trends
   - Adjust strategies

### Matter Management

1. **Keep Matters Updated**
   - Update status regularly
   - Add notes and documents
   - Track deadlines

2. **Watch Health Indicators**
   - Address high WIP warnings
   - Monitor prescription dates
   - Take action promptly

3. **Link Services**
   - Associate services with matters
   - Track service delivery
   - Improve reporting

### System Usage

1. **Use Search**
   - Find matters quickly
   - Search by client or attorney
   - Save time navigating

2. **Leverage Filters**
   - Filter by status
   - Focus on active work
   - Reduce clutter

3. **Export Data**
   - Download reports regularly
   - Keep external backups
   - Share with stakeholders

---

## Quick Reference

### Common Tasks

| Task | Steps |
|------|-------|
| Create Quote | Pro Forma → New Pro Forma → Fill Details → Create |
| Convert to Matter | Pro Forma → Find Accepted → Convert to Matter |
| Generate Invoice | Invoices → Generate Invoice → Select Matter → Review → Generate |
| Record Time | Matter → Add Time Entry → Fill Details → Save |
| Record Payment | Invoices → Find Invoice → Record Payment → Enter Details |
| View Reports | Reports → Select Report Type → Generate |

### Keyboard Shortcuts

- **Ctrl/Cmd + K**: Open command bar (quick navigation)
- **Esc**: Close modals
- **Tab**: Navigate form fields

### Status Colors

- **Green**: Active, Paid, Success
- **Yellow**: Pending, Warning
- **Blue**: Sent, In Progress
- **Red**: Overdue, Declined, Error
- **Purple**: Converted
- **Gray**: Draft, Inactive, Closed

---

## Support & Help

### Getting Help

- **In-App Help**: Look for the (?) icon throughout the system
- **Tooltips**: Hover over elements for quick tips
- **Validation**: System will warn you of errors

### Common Questions

**Q: Why can't I create a matter directly?**
A: LexoHub enforces the 3-step workflow. All matters must start as pro forma requests to ensure proper documentation and client agreement.

**Q: How do I handle rush work without a pro forma?**
A: Create a pro forma first, mark it as "High Priority," and immediately accept and convert it. This maintains your audit trail.

**Q: What if a client disputes an invoice?**
A: The system tracks all time entries and expenses linked to the matter, providing complete documentation for dispute resolution.

**Q: Can I reverse a matter conversion?**
A: Yes, use the "Reverse" button on the matter. This will delete the matter and restore the pro forma to "Accepted" status.

**Q: How do I handle partial payments?**
A: Record each payment separately. The system tracks the total paid and outstanding balance automatically.

---

## System Requirements

### Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

### Internet Connection

- Stable internet required
- Cloud-based system
- Auto-saves your work

### Mobile Access

- Responsive design
- Works on tablets and phones
- Touch-optimized interface

---

## Data & Security

### Your Data

- Stored securely in the cloud
- Automatic backups
- Encrypted connections

### Privacy

- Your data is private
- Not shared with third parties
- Compliant with POPIA

### Backups

- Automatic daily backups
- Export your data anytime
- Download reports for records

---

**Version**: 1.0  
**Last Updated**: January 2025  
**For**: LexoHub Users

---

*This guide covers the core features of LexoHub. For specific questions or advanced features, please contact support.*
