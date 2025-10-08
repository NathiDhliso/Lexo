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
- `src/components/proforma/NewProFormaModal.tsx`
- `src/pages/ProFormaRequestsPage.tsx`
- Database: `proforma_requests` table

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
- `src/pages/MattersPage.tsx`
- Database: `matters`, `time_entries`, `expenses` tables

### Step 3: Invoice (Billing)
**Purpose:** Generate final invoices and track payments  
**Key Actions:**
- Generate invoice from matter WIP
- Auto-generate invoice number (INV-YYYY-NNNN)
- Auto-calculate totals (fees + disbursements + VAT)
- Send invoice to client
- Record payments
- Track payment status
- Link to source pro forma (if applicable)

**Core Files:**
- `src/services/api/invoices.service.ts`
- `src/services/api/invoice-api.service.ts`
- `src/components/invoices/InvoiceGenerationModal.tsx`
- `src/pages/InvoicesPage.tsx`
- Database: `invoices`, `payments` tables

---

## Supporting Features (ALLOWED)

These features directly support the 3-step workflow:

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

### Document Processing (Helper)
- `src/services/api/document-intelligence.service.ts` - Extract data from uploaded briefs
- `src/components/document-processing/` - Document upload
- **Only used to pre-populate matter forms**

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

### Services (12 files ONLY)
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
```

### Pages (7 files ONLY)
```
src/pages/
├── DashboardPage.tsx ✅
├── ProFormaRequestsPage.tsx ✅
├── MattersPage.tsx ✅
├── InvoicesPage.tsx ✅
├── ProfilePage.tsx ✅
├── SettingsPage.tsx ✅
└── LoginPage.tsx ✅
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
├── invoices/ ✅
├── matters/ ✅
├── navigation/ ✅
├── notifications/ ✅
└── proforma/ ✅
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
Version: 1.0  
Last Updated: 2025-01-07  
Status: **ACTIVE - ENFORCE STRICTLY**

This is the **ONLY** system prompt for LexoHub. Any request to add features, services, or complexity outside the 3-step workflow must be rejected immediately.
