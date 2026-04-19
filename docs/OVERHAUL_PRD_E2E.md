# LexoHub Overhaul PRD (End-User First, End-to-End)

## 1. Product Goal
- Build the most reliable day-to-day operating system for South African advocates from first brief to final payment.
- Remove spreadsheet work, reduce billing leakage, and improve attorney experience.
- Keep all financial workflows compliant (SARS, LPC, auditability).

## 2. Product Vision
- A single workflow where an advocate can intake work, execute matters, bill accurately, collect faster, and report confidently.
- Attorney collaborators can submit, track, and respond without back-and-forth chaos.

## 3. Primary End Users
- Advocate (solo or small firm): needs fast intake, clear WIP, accurate invoices, and confidence in collections.
- Instructing attorney: needs easy submission, transparency, and quick response to quotes/invoices.
- Practice admin/finance support: needs clean records, payment reconciliation, and compliance-ready exports.

## 4. Core User Outcomes (What Success Feels Like)
- I can create a matter in under 5 minutes from a call or attorney request, either taking the detailed "Quote First" path or the rapid "Accept & Work" brief fee path.
- I can seamlessly connect with attorneys—whether they are registered portal users or unregistered guests who just receive PDF invoices via email.
- I always know unbilled work, next billing action, and what is overdue.
- I can generate compliant invoices and credit notes (with strict sequential numbering) without manual fixes.
- I can reconcile payments, partial payments, and trust/retainer balances with no spreadsheet dependence.
- I can prove every financial change with an audit trail and link documents directly from my cloud storage (Drive/OneDrive).

## 5. North Star Metrics
- Time to first matter created (new user): target under 10 minutes.
- Matter-to-invoice cycle time: reduce by 30%.
- Percentage of matters invoiced within SLA: target above 90%.
- DSO (days sales outstanding): reduce by 20%.
- Payment reconciliation accuracy: target 99.5%+.
- Weekly active advocates: target growth and retention cohort uplift.

## 6. End-to-End Journey (Target State)
- Sign in and configure practice.
- Capture or receive a brief.
- Execute matter work (time, services, disbursements, documents).
- Control scope and quote approvals.
- Generate and send compliant invoice.
- Record and reconcile payment events.
- Handle exceptions (disputes, credit notes, amendments).
- Close matter and report performance/compliance.

## 7. Ordered Feature Implementation Plan

### Phase 0: Platform Stability and Trust (Foundation)
- End-user outcome: users can trust sign-in, session continuity, and basic system availability.
- Features: authentication hardening, production redirect correctness, role-aware routing, error boundaries, global loading and retry patterns.
- Features: baseline observability (error tracking, API failure logs, key user event logs).
- Features: environment validation guardrails for Supabase and cloud integrations.
- Definition of done: no blocking auth regressions in production for 2 consecutive weeks.

### Phase 1: Onboarding and Workspace Setup
- End-user outcome: a new advocate can configure the system once and start working immediately.
- Features: guided onboarding wizard for billing model, firm profile, VAT setup, invoice preferences.
- Features: first-run checklist with progress (create firm, add attorney contacts, create first matter).
- Features: sensible defaults for numbering, rates, and templates.
- Definition of done: 80%+ of new users complete setup without support.

### Phase 2: Intake and Matter Creation (Front Door)
- End-user outcome: every new piece of work can enter the system quickly and consistently, adapting gracefully to the scope.
- Features: The "Dual-Path" workflow selection.
  - Path A (Quote First): For complex work requiring a Pro Forma, attorney approval workflows, and detailed scope management.
  - Path B (Accept & Work): For straightforward, traditional brief fee work (court appearances, consultations) where the advocate skips the Pro Forma overhead entirely.
- Features: Attorney connection interface allowing selection of registered attorneys (via firm dropdowns/quick select) or free-text capture for unregistered attorneys (triggering a portal invitation payload).
- Features: Quick brief capture flow (structured prompts, form steps) mapped directly to user-saved "Quick Brief" templates.
- Features: Duplicate/related matter detection and conflict warning basics.
- Features: Seamless creation of "Matter Workbenches".
- Definition of done: median matter creation time below 5 minutes via either Dual-Path path.

### Phase 3: Matter Workbench Core (Execution Engine)
- End-user outcome: all work on a matter is tracked in one place with real-time WIP visibility, avoiding context-switching.
- Features: unified matter workspace tabs (overview, time, services, expenses/disbursements, documents, billing).
- Features: explicit Disbursement logging with VAT calculations (15%), WIP additions, and cloud receipt URL capability.
- Features: simple Fee Entry Modal for Path B (brief fees) without detailed WIP overhead.
- Features: intelligent document linking ecosystem. Advocates attach Google Drive, OneDrive, or Dropbox URLs straight to the matter structure instead of uploading/cluttering local storage.
- Features: deadline, urgency, and next-action timelines.
- Features: matter status lifecycle management and archival visibility.
- Definition of done: over 90% of active matters have complete real-time WIP reporting before shifting to billing.

### Phase 4: Scope and Quote Control
- End-user outcome: scope changes and quote approvals are controlled, visible, and bill-safe.
- Features: pro forma creation, approval, rejection, and conversion to matter.
- Features: scope amendment requests with impact preview.
- Features: revision history for quote and scope decisions.
- Features: expiration and follow-up nudges for pending pro formas.
- Definition of done: quote-to-matter conversion is fully traceable and reversible where allowed.

### Phase 5: Billing and Invoice Production
- End-user outcome: advocates can generate compliant invoices in minutes with no manual spreadsheet work.
- Features: invoice generation from matter WIP (time, services, disbursements, adjustments).
- Features: sequential numbering and VAT-compliant invoice formatting.
- Features: invoice template customization and branded PDF output.
- Features: pre-send validation (missing fields, numbering, VAT checks).
- Definition of done: 99%+ invoice generation success with no numbering gaps except explicit void events.

### Phase 6: Payments, Collections, and Exceptions
- End-user outcome: cash collection is transparent, actionable, and mathematically verifiable down to the cent.
- Features: partial payments system allowing multiple payment records against a single invoice without breaking outstanding balance loops.
- Features: credit notes workflow tied directly into SARS compliance rules, generated from an invoice, calculating real-time balance adjustments.
- Features: payment method tracking, overpayment warnings, aging thresholds.
- Features: payment disputes workflow and exception state management.
- Definition of done: outstanding report matches ledger and invoice balances with 100% accuracy, supporting partial payment histories.

### Phase 7: Trust and Retainer Management
- End-user outcome: trust and retainer handling is compliant, auditable, and easy to reconcile.
- Features: retainer agreement setup, drawdown rules, and replenishment alerts.
- Features: trust receipt logging, transfers, and balance protections.
- Features: reconciliation views and LPC-ready reporting outputs.
- Features: controls to prevent negative trust operations.
- Definition of done: monthly trust reconciliation can be completed entirely in-product.

### Phase 8: Attorney Collaboration Experience
- End-user outcome: attorneys can self-serve status and documents via portal, ending email tag and follow-up chases.
- Features: automated attorney invitation token workflows via email upon "First Matter" creation for unregistered firms.
- Features: historical matter-linking engine - when an attorney finally registers using an invite link, previously captured matters tied to their email are auto-assigned to their portal.
- Features: automated delivery routes—if the attorney is registered, post to their portal; if unregistered, send invoice PDFs directly attached to emails with a "register now" CTA.
- Features: action centers for quote approvals, clarification requests, and status timeline visibility.
- Definition of done: unregistered and registered attorneys both receive invoices, with one-click conversion to portal users.

### Phase 9: Reporting, Search, and Operational Intelligence
- End-user outcome: robust dashboards let the user make immediate daily actions from live data, reducing cognitive load.
- Features: The "Enhanced Dashboard" structure:
  - Urgent Attention Cards (overdue items, missing deadlines)
  - This Week Deadlines Cards.
  - Financial Snapshot Cards (WIP, Balance).
  - Active Matters lists, lazy-loaded for performance.
- Features: "Advanced Filters Modal" on the root Matter screen enabling complex global scoping (search by fees, dates, types, practice areas, exclusions).
- Features: Quick Stats and audit log visibility (e.g., VAT rate history, sequential invoice numbering exceptions).
- Definition of done: dashboard correctly surfaces action cards for unbilled, unpaid, and urgent timelines directly on login.

### Phase 10: Quality, Performance, and Release Hardening
- End-user outcome: the app feels fast, predictable, and safe at production scale.
- Features: full regression test matrix for core journey (intake to payment).
- Features: performance budgets (page load, report generation, PDF generation).
- Features: security checks, RLS verification, and permission boundary tests.
- Features: release playbooks, rollback procedures, and incident runbooks.
- Definition of done: stable release with clear SLOs and incident response ownership.

## 8. Cross-Cutting Requirements (Apply to Every Phase)
- UX: mobile-first responsive behavior for all critical workflows.
- UX: accessibility baseline (keyboard nav, labels, contrast, focus visibility).
- Data: every critical action must be audit logged.
- Security: role-based access and RLS enforced for every entity.
- Reliability: idempotent write paths where financial records are involved.
- Performance: avoid blocking UI on non-critical calls; use optimistic updates where safe.
- Compliance: preserve immutable numbering records for invoices and credit notes.

## 9. Explicit Out-of-Scope for Overhaul MVP
- Native mobile apps (iOS/Android) beyond PWA quality.
- Complex AI auto-drafting without human review controls.
- Deep accounting suite integrations until ledger accuracy is stable.
- Multi-country tax localization beyond South African requirements.

## 10. Release Gates (No Phase Promotion Without)
- Gate A: user acceptance criteria pass for the phase's end-user outcome.
- Gate B: no unresolved P0/P1 defects in phase-critical workflows.
- Gate C: telemetry confirms feature usage and error rates within threshold.
- Gate D: compliance checks pass where financial outputs are involved.

## 11. Implementation Sequence Summary (Single-Line View)
- Foundation -> Onboarding -> Intake -> Matter Execution -> Scope Control -> Billing -> Collections -> Trust/Retainer -> Attorney Collaboration -> Reporting -> Hardening.

## 12. End-to-End Definition of Success
- A first-time advocate can sign up, configure settings, capture a matter, execute work, issue a compliant invoice, record payment, and review cash position in one uninterrupted product flow.
