# Requirements Document

## Introduction

This feature represents a comprehensive architectural refactoring of the LexoHub billing pipeline. The current system has accumulated significant technical debt through contradictory features, obsolete concepts, and fragmented workflows. This refactoring will establish a clean, attorney-first model with a unified logging system that flows seamlessly from Pro Forma estimates through WIP tracking to final invoicing.

The refactoring addresses three critical problems:
1. **Technical Debt**: Multiple obsolete features and components that create confusion and maintenance burden
2. **Fragmented Workflow**: Disconnected systems for logging services, time, and expenses across the pipeline
3. **Data Integrity Issues**: Violations of the "atomic rule" where invoices incorrectly reference estimates instead of actual logged work

## Requirements

### Requirement 1: Technical Debt Removal

**User Story:** As a developer, I want all obsolete code removed from the codebase, so that I can work with a clean foundation and avoid confusion about which components are active.

#### Acceptance Criteria

1. WHEN the refactoring begins THEN the system SHALL delete all files related to the contradictory "Automatic Population" feature including aws-document-processing.service.ts, document-intelligence.service.ts, and the entire document-processing component folder
2. WHEN the refactoring begins THEN the system SHALL delete all files related to the obsolete "Briefs" concept including brief-api.service.ts and BriefsList.tsx
3. WHEN the refactoring begins THEN the system SHALL delete all obsolete Pro Forma creation UI components including AttorneyServiceSelector.tsx, SmartServiceSelector.tsx, CreateProFormaModal.tsx, and NewProFormaModal.tsx
4. WHEN the refactoring begins THEN the system SHALL delete the entire obsolete attorney portal including src/pages/attorney/ and src/components/attorney-portal/ folders
5. WHEN the refactoring begins THEN the system SHALL delete obsolete type definitions including attorney.types.ts, forms/README.md, and document-types.css
6. WHEN all deletions are complete THEN the system SHALL have no references to deleted components in the remaining codebase

### Requirement 2: Attorney-First Firm Management

**User Story:** As a law firm administrator, I want to manage instructing firms as first-class entities, so that I can properly track which firms are instructing matters and maintain accurate client relationships.

#### Acceptance Criteria

1. WHEN I navigate to the firms page THEN the system SHALL display a list of all instructing firms with search and filter capabilities
2. WHEN I view a firm card THEN the system SHALL display firm details adapted from the matter card pattern
3. WHEN I create or update a firm THEN the system SHALL use the existing attorney.service.ts for all data operations
4. WHEN I create a new matter THEN the system SHALL require me to select an instructing firm from a dropdown
5. WHEN I create a new matter THEN the system SHALL NOT display the obsolete "Attorney Information" step or "Automatic Population" features
6. IF a matter is created THEN the system SHALL store a firm_id foreign key relationship
7. WHEN the database schema is updated THEN the system SHALL include a firms table and firm_id column on the matters table

### Requirement 3: Cloud-Based Document Linking

**User Story:** As a matter manager, I want to link documents from cloud storage providers, so that I can associate existing files with matters without redundant uploads.

#### Acceptance Criteria

1. WHEN I view the Documents tab for a matter THEN the system SHALL display a "Link from Cloud" button
2. WHEN I click "Link from Cloud" THEN the system SHALL use the existing useCloudStorage hook and cloud-storage.service.ts
3. WHEN I link a document THEN the system SHALL NOT use the deleted FileUpload.tsx component
4. WHEN documents are linked THEN the system SHALL maintain references to cloud storage locations

### Requirement 4: Universal Logging Backend

**User Story:** As a system architect, I want a unified backend structure for logging services, time, and expenses, so that all billable work follows consistent patterns and can be easily aggregated.

#### Acceptance Criteria

1. WHEN the database is updated THEN the system SHALL include a logged_services table
2. WHEN the logged-services.service.ts is created THEN the system SHALL follow the same API pattern as time-entries.service.ts
3. WHEN the logged-services.service.ts is created THEN the system SHALL provide createService, getServicesByMatter, updateService, and deleteService functions
4. WHEN proforma-request.service.ts is refactored THEN the system SHALL use logged-services.service.ts, time-entries.service.ts, and expenses.service.ts
5. WHEN the LoggedService type is defined THEN the system SHALL be added to financial.types.ts
6. WHEN the schema documentation is updated THEN the system SHALL reflect the logged_services table structure

### Requirement 5: Universal Logging Frontend

**User Story:** As a legal professional, I want consistent modal interfaces for logging services, time, and expenses, so that I can quickly record billable work with a familiar interface regardless of the work type.

#### Acceptance Criteria

1. WHEN LogServiceModal.tsx is created THEN the system SHALL be adapted from TimeEntryModal.tsx
2. WHEN LogServiceModal.tsx is created THEN the system SHALL reuse all modal structure, form handling, and save/cancel logic from TimeEntryModal.tsx
3. WHEN I use LogServiceModal THEN the system SHALL integrate with RateCardSelector.tsx for auto-filling estimates
4. WHEN I use LogServiceModal THEN the system SHALL save data using logged-services.service.ts
5. WHEN the universal toolset is complete THEN the system SHALL consist of three modals: TimeEntryModal.tsx, QuickDisbursementModal.tsx, and LogServiceModal.tsx

### Requirement 6: Pro Forma Estimate Integration

**User Story:** As a legal professional creating a Pro Forma estimate, I want to add services, time, and expenses using consistent modal interfaces, so that I can build comprehensive estimates efficiently.

#### Acceptance Criteria

1. WHEN I view the Pro Forma request page THEN the system SHALL display three buttons: "Add Service," "Add Time," and "Add Expense"
2. WHEN I click "Add Service" THEN the system SHALL open LogServiceModal.tsx
3. WHEN I click "Add Time" THEN the system SHALL open TimeEntryModal.tsx
4. WHEN I click "Add Expense" THEN the system SHALL open QuickDisbursementModal.tsx
5. WHEN proforma-pdf.service.ts is refactored THEN the system SHALL correctly fetch and render items from logged_services, time_entries, and expenses tables
6. WHEN the Pro Forma approval flow is updated THEN the system SHALL maintain the existing PartnerApprovalPage.tsx and ProFormaSubmissionPage.tsx

### Requirement 7: Matter WIP Tracking Integration

**User Story:** As a legal professional tracking work in progress, I want to log actual services, time, and expenses against matters using the same modal interfaces, so that I can maintain accurate records of work performed.

#### Acceptance Criteria

1. WHEN I view MatterDetailsInvoicing.tsx THEN the system SHALL display a tabbed interface with "Services," "Time," and "Expenses" tabs
2. WHEN I am in the Services tab THEN the system SHALL display a "Log Service" button that opens LogServiceModal.tsx
3. WHEN I am in the Time tab THEN the system SHALL display a "Log Time" button that opens TimeEntryModal.tsx and show TimeEntryList.tsx
4. WHEN I am in the Expenses tab THEN the system SHALL display a "Log Expense" button that opens QuickDisbursementModal.tsx
5. WHEN ProFormaChecklist.tsx is created THEN the system SHALL use standard UI components from src/components/ui/
6. WHEN ProFormaChecklist.tsx is integrated THEN the system SHALL display in the refactored MatterDetailsInvoicing.tsx
7. WHEN matter-conversion.service.ts is refactored THEN the system SHALL correctly convert Pro Forma structure (services, time, expenses) into checklist data
8. WHEN ConvertProFormaModal.tsx is refactored THEN the system SHALL use the updated matter-conversion.service.ts

### Requirement 8: Invoice Generation with Atomic Rule

**User Story:** As a legal professional generating invoices, I want invoices to reflect only the actual work logged (not the original estimates), so that clients are billed accurately for work performed.

#### Acceptance Criteria

1. WHEN WIPAccumulator.tsx is refactored THEN the system SHALL correctly sum totals from logged_services, time_entries, and expenses
2. WHEN WIPAccumulator.tsx calculates totals THEN the system SHALL correctly use the servicesTotal state
3. WHEN MatterInvoicePanel.tsx "Generate Invoice" is clicked THEN the system SHALL only read the final total from WIPAccumulator.tsx
4. WHEN GenerateInvoiceModal.tsx is refactored THEN the system SHALL NOT fetch data from the original Pro Forma estimate
5. WHEN UnifiedInvoiceWizard.tsx is refactored THEN the system SHALL NOT fetch data from the original Pro Forma estimate
6. WHEN invoice-pdf.service.ts is refactored THEN the system SHALL only accept and render data from actual logged WIP totals
7. WHEN invoice-pdf.service.ts generates an invoice THEN the system SHALL NOT re-fetch Pro Forma estimate data

### Requirement 9: Data Consistency and Validation

**User Story:** As a system administrator, I want all data relationships properly validated and enforced, so that the system maintains referential integrity throughout the refactored pipeline.

#### Acceptance Criteria

1. WHEN a matter is created without a firm_id THEN the system SHALL reject the creation with a validation error
2. WHEN logged services, time, or expenses are created THEN the system SHALL validate that the referenced matter exists
3. WHEN an invoice is generated THEN the system SHALL validate that WIP items exist for the matter
4. WHEN Pro Forma items are converted to WIP THEN the system SHALL maintain traceability between estimate and actual

### Requirement 10: Migration and Backward Compatibility

**User Story:** As a system administrator, I want existing data to be properly migrated to the new structure, so that no historical information is lost during the refactoring.

#### Acceptance Criteria

1. WHEN the database migration runs THEN the system SHALL create the firms table without data loss
2. WHEN the database migration runs THEN the system SHALL add firm_id to existing matters with appropriate defaults or null values
3. WHEN the database migration runs THEN the system SHALL create the logged_services table
4. WHEN existing Pro Forma data is accessed THEN the system SHALL handle both old and new data structures gracefully
5. IF legacy data structures are encountered THEN the system SHALL log warnings but continue to function
