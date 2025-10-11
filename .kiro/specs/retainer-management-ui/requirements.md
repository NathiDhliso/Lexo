# Requirements Document: Retainer Management UI

## Introduction

LexoHub already has a complete backend implementation for retainer management (client credit ledger), including database tables, API services, and business logic. However, there is currently no user interface to access this functionality. This creates a significant gap in financial management capabilities for solo advocates who need to track client deposits and apply them to invoices.

This spec focuses exclusively on building the user interface and user experience for the existing retainer management system. The goal is to make retainer management accessible, intuitive, and integrated into the advocate's daily workflow without requiring them to understand complex trust accounting principles.

### What Already Exists (Backend)
- `retainer_agreements` table with full schema
- `trust_transactions` table for tracking deposits/drawdowns
- `RetainerService` with complete CRUD operations
- Business logic for deposits, drawdowns, refunds, and balance tracking
- Low balance alerts and expiring retainer detection

### What's Missing (This Spec)
- User interface components for retainer management
- Integration into matter workflow
- Visual representation of retainer balances
- Invoice payment application from retainers
- Dashboard widgets for retainer overview
- Mobile-responsive retainer views

## Requirements

### Requirement 1: Create and View Retainer Agreements

**User Story:** As a solo advocate receiving a client deposit, I want to create a retainer agreement linked to a matter and record the initial deposit, so that I can track the client's credit balance and apply it to future invoices.

#### Acceptance Criteria

1. WHEN viewing a matter detail page THEN the system SHALL display a "Retainer" section showing the current retainer status (if exists) or option to create one
2. WHEN clicking "Create Retainer" THEN the system SHALL open a modal with fields for: retainer type, retainer amount, billing period, start date, end date, auto-renew option, and notes
3. WHEN creating a retainer THEN the system SHALL validate that retainer amount is positive and start date is not in the past
4. WHEN a retainer is created THEN the system SHALL display a success message and show the retainer details in the matter
5. WHEN viewing an existing retainer THEN the system SHALL display: retainer type, amount, current balance, percentage remaining, start/end dates, and status
6. WHEN a retainer exists for a matter THEN the system SHALL display a prominent balance indicator showing available credit
7. IF a retainer balance is low (below threshold) THEN the system SHALL display a warning indicator

### Requirement 2: Record Deposits to Retainer

**User Story:** As a solo advocate receiving additional funds from a client, I want to record deposits to their retainer account, so that I can maintain an accurate balance of available credit.

#### Acceptance Criteria

1. WHEN viewing a retainer THEN the system SHALL provide an "Add Deposit" button
2. WHEN clicking "Add Deposit" THEN the system SHALL open a modal with fields for: amount, reference number, description, and transaction date
3. WHEN recording a deposit THEN the system SHALL validate that the amount is positive
4. WHEN a deposit is saved THEN the system SHALL update the retainer balance immediately and display a success message
5. WHEN a deposit is recorded THEN the system SHALL log the transaction in the transaction history with timestamp and user
6. WHEN viewing transaction history THEN the system SHALL display deposits with green indicators and positive amounts

### Requirement 3: Apply Retainer to Invoices (Drawdown)

**User Story:** As a solo advocate generating an invoice for a matter with a retainer, I want to automatically or manually apply the retainer balance to the invoice, so that the client is only billed for the amount exceeding their available credit.

#### Acceptance Criteria

1. WHEN generating an invoice for a matter with an active retainer THEN the system SHALL display the available retainer balance
2. WHEN generating an invoice THEN the system SHALL provide an option to "Apply Retainer" with a field to specify the amount
3. WHEN applying a retainer THEN the system SHALL validate that the amount does not exceed the available balance
4. WHEN applying a retainer THEN the system SHALL validate that the amount does not exceed the invoice total
5. WHEN a retainer is applied to an invoice THEN the system SHALL reduce the invoice balance due by the applied amount
6. WHEN a retainer is applied THEN the system SHALL create a drawdown transaction linked to the invoice
7. WHEN viewing an invoice with retainer applied THEN the system SHALL display: original amount, retainer applied, and balance due
8. WHEN a retainer is fully depleted THEN the system SHALL display a "Retainer Depleted" status and prevent further drawdowns

### Requirement 4: View Transaction History

**User Story:** As a solo advocate managing client finances, I want to view a complete history of all deposits and drawdowns for a retainer, so that I can provide transparent accounting to clients and track fund usage.

#### Acceptance Criteria

1. WHEN viewing a retainer THEN the system SHALL display a "Transaction History" section
2. WHEN viewing transaction history THEN the system SHALL display transactions in reverse chronological order (newest first)
3. WHEN displaying a transaction THEN the system SHALL show: date, type (deposit/drawdown/refund), amount, description, balance before, balance after, and related invoice (if applicable)
4. WHEN viewing transaction history THEN the system SHALL use visual indicators: green for deposits, red for drawdowns, orange for refunds
5. WHEN clicking on a transaction linked to an invoice THEN the system SHALL navigate to that invoice detail page
6. WHEN transaction history is long THEN the system SHALL implement pagination (20 transactions per page)
7. WHEN viewing transaction history THEN the system SHALL provide export functionality (CSV or PDF)

### Requirement 5: Retainer Dashboard Widget

**User Story:** As a solo advocate managing multiple matters with retainers, I want to see an overview of all my active retainers on my dashboard, so that I can quickly identify low balances or expiring agreements without navigating to individual matters.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN the system SHALL display a "Retainers" widget showing summary statistics
2. WHEN displaying the retainers widget THEN the system SHALL show: total active retainers, total balance across all retainers, number of low-balance retainers, number of expiring retainers (within 30 days)
3. WHEN clicking on the retainers widget THEN the system SHALL navigate to a dedicated retainers page
4. WHEN viewing the retainers page THEN the system SHALL display a list of all active retainers with: matter name, client name, current balance, percentage remaining, and status indicators
5. WHEN a retainer has low balance THEN the system SHALL display a warning badge
6. WHEN a retainer is expiring soon THEN the system SHALL display an alert badge
7. WHEN clicking on a retainer in the list THEN the system SHALL navigate to the matter detail page with the retainer section expanded

### Requirement 6: Retainer Balance Indicators

**User Story:** As a solo advocate working on multiple matters, I want to see retainer balance indicators throughout the application, so that I'm always aware of available client credit when making billing decisions.

#### Acceptance Criteria

1. WHEN viewing a matter card in the matters list THEN the system SHALL display a retainer badge if an active retainer exists
2. WHEN hovering over the retainer badge THEN the system SHALL show a tooltip with current balance and percentage remaining
3. WHEN viewing a matter detail page with a retainer THEN the system SHALL display a prominent balance card in the header or sidebar
4. WHEN viewing the balance card THEN the system SHALL use a progress bar or gauge to visualize percentage remaining
5. WHEN balance is above 50% THEN the system SHALL use green color indicators
6. WHEN balance is between 20-50% THEN the system SHALL use yellow/orange color indicators
7. WHEN balance is below 20% THEN the system SHALL use red color indicators and display a warning message

### Requirement 7: Refund Processing

**User Story:** As a solo advocate concluding a matter with remaining retainer funds, I want to process a refund to return unused funds to the client, so that I can maintain proper trust accounting and client relationships.

#### Acceptance Criteria

1. WHEN viewing a retainer with available balance THEN the system SHALL provide a "Process Refund" button
2. WHEN clicking "Process Refund" THEN the system SHALL open a modal with fields for: refund amount and reason
3. WHEN processing a refund THEN the system SHALL validate that the amount does not exceed the available balance
4. WHEN processing a refund THEN the system SHALL require a reason/description
5. WHEN a refund is processed THEN the system SHALL reduce the retainer balance and create a refund transaction
6. WHEN a refund is processed THEN the system SHALL display a confirmation message with the refund details
7. WHEN viewing transaction history THEN the system SHALL display refunds with orange indicators and clear labeling

### Requirement 8: Retainer Lifecycle Management

**User Story:** As a solo advocate managing ongoing client relationships, I want to renew, cancel, or modify retainer agreements as circumstances change, so that I can maintain accurate financial records throughout the matter lifecycle.

#### Acceptance Criteria

1. WHEN viewing an active retainer THEN the system SHALL provide options to: Renew, Cancel, or Edit
2. WHEN clicking "Renew" THEN the system SHALL open a modal to set a new end date and confirm renewal
3. WHEN renewing a retainer THEN the system SHALL update the status to active and set the new end date
4. WHEN clicking "Cancel" THEN the system SHALL require confirmation and a cancellation reason
5. WHEN cancelling a retainer THEN the system SHALL update the status to cancelled and prevent further transactions
6. IF a retainer has remaining balance when cancelled THEN the system SHALL warn the user and suggest processing a refund first
7. WHEN clicking "Edit" THEN the system SHALL allow updating: end date, auto-renew setting, low balance threshold, and notes
8. WHEN editing a retainer THEN the system SHALL NOT allow changing the retainer amount or type (to maintain audit integrity)

### Requirement 9: Mobile Responsiveness

**User Story:** As a solo advocate who often works from my phone or tablet, I want to access and manage retainer information from any device, so that I can check balances and record transactions while meeting with clients or working remotely.

#### Acceptance Criteria

1. WHEN viewing retainer information on mobile THEN the system SHALL display a responsive layout optimized for smaller screens
2. WHEN viewing the retainer balance card on mobile THEN the system SHALL use a vertical layout with clear typography
3. WHEN recording deposits or drawdowns on mobile THEN the system SHALL provide touch-friendly form inputs with appropriate keyboards (numeric for amounts)
4. WHEN viewing transaction history on mobile THEN the system SHALL use a compact card layout with essential information visible
5. WHEN accessing retainer actions on mobile THEN the system SHALL use bottom sheets or full-screen modals for better usability

### Requirement 10: Integration with Invoice Workflow

**User Story:** As a solo advocate generating invoices, I want the system to automatically suggest applying available retainer balance, so that I don't have to manually remember to check for client credit before billing.

#### Acceptance Criteria

1. WHEN creating an invoice for a matter with an active retainer THEN the system SHALL display a prominent notification: "This matter has R[amount] available in retainer"
2. WHEN the invoice amount is less than or equal to the retainer balance THEN the system SHALL suggest: "Apply full retainer balance to this invoice?"
3. WHEN the invoice amount exceeds the retainer balance THEN the system SHALL suggest: "Apply R[balance] from retainer? Client will be billed R[difference]"
4. WHEN the user accepts the suggestion THEN the system SHALL automatically populate the retainer application amount
5. WHEN generating the invoice THEN the system SHALL clearly show the calculation: Invoice Total - Retainer Applied = Balance Due
6. WHEN viewing a paid invoice that used retainer funds THEN the system SHALL display the payment breakdown showing retainer application

## Success Metrics

- **Adoption Rate:** 60%+ of advocates with client deposits create retainer agreements within first month
- **Usage:** Average of 3+ transactions per active retainer per month
- **Accuracy:** Zero reported discrepancies in retainer balance calculations
- **Efficiency:** 80%+ reduction in time spent manually tracking client deposits
- **Satisfaction:** 90%+ of users rate retainer management as "easy to use" or "very easy to use"
- **Financial Impact:** 30%+ increase in timely invoice payments due to retainer application

## Out of Scope (Future Considerations)

- Full trust accounting compliance features (interest calculations, regulatory reporting)
- Multi-currency retainer support
- Automated retainer replenishment reminders to clients
- Integration with external payment processors for direct deposits
- Retainer agreement document generation and e-signature
- Client portal access to view retainer balance
- Automated low-balance notifications to clients
- Retainer forecasting based on historical billing patterns
