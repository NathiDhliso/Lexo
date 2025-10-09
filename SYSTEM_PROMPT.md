# LexoHub System Prompt - 3-Step Workflow Only

## Core Mission
LexoHub is a **focused legal practice management system** for South African advocates with **exactly 3 core features** forming a linear workflow:

```
Step 1: PRO FORMA (Quote) → Step 2: MATTER (Conversion) → Step 3: INVOICE (Billing)
```

**THE WORKFLOW ALWAYS STARTS WITH PRO FORMA FIRST.**

**Supporting features that enhance pricing, billing, or workflow efficiency are permitted when they directly contribute to the 3-step process. Any feature that creates an alternative workflow or operates independently must be rejected.**

---

## The 3-Step Workflow (ONLY)

### ⭐ CRITICAL: The Workflow ALWAYS Starts with Pro Forma

**You CANNOT create a Matter directly. You MUST create a Pro Forma first.**

The workflow is strictly linear:
1. Create Pro Forma (lightweight quote)
2. Convert accepted Pro Forma to Matter
3. Generate Invoice from Matter WIP

### 🔗 Matter-Centric Data Flow

**Everything is linked by Matter ID:**
```
Pro Forma → Matter (source_proforma_id)
    ↓
Time Entries → Matter (matter_id)
    ↓
Expenses → Matter (matter_id)
    ↓
Invoice ← Auto-imports all data from Matter
```

**When generating an invoice:**
1. Select matter (shows pro forma + unbilled time + expenses)
2. System **automatically loads**:
   - Pro forma services (if matter has source_proforma_id)
   - Unbilled time entries (from matter)
   - Expenses (from matter)
3. All items pre-selected for review
4. Configure pricing and generate

**This ensures:**
- No manual data entry
- Proper linkage through matter ID
- Complete audit trail from pro forma to invoice
- Single source of truth (the matter)

### Step 1: Pro Forma (Quote Generation) - THE STARTING POINT
**Purpose:** Create lightweight quotes for potential work WITHOUT creating a matter  
**Why First:** Keeps the matters list clean - rejected quotes never become matters  
**Key Actions:**
- Create pro forma request with attorney details (minimal data entry)
- Auto-generate quote number (PF-YYYY-NNN)
- Send quote to attorney
- Track status: draft → sent → accepted/declined/expired
- **ONLY when accepted:** Convert to Matter (Step 2)

**Core Files:**
- `src/services/api/proforma-request.service.ts`
- `src/services/proforma-pdf.service.ts` - PDF generation for pro forma quotes
- `src/components/proforma/NewProFormaModal.tsx`
- `src/pages/ProFormaRequestsPage.tsx` - Advocate view
- `src/pages/ProFormaRequestPage.tsx` - Attorney submission page (public link)
- Database: `proforma_requests` table

**Attorney Submission Features:**
- Public link generation for attorneys to submit details
- Toggle between manual entry and document upload
- Document intelligence auto-populates form fields
- Rate card integration for pricing estimation
- All fields remain editable after auto-population

### Step 2: Matter (Case Management) - THE CONVERSION
**Purpose:** Convert accepted pro formas into official billable matters  
**Why Second:** Only accepted quotes become matters - keeps matters list clean  
**Key Actions:**
- **Convert from accepted pro forma** (primary method)
- Upload attorney's brief (optional - for document intelligence)
- Pre-populate form with pro forma data (zero re-entry)
- Auto-generate reference number (JHB/YYYY/NNN or CPT/YYYY/NNN)
- Track time entries (WIP)
- Track expenses (WIP)
- Auto-calculate WIP value
- Maintain link to source pro forma

**Core Files:**
- `src/services/api/matter-api.service.ts`
- `src/services/api/matter-conversion.service.ts`
- `src/services/api/time-entries.service.ts`
- `src/services/api/expenses.service.ts`
- `src/components/matters/NewMatterMultiStep.tsx`
- `src/components/matters/ConvertProFormaModal.tsx`
- `src/pages/MattersPage.tsx` - Matter list and management
- `src/pages/MatterWorkbenchPage.tsx` - Detailed matter view/workbench
- Database: `matters`, `time_entries`, `expenses` tables

### Step 3: Invoice (Billing)
**Purpose:** Generate final invoices and track payments  
**Key Actions:**
- Generate invoice from matter WIP
- **Auto-import pro forma services** (if matter linked to pro forma)
- **Auto-import unbilled time entries** from matter
- **Auto-import expenses** from matter
- Auto-generate invoice number (INV-YYYY-NNNN)
- Auto-calculate totals (fees + disbursements + VAT)
- Send invoice to client
- Record payments
- Track payment status
- Link to source pro forma (if applicable)

**Core Files:**
- `src/services/api/invoices.service.ts`
- `src/services/api/invoice-api.service.ts`
- `src/services/invoice-pdf.service.ts` - PDF generation for invoices
- `src/services/pdf-template.service.ts` - PDF template management
- `src/components/invoices/MatterSelectionModal.tsx` - Select matter for invoice
- `src/components/invoices/UnifiedInvoiceWizard.tsx` - Auto-importing invoice generator
- `src/components/invoices/ProFormaInvoiceList.tsx` - Pro forma management
- `src/components/invoices/MatterTimeEntriesView.tsx` - Time entry overview
- `src/components/settings/PDFTemplateEditor.tsx` - Advanced PDF customization
- `src/pages/InvoicesPage.tsx` - Unified invoice interface (4 tabs)
- `src/pages/SettingsPage.tsx` - Includes PDF Templates tab
- Database: `invoices`, `payments`, `pdf_templates` tables

**Invoice Page Tabs:**
1. **Invoices** - Final invoice management
2. **Pro Forma** - View and convert pro forma requests
3. **Time Entries** - View unbilled time grouped by matter
4. **Payment Tracking** - Monitor payments and overdue invoices

---

## Supporting Features (ALLOWED)

These features directly support the 3-step workflow:

### PDF Template Customization System
**Purpose:** Professional, branded PDF generation for invoices and pro forma documents  
**Integration:**
- **Step 1 (Pro Forma):** Generate beautifully formatted quote PDFs with custom branding
- **Step 3 (Invoice):** Generate professional invoice PDFs with advocate's brand identity

**Key Features:**
1. **Visual Color Customization:**
   - 5 pre-built professional color schemes
   - Custom color picker (no hex codes needed)
   - Real-time preview updates

2. **Layout Presets (8 Professional Styles):**
   - Formal, Modern, Minimalist, Classic
   - Executive, Elegant, Compact, Spacious
   - One-click application with instant preview

3. **Advanced Layout Controls:**
   - Logo placement: Left, Center, Right, Watermark
   - Vertical title orientation (magazine-style)
   - Logo opacity & rotation controls
   - Page margins customization
   - Background color selection

4. **Table Styling:**
   - Borderless or bordered tables
   - Border styles: Solid, Dashed, Dotted
   - Custom colors for headers and rows
   - Alternate row colors

5. **Footer Customization:**
   - Terms & Conditions (always visible)
   - Thank You notes
   - Bank/Payment details
   - Page numbers & timestamps

6. **Text & Typography:**
   - Title alignment (left, center, right)
   - Border styling (style, width, color)
   - Font customization

7. **Live Preview:**
   - Split-screen editor and preview
   - Instant updates as you customize
   - Sticky preview panel
   - Sample invoice display

**Core Files:**
- `src/services/invoice-pdf.service.ts` - PDF generation engine
- `src/services/pdf-template.service.ts` - Template CRUD operations
- `src/components/settings/PDFTemplateEditor.tsx` - Visual editor (2100+ lines)
- `src/types/pdf-template.types.ts` - Type definitions
- `src/utils/pdf-template-helper.ts` - PDF rendering utilities
- Database: `pdf_templates` table, `pdf-assets` storage bucket
- Migration: `supabase/migrations/20250109000000_create_pdf_templates.sql`

**User Experience:**
- No technical knowledge required
- Visual controls, not textual
- Instant feedback with live preview
- Professional, print-ready output
- Template saving and reuse

### Rate Cards & Pricing Management
**Purpose:** Enhance pricing accuracy and speed across all 3 workflow steps  
**Integration:**
- **Step 1 (Pro Forma):** Auto-populate service prices from rate card templates
- **Step 2 (Matter):** Consistent hourly rates for time tracking and WIP calculations  
- **Step 3 (Invoice):** Standardized pricing for invoice generation

**Key Benefits:**
- Eliminates manual price entry across workflow
- Ensures consistent pricing from quote to final invoice
- Speeds up pro forma creation with pre-configured services
- Maintains professional pricing standards

**Core Files:**
- `src/services/rate-card.service.ts` - Rate card management
- `src/components/pricing/` - Rate card components
- `src/utils/PricingCalculator.ts` - Pricing calculations
- Database: `rate_cards`, `standard_service_templates`, `service_categories` tables

### User Management
- `src/services/api/advocate.service.ts` - User profiles
- `src/services/api/user-preferences.service.ts` - Settings
- `src/pages/ProfilePage.tsx` - User profile
- `src/pages/SettingsPage.tsx` - User settings
- Database: `advocates`, `user_preferences` tables

### Authentication
- `src/components/auth/` - Login/logout
- `src/contexts/AuthContext.tsx` - Auth state
- `src/pages/LoginPage.tsx` - Login page

### Dashboard
- `src/pages/DashboardPage.tsx` - Overview of 3-step workflow
- Shows: Pro forma counts, Matter counts, Invoice metrics
- Quick actions: Create Pro Forma, View Matters, View Invoices

### Document Processing & AWS Integration
**Purpose:** Extract data from uploaded documents to auto-populate forms  
**Integration:**
- **Pro Forma:** Attorney uploads brief, system extracts details
- **Matter:** Upload attorney's brief to pre-populate matter form

**Core Files:**
- `src/services/api/document-intelligence.service.ts` - Document intelligence API
- `src/services/aws-document-processing.service.ts` - AWS Textract integration
- `src/services/aws-email.service.ts` - AWS SES email delivery
- `src/components/document-processing/` - Document upload components
- Database: `document_uploads` table

**AWS Services Used:**
- **AWS Textract:** Document text extraction and analysis
- **AWS SES:** Email delivery for invoices and pro forma quotes
- Configured via environment variables

### Notifications & Reminders
**Purpose:** Keep advocates informed of important events and deadlines  
**Integration:**
- Payment reminders for overdue invoices
- Pro forma expiry notifications
- Matter deadline alerts
- Smart notification prioritization

**Core Files:**
- `src/services/reminder.service.ts` - Reminder scheduling and delivery
- `src/services/smart-notifications.service.ts` - Intelligent notification system
- `src/services/ticker-data.service.ts` - Dashboard ticker/metrics

### UI Components
- `src/components/design-system/` - Reusable UI components
- `src/components/common/` - Shared components
- `src/components/forms/` - Form components
- `src/components/navigation/` - Navigation
- `src/components/notifications/` - Toast notifications

---

## Forbidden Features (REJECT)

**Any code related to these features must be rejected and removed:**

❌ AI Analytics / Predictive Analytics  
❌ Calendar / Court Diary  
❌ Client Management (separate from matters)  
❌ Document Management System  
❌ Practice Health / Analytics  
❌ Cash Flow Management  
❌ Strategic Finance  
❌ Compliance Tracking  
❌ Ethics Compliance  
❌ Professional Development  
❌ Academy / Training  
❌ Workflow Automation (beyond 3-step)  
❌ API Integrations (external)  
❌ Court Integrations  
❌ Judge Analytics  
❌ Settlement Predictions  
❌ Fee Optimization  
❌ NLP Processing (beyond document intelligence)  
❌ Template Management  
❌ Matter Templates  
❌ RBAC (Role-Based Access Control)  
❌ Feature Toggles  
❌ Advanced Features System  

---

## Database Schema (Core + Supporting Tables)

### Core Workflow Tables
1. **advocates** - User profiles
2. **proforma_requests** - Pro Forma quotes (Step 1)
3. **matters** - Legal matters (Step 2)
4. **time_entries** - Time tracking (WIP)
5. **expenses** - Expense tracking (WIP)
6. **invoices** - Final invoices (Step 3)
7. **payments** - Payment records
8. **user_preferences** - User settings

### Supporting Feature Tables
9. **rate_cards** - Pricing templates for pro forma and invoices
10. **standard_service_templates** - Pre-configured legal service templates
11. **service_categories** - Organization of legal services
12. **pdf_templates** - PDF template customization (colors, layouts, branding)
13. **document_uploads** - Document upload tracking and metadata
14. **services** - Service definitions and catalog

### Storage Buckets
- **pdf-assets** - Logo uploads and branding images for PDF templates
- **document-uploads** - Uploaded legal documents (briefs, contracts, etc.)

**Tables must directly support the 3-step workflow or enhance pricing/billing functionality.**

---

## ⭐ CRITICAL: Database Environment Strategy

### 🚫 NO LOCAL DATABASES - EVER

**LexoHub MUST use remote Supabase projects for ALL environments. Local databases are STRICTLY PROHIBITED.**

### Environment Strategy
- **Development:** Dedicated remote Supabase project
- **Staging:** Dedicated remote Supabase project  
- **Production:** Dedicated remote Supabase project
- **Testing:** Dedicated remote Supabase project (if needed)

### Rationale
1. **Consistency:** All environments use identical Supabase features and configurations
2. **Collaboration:** Multiple developers can work with shared, consistent data
3. **Real-world Testing:** Development environment mirrors production exactly
4. **Supabase Features:** Full access to Auth, RLS, Edge Functions, and real-time features
5. **Deployment Simplicity:** No database setup/migration complexity during deployment
6. **Data Integrity:** Professional backup, monitoring, and maintenance by Supabase
7. **Security:** Production-grade security policies applied consistently across all environments

### Implementation Requirements
- All `.env` files MUST contain remote Supabase project URLs
- No SQLite, PostgreSQL local instances, or embedded databases
- No database containers or local database servers
- All database connections go through Supabase client libraries
- Environment-specific Supabase projects ensure proper data isolation

**This is a non-negotiable architectural decision for LexoHub.**

---

## File Structure (ALLOWED)

### Services (23 files)
```
src/services/api/
├── base-api.service.ts ✅
├── proforma-request.service.ts ✅
├── matter-conversion.service.ts ✅
├── matter-api.service.ts ✅
├── invoices.service.ts ✅
├── invoice-api.service.ts ✅
├── time-entries.service.ts ✅
├── expenses.service.ts ✅
├── advocate.service.ts ✅
├── user-preferences.service.ts ✅
├── document-intelligence.service.ts ✅
└── index.ts ✅

src/services/
├── advocate.service.ts ✅ (Advocate profile management)
├── auth.service.ts ✅ (Authentication utilities)
├── aws-document-processing.service.ts ✅ (AWS Textract integration)
├── aws-email.service.ts ✅ (AWS SES email delivery)
├── invoice-pdf.service.ts ✅ (PDF generation for invoices)
├── pdf-template.service.ts ✅ (PDF template management)
├── proforma-pdf.service.ts ✅ (PDF generation for pro forma)
├── rate-card.service.ts ✅ (Pricing templates)
├── reminder.service.ts ✅ (Reminder scheduling)
├── smart-notifications.service.ts ✅ (Intelligent notifications)
└── ticker-data.service.ts ✅ (Dashboard metrics)
```

### Pages (9 files)
```
src/pages/
├── DashboardPage.tsx ✅ (Overview of 3-step workflow)
├── ProFormaRequestsPage.tsx ✅ (Advocate view - manage pro forma requests)
├── ProFormaRequestPage.tsx ✅ (Attorney view - public submission page)
├── MattersPage.tsx ✅ (Matter list and management)
├── MatterWorkbenchPage.tsx ✅ (Detailed matter view/workbench)
├── InvoicesPage.tsx ✅ (4 tabs: Invoices, Pro Forma, Time Entries, Tracking)
├── ProfilePage.tsx ✅ (User profile management)
├── SettingsPage.tsx ✅ (Settings with PDF Templates tab)
└── LoginPage.tsx ✅ (Authentication)
```

### Components (Core folders ONLY)
```
src/components/
├── auth/ ✅
├── common/ ✅
├── design-system/ ✅
├── document-processing/ ✅
├── forms/ ✅
├── icons/ ✅
├── invoices/ ✅ (includes unified invoice wizard, matter selection, pro forma list, time entries view)
├── matters/ ✅
├── navigation/ ✅
├── notifications/ ✅
├── pricing/ ✅ (rate card components)
├── proforma/ ✅
└── settings/ ✅ (includes PDFTemplateEditor for PDF customization)
```

---

## Enhancement Rules

### ✅ ALLOWED Enhancements
Any enhancement that **directly improves** the 3-step workflow:

1. **Pro Forma Improvements:**
   - Better quote templates
   - Email delivery of quotes
   - PDF generation for quotes
   - Quote expiry reminders
   - Bulk quote actions

2. **Matter Improvements:**
   - Better time entry UI
   - Expense receipt upload
   - WIP reporting
   - Matter status tracking
   - Client communication logging

3. **Invoice Improvements:**
   - Better invoice templates
   - **PDF Template Customization System** ✅
   - Email delivery of invoices
   - Payment reminders
   - Payment plan tracking
   - Invoice aging reports

4. **Workflow Improvements:**
   - Faster pro forma → matter conversion
   - Better data pre-population
   - Automatic linking/tracking
   - Workflow status visualization
   - Quick actions/shortcuts

5. **UX Improvements:**
   - Better forms
   - Faster navigation
   - Better error handling
   - Loading states
   - Responsive design

### ❌ REJECTED Enhancements
Any enhancement that adds features **outside** the 3-step workflow:

1. **New Features:**
   - Calendar/scheduling
   - Client portal
   - Document library
   - Analytics dashboard
   - Reporting tools
   - Integrations
   - AI predictions
   - Compliance tracking

2. **Complexity:**
   - Multi-user collaboration
   - Advanced permissions
   - Feature toggles
   - A/B testing
   - Advanced analytics

---

## Code Review Checklist

Before accepting any code change, verify:

- [ ] Does it support Pro Forma, Matter, or Invoice? (ACCEPT)
- [ ] Does it enhance pricing, billing, or workflow efficiency? (ACCEPT if supporting feature)
- [ ] Does it add a new feature outside the 3-step workflow? (REJECT)
- [ ] Does it add a new database table? (ACCEPT if supports 3-step workflow or pricing)
- [ ] Does it add a new service file? (ACCEPT if supports core workflow)
- [ ] Does it add a new page? (REJECT unless core workflow)
- [ ] Does it improve the 3-step workflow? (ACCEPT)
- [ ] Does it fix a bug in the 3-step workflow? (ACCEPT)
- [ ] Does it improve UX for core features? (ACCEPT)

---

## AI Assistant Instructions

When working on LexoHub:

1. **Always verify** the request relates to the 3-step workflow
2. **Reject any request** for features outside the 3 steps
3. **Remove any code** that doesn't support the 3 steps
4. **Keep the codebase minimal** - only core features
5. **Maintain focus** - Pro Forma → Matter → Invoice
6. **No bloat** - every file must have a clear purpose
7. **No speculation** - don't add "nice to have" features
8. **User data flows** through the 3 steps only

### Response Template for Rejected Requests

```
❌ This feature is outside the 3-step workflow (Pro Forma → Matter → Invoice).

LexoHub is focused exclusively on:
1. Pro Forma - Quote generation
2. Matter - Case management with WIP tracking
3. Invoice - Billing and payments

[Feature Name] does not directly support these core features and will not be implemented.

If you believe this feature is essential to the 3-step workflow, please explain how it improves:
- Pro Forma creation/conversion
- Matter management/WIP tracking
- Invoice generation/payment tracking
```

---

## Success Metrics

The system is successful when:

1. **Pro Forma (STEP 1 - ALWAYS FIRST):**
   - < 2 minutes to create quote
   - 90%+ conversion rate for accepted quotes
   - Zero data re-entry when converting to matter
   - **Matters list stays clean** - rejected quotes never create matter records

2. **Matter (STEP 2 - CONVERSION ONLY):**
   - **100% of matters come from accepted pro formas**
   - Automatic WIP calculation
   - Easy time/expense entry
   - Clear link to source pro forma
   - Pre-populated forms (no re-entry)

3. **Invoice (STEP 3 - FINAL BILLING):**
   - One-click invoice generation from WIP
   - Automatic calculations (fees + VAT)
   - Complete audit trail from quote to payment
   - Links back to original pro forma

4. **Overall:**
   - Clean codebase (< 50 files)
   - Fast performance
   - Zero bugs in core workflow
   - **Users ALWAYS start with Pro Forma**
   - Happy users completing the 3-step flow

---

## Final Rules

### Rule 1: Pro Forma ALWAYS Comes First
**The workflow MUST start with Pro Forma.** You cannot create a Matter directly. This is non-negotiable.

### Rule 2: If in Doubt, Reject It
LexoHub is intentionally minimal. Every line of code must justify its existence by directly supporting the 3-step workflow. When unsure whether a feature belongs, the answer is **NO**.

### Rule 3: The Workflow is Linear
Pro Forma → Matter → Invoice. No shortcuts. No skipping steps. No creating matters without pro formas.

---

## Document Version
Version: 1.2  
Last Updated: 2025-01-09  
Status: **ACTIVE - ENFORCE STRICTLY**

**Recent Updates (v1.2):**

**PDF Customization System:**
- ✅ Complete PDF Template Customization System (2100+ lines)
- ✅ Visual color picker with 5 professional schemes
- ✅ Live preview panel with split-screen editing
- ✅ 8 layout presets (Formal, Modern, Minimalist, Classic, Executive, Elegant, Compact, Spacious)
- ✅ Advanced layout controls (logo placement, opacity, rotation, margins, background colors)
- ✅ Vertical title orientation (magazine-style)
- ✅ Borderless table options
- ✅ Footer customization (Terms & Conditions, Thank You notes, Bank details)
- ✅ Text alignment and border styling
- ✅ Logo watermark effects

**AWS Integration:**
- ✅ AWS Textract for document intelligence
- ✅ AWS SES for email delivery
- ✅ Document upload with auto-population

**Pro Forma Enhancements:**
- ✅ Attorney-facing public submission page
- ✅ Toggle between manual entry and document upload
- ✅ Rate card integration in pro forma links
- ✅ Pro forma PDF generation service

**Notifications & Reminders:**
- ✅ Smart notification system
- ✅ Payment reminders
- ✅ Pro forma expiry alerts
- ✅ Dashboard ticker/metrics

**Database & Files:**
- ✅ Updated to 23 service files (from 15)
- ✅ Updated to 9 pages (from 7)
- ✅ Added `document_uploads` and `services` tables
- ✅ Added `document-uploads` storage bucket
- ✅ Migration: `20250109000000_create_pdf_templates.sql`

This is the **ONLY** system prompt for LexoHub. Any request to add features, services, or complexity outside the 3-step workflow must be rejected immediately.
