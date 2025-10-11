# Retainer Management UI Feature Spec

## Overview

This spec defines the user interface layer for LexoHub's existing retainer management system (client credit ledger). The backend infrastructure is already complete - this spec focuses on making retainer functionality accessible and intuitive for solo advocates through well-designed UI components integrated into their daily workflow.

## Problem Statement

LexoHub has a complete backend implementation for retainer management, including database tables (`retainer_agreements`, `trust_transactions`), API services (`RetainerService`), and business logic. However, there is no user interface to access this functionality, creating a significant gap in financial management capabilities for advocates who need to track client deposits and apply them to invoices.

## Solution

Build a comprehensive UI layer that makes retainer management simple and accessible:
- Visual balance indicators with color coding
- Intuitive modals for deposits, drawdowns, and refunds
- Integration into matter workflow and invoice generation
- Dashboard widgets for overview and alerts
- Mobile-responsive design for on-the-go access

## Spec Documents

1. **[requirements.md](./requirements.md)** - Complete requirements with user stories and acceptance criteria
2. **[design.md](./design.md)** - Comprehensive UI/UX design including components, hooks, and integration points
3. **[tasks.md](./tasks.md)** - Detailed implementation plan with 15 major tasks broken into 50+ actionable sub-tasks

## Key Features

### Core Functionality
- Create retainer agreements linked to matters
- Record deposits to client credit accounts
- Apply retainer balance to invoices (drawdowns)
- Process refunds for unused funds
- View complete transaction history
- Manage retainer lifecycle (renew, cancel, edit)

### Visual Design
- Color-coded balance indicators (green/yellow/red)
- Progress bars showing percentage remaining
- Transaction history with visual type indicators
- Warning badges for low balance and expiring retainers
- Responsive layouts for all screen sizes

### Integration Points
- Matter detail page with dedicated Retainer section
- Matter list cards with retainer badges
- Invoice generation with automatic retainer application prompt
- Dashboard widget showing retainer overview and alerts
- Dedicated retainers list page for cross-matter view

## Success Metrics

- **Adoption**: 60%+ of advocates with client deposits create retainer agreements within first month
- **Usage**: Average of 3+ transactions per active retainer per month
- **Accuracy**: Zero reported discrepancies in balance calculations
- **Efficiency**: 80%+ reduction in time spent manually tracking deposits
- **Satisfaction**: 90%+ rate retainer management as "easy to use"
- **Financial Impact**: 30%+ increase in timely invoice payments

## Implementation Approach

### Phase 1: Core UI (Week 1-2)
- TypeScript types and utilities
- Custom React hooks (useRetainer, useRetainerTransactions)
- Core components (RetainerBalanceCard, EmptyRetainerState, RetainerBadge)
- Management modals (Create, Deposit, Apply, Refund)
- Matter detail page integration

### Phase 2: Transaction & History (Week 2-3)
- Transaction history components
- Edit, Renew, Cancel modals
- Export functionality
- Enhanced error handling

### Phase 3: Dashboard & Overview (Week 3)
- Dashboard widget
- Retainers list page
- Cross-matter statistics
- Low balance and expiring alerts

### Phase 4: Polish & Mobile (Week 4)
- Mobile responsiveness optimization
- Accessibility improvements
- Performance optimization
- User testing and refinements

## Technical Stack

- **Backend**: Already complete (Supabase, RetainerService)
- **Frontend**: React + TypeScript
- **State Management**: React Query for data fetching and caching
- **UI Components**: Existing LexoHub design system
- **Forms**: React Hook Form with validation
- **Mobile**: Responsive design with touch optimization

## What Already Exists (Backend)

✅ **Database Tables**:
- `retainer_agreements` - Stores retainer agreement details
- `trust_transactions` - Tracks all deposits, drawdowns, and refunds

✅ **API Service** (`RetainerService`):
- `create()` - Create new retainer agreement
- `deposit()` - Record deposit to trust account
- `drawdown()` - Apply retainer to invoice
- `refund()` - Process refund to client
- `getByMatterId()` - Fetch retainer for matter
- `getSummary()` - Get balance and statistics
- `getTransactionHistory()` - Fetch all transactions
- `cancel()`, `renew()` - Lifecycle management
- `getLowBalanceRetainers()`, `getExpiringRetainers()` - Alerts

✅ **Business Logic**:
- Balance calculations
- Transaction validation
- Low balance detection
- Expiry tracking

## What's Being Built (This Spec)

🔨 **UI Components**:
- RetainerBalanceCard - Visual balance display
- CreateRetainerModal - Create new retainer
- AddDepositModal - Record deposits
- ApplyRetainerModal - Apply to invoices
- RetainerTransactionHistory - Transaction list
- RetainerSummaryWidget - Dashboard overview
- RetainerBadge - Matter card indicator
- And 10+ more components

🔨 **Custom Hooks**:
- useRetainer - Retainer data and mutations
- useRetainerTransactions - Transaction history
- useAllRetainers - Cross-matter statistics

🔨 **Integration**:
- Matter detail page retainer section
- Invoice generation retainer prompt
- Dashboard retainer widget
- Matter card retainer badges
- Dedicated retainers list page

## Getting Started

To begin implementing this feature:

1. Review the [requirements.md](./requirements.md) to understand user needs
2. Study the [design.md](./design.md) for component specifications
3. Follow the [tasks.md](./tasks.md) implementation plan sequentially
4. Start with Task 1 (Types and utilities) and work through incrementally

## Dependencies

- ✅ Existing RetainerService (already implemented)
- ✅ Database tables and RLS policies (already implemented)
- ✅ Supabase authentication system
- ✅ Existing UI component library
- ✅ React Query or SWR for data fetching
- ✅ Existing matter and invoice pages

## Future Enhancements (Out of Scope for MVP)

- Full trust accounting compliance features
- Multi-currency support
- Automated client notifications
- Payment processor integration
- Client portal access to retainer balance
- Retainer forecasting and analytics
- Document generation for retainer agreements

## Questions or Feedback

This spec is ready for implementation. To execute tasks:

1. Open the [tasks.md](./tasks.md) file
2. Click "Start task" next to any task item
3. Follow the task details and requirements references
4. Complete tasks sequentially for best results

---

**Spec Status**: ✅ Complete - Ready for Implementation  
**Priority**: Phase 1 - High Priority  
**Estimated Effort**: 3-4 weeks for complete UI (2 weeks for core functionality)  
**Backend Status**: ✅ Already Complete  
**Created**: 2025-10-11
