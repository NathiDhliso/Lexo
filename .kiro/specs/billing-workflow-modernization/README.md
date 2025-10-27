# Billing Workflow Modernization Spec

## Overview

This spec addresses critical value proposition gaps in LexoHub's billing system that conflict with South African advocates' traditional practice patterns. The current system treats time-based billing as the primary workflow, creating unnecessary complexity for advocates who primarily work on brief fees (fixed-fee arrangements).

## Problem Statement

The current system has 10 major value proposition gaps:

1. **Path A/B Inequality** - Time tracking feels mandatory, brief fees feel secondary
2. **Trust Account Gap** - No trust account management (Legal Practice Council requirement)
3. **Invoice Numbering Rigidity** - Strict sequential numbering with no flexibility
4. **Disbursement VAT Complexity** - Manual VAT toggling for every disbursement
5. **Pro Forma Delays** - Formal approval process conflicts with urgent matters
6. **Attorney Invitation Overhead** - Bureaucratic setup for established relationships
7. **Payment Tracking Stress** - Negative language creates anxiety
8. **Scope Amendments Limited** - Only available in Path A (quote-first)
9. **Mobile Experience Secondary** - Desktop-optimized, not mobile-first
10. **Brief Fee Inefficiency** - No templates, slow invoice generation

## Solution

This spec implements a **billing-model-agnostic system** where brief fees and time-based billing are treated as equally valid workflows. The system adapts to the user's preferred billing method through:

- **Matter-level billing preferences** - Choose per matter
- **User-level defaults** - Set your primary workflow
- **Progressive disclosure** - Hide complexity for brief fee users
- **Trust account management** - Full LPC compliance
- **Flexible invoice numbering** - With audit trail for SARS
- **Smart disbursement VAT** - Auto-suggest based on type
- **Urgent matter workflow** - Skip pro forma for same-day briefs
- **Simplified attorney connection** - Manual entry without registration
- **Positive payment tracking** - Encouraging language
- **Scope amendments for all** - Available for brief fees too
- **Mobile-first quick actions** - One-tap essential actions
- **Brief fee templates** - <60 second invoicing

## Documents

- **[requirements.md](./requirements.md)** - 12 detailed requirements with acceptance criteria
- **[design.md](./design.md)** - Architecture, components, data models, implementation strategy
- **[tasks.md](./tasks.md)** - 30 major tasks, ~100 sub-tasks, 7-8 week timeline

## Key Features

### 1. Billing Model Selection
- Choose per matter: Brief Fee, Time-Based, or Quick Opinion
- System adapts UI based on selection
- User defaults from onboarding preference

### 2. Trust Account Management
- Full trust account with LPC compliance
- Receipt recording with legal disclosures
- Transfer to business account with audit trail
- Negative balance prevention (critical)
- Reconciliation reports

### 3. Flexible Invoice Numbering
- Strict Sequential mode (no gaps)
- Flexible mode (allows gaps with audit trail)
- SARS compliant in both modes
- Year reset options

### 4. Smart Disbursement VAT
- Auto-suggest VAT based on disbursement type
- Court fees default to VAT-exempt
- Travel/accommodation default to VAT-inclusive
- Easy override with audit trail

### 5. Urgent Matter Quick Capture
- 2-step matter creation for urgent briefs
- Skip pro forma approval
- Immediate activation
- Late document attachment

### 6. Simplified Attorney Connection
- Quick select from recurring attorneys
- Manual entry without registration
- Optional portal invitation
- Email invoice delivery for unregistered

### 7. Scope Amendments for Brief Fees
- Request additional fees for expanded scope
- Attorney approval workflow
- Itemized on invoice
- Full audit trail

### 8. Positive Payment Tracking
- "Needs attention" instead of "Overdue"
- "Collection opportunities" instead of "Aging debt"
- Progress bars with encouraging messages
- Neutral colors, action-oriented

### 9. Mobile Quick Actions
- One-tap: Record payment, Log disbursement, Send invoice
- Offline mode with sync queue
- Voice-to-text for descriptions
- WhatsApp invoice sharing
- Camera receipt capture

### 10. Brief Fee Templates
- Pre-configured templates by matter type
- One-click invoice generation
- <60 second target
- Usage analytics

## Implementation Timeline

- **Phase 1**: Billing Model Foundation (2 weeks)
- **Phase 2**: Trust Account System (1.5 weeks)
- **Phase 3**: Invoice Numbering & Disbursements (1.5 weeks)
- **Phase 4**: Workflow Streamlining (1.5 weeks)
- **Phase 5**: Mobile Optimization (1.5 weeks)
- **Phase 6**: Testing & Refinement (1 week)
- **Phase 7**: Documentation & Deployment (1 week)

**Total: 7-8 weeks**

## Success Metrics

- Brief fee matters created without time-tracking: >80%
- Time to create invoice with template: <60 seconds
- User satisfaction with billing workflow: >4.5/5
- Trust account compliance: 100% (no negative balances)
- Mobile task completion rate: >90%
- Scope amendment usage: >30% of matters
- Attorney connection time: <2 minutes

## Compliance

- **SARS**: Invoice numbering compliant in both modes
- **Legal Practice Council**: Trust account regulations fully implemented
- **VAT**: Correct treatment and reporting for all disbursements

## Getting Started

To begin implementation:

1. Review [requirements.md](./requirements.md) to understand all acceptance criteria
2. Study [design.md](./design.md) for architecture and component details
3. Follow [tasks.md](./tasks.md) phase by phase
4. Start with Phase 1 (Billing Model Foundation) as it's foundational for all other phases

## Questions or Feedback?

This spec addresses fundamental product strategy issues. If you have questions about:
- **Requirements**: Review acceptance criteria in requirements.md
- **Architecture**: Check design patterns in design.md
- **Implementation**: Follow task breakdown in tasks.md
- **Timeline**: See phase estimates in tasks.md

## Status

- [x] Requirements defined
- [x] Design completed
- [x] Tasks planned
- [ ] Implementation started
- [ ] Testing completed
- [ ] Deployed to production
