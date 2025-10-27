# LexoHub App - Complete Feature Documentation

**Last Updated:** October 27, 2025  
**Version:** 2.0  
**Purpose:** Comprehensive documentation of ALL features implemented in the LexoHub legal practice management application

**Major Update**: Added Billing Model Foundation, Trust Account System, Mobile Optimization, and Advanced Workflow Features

---

## 🆕 WHAT'S NEW IN VERSION 2.0

**For detailed information about new features, see:** [New Features 2025 Document](./NANTSIKE_APP_NEW_FEATURES_2025.md)

### Major Additions:
1. **Billing Model System** - Three billing models (Brief Fee, Time-Based, Quick Opinion) with adaptive UI
2. **Trust Account Management** - Complete LPC-compliant trust account system
3. **Mobile Optimization** - Full mobile support with offline capability, voice input, and camera integration
4. **Advanced Workflows** - Brief fee templates, attorney usage tracking, enhanced reporting
5. **Offline Mode** - Work without internet with automatic sync when online
6. **WhatsApp Integration** - Share invoices directly via WhatsApp
7. **Push Notifications** - Stay informed of important events
8. **Voice Input** - Speak instead of type on mobile devices
9. **Camera Receipt Capture** - Take photos of receipts and attach to disbursements
10. **Enhanced Analytics** - Improved dashboard and reporting with real-time insights

### Implementation Status:
- ✅ **Phase 1-5 Complete**: 87 implementation tasks finished
- ⏳ **Phase 6**: Testing & Refinement in progress
- ⏳ **Phase 7**: Documentation & Deployment upcoming

---

## 🔒 CORE PRIVACY PRINCIPLE

**NO DOCUMENT UPLOADS TO SERVERS**

This system does NOT store sensitive legal documents on servers. Instead:
- ✅ Attorneys can link to documents in their own cloud storage (Google Drive, OneDrive, Dropbox)
- ✅ You maintain complete control over sensitive materials
- ✅ Links are stored for reference, but documents stay in YOUR secure environment
- ✅ Read-only access to your cloud storage - we never download or store your files

---

## TABLE OF CONTENTS

1. [User Management & Authentication](#1-user-management--authentication)
2. [Billing Model System](#2-billing-model-system-new) ⭐ NEW
3. [Dual-Path Workflow System](#3-dual-path-workflow-system)
4. [Matter Management](#4-matter-management)
4. [Pro Forma (Quote) System](#4-pro-forma-quote-system)
5. [Matter Workbench (WIP Workspace)](#5-matter-workbench-wip-workspace)
6. [Time Tracking](#6-time-tracking)
7. [Disbursements & Expenses](#7-disbursements--expenses)
8. [Services Logging](#8-services-logging)
9. [Scope Amendments](#9-scope-amendments)
10. [Document Management (Cloud Linking)](#10-document-management-cloud-linking)
11. [Invoicing System](#11-invoicing-system)
12. [Payment Tracking](#12-payment-tracking)
13. [Credit Notes](#13-credit-notes)
14. [Firm Management](#14-firm-management)
15. [Attorney Portal](#15-attorney-portal)
16. [Dashboard & Analytics](#16-dashboard--analytics)
17. [Reports](#17-reports)
18. [Settings & Configuration](#18-settings--configuration)
19. [Quick Actions & Keyboard Shortcuts](#19-quick-actions--keyboard-shortcuts)
20. [Search & Filtering](#20-search--filtering)
21. [Audit Trail](#21-audit-trail)
22. [Notifications](#22-notifications)
23. [UI/UX Features](#23-uiux-features)

---

## 1. USER MANAGEMENT & AUTHENTICATION

### 1.1 User Roles
- **Advocate (Primary User)**: Full system access, practice owner
- **Attorney (External)**: Limited portal access for matter submission and tracking
- **Team Members**: (Future feature) Collaborative access

### 1.2 Authentication Features
- Email/password authentication via Supabase Auth
- Secure password hashing
- Session management
- Protected routes with role-based access control
- Automatic session refresh
- Logout functionality

### 1.3 User Profiles
- Full name, practice number, email, phone
- Bar association details
- Chambers address, postal address
- Hourly rate configuration
- Profile photo/avatar support
- Year admitted to practice

### 1.4 Attorney User Management
- Separate attorney user accounts
- Attorney registration via invitation tokens
- Firm-based attorney grouping
- Attorney-specific login portal
- Matter access control per attorney

---

## 2. BILLING MODEL SYSTEM (NEW)

### 2.1 Three Billing Models
The system now supports three distinct billing approaches:

**Brief Fee Model (Default)**
- Fixed fee agreed upfront
- No mandatory time tracking
- Fee milestones for progress tracking
- Traditional advocate billing approach
- Optional time tracking for internal analysis

**Time-Based Model**
- Hourly rate billing
- Comprehensive time tracking
- Budget tracking and comparison
- Detailed time entry management
- Automatic invoice generation from time entries

**Quick Opinion Model**
- Flat rate for quick consultations
- Fast turnaround matters
- Simplified workflow
- Fixed pricing structure

### 2.2 Billing Strategy Pattern
- Strategy pattern implementation for billing logic
- Automatic calculation based on billing model
- Model-specific validation rules
- Conditional UI rendering based on model
- Seamless model switching with data preservation

### 2.3 Billing Preferences
- **Onboarding Wizard**: Set primary workflow during setup
- **Default Billing Model**: Auto-select preferred model for new matters
- **Dashboard Configuration**: Customize widgets based on workflow
- **Time Tracking Preferences**: Show/hide time tracking by default
- **Milestone Auto-Creation**: Automatically create fee milestones

### 2.4 Adaptive Matter Workbench
- **Conditional Rendering**: UI adapts to billing model
- **Brief Fee View**: Shows fee milestones, hides mandatory time tracking
- **Time-Based View**: Prominent time tracking, budget comparison
- **Quick Opinion View**: Simplified interface for fast turnaround
- **Collapsible Time Tracking**: Optional time tracking for brief fees (internal analysis)

---

## 3. DUAL-PATH WORKFLOW SYSTEM

The application supports two distinct workflows for matter creation:

### 3.1 Path A: "Quote First" (Complex Matters)
**Flow:**
1. Attorney submits brief via portal → Matter status: "New Request"
2. Advocate reviews brief details
3. Advocate creates Pro Forma (estimate/quote)
4. Pro Forma sent to attorney → Status: "Awaiting Approval"
5. Attorney approves or declines
6. If approved: Convert to Active Matter
7. Track work against original budget
8. Request scope amendments when needed
9. Generate invoice from tracked work

**Features:**
- Formal quoting process
- Budget tracking and comparison
- Scope amendment workflow
- Original estimate vs actual cost comparison
- Pro forma to matter conversion
- Reverse conversion capability

### 3.2 Path B: "Accept & Work" (Traditional Brief Fee)
**Flow:**
1. Attorney phones/emails directly
2. Advocate uses Quick Brief Capture
3. Matter created immediately as "Active"
4. Work performed
5. Choose billing method:
   - Simple Fee Entry (fixed brief fee)
   - Time Tracking (hourly billing)
6. Generate invoice

**Features:**
- Quick Brief Capture modal (phone call workflow)
- Preconfigured answer templates
- Instant matter activation
- Flexible billing options
- Simplified workflow for routine matters

---


## 4. MATTER MANAGEMENT

### 4.1 Matter Creation Methods
1. **Quick Brief Capture** (Path B)
   - 6-step guided form
   - Capture during phone calls
   - Pre-configured templates
   - Auto-calculated deadlines
   - Instant activation

2. **Pro Forma Conversion** (Path A)
   - Convert approved quotes to matters
   - Preserve budget information
   - Link to original pro forma
   - Automatic reference numbering

3. **Attorney Portal Submission**
   - Attorneys submit briefs via web portal
   - Structured brief form
   - Document linking (cloud storage)
   - Status tracking

### 3.2 Matter Statuses
- **New Request**: Attorney submitted, awaiting advocate review
- **Awaiting Approval**: Pro forma sent, waiting for attorney response
- **Active**: Work in progress
- **Completed**: Work finished, ready for invoicing
- **Settled**: Matter resolved
- **Closed**: Archived/completed
- **Declined**: Request rejected
- **On Hold**: Temporarily paused

### 3.3 Matter Information
- Matter title and reference number
- Client name and details
- Instructing attorney and firm
- Matter type (Opinion, Court Appearance, Drafting, Research, etc.)
- Practice area (Commercial, Labour, Tax, Constitutional, etc.)
- Brief description and detailed notes
- Deadline/expected completion date
- Urgency level (Same Day, 1-2 Days, Within Week, etc.)
- Creation source tracking (quick_brief, proforma_conversion, attorney_portal)
- WIP (Work in Progress) value calculation
- Budget tracking (Path A)
- Associated services
- Document references (cloud links)

### 3.4 Matter Actions
- View matter details
- Edit matter information
- Archive/unarchive matters
- Delete matters (with confirmation)
- Navigate to Matter Workbench
- Request scope amendments
- Generate invoices
- Track payment status
- View matter history
- Bulk operations (archive, delete, export)

### 3.5 Matter Search & Filtering
- **Quick Search**: Real-time search across titles, clients, attorneys
- **Advanced Filters**:
  - Practice area
  - Matter type
  - Status (multiple selection)
  - Attorney firm
  - Date range (created, deadline)
  - Fee range (min/max)
  - Include archived matters toggle
- **Sort Options**:
  - Last activity
  - Deadline
  - Created date
  - Total fee
  - Matter title
  - Ascending/descending

### 3.6 Matter Statistics
- New requests count
- Active matters count
- Total WIP value
- Settled matters count
- Closed matters count
- Completion percentages
- Days in WIP
- Deadline tracking

### 3.7 Matter Archiving
- Archive completed/paid matters
- Optional archive reason
- Excluded from default views
- Searchable when "Include Archived" enabled
- Restore capability
- Full audit trail maintained

---

## 4. PRO FORMA (QUOTE) SYSTEM

### 4.1 Pro Forma Creation
- Create from new request
- Manual pro forma creation
- Service-based line items
- Automatic VAT calculation (15% SA rate)
- Quote number generation
- Estimated amount calculation
- Work description
- Urgency indicators

### 4.2 Pro Forma Statuses
- **Draft**: Being prepared
- **Sent**: Sent to attorney
- **Accepted**: Attorney approved
- **Declined**: Attorney rejected
- **Expired**: Past validity period
- **Converted**: Converted to active matter

### 4.3 Pro Forma Features
- PDF generation with advocate details
- VAT-compliant formatting
- Subtotal and total calculations
- Send to attorney via email
- Generate shareable link
- Attorney response tracking
- Responded_at timestamp
- Review and quote workflow

### 4.4 Pro Forma to Matter Conversion
- One-click conversion
- Preserve budget information
- Link matter to source pro forma
- Automatic status updates
- Reverse conversion capability
- Matter deletion restores pro forma

### 4.5 Pro Forma Actions
- Send quote to attorney
- Mark as accepted
- Convert to matter
- Download PDF
- Generate shareable link
- Reverse conversion
- View matter (if converted)
- Filter by status

---

## 5. MATTER WORKBENCH (WIP WORKSPACE)

The Matter Workbench is the central workspace for active matters, providing comprehensive work tracking and management.

### 5.1 Workbench Tabs
1. **Overview**: Matter summary, budget comparison, key metrics
2. **Time**: Time entry tracking and management
3. **Expenses**: Disbursement logging and tracking
4. **Services**: Service logging and management
5. **Amendments**: Scope amendment requests (Path A only)
6. **Documents**: Cloud-linked document management
7. **Invoicing**: Invoice generation and payment tracking

### 5.2 Path-Specific Actions

**Path A Actions:**
- Log Time Entry
- Log Expense/Disbursement
- Log Service
- Request Scope Amendment
- View Budget Comparison

**Path B Actions:**
- Simple Fee Entry
- Log Time Entry (optional)
- Log Expense/Disbursement (optional)

### 5.3 WIP Value Tracking
- Real-time WIP calculation
- Time entries total
- Disbursements total
- Services total
- Budget vs actual comparison (Path A)
- Amendment impact tracking
- Visual progress indicators

### 5.4 Budget Comparison Widget (Path A)
- Original pro forma budget
- Amendment total
- Current WIP value
- Remaining budget
- Over/under budget indicators
- Amendment count
- Visual progress bars

---

## 6. TIME TRACKING

### 6.1 Time Entry Features
- Matter association
- Date and time logging
- Duration tracking (hours and minutes)
- Hourly rate configuration
- Description/notes
- Billable/non-billable toggle
- Activity type categorization
- Automatic amount calculation

### 6.2 Time Entry Management
- Add new time entries
- Edit existing entries
- Delete entries
- Bulk time entry
- Time entry templates
- Quick time logging from workbench

### 6.3 Time Entry Display
- Chronological listing
- Total hours calculation
- Total value calculation
- Filter by date range
- Group by matter
- Export to CSV/PDF

### 6.4 Time Entry Integration
- Automatic WIP value updates
- Invoice line item generation
- Matter workbench integration
- Dashboard time metrics
- Reports integration

---

## 7. DISBURSEMENTS & EXPENSES

### 7.1 Disbursement Features
- Description and amount
- Date incurred (defaults to today)
- VAT applicable toggle (defaults to Yes)
- Automatic VAT calculation (15%)
- Receipt link (cloud storage)
- Matter association
- Category/type classification

### 7.2 Common Disbursement Types
- Court transcripts
- Travel expenses
- Expert witness fees
- Printing and binding
- Filing fees
- Research database access
- Courier services
- Photocopying

### 7.3 Disbursement Management
- Log new disbursements
- Edit existing disbursements
- Delete disbursements
- Quick disbursement modal
- Bulk disbursement entry

### 7.4 Disbursement Display
- Disbursements table with columns:
  - Date
  - Description
  - Amount (excl VAT)
  - VAT amount
  - Total (incl VAT)
- Total unbilled disbursements
- Filter by date range
- Export capabilities

### 7.5 Disbursement Integration
- Automatic WIP value updates
- Automatic invoice inclusion
- Separate from professional fees on invoices
- WIP report tracking
- Matter workbench integration

---

## 8. SERVICES LOGGING

### 8.1 Service Features
- Service name and description
- Service category
- Fixed price or quantity-based
- Unit price and quantity
- Total amount calculation
- Matter association
- Date logged

### 8.2 Service Categories
- Legal research
- Document drafting
- Court appearances
- Consultations
- Opinions
- Negotiations
- Custom categories

### 8.3 Service Management
- Log new services
- Edit existing services
- Delete services
- Service templates
- Quick service logging

### 8.4 Service Integration
- WIP value contribution
- Invoice line items
- Matter workbench display
- Service-based pro formas

---

## 9. SCOPE AMENDMENTS

### 9.1 Amendment Workflow (Path A Only)
1. Advocate identifies additional work needed
2. Click "Request Scope Amendment"
3. Add new line items with descriptions and costs
4. System shows: Original + Amendment = New Total
5. Send amendment request to attorney
6. Attorney approves or declines
7. If approved: Budget updates, work continues
8. If declined: Work only on original scope

### 9.2 Amendment Features
- Multiple amendments per matter
- Amendment history tracking
- Approval status tracking
- Budget impact calculation
- Amendment numbering
- Reason/justification notes

### 9.3 Amendment Display
- Original budget display
- Amendment list with amounts
- Cumulative amendment total
- Updated total budget
- Approval status indicators
- Amendment dates

### 9.4 Amendment Integration
- Budget comparison widget updates
- WIP tracking against amended budget
- Invoice generation includes amendments
- Matter history tracking

---

## 10. DOCUMENT MANAGEMENT (CLOUD LINKING)

### 10.1 Cloud Storage Integration
**Supported Providers:**
- Google Drive (Active)
- OneDrive (Coming Soon)
- Dropbox (Coming Soon)
- Local file system (Coming Soon)

### 10.2 Connection Management
- OAuth authentication
- Multiple provider connections
- Primary connection designation
- Connection status monitoring
- Disconnect/reconnect capability
- Connection deletion
- Last sync tracking

### 10.3 Document Linking Features
- Link existing files from cloud storage
- No file uploads to app servers
- Document name and description
- Document type/category
- Matter association
- Date linked tracking
- Provider-specific metadata

### 10.4 Document References
- File name
- Cloud storage provider
- Provider file ID
- Provider file path
- Web URL for viewing
- Download URL
- Linked date
- Linked by user

### 10.5 Document Actions
- View in cloud storage (opens provider URL)
- Unlink from matter
- Verify file availability
- Bulk document verification
- Document search

### 10.6 Privacy Features
- Read-only cloud access
- No file content stored locally
- Links only stored in database
- User maintains full file control
- Files stay in user's storage
- Automatic verification of file availability

---


## 11. INVOICING SYSTEM

### 11.1 Sequential Invoice Numbering
**SARS-Compliant Automatic Numbering:**
- Configurable format (INV-YYYY-NNN, INV-YY-NNN, YYYY-NNN, Custom)
- Auto-assigned sequential numbers (INV-2025-001, 002, 003...)
- Automatic year reset (001 on January 1st)
- Separate credit note sequence (CN-2025-001, 002...)
- No gaps in numbering sequence
- Full audit trail of all numbers issued
- Void tracking with reasons

### 11.2 Invoice Generation
**From Matter Workbench:**
- "Generate Invoice from Time" - pulls all logged work
- "Simple Fee Entry" - fixed fee invoicing
- Automatic inclusion of:
  - All time entries
  - All services
  - All disbursements
  - Scope amendments (Path A)

### 11.3 Invoice Content
**Professional Services Section:**
- Time entries with hours and rates
- Services with descriptions and amounts
- Subtotal for services

**Disbursements Section:**
- Separate section from professional fees
- Each disbursement listed
- Subtotal for disbursements

**Totals:**
- Total (Excl VAT)
- VAT @ 15%
- TOTAL DUE (Incl VAT)
- VAT Number display

### 11.4 Invoice Statuses
- **Draft**: Being prepared
- **Sent**: Sent to attorney
- **Partially Paid**: Some payment received
- **Paid**: Fully paid
- **Overdue**: Past due date
- **Cancelled**: Voided/cancelled
- **Pro Forma**: Estimate/quote status

### 11.5 Invoice Features
- PDF generation with advocate details
- SARS-compliant formatting
- Sequential numbering
- VAT breakdown
- Payment terms
- Due date calculation
- Bank details inclusion
- Professional letterhead
- Matter reference
- Attorney details

### 11.6 Invoice Actions
- Generate and send
- Download PDF
- Record payment
- Issue credit note
- Mark as paid
- Void invoice
- Resend invoice
- View payment history

---

## 12. PAYMENT TRACKING

### 12.1 Partial Payment System
**Features:**
- Record multiple payments per invoice
- Payment amount tracking
- Payment date
- Payment method (EFT, Cash, Cheque, Credit Card)
- Reference number
- Payment notes
- Automatic balance calculation

### 12.2 Payment History
**Tracking:**
- Date of each payment
- Amount paid
- Payment method
- Reference number
- Running balance after each payment
- Payment progress indicators

### 12.3 Payment Status
- Outstanding balance calculation
- Amount paid vs total
- Payment progress percentage
- Days since invoice sent
- Days overdue (if applicable)
- Payment status badges

### 12.4 Payment Actions
- Record new payment
- Edit payment details
- Delete payment (with audit trail)
- View full payment history
- Export payment records
- Generate payment receipts

### 12.5 Payment Integration
- Automatic invoice status updates
- Outstanding Fees Report updates
- Revenue Report updates
- Dashboard metrics updates
- Matter status updates (closes when fully paid)

---

## 13. CREDIT NOTES

### 13.1 Credit Note System
**Sequential Numbering:**
- Separate sequence from invoices (CN-2025-001, 002...)
- Auto-assigned numbers
- Annual reset
- Full audit trail

### 13.2 Credit Note Reasons
- Fee adjustment
- Calculation error
- Goodwill discount
- Disbursement correction
- Scope disagreement
- Other (with notes)

### 13.3 Credit Note Features
- Reference to original invoice
- Credit amount (must be ≤ outstanding balance)
- Reason category and notes
- Issue date
- VAT-compliant formatting
- PDF generation
- Automatic balance adjustment

### 13.4 Credit Note Workflow
1. Open invoice
2. Click "Issue Credit Note"
3. System assigns next CN number
4. Select reason
5. Enter credit amount
6. Add notes
7. Generate PDF
8. System updates:
   - Invoice balance
   - Payment history
   - Outstanding Fees Report
   - Revenue Report
   - Numbering audit log

### 13.5 Credit Note Impact
- Reduces invoice total
- Updates outstanding balance
- Affects revenue reporting
- Creates overpayment if applicable
- Tracks in audit log
- Maintains SARS compliance

---

## 14. FIRM MANAGEMENT

### 14.1 Firm Information
- Firm name
- Primary attorney name
- Email address
- Phone number
- Practice number
- Physical address
- Postal address
- Firm status (active/inactive)
- Creation date
- Advocate association

### 14.2 Firm Features
- Create new firms
- Edit firm details
- Archive/activate firms
- Delete firms (with confirmation)
- View firm matters
- Attorney management per firm
- Invitation token system

### 14.3 Attorney Invitation System
**Workflow:**
1. Advocate creates firm
2. Generate invitation token
3. Send invitation link to attorney
4. Attorney registers via unique link
5. Attorney account created
6. Linked to firm automatically
7. Access to attorney portal

**Features:**
- Unique invitation tokens
- Token expiration
- Token usage tracking
- Resend invitations
- Revoke invitations
- Multiple attorneys per firm

### 14.4 Firm Display
- Firm cards with attorney avatars
- Active matters count
- Attorney count
- Firm status badges
- Quick actions menu
- Bulk operations

### 14.5 Firm Actions
- Add attorney to firm
- Manage firm details
- View firm matters
- Generate invitation
- Archive firm
- Export firm data
- Bulk firm operations

---

## 15. ATTORNEY PORTAL

### 15.1 Attorney Access
- Separate login portal
- Email/password authentication
- Firm-based access
- Matter-specific permissions
- Read-only access to own matters

### 15.2 Attorney Features
**Matter Submission:**
- Submit new matter requests
- Structured brief form
- Document linking (cloud storage)
- Urgency selection
- Practice area selection
- Matter type selection

**Matter Tracking:**
- View submitted matters
- Track matter status
- View pro forma quotes
- Approve/decline quotes
- View invoices
- Track payments

**Pro Forma Review:**
- View sent pro formas
- Review estimated costs
- Approve estimates
- Decline with reason
- Request modifications

### 15.3 Attorney Portal Pages
- Dashboard (matter overview)
- Submit Matter Request
- My Matters
- Pro Forma Requests
- Invoices
- Profile Settings

### 15.4 Attorney Notifications
- New pro forma received
- Pro forma approved/declined
- Matter status updates
- Invoice generated
- Payment received
- Scope amendment requests

---

## 16. DASHBOARD & ANALYTICS

### 16.1 Enhanced Dashboard
**Urgent Attention Section:**
- Deadlines today
- Overdue invoices (45+ days)
- Pending pro formas (5+ days)
- High WIP inactive matters
- Approaching prescription

**This Week's Deadlines:**
- Matters due this week
- Deadline dates
- Matter details
- Quick navigation

**Financial Snapshot (3 Cards):**
1. Outstanding Fees
   - Total amount
   - Invoice count
   - Aging breakdown
2. WIP Value
   - Total unbilled work
   - Matter count
   - Days in WIP
3. Month Invoiced
   - Current month total
   - Invoice count
   - Payment rate

**Active Matters:**
- Top 5 active matters
- Completion percentages
- Last activity dates
- WIP values
- Status indicators

**Pending Actions:**
- New requests count
- Pro forma approvals count
- Scope amendments count
- Ready to invoice count

**Quick Stats (30-Day Metrics):**
- Matters completed
- Amount invoiced
- Payments received
- Average time to invoice

### 16.2 Dashboard Features
- Auto-refresh every 5 minutes
- Manual refresh button
- Last updated timestamp
- Click-through navigation
- Real-time data
- Skeleton loading states
- Responsive design

### 16.3 Dashboard Cards
- Firm Overview Card
- Attorney Invitations Card
- New Requests Card
- Cloud Storage Status Card
- Recent Activity Feed
- Financial Overview Card

---

## 17. REPORTS

### 17.1 WIP Report (Tier 2 - Enhanced)
**Shows:**
- All active matters with unbilled work
- Matter name and client
- Hours logged
- Disbursements logged
- Total WIP value per matter
- Days in WIP (aging)
- Matter status and progress

**Features:**
- Filter by practice area, attorney firm, days in WIP
- Sort by WIP value, days in WIP, matter deadline
- Color coding: Green (<7 days), Yellow (7-14), Orange (14-30), Red (30+)
- Click to jump to matter workbench
- "Generate Invoice" button for ready matters
- Export to CSV
- Real-time updates

**Helps Answer:**
- "How much unbilled work do I have right now?"
- "Which matters have been in WIP too long?"
- "What's my potential revenue if I invoice everything today?"
- "Which disbursements haven't been billed yet?"

### 17.2 Revenue Report (Tier 1 - Enhanced)
**Shows:**
- Gross revenue (all invoices issued)
- Credit notes (reductions)
- Net revenue (gross - credits)
- Payment rate percentage
- Breakdown by practice area
- Breakdown by attorney firm
- Breakdown by matter type
- Month-over-month comparison
- Quarter-over-quarter comparison
- Year-to-date totals

**Features:**
- Date range filters (custom, month, quarter, year)
- Attorney firm filter
- Practice area filter
- Matter type filter
- CSV export for Excel
- PDF report generation
- SARS-formatted export for tax submission

**Metrics:**
- Invoices issued vs payments received
- Average time from invoice to payment
- Payment patterns by attorney firm
- Best performing practice areas
- Cash flow timing analysis

### 17.3 Outstanding Fees Report (Tier 1 - Enhanced)
**Shows:**
- All unpaid invoices
- Invoice number and date
- Attorney firm
- Matter name
- Total invoice amount
- Amount paid
- Outstanding balance
- Days overdue
- Payment progress indicators

**Features:**
- Real-time updates when payments recorded
- Partial payment tracking
- Aging categories: Current, 1-30, 31-60, 61-90, 90+ days
- Color coding: Green (current), Yellow (30+), Orange (45+), Red (60+)
- Click to jump to invoice with payment history
- Record payment directly from report
- Export to CSV
- Filter by attorney firm, days overdue, amount range
- Sort by days overdue, amount, attorney, invoice number

**Updates When:**
- Invoice sent
- Partial payment recorded
- Full payment received
- Credit note issued

### 17.4 Additional Reports
- Pipeline Report (matter status pipeline)
- Client Revenue Report (revenue by client)
- Time Entry Summary (time tracking analysis)
- Aging Report (invoice aging periods)
- Matter Profitability (profit analysis)
- Custom Report Builder

---

## 18. SETTINGS & CONFIGURATION

### 18.1 Invoice Settings
**Numbering Configuration:**
- Invoice number format selection
- Current sequence display
- Next invoice number preview
- Credit note format selection
- Current CN sequence
- Automatic year reset configuration

**VAT & SARS Compliance:**
- VAT registered toggle
- VAT number entry
- VAT rate configuration (15% default)
- Advocate details for tax invoices:
  - Full name
  - Address
  - Phone
  - Email

**Audit Log:**
- View all invoice numbers issued
- View all credit note numbers used
- Voided numbers tracking
- SARS compliance verification

### 18.2 Quick Brief Templates
**Template Categories:**
- Matter Types (Opinion, Court Appearance, Drafting, etc.)
- Practice Areas (Labour, Commercial, Tax, etc.)
- Urgency Presets (Same Day, 1-2 Days, Within Week, etc.)
- Common Issue Templates (Breach of Contract, Employment Dispute, etc.)

**Template Management:**
- Add custom templates
- Edit existing templates
- Reorder by frequency
- Mark as favorites (auto-suggest)
- Import from CSV
- Export templates

### 18.3 Profile Settings
- Full name and initials
- Practice number
- Bar association
- Year admitted
- Email and phone
- Chambers address
- Postal address
- Hourly rate
- Profile photo

### 18.4 Cloud Storage Settings
- Connect storage providers
- Manage connections
- Set primary connection
- Disconnect/reconnect
- Delete connections
- Verify file availability
- View sync status
- Connection error handling

### 18.5 Rate Card Management
- Create rate cards
- Multiple rate tiers
- Service-based rates
- Hourly rates
- Fixed fee rates
- Rate card templates

### 18.6 PDF Template Editor
- Customize invoice layout
- Logo upload
- Color scheme selection
- Font selection
- Header/footer customization
- Layout presets
- Live preview

### 18.7 Team Management (Future)
- Add team members
- Role assignment
- Permission management
- Activity tracking

---


## 19. QUICK ACTIONS & KEYBOARD SHORTCUTS

### 19.1 Global Quick Actions Menu
**Accessible via:** Keyboard shortcut (Ctrl/Cmd + K) or menu button

**Quick Actions:**
- New Matter (Quick Brief)
- New Pro Forma
- Log Time Entry
- Log Disbursement
- View Dashboard
- View Matters
- View Invoices
- View Reports
- Search Matters
- Settings

### 19.2 Keyboard Shortcuts
**Navigation:**
- `Ctrl/Cmd + K`: Open Quick Actions
- `Ctrl/Cmd + /`: Show keyboard shortcuts help
- `Esc`: Close modals/dialogs
- `Ctrl/Cmd + S`: Save (in forms)

**Matter Actions:**
- `N`: New Matter (on Matters page)
- `Q`: Quick Brief Capture
- `F`: Advanced Filters
- `E`: Export

**Quick Entry:**
- `T`: Log Time Entry (in workbench)
- `D`: Log Disbursement (in workbench)
- `S`: Log Service (in workbench)

### 19.3 Quick Actions Settings
- Enable/disable shortcuts
- Customize shortcut keys
- Quick action favorites
- Recent actions history

### 19.4 Context-Aware Actions
- Matter card quick actions
- Invoice quick actions
- Firm quick actions
- Right-click context menus

---

## 20. SEARCH & FILTERING

### 20.1 Matter Search
**Quick Search Bar:**
- Real-time search as you type
- Searches across:
  - Matter titles
  - Client names
  - Descriptions
  - Attorney firm names
- Instant results display
- Result count indicator

**Advanced Filters Modal:**
- Practice area dropdown
- Matter type dropdown
- Status (multiple selection checkboxes)
- Attorney firm dropdown
- Date range (from/to date pickers)
- Fee range (min/max amount)
- Sort by (Last Activity, Deadline, Created Date, Total Fee, Matter Title)
- Sort order (Ascending/Descending)
- Include archived matters toggle

### 20.2 Active Filter Chips
- Visual display of applied filters
- Click to remove individual filters
- Clear all filters button
- Filter count indicator

### 20.3 Search Results
- Total count display
- Filtered matter cards
- Empty state when no results
- Loading states
- Export filtered results

### 20.4 Saved Searches (Future)
- Save filter combinations
- Named saved searches
- Quick access to saved searches
- Share saved searches

---

## 21. AUDIT TRAIL

### 21.1 Audit Log Features
- Comprehensive activity tracking
- User action logging
- Entity change tracking
- Timestamp recording
- IP address logging
- User agent tracking

### 21.2 Tracked Actions
**Matter Actions:**
- Matter created
- Matter updated
- Matter status changed
- Matter archived/unarchived
- Matter deleted

**Invoice Actions:**
- Invoice generated
- Invoice sent
- Payment recorded
- Credit note issued
- Invoice voided

**Pro Forma Actions:**
- Pro forma created
- Pro forma sent
- Pro forma approved/declined
- Pro forma converted

**User Actions:**
- Login/logout
- Settings changed
- Template created/updated
- Connection added/removed

### 21.3 Audit Log Display
- Chronological listing
- Filter by entity type
- Filter by action type
- Filter by user
- Filter by date range
- Search audit logs
- Export audit trail

### 21.4 Change Tracking
- Before/after values
- Field-level changes
- JSON change diff
- Metadata storage
- Rollback capability (future)

---

## 22. NOTIFICATIONS

### 22.1 In-App Notifications
- Toast notifications (success, error, info, warning)
- Notification badges on navigation
- Notification center (future)
- Dismissible notifications
- Auto-dismiss timers

### 22.2 Notification Types
**Success Notifications:**
- Matter created
- Invoice generated
- Payment recorded
- Settings saved

**Error Notifications:**
- Failed operations
- Validation errors
- Network errors
- Permission errors

**Warning Notifications:**
- Approaching deadlines
- Overdue invoices
- High WIP inactive matters
- Missing information

**Info Notifications:**
- Status updates
- System messages
- Feature announcements

### 22.3 Email Notifications (Future)
- Pro forma sent
- Invoice sent
- Payment received
- Deadline reminders
- Overdue invoice alerts

### 22.4 Notification Preferences
- Enable/disable notification types
- Email notification settings
- Notification frequency
- Quiet hours

---

## 23. UI/UX FEATURES

### 23.1 Design System
**Components:**
- Buttons (Primary, Secondary, Ghost, Danger, Outline)
- Cards (Standard, Hoverable, Clickable)
- Modals (Small, Medium, Large, Full-screen)
- Forms (Input, Select, Textarea, Checkbox, Radio)
- Tables (Sortable, Filterable, Paginated)
- Badges (Status, Count, Info)
- Tooltips
- Dropdowns
- Tabs
- Progress bars
- Skeletons (Loading states)
- Empty states
- Error states

**Color Palette:**
- Mpondo Gold (Primary brand color)
- Judicial Blue (Secondary)
- Metallic Gray (Neutral)
- Status colors (Success, Error, Warning, Info)
- Dark mode support

### 23.2 Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Breakpoint system
- Touch-friendly targets (44px minimum)
- Responsive navigation
- Mobile modals
- Adaptive grids

### 23.3 Dark Mode
- System preference detection
- Manual toggle
- Persistent preference
- All components dark mode compatible
- Proper contrast ratios
- Accessible color combinations

### 23.4 Accessibility
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Semantic HTML
- Alt text for images
- Form labels
- Error announcements

### 23.5 Loading States
- Skeleton loaders
- Spinner animations
- Progress indicators
- Optimistic UI updates
- Loading overlays
- Async button states

### 23.6 Empty States
- Contextual empty messages
- Helpful illustrations
- Call-to-action buttons
- Onboarding hints
- No data states

### 23.7 Error Handling
- User-friendly error messages
- Error boundaries
- Retry mechanisms
- Fallback UI
- Error logging
- Network error handling

### 23.8 Animations & Transitions
- Smooth page transitions
- Modal animations
- Hover effects
- Loading animations
- Micro-interactions
- Reduced motion support

### 23.9 Bulk Operations
- Multi-select checkboxes
- Bulk action toolbar
- Select all/none
- Selection count
- Bulk actions:
  - Archive
  - Delete
  - Export
  - Status change
- Confirmation dialogs
- Progress tracking

### 23.10 Export Capabilities
- CSV export
- PDF export
- Excel-compatible formats
- Custom export fields
- Filtered data export
- Bulk export

---

## 24. TECHNICAL FEATURES

### 24.1 Technology Stack
**Frontend:**
- React 18 with TypeScript
- Vite build tool
- TailwindCSS for styling
- React Router for navigation
- React Hot Toast for notifications
- Lucide React for icons

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth
- Supabase Storage (for non-sensitive files)
- Row Level Security (RLS)
- Database triggers and functions

**Cloud Integration:**
- Google Drive API
- OneDrive API (planned)
- Dropbox API (planned)
- OAuth 2.0 authentication

### 24.2 Database Schema
**Core Tables:**
- user_profiles (advocate information)
- attorney_users (attorney accounts)
- firms (law firm management)
- matters (matter records)
- proforma_requests (quotes/estimates)
- invoices (billing)
- payments (payment tracking)
- credit_notes (credit note records)
- time_entries (time tracking)
- disbursements (expense tracking)
- logged_services (service tracking)
- document_references (cloud file links)
- cloud_storage_connections (provider connections)
- audit_log (activity tracking)
- quick_brief_templates (template management)

**Enums:**
- matter_status
- invoice_status
- proforma_request_status
- payment_method
- practice_area
- matter_type
- urgency_level

### 24.3 Security Features
- Row Level Security (RLS) policies
- User authentication via Supabase Auth
- Secure password hashing
- JWT token management
- API key protection
- CORS configuration
- SQL injection prevention
- XSS protection
- CSRF protection

### 24.4 Performance Optimizations
- Lazy loading components
- Code splitting
- Image optimization
- Database indexing
- Query optimization
- Caching strategies
- Debounced search
- Pagination
- Virtual scrolling (future)

### 24.5 Data Privacy
- No document uploads to servers
- Cloud storage linking only
- Encrypted connections
- GDPR compliance considerations
- Data retention policies
- User data export
- Account deletion

---

## 25. INTEGRATION FEATURES

### 25.1 Cloud Storage Integration
- OAuth authentication flow
- Token refresh handling
- Multiple provider support
- Connection status monitoring
- File verification
- Sync error handling

### 25.2 Email Integration (Future)
- SMTP configuration
- Email templates
- Pro forma sending
- Invoice sending
- Notification emails
- Email tracking

### 25.3 Payment Gateway Integration (Future)
- PayFast integration
- PayStack integration
- Payment processing
- Payment webhooks
- Refund handling

### 25.4 Calendar Integration (Future)
- Google Calendar sync
- Outlook Calendar sync
- Deadline reminders
- Court date tracking
- Appointment scheduling

### 25.5 Accounting Software Integration (Future)
- Xero integration
- QuickBooks integration
- Sage integration
- Automated bookkeeping
- Financial reporting

---

## 26. WORKFLOW AUTOMATION

### 26.1 Automatic Calculations
- WIP value auto-calculation
- VAT calculations (15%)
- Invoice totals
- Payment balances
- Budget comparisons
- Deadline calculations

### 26.2 Status Automation
- Matter status updates on payment
- Invoice status updates on payment
- Pro forma status on conversion
- Automatic matter closure
- Overdue detection

### 26.3 Numbering Automation
- Sequential invoice numbering
- Sequential credit note numbering
- Annual number reset
- Matter reference generation
- Quote number generation

### 26.4 Notification Automation
- Deadline reminders
- Overdue invoice alerts
- Payment confirmations
- Status change notifications

---

## 27. REPORTING & ANALYTICS

### 27.1 Financial Reports
- Revenue Report (with credit notes)
- Outstanding Fees Report (with partial payments)
- WIP Report (with disbursements)
- Profitability Report
- Cash Flow Report
- Aging Report

### 27.2 Operational Reports
- Matter Pipeline Report
- Time Entry Summary
- Disbursement Summary
- Service Summary
- Attorney Performance
- Practice Area Analysis

### 27.3 Report Features
- Date range filtering
- Multiple filter options
- Sort capabilities
- Export to CSV/PDF
- SARS-formatted exports
- Visual charts (future)
- Scheduled reports (future)

---

## 28. MOBILE FEATURES

### 28.1 Mobile Responsive Design
- Mobile-optimized layouts
- Touch-friendly buttons (44px minimum)
- Swipe gestures
- Mobile navigation menu
- Responsive tables
- Mobile modals

### 28.2 Mobile-Specific Features
- Quick actions menu
- Simplified forms
- Mobile-optimized search
- Touch-optimized date pickers
- Mobile file selection

---

## 29. FUTURE ENHANCEMENTS

### 29.1 Planned Features
- Calendar integration
- Email integration
- Payment gateway integration
- Accounting software integration
- Team collaboration
- Client portal
- Document templates
- E-signature integration
- SMS notifications
- Mobile app (iOS/Android)
- Advanced analytics
- AI-powered insights
- Automated time tracking
- Voice-to-text brief capture
- Multi-currency support
- Multi-language support

### 29.2 Roadmap Priorities
1. Email integration (High)
2. Payment gateway (High)
3. Calendar sync (Medium)
4. Team collaboration (Medium)
5. Client portal (Medium)
6. Mobile app (Low)
7. Advanced analytics (Low)

---

## 30. COMPLIANCE & STANDARDS

### 30.1 South African Legal Compliance
- SARS VAT compliance (15% rate)
- Tax invoice requirements
- VAT number display
- Sequential numbering
- Audit trail maintenance
- Financial record keeping

### 30.2 Data Protection
- POPIA compliance considerations
- Data privacy by design
- No sensitive document storage
- User data control
- Right to deletion
- Data export capability

### 30.3 Professional Standards
- Legal Practice Council requirements
- Trust account readiness (future)
- Professional indemnity tracking (future)
- CPD tracking (future)

---

## SUMMARY OF KEY FEATURES

### 🆕 NEW: Billing Model System
✅ Three Billing Models (Brief Fee, Time-Based, Quick Opinion)
✅ Billing Strategy Pattern Implementation
✅ Adaptive Matter Workbench (UI changes based on billing model)
✅ Billing Preferences & Onboarding Wizard
✅ Fee Milestones for Brief Fees
✅ Collapsible Time Tracking (optional for brief fees)
✅ Model-Specific Validation & Calculations

### 🆕 NEW: Trust Account Management
✅ LPC-Compliant Trust Account System
✅ Trust Receipt Recording with Sequential Numbering
✅ Trust to Business Account Transfers
✅ Negative Balance Prevention
✅ Trust Account Reconciliation Reports
✅ Trust Receipt PDF Generation
✅ Complete Audit Trail
✅ Trust Account Dashboard

### 🆕 NEW: Mobile Optimization
✅ Mobile Quick Actions Menu (48px touch targets)
✅ Mobile-Optimized Modals (Payment, Disbursement, Invoice)
✅ Swipe Gestures & Navigation
✅ Voice Input Integration (Web Speech API)
✅ Offline Mode with Sync (IndexedDB + Encryption)
✅ WhatsApp Invoice Sharing
✅ Camera Receipt Capture with Compression
✅ Push Notifications (Service Worker)
✅ Mobile Performance Optimization (Virtual Scrolling, Lazy Loading)
✅ Progressive Web App (PWA) Support

### 🆕 NEW: Advanced Workflows
✅ Brief Fee Templates with Usage Analytics
✅ Attorney Usage Tracking & Statistics
✅ Enhanced Attorney Portal with Invitations
✅ Invoice Delivery Tracking & Logging
✅ Template-Based Matter Creation
✅ Recurring Attorney Quick Select

### Core Workflows
✅ Dual-Path System (Quote First vs Accept & Work)
✅ Quick Brief Capture (6-step phone call workflow)
✅ Pro Forma to Matter Conversion
✅ Matter Workbench (comprehensive WIP workspace)

### Financial Management
✅ Sequential Invoice Numbering (SARS-compliant)
✅ Partial Payment Tracking
✅ Credit Notes with Sequential Numbering
✅ VAT Calculations (15%)
✅ Disbursement Tracking
✅ Time Tracking
✅ Service Logging

### Document Management
✅ Cloud Storage Integration (Google Drive, OneDrive, Dropbox)
✅ Document Linking (no uploads)
✅ Privacy-First Approach
✅ File Verification

### Reporting (Enhanced)
✅ WIP Report (Enhanced with disbursements & aging)
✅ Revenue Report (Enhanced with credit notes & trends)
✅ Outstanding Fees Report (Enhanced with partial payments & progress)
✅ Enhanced Dashboard (Urgent Attention, Financial Snapshot, Quick Stats)
✅ Custom Report Builder

### User Experience
✅ Enhanced Dashboard with Urgent Attention
✅ Quick Actions & Keyboard Shortcuts
✅ Advanced Search & Filtering
✅ Dark Mode Support
✅ Responsive Design (Mobile, Tablet, Desktop)
✅ Bulk Operations
✅ Export Capabilities (CSV, PDF)
✅ Reusable Hooks System (useModalForm, useTable, useSearch, etc.)

### Attorney Features
✅ Attorney Portal
✅ Matter Submission
✅ Pro Forma Review & Approval
✅ Invoice Tracking
✅ Firm Management
✅ Invitation System with Tokens
✅ Usage Statistics & Analytics

### System Features
✅ Audit Trail
✅ Role-Based Access Control
✅ Secure Authentication
✅ Real-Time Updates
✅ Automatic Calculations
✅ Status Automation
✅ Offline Storage with Encryption
✅ Sync Queue with Conflict Resolution

---

## CONCLUSION

The LexoHub App is a comprehensive legal practice management system designed specifically for South African advocates. Version 2.0 represents a major evolution with:

### Core Strengths
1. **Privacy-First Document Management**: No sensitive documents stored on servers
2. **Flexible Billing Models**: Three billing approaches to match your practice style
3. **LPC-Compliant Trust Accounts**: Complete trust account management system
4. **Mobile-First Design**: Full mobile optimization with offline capability
5. **Dual-Path Workflow**: Flexibility for both complex and routine matters
6. **SARS-Compliant Invoicing**: Sequential numbering and VAT compliance
7. **Comprehensive Financial Tracking**: Time, disbursements, services, and payments
8. **Attorney Collaboration**: Dedicated portal for attorney interaction
9. **Real-Time Analytics**: Enhanced dashboard and reporting
10. **Professional UX**: Modern, responsive, accessible design

### What Makes LexoHub Different
- **Built for Advocates**: Designed around South African advocate practice patterns
- **Flexible Billing**: Supports brief fees, time-based, and quick opinions
- **Mobile Optimized**: Work from anywhere with offline capability
- **Trust Account Compliance**: LPC-compliant trust account management
- **Privacy Focused**: Documents stay in your cloud storage
- **Modern Technology**: Progressive Web App with offline support
- **Continuous Innovation**: Regular updates with new features

### Version 2.0 Highlights
- ✅ **87 Implementation Tasks Completed**
- ✅ **3 Billing Models** with adaptive UI
- ✅ **Complete Trust Account System** for LPC compliance
- ✅ **17 Mobile Components** for on-the-go practice management
- ✅ **Offline Mode** with encrypted storage and sync
- ✅ **WhatsApp Integration** for instant invoice sharing
- ✅ **Voice Input** for faster mobile data entry
- ✅ **Camera Integration** for receipt capture
- ✅ **Push Notifications** for important events
- ✅ **Enhanced Analytics** with real-time insights

The system is built to adapt to how advocates actually work, not how software thinks they should work.

---

**Document Version:** 2.0  
**Last Updated:** October 27, 2025  
**Total Features Documented:** 300+  
**New Features Added:** 100+  
**Status:** Implementation Complete, Ready for Testing

**See Also:**
- [New Features 2025 Document](./NANTSIKE_APP_NEW_FEATURES_2025.md) - Detailed new feature documentation
- [Phase 5 Mobile Optimization](./PHASE_5_MOBILE_OPTIMIZATION_COMPLETE.md) - Mobile feature details
- [Billing Workflow Tasks](../.kiro/specs/billing-workflow-modernization/tasks.md) - Implementation tracking

