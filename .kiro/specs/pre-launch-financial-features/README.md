# Pre-Launch Financial Features Specification

## Status: Ready for Implementation

This specification addresses five critical features required before production launch to ensure accurate financial tracking, SARS compliance, and operational efficiency for South African legal practice management.

## Business Impact

### Without These Features (Annual Risk)
- Missed disbursements: **-R30,000**
- SARS penalties: **-R15,000**
- Lost clients (missed deadlines): **-R80,000**
- Unbillable work tracking issues: **-R75,000**
- Lost fee disputes: **-R40,000**
- **Total Annual Risk: -R240,000**

### With These Features (Annual Benefit)
- All disbursements billed: **+R30,000**
- SARS-compliant from day 1: **+R15,000**
- No missed deadlines: **+R80,000**
- Improved efficiency: **+R37,500**
- Win fee disputes: **+R40,000**
- **Total Annual Benefit: +R202,500**

## Features Included

### 1. Partial Payments Handling
Track multiple payments against a single invoice with accurate outstanding balance reporting for proper cashflow management and SARS provisional tax calculations.

**Key Capabilities:**
- Record partial payments with date, amount, method, and reference
- Automatic balance calculation and status updates
- Payment history tracking with audit trail
- Outstanding Fees Report showing actual amounts owed
- Revenue Report based on payment dates (not invoice dates)

### 2. Disbursements Workflow
Log and track disbursements (court fees, travel, transcripts) separately from professional fees with proper VAT handling and invoice integration.

**Key Capabilities:**
- Log disbursements with description, amount, date, and VAT flag
- Automatic VAT calculation (15% or custom rate)
- Optional receipt link to cloud storage
- Separate "DISBURSEMENTS" section on invoices
- Include unbilled disbursements in WIP calculations

### 3. Invoice Numbering & VAT Compliance
Generate SARS-compliant tax invoices with sequential numbering, no gaps, and complete audit trail.

**Key Capabilities:**
- Sequential invoice numbering (configurable format)
- Separate credit note numbering
- Automatic year rollover
- Void number tracking with reasons
- VAT-compliant tax invoice format
- Advocate details configuration
- VAT rate history tracking
- Complete numbering audit log

### 4. Enhanced Dashboard
Comprehensive dashboard showing urgent items, financial snapshot, active matters, and pending actions at a glance.

**Key Capabilities:**
- Urgent Attention section (deadlines today, overdue invoices, pending pro formas)
- This Week's Deadlines
- Financial Snapshot (outstanding fees, WIP, month invoiced)
- Active Matters with completion percentage and stale warnings
- Pending Actions counts (new requests, approvals, amendments, ready to invoice)
- Quick Stats (30-day metrics)
- Auto-refresh every 5 minutes

### 5. Matter Search & Archiving
Fast full-text search with advanced filters and archive functionality to keep active matters list clean while preserving historical data.

**Key Capabilities:**
- Real-time full-text search across title, client, attorney, description
- Advanced filters (practice area, type, status, date range, fee range, firm)
- Sort options (deadline, created date, fee, last activity)
- Archive matters with reason tracking
- Include/exclude archived in search
- Export filtered results to CSV/PDF
- Pagination for large result sets

## Documents

- **[requirements.md](./requirements.md)** - Detailed requirements with user stories and acceptance criteria in EARS format
- **[design.md](./design.md)** - Technical architecture, database schemas, service layer design, UI components, and implementation strategy
- **[tasks.md](./tasks.md)** - Implementation task list with 60+ discrete coding tasks organized by feature

## Implementation Approach

### Recommended Priority Order
1. **Feature 3: Invoice Numbering** (Foundation for compliance)
2. **Feature 1: Partial Payments** (Critical for cashflow tracking)
3. **Feature 2: Disbursements** (Revenue protection)
4. **Feature 4: Dashboard** (User experience)
5. **Feature 5: Search** (Operational efficiency)

### Estimated Timeline
- **Single Developer:** 4-6 weeks
- **Two Developers:** 3-4 weeks
- **Team of 3+:** 2-3 weeks

### Development Phases
1. **Phase 1:** Database migrations and schema changes
2. **Phase 2:** Service layer implementation
3. **Phase 3:** UI components and integration
4. **Phase 4:** Testing and refinement
5. **Phase 5:** Deployment and monitoring

## Technical Stack

- **Frontend:** React, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, RLS, Edge Functions)
- **State Management:** React Query
- **Forms:** React Hook Form with Zod validation
- **PDF Generation:** jsPDF / pdfmake
- **Testing:** Vitest, Playwright

## Compliance Requirements

- **SARS Income Tax Act:** Sequential invoice numbering without gaps
- **VAT Act:** Tax invoice requirements for VAT-registered advocates
- **POPIA:** Audit trail for data access and modifications
- **ECTA:** Digital evidence admissibility standards

## Success Criteria

- ✅ Partial payments: 90%+ of invoices with multiple payments tracked accurately
- ✅ Disbursements: 100% of disbursements included in invoices
- ✅ Invoice numbering: 0 gaps in sequence, 100% SARS compliant
- ✅ Dashboard: <2 second load time, 95%+ user satisfaction
- ✅ Search: <1 second response time, 90%+ relevant results

## Getting Started

### For Developers

1. Read the [requirements.md](./requirements.md) to understand what needs to be built
2. Review the [design.md](./design.md) for technical architecture and implementation details
3. Follow the [tasks.md](./tasks.md) for step-by-step implementation guidance
4. Start with Feature 3 (Invoice Numbering) as it's foundational

### For Product Managers

1. Review the business impact section above
2. Understand the compliance requirements
3. Plan user acceptance testing scenarios
4. Prepare user training materials

### For QA/Testing

1. Review acceptance criteria in requirements.md
2. Create test cases for each feature
3. Focus on edge cases (overpayments, voided numbers, etc.)
4. Verify SARS compliance for tax invoices

## Dependencies

- Existing invoice generation system
- Matter management system
- User authentication and authorization
- Database access with RLS policies
- PDF generation service

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration issues | High | Thorough testing on staging, rollback plan |
| Performance degradation | Medium | Caching, indexing, query optimization |
| SARS compliance gaps | High | Legal review, compliance checklist |
| User adoption resistance | Medium | Training, documentation, gradual rollout |
| Integration bugs | Medium | Comprehensive testing, feature flags |

## Support & Questions

For questions about this specification:
- Review the design document for technical details
- Check the requirements document for business logic
- Consult the tasks document for implementation guidance

## Version History

- **v1.0** (2025-10-26) - Initial specification created
  - 5 high-priority features defined
  - Requirements, design, and tasks documented
  - Ready for implementation

## Next Steps

1. ✅ Requirements approved
2. ✅ Design approved
3. ✅ Tasks approved
4. ⏳ Begin implementation (start with tasks.md)
5. ⏳ Conduct testing
6. ⏳ Deploy to production

---

**This specification is complete and ready for implementation. Open [tasks.md](./tasks.md) and click "Start task" next to task items to begin execution.**
