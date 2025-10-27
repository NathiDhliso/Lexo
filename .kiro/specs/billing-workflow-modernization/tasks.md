# Billing Workflow Modernization Implementation Tasks

## Overview

This task list implements the billing workflow modernization to address value proposition gaps and align with South African advocates' traditional practice patterns. Tasks are organized into 6 phases with clear dependencies and success criteria.

## Phase 1: Billing Model Foundation (Week 1-2)

- [x] 1. Implement billing strategy pattern


  - [x] 1.1 Create billing strategy interfaces and types



    - Define `BillingStrategy` interface with methods for calculations and UI behavior
    - Create `BillingModel` enum: 'brief-fee', 'time-based', 'quick-opinion'
    - Define strategy-specific types: `BriefFeeStrategy`, `TimeBasedStrategy`, `QuickOpinionStrategy`



    - _Requirements: 1.1, 1.2_
  
  - [x] 1.2 Implement concrete billing strategy classes

    - Create `BriefFeeStrategy` class with milestone-based logic


    - Create `TimeBasedStrategy` class with hourly rate calculations
    - Create `QuickOpinionStrategy` class with flat-rate logic
    - Implement `calculateInvoiceAmount()` for each strategy
    - _Requirements: 1.1, 1.3_
  
  - [x] 1.3 Create billing strategy factory and hook

    - Build `BillingStrategyFactory` to instantiate strategies
    - Create `useBillingStrategy(model)` React hook
    - Add strategy caching for performance
    - _Requirements: 1.1_

- [x] 2. Add billing model to matter schema
  - [x] 2.1 Update database schema


    - Add `billing_model` column to matters table (enum type)
    - Add `agreed_fee` column for brief fees (decimal)
    - Add `hourly_rate` column for time-based (decimal)
    - Create migration script with default values for existing matters
    - _Requirements: 1.1, 1.6_
  
  - [x] 2.2 Update TypeScript types


    - Add `billingModel` field to `Matter` interface
    - Add `agreedFee` and `hourlyRate` optional fields





    - Update matter creation and update DTOs
    - _Requirements: 1.1_
  
  - [x] 2.3 Update matter API service


    - Modify `createMatter()` to accept billing model


    - Modify `updateMatter()` to handle billing model changes
    - Add validation for billing model transitions
    - _Requirements: 1.5_



- [x] 3. Create billing model selector component
  - [x] 3.1 Build BillingModelSelector UI component

    - Create radio button group with three options
    - Add descriptive text for each billing model





    - Implement controlled component pattern
    - Style with judicial color palette
    - _Requirements: 1.1_
  


  - [x] 3.2 Integrate selector into matter creation wizard


    - Add billing model step to MatterCreationWizard
    - Pre-select user's default billing model
    - Show contextual help text

    - _Requirements: 1.1, 2.6_
  
  - [x] 3.3 Add billing model change confirmation


    - Create confirmation modal for post-creation changes
    - Warn about data implications (e.g., time entries)
    - Implement change validation logic
    - _Requirements: 1.5_



- [x] 4. Implement user billing preferences
  - [x] 4.1 Create billing preferences database schema
    - Add `advocate_billing_preferences` table
    - Include fields: default_billing_model, primary_workflow, dashboard_widgets
    - Create migration with default values
    - _Requirements: 2.1, 2.2_
  
  - [x] 4.2 Create billing preferences API service

    - Implement `getBillingPreferences(advocateId)`
    - Implement `updateBillingPreferences(advocateId, preferences)`
    - Add caching layer for performance
    - _Requirements: 2.1, 2.5_
  


  - [x] 4.3 Create useBillingPreferences hook
    - Fetch preferences on mount
    - Provide update function
    - Handle loading and error states
    - _Requirements: 2.1_

- [x] 5. Create onboarding billing preference wizard
  - [x] 5.1 Build BillingPreferenceWizard component


    - Create three-option radio group: "Mostly brief fees", "Mixed", "Primarily time-based"
    - Add descriptive text for each option
    - Style with judicial color palette
    - _Requirements: 2.1_


  
  - [x] 5.2 Integrate wizard into onboarding flow





    - Add wizard step to OnboardingChecklist
    - Save preference on selection


    - Configure dashboard based on selection
    - _Requirements: 2.1, 2.3_
  
  - [x] 5.3 Implement preference-based defaults





    - Set default billing model based on preference
    - Configure dashboard widget visibility
    - Apply to new matter creation
    - _Requirements: 2.2, 2.3, 2.6_

- [x] 6. Implement adaptive matter workbench UI





  - [x] 6.1 Create conditional rendering logic





    - Use `useBillingStrategy()` to determine UI elements
    - Hide time tracking widgets for brief-fee matters
    - Show fee milestones for brief-fee matters
    - _Requirements: 1.2, 3.1_
  
  - [x] 6.2 Build FeeMilestonesWidget component




    - Display milestones: "Brief accepted", "Opinion delivered", "Court appearance"
    - Add progress indicators
    - Allow milestone completion tracking
    - _Requirements: 1.3, 3.2_
  
  - [x] 6.3 Create collapsible advanced time tracking section


    - Build Collapsible component wrapper
    - Add "Track time for internal analysis" section
    - Mark time entries as "optional" and "internal use only"
    - Ensure time entries don't affect invoice by default
    - _Requirements: 3.3, 3.4, 3.5_
  

  - [x] 6.4 Update MatterWorkbenchPage with adaptive UI


    - Integrate conditional rendering based on billing model
    - Test all three billing models
    - Ensure smooth transitions
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3_

## Phase 2: Trust Account System (Week 2-3)

- [x] 7. Create trust account database schema
  - [x] 7.1 Design trust accounts table
    - Create `trust_accounts` table with advocate_id, bank_details, balance
    - Add unique constraint on advocate_id
    - Create indexes for performance
    - _Requirements: 4.1_
  
  - [x] 7.2 Design trust transactions table
    - Create `trust_transactions` table with type, amount, matter_id, timestamp
    - Add foreign keys to trust_accounts and matters
    - Create indexes on matter_id and timestamp
    - _Requirements: 4.2, 4.5_
  
  - [x] 7.3 Design trust transfers table
    - Create `trust_transfers` table linking trust and business accounts
    - Include audit trail fields
    - Add validation constraints
    - _Requirements: 4.5_
  
  - [x] 7.4 Create migration scripts
    - Write up migration for all trust account tables
    - Add default trust account for existing advocates
    - Test migration on staging database
    - _Requirements: 4.1_

- [x] 8. Implement trust account API services
  - [x] 8.1 Create trust account service
    - Implement `getTrustAccount(advocateId)`
    - Implement `updateTrustAccountDetails(advocateId, details)`
    - Add balance calculation logic
    - _Requirements: 4.1_
  
  - [x] 8.2 Create trust transaction service
    - Implement `recordTrustReceipt(transaction)`
    - Implement `getTrustTransactions(advocateId, filters)`
    - Add transaction validation (no negative balance)
    - _Requirements: 4.2, 4.7_
  
  - [x] 8.3 Create trust transfer service
    - Implement `transferToBusinessAccount(transfer)`
    - Create audit trail entry for each transfer
    - Update both trust and business balances atomically
    - _Requirements: 4.5_
  
  - [x] 8.4 Add trust account balance validation
    - Implement pre-transaction balance check
    - Throw `TrustAccountViolationError` if balance would go negative
    - Log all validation failures
    - _Requirements: 4.7_



- [x] 9. Build trust account dashboard UI
  - [x] 9.1 Create TrustAccountDashboard component
    - Display current balance with visual indicator (green if positive)
    - Show last transaction timestamp
    - List recent transactions with icons
    - Add action buttons: Record Receipt, Transfer, Reconcile
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 9.2 Create RecordTrustReceiptModal component
    - Build form: amount, matter selection, description
    - Generate receipt number automatically
    - Validate balance won't go negative
    - Show success confirmation with receipt number
    - _Requirements: 4.2, 4.4_
  
  - [x] 9.3 Create TransferToBusinessModal component
    - Build form: amount, matter selection, reason
    - Show current trust and business balances
    - Validate sufficient trust balance
    - Create audit trail entry
    - _Requirements: 4.5_
  
  - [x] 9.4 Create TrustAccountReconciliationReport component
    - Generate reconciliation report with all transactions
    - Show opening balance, transactions, closing balance
    - Export to PDF for LPC audits
    - _Requirements: 4.8_
  
  - [x] 9.5 Add trust account negative balance alert
    - Create prominent red alert banner
    - Display on all pages when balance is negative
    - Block trust account operations until resolved
    - Send email notification to advocate
    - _Requirements: 4.7_

- [x] 10. Integrate trust account into payment flow
  - [x] 10.1 Update RecordPaymentModal
    - Add account type selector: "Trust Account" or "Business Account"
    - Route payment to appropriate account
    - Update respective balance
    - _Requirements: 4.2_
  
  - [x] 10.2 Add trust account to financial reports
    - Show trust balance separately from business balance
    - Add trust transaction history to reports
    - Include trust transfers in audit trail
    - _Requirements: 4.6_
  
  - [x] 10.3 Create trust receipt PDF generator
    - Design trust receipt template with legal disclosures
    - Include LPC-required information
    - Generate PDF on receipt recording
    - Email to client automatically
    - _Requirements: 4.4_

## Phase 3: Invoice Numbering & Disbursements (Week 3-4)

- [x] 11. Implement flexible invoice numbering
  - [x] 11.1 Update invoice numbering schema
    - Add `invoice_numbering_mode` to advocate preferences
    - Add `invoice_number_audit_log` table
    - Create migration script
    - _Requirements: 5.1, 5.4_
  
  - [x] 11.2 Create invoice numbering service
    - Implement `getNextInvoiceNumber(advocateId, mode)`
    - Add strict sequential validation
    - Add flexible mode with gap logging
    - Implement year reset logic
    - _Requirements: 5.1, 5.2, 5.3, 5.7_
  
  - [x] 11.3 Create invoice number audit service
    - Implement `logInvoiceNumberAction(action, number, reason)`
    - Track: created, voided, gap-detected
    - Store user ID and timestamp
    - _Requirements: 5.4, 5.5_
  
  - [x] 11.4 Build InvoiceNumberingSettings component
    - Create mode selector: "Strict Sequential" vs "Flexible"
    - Show current sequence and next number
    - Add year reset preference
    - Display audit log
    - _Requirements: 5.1, 5.7_
  
  - [x] 11.5 Create InvoiceNumberingAuditLog component
    - Display all invoice numbering actions
    - Filter by action type
    - Show user, timestamp, reason
    - Export to CSV for SARS compliance
    - _Requirements: 5.4, 5.6_
  
  - [x] 11.6 Update invoice generation to use new numbering
    - Integrate numbering service into invoice creation
    - Handle voids with reason capture
    - Log all actions in audit trail
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 12. Implement smart disbursement VAT handling
  - [x] 12.1 Create disbursement VAT rules engine
    - Define VAT rules for common disbursement types
    - Implement `suggestVAT(disbursementType)` function
    - Allow custom rules for user-defined types
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 12.2 Update disbursement schema
    - Add `vat_suggested` boolean field
    - Add `disbursement_type_vat_rules` table for custom types
    - Create migration script
    - _Requirements: 6.1, 6.4_
  
  - [x] 12.3 Create SmartDisbursementForm component
    - Build form with type selector
    - Auto-suggest VAT based on type
    - Show info tooltip explaining suggestion
    - Allow easy override
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 12.4 Create DisbursementTypeManager component
    - Allow creating custom disbursement types
    - Set default VAT behavior for each type
    - Show usage statistics
    - _Requirements: 6.4_
  
  - [x] 12.5 Update invoice generation for VAT separation
    - Separate VAT-inclusive and VAT-exempt disbursements
    - Show clear breakdown on invoice
    - Calculate VAT correctly for SARS compliance
    - _Requirements: 6.6, 6.7_
  
  - [x] 12.6 Add VAT correction with audit trail
    - Allow changing VAT treatment after creation
    - Log correction in audit trail
    - Update invoice if already generated
    - _Requirements: 6.5_



## Phase 4: Workflow Streamlining (Week 4-5)

- [x] 13. Implement urgent matter quick capture
  - [x] 13.1 Create UrgentMatterQuickCapture component
    - Build 2-step wizard: Essential details, Optional documents
    - Add "URGENT" visual indicator
    - Pre-fill attorney from quick select
    - Auto-fill firm details
    - _Requirements: 7.1, 7.3_
  
  - [x] 13.2 Add urgent matter bypass logic
    - Skip pro forma approval step for urgent matters
    - Set matter status to "Active" immediately
    - Generate confirmation email to attorney
    - _Requirements: 7.2, 7.4_
  
  - [x] 13.3 Create urgent matter badge and filtering
    - Add orange "URGENT" badge to matter cards
    - Add "Urgent" filter to matters page
    - Sort urgent matters to top by default
    - _Requirements: 7.6_
  
  - [x] 13.4 Update invoice generation for urgent matters
    - Allow invoicing without prior quote approval
    - Include agreed fee from quick capture
    - Add note: "Urgent brief - fee agreed verbally"
    - _Requirements: 7.7_
  
  - [x] 13.5 Add late document attachment
    - Allow attaching documents to existing urgent matters
    - Update matter with formal brief details
    - Maintain original creation timestamp
    - _Requirements: 7.5_

- [x] 14. Implement simplified attorney connection
  - [x] 14.1 Create AttorneyQuickSelect component
    - Build two-mode selector: Quick Select vs Manual Entry
    - Show recurring attorneys with usage stats
    - Auto-fill firm details for recurring attorneys
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [x] 14.2 Add manual attorney entry without registration
    - Create form: name, email, firm, phone
    - Make portal invitation optional checkbox
    - Create attorney record without requiring registration
    - _Requirements: 8.1, 8.2_
  
  - [x] 14.3 Update invoice delivery for unregistered attorneys
    - Send invoice via email instead of portal notification
    - Include PDF attachment
    - Add "View in portal" link for future registration
    - _Requirements: 8.6_
  
  - [x] 14.4 Create attorney registration linking
    - Detect when unregistered attorney registers
    - Offer to link historical matters to account
    - Show confirmation of linked matters
    - _Requirements: 8.7_
  
  - [x] 14.5 Build recurring attorney management
    - Track attorney usage frequency
    - Show "Last worked with" timestamp
    - Display matter count per attorney
    - _Requirements: 8.3, 8.4_

- [x] 15. Implement scope amendment for brief fees
  - [x] 15.1 Create ScopeAmendmentModal component
    - Build form: original scope, expanded scope, additional fee, reason
    - Show original fee and calculate new total
    - Add attorney approval workflow
    - _Requirements: 9.1, 9.2_
  
  - [x] 15.2 Create scope amendment database schema
    - Add `scope_amendments` table
    - Include fields: matter_id, original_scope, expanded_scope, fees, status
    - Create migration script
    - _Requirements: 9.1_
  
  - [x] 15.3 Implement scope amendment API service
    - Create `submitScopeAmendment(amendment)`
    - Create `approveScopeAmendment(amendmentId)`
    - Create `declineScopeAmendment(amendmentId, reason)`
    - Update matter fee on approval
    - _Requirements: 9.2, 9.3, 9.4_
  
  - [x] 15.4 Add attorney notification for amendments
    - Send email with amendment details
    - Include approval/decline links
    - Add portal notification
    - _Requirements: 9.3_
  
  - [x] 15.5 Create scope amendment history view
    - Display all amendments for a matter
    - Show status, dates, amounts
    - Add audit trail
    - _Requirements: 9.6_
  
  - [x] 15.6 Update invoice generation for amendments
    - Itemize original fee and amendment fees separately
    - Show clear breakdown
    - Include amendment descriptions
    - _Requirements: 9.7_

- [x] 16. Redesign payment tracking UI with positive language
  - [x] 16.1 Update PaymentTrackingDashboard component
    - Replace "Overdue" with "Needs attention"
    - Show positive metrics: "85% collected this month"
    - Use neutral colors instead of red/orange warnings
    - Add "Collection opportunities" section
    - _Requirements: 10.1, 10.2, 10.3, 10.6_
  
  - [x] 16.2 Update invoice status badges
    - Change "OVERDUE" to "Follow-up suggested"
    - Use blue instead of red for pending payments
    - Add encouraging progress bars
    - _Requirements: 10.1, 10.7_
  
  - [x] 16.3 Create CollectionReport component
    - Move detailed aging to dedicated report
    - Show aging categories only when requested
    - Provide actionable insights
    - _Requirements: 10.5_
  
  - [x] 16.4 Update invoice filtering
    - Replace "Overdue" filter with "Needs attention"
    - Add "Payment pending" filter
    - Add "Follow-up suggested" filter
    - _Requirements: 10.4_
  
  - [x] 16.5 Add positive payment progress indicators
    - Show progress bars for partial payments
    - Display encouraging messages: "R5,000 of R10,000 received"
    - Celebrate full payments with checkmark
    - _Requirements: 10.7_



- [x] 17. Implement brief fee template system
  - [x] 17.1 Create brief fee template schema
    - Add `brief_fee_templates` table
    - Include fields: name, matter_type, base_fee, typical_disbursements
    - Add usage tracking fields
    - Create migration with default templates
    - _Requirements: 12.1, 12.2_
  
  - [x] 17.2 Create template API service
    - Implement `getTemplates(advocateId)`
    - Implement `createTemplate(template)`
    - Implement `updateTemplate(templateId, updates)`
    - Implement `deleteTemplate(templateId)`
    - Track usage statistics
    - _Requirements: 12.2, 12.7_
  
  - [x] 17.3 Build BriefFeeTemplateManager component
    - Display template cards with usage stats
    - Show: name, base fee, usage count, average fee
    - Add create/edit/delete actions
    - _Requirements: 12.1, 12.7_
  
  - [x] 17.4 Create TemplateEditor component
    - Build form: name, matter type, base fee
    - Add typical disbursements list
    - Set seniority multiplier
    - Preview calculated fee
    - _Requirements: 12.2_
  
  - [x] 17.5 Integrate templates into matter creation
    - Suggest templates based on matter type
    - Pre-fill fee and disbursements from template
    - Offer "Save as new template" option
    - _Requirements: 12.3, 12.5_
  
  - [x] 17.6 Optimize invoice generation with templates
    - One-click invoice from template
    - Pre-fill all fields
    - Target <60 second completion time
    - _Requirements: 12.6_
  
  - [x] 17.7 Add template usage analytics
    - Track: times used, average fee, total revenue
    - Show trends over time
    - Suggest template optimizations
    - _Requirements: 12.7_

## Phase 5: Mobile Optimization (Week 5-6)

- [x] 18. Create mobile quick actions menu





  - [x] 18.1 Build MobileQuickActionsMenu component


    - Create 3x2 grid of action buttons
    - Use large touch targets (minimum 48px)
    - Add icons and labels
    - Style for mobile viewport
    - _Requirements: 11.1, 11.2_
  
  - [x] 18.2 Implement quick action modals


    - Create mobile-optimized RecordPaymentModal
    - Create mobile-optimized LogDisbursementModal
    - Create mobile-optimized SendInvoiceModal
    - Simplify forms for mobile
    - _Requirements: 11.2_
  
  - [x] 18.3 Add swipe gestures for navigation


    - Implement swipe-to-go-back
    - Add swipe-to-refresh
    - Use touch-friendly animations
    - _Requirements: 11.4_
  


  - [x] 18.4 Create mobile matter card layout

    - Design card-based layout for matters
    - Add swipe actions: View, Edit, Invoice
    - Optimize for thumb reach
    - _Requirements: 11.4_

- [x] 19. Implement simplified mobile matter creation



  - [x] 19.1 Create MobileMatterCreationWizard component


    - Build 2-step wizard: Attorney + Fee, Optional Documents
    - Use large form inputs
    - Add voice-to-text support
    - _Requirements: 11.3_
  
  - [x] 19.2 Add voice input for descriptions


    - Integrate Web Speech API
    - Add microphone button to text fields
    - Show voice input indicator
    - Handle speech-to-text conversion
    - _Requirements: 11.6_
  
  - [x] 19.3 Optimize form inputs for mobile


    - Use appropriate input types (tel, email, number)
    - Add input masks for currency
    - Implement auto-complete
    - _Requirements: 11.3_

- [x] 20. Implement offline mode with sync



  - [x] 20.1 Create offline storage layer


    - Use IndexedDB for offline data
    - Store: matters, disbursements, time entries
    - Implement data encryption
    - _Requirements: 11.5_
  

  - [x] 20.2 Build sync queue system

    - Queue offline actions for sync
    - Implement conflict resolution
    - Show sync status indicator
    - Retry failed syncs
    - _Requirements: 11.5_
  
  - [x] 20.3 Add offline disbursement logging


    - Allow logging disbursements offline
    - Store in local queue
    - Sync when connection restored
    - Show "Pending sync" indicator
    - _Requirements: 11.5_
  

  - [x] 20.4 Create offline mode indicator

    - Show connection status in header
    - Display "Working offline" message
    - Show pending sync count
    - _Requirements: 11.5_

- [x] 21. Add mobile-specific features
  - [x] 21.1 Implement WhatsApp invoice sharing
    - Add "Share via WhatsApp" button
    - Generate shareable invoice link
    - Pre-fill WhatsApp message
    - Track shares in analytics
    - _Requirements: 11.7_
  
  - [x] 21.2 Add camera receipt capture
    - Integrate device camera
    - Capture receipt photos
    - Compress and upload images
    - Attach to disbursements
    - _Requirements: 11.5 (implied)_
  
  - [x] 21.3 Implement mobile notifications
    - Add push notification support
    - Notify: new requests, payments received, approvals needed
    - Allow notification preferences
    - _Requirements: 11.1 (implied)_
  
  - [x] 21.4 Optimize mobile performance
    - Implement lazy loading for lists
    - Use virtual scrolling
    - Compress images before upload
    - Minimize bundle size
    - _Requirements: 11.1_



## Phase 6: Testing & Refinement (Week 6-7)

- [ ] 22. Conduct unit testing
  - [ ]* 22.1 Test billing strategy logic
    - Test `BriefFeeStrategy` calculations
    - Test `TimeBasedStrategy` calculations
    - Test `QuickOpinionStrategy` calculations
    - Test strategy factory
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 22.2 Test VAT suggestion engine
    - Test all predefined disbursement types
    - Test custom type rules
    - Test override functionality
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 22.3 Test trust account calculations
    - Test balance calculations
    - Test negative balance prevention
    - Test transfer logic
    - Test reconciliation
    - _Requirements: 4.1, 4.2, 4.5, 4.7_
  
  - [ ]* 22.4 Test invoice numbering
    - Test strict sequential mode
    - Test flexible mode with gaps
    - Test year reset logic
    - Test void handling
    - _Requirements: 5.1, 5.2, 5.3, 5.7_
  
  - [ ]* 22.5 Test template calculations
    - Test fee calculations with multipliers
    - Test disbursement pre-filling
    - Test usage statistics
    - _Requirements: 12.2, 12.3, 12.7_

- [ ] 23. Conduct integration testing
  - [ ]* 23.1 Test matter creation workflows
    - Test brief fee matter creation
    - Test time-based matter creation
    - Test urgent matter quick capture
    - Test billing model changes
    - _Requirements: 1.1, 1.5, 7.1_
  
  - [ ]* 23.2 Test trust account workflows
    - Test receipt recording
    - Test transfer to business
    - Test reconciliation
    - Test negative balance prevention
    - _Requirements: 4.2, 4.5, 4.7, 4.8_
  
  - [ ]* 23.3 Test scope amendment workflow
    - Test amendment submission
    - Test attorney approval
    - Test attorney decline
    - Test fee updates
    - Test invoice generation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7_
  
  - [ ]* 23.4 Test invoice generation
    - Test with brief fee template
    - Test with scope amendments
    - Test with smart disbursements
    - Test numbering in both modes
    - _Requirements: 5.1, 6.6, 9.7, 12.6_
  
  - [ ]* 23.5 Test mobile offline sync
    - Test offline disbursement logging
    - Test sync queue
    - Test conflict resolution
    - Test connection restoration
    - _Requirements: 11.5_

- [ ] 24. Conduct compliance testing
  - [ ]* 24.1 Test SARS invoice numbering compliance
    - Verify strict sequential mode compliance
    - Verify flexible mode audit trail
    - Test void tracking
    - Generate SARS reports
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_
  
  - [ ]* 24.2 Test LPC trust account compliance
    - Verify negative balance prevention
    - Test receipt generation with disclosures
    - Verify audit trail completeness
    - Generate reconciliation reports
    - _Requirements: 4.4, 4.5, 4.7, 4.8_
  
  - [ ]* 24.3 Test VAT compliance
    - Verify VAT calculations
    - Test VAT-exempt disbursements
    - Generate VAT reports
    - Verify SARS compliance
    - _Requirements: 6.6, 6.7_

- [ ] 25. Conduct user acceptance testing
  - [ ] 25.1 Test brief fee advocate workflow
    - Create matter with brief fee model
    - Verify time tracking is hidden
    - Use fee milestones
    - Generate invoice from template
    - Target <60 second invoice generation
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 12.6_
  
  - [ ] 25.2 Test time-based advocate workflow
    - Create matter with time-based model
    - Verify time tracking is visible
    - Log time entries
    - Generate invoice with time breakdown
    - _Requirements: 1.2, 1.4_
  
  - [ ] 25.3 Test urgent matter workflow
    - Create urgent matter via quick capture
    - Verify pro forma skip
    - Generate invoice without prior approval
    - Attach documents later
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.7_
  
  - [ ] 25.4 Test trust account workflow
    - Record trust receipt
    - Transfer to business account
    - Generate reconciliation report
    - Verify negative balance prevention
    - _Requirements: 4.2, 4.4, 4.5, 4.7, 4.8_
  
  - [ ] 25.5 Test mobile workflow
    - Use quick actions menu
    - Create matter on mobile
    - Log disbursement offline
    - Verify sync when online
    - Share invoice via WhatsApp
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.7_
  
  - [ ] 25.6 Gather user feedback
    - Conduct user interviews
    - Collect satisfaction ratings
    - Identify pain points
    - Document enhancement requests
    - _Requirements: All_

- [ ] 26. Performance optimization
  - [ ] 26.1 Optimize billing strategy caching
    - Implement strategy instance caching
    - Measure performance improvement
    - Target <50ms strategy resolution
    - _Requirements: 1.1_
  
  - [ ] 26.2 Optimize template suggestions
    - Pre-compute template matches
    - Index by matter type
    - Target <100ms suggestion time
    - _Requirements: 12.3_
  
  - [ ] 26.3 Optimize trust account balance calculation
    - Implement incremental balance updates
    - Cache current balance
    - Target <200ms balance retrieval
    - _Requirements: 4.1_
  
  - [ ] 26.4 Optimize mobile sync
    - Implement delta sync (not full sync)
    - Compress sync payloads
    - Target <5 second sync time
    - _Requirements: 11.5_
  
  - [ ] 26.5 Optimize invoice generation
    - Pre-load template data
    - Optimize PDF generation
    - Target <2 second invoice creation
    - _Requirements: 12.6_



## Phase 7: Documentation & Deployment (Week 7)

- [ ] 27. Create user documentation
  - [ ] 27.1 Write billing model selection guide
    - Explain each billing model
    - Provide decision flowchart
    - Include screenshots
    - Add FAQ section
    - _Requirements: 1.1, 2.1_
  
  - [ ] 27.2 Write trust account management guide
    - Explain LPC compliance requirements
    - Document receipt recording process
    - Document transfer process
    - Include reconciliation instructions
    - _Requirements: 4.1, 4.2, 4.5, 4.8_
  
  - [ ] 27.3 Write invoice numbering guide
    - Explain strict vs flexible modes
    - Document SARS compliance
    - Provide mode selection guidance
    - Include audit trail examples
    - _Requirements: 5.1, 5.4_
  
  - [ ] 27.4 Write mobile quick actions guide
    - Document all quick actions
    - Explain offline mode
    - Provide sync troubleshooting
    - Include WhatsApp sharing instructions
    - _Requirements: 11.1, 11.2, 11.5, 11.7_
  
  - [ ] 27.5 Write template system guide
    - Explain template creation
    - Document template usage
    - Provide best practices
    - Include optimization tips
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 28. Create developer documentation
  - [ ] 28.1 Document billing strategy pattern
    - Explain architecture
    - Provide implementation examples
    - Document extension points
    - Include API reference
    - _Requirements: 1.1_
  
  - [ ] 28.2 Document trust account API
    - Document all endpoints
    - Provide request/response examples
    - Explain validation rules
    - Include error handling
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [ ] 28.3 Document mobile sync architecture
    - Explain offline storage
    - Document sync queue
    - Provide conflict resolution guide
    - Include troubleshooting
    - _Requirements: 11.5_
  
  - [ ] 28.4 Create API migration guide
    - Document breaking changes
    - Provide migration scripts
    - Include version compatibility matrix
    - _Requirements: All_

- [ ] 29. Prepare deployment
  - [ ] 29.1 Create feature flags
    - Implement flags for all major features
    - Create flag management UI
    - Document flag usage
    - _Requirements: All_
  
  - [ ] 29.2 Plan gradual rollout
    - Define rollout phases
    - Identify pilot users
    - Create rollback plan
    - Set success criteria
    - _Requirements: All_
  
  - [ ] 29.3 Setup monitoring and alerts
    - Add analytics tracking for all features
    - Setup error monitoring
    - Create performance dashboards
    - Configure alerts for critical issues
    - _Requirements: All_
  
  - [ ] 29.4 Prepare migration scripts
    - Create data migration for existing matters
    - Create trust account initialization
    - Create template seeding
    - Test on staging environment
    - _Requirements: All_

- [ ] 30. Execute migration and rollout
  - [ ] 30.1 Migrate existing data
    - Run matter billing model migration
    - Initialize trust accounts
    - Seed default templates
    - Verify data integrity
    - _Requirements: All_
  
  - [ ] 30.2 Deploy to pilot users
    - Enable features for pilot group
    - Monitor usage and errors
    - Gather feedback
    - Make adjustments
    - _Requirements: All_
  
  - [ ] 30.3 Gradual rollout to all users
    - Enable features in phases
    - Monitor performance and errors
    - Provide support
    - Document issues and resolutions
    - _Requirements: All_
  
  - [ ] 30.4 Post-deployment verification
    - Verify all features working
    - Check compliance reports
    - Validate performance metrics
    - Confirm user satisfaction
    - _Requirements: All_

## Success Criteria

Each task must meet the following before being marked complete:
- [ ] Functionality works as specified in requirements
- [ ] Code follows project patterns and standards
- [ ] Unit tests written and passing (for non-optional test tasks)
- [ ] Integration tests passing (for non-optional test tasks)
- [ ] Component is documented
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Performance benchmarks met
- [ ] Compliance requirements verified (SARS, LPC)

## Notes

- Tasks marked with * are optional testing tasks that can be skipped for MVP but are recommended for production
- Focus on Phase 1-2 first (billing models and trust accounts) as they are foundational
- Mobile optimization (Phase 5) can be done in parallel with Phase 4
- Testing (Phase 6) should be ongoing throughout implementation, not just at the end
- Trust account features are critical for Legal Practice Council compliance - cannot be skipped
- Invoice numbering flexibility is important but can use strict mode initially if needed
- Template system provides significant time savings - prioritize for user satisfaction

## Dependencies

- Phase 2 (Trust Accounts) depends on Phase 1 (Billing Models) for matter schema updates
- Phase 3 (Invoice Numbering) can be done in parallel with Phase 2
- Phase 4 (Workflow Streamlining) depends on Phase 1 and Phase 3
- Phase 5 (Mobile) can start after Phase 1 is complete
- Phase 6 (Testing) should be ongoing throughout all phases
- Phase 7 (Documentation) should be done incrementally with each phase

## Estimated Timeline

- Phase 1: 2 weeks (10 business days)
- Phase 2: 1.5 weeks (7-8 business days)
- Phase 3: 1.5 weeks (7-8 business days)
- Phase 4: 1.5 weeks (7-8 business days)
- Phase 5: 1.5 weeks (7-8 business days)
- Phase 6: 1 week (5 business days, ongoing)
- Phase 7: 1 week (5 business days)

**Total: 7-8 weeks for complete implementation**

## Risk Mitigation

- **Trust account compliance risk**: Engage legal expert to review implementation
- **Data migration risk**: Test thoroughly on staging, have rollback plan
- **User adoption risk**: Provide comprehensive onboarding and documentation
- **Performance risk**: Monitor closely, optimize proactively
- **Mobile sync risk**: Implement robust conflict resolution and error handling
