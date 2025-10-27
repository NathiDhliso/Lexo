# Implementation Plan

- [-] 1. Set up consolidation infrastructure and safety mechanisms

  - Create archive directories for backup storage
  - Implement validation scripts for migration and service testing
  - Set up rollback procedures and documentation
  - _Requirements: 5.1, 5.4_

- [ ] 2. Phase 1: Database Migration Consolidation (High Priority)
- [ ] 2.1 Archive duplicate billing preferences migrations
  - Move `20250127000022_create_advocate_billing_preferences.sql` to archive folder
  - Move `20250128000000_advocate_billing_preferences.sql` to archive folder
  - Keep `20251027153935_create_advocate_billing_preferences_fix.sql` as authoritative version
  - _Requirements: 1.1, 1.3, 1.5_

- [ ] 2.2 Archive duplicate invoice numbering migrations
  - Identify and archive `20250127000002_invoice_numbering_system.sql`
  - Archive `20250127000002_add_invoice_numbering_and_disbursement_vat.sql`
  - Keep `20250127000010_enhanced_invoice_numbering.sql` as consolidated version
  - _Requirements: 1.2, 1.3, 1.5_

- [ ] 2.3 Validate consolidated migrations
  - Run schema comparison tests between original and consolidated migrations
  - Verify no data loss or corruption in test environment
  - Document migration consolidation changes
  - _Requirements: 1.4, 1.5, 5.1_

- [ ] 3. Phase 2: Service Layer Unification (Medium Priority)
- [ ] 3.1 Create service compatibility layer
  - Implement ExpensesService as proxy class that delegates to DisbursementService
  - Map all ExpensesService methods to equivalent DisbursementService methods
  - Add deprecation warnings to ExpensesService methods
  - _Requirements: 2.2, 2.4, 5.2_

- [ ] 3.2 Update service imports and references
  - Find all imports of ExpensesService in the codebase
  - Update imports to use DisbursementService where appropriate
  - Update method calls to use unified DisbursementService interface
  - _Requirements: 2.1, 2.3, 6.2_

- [ ] 3.3 Integrate VAT service with unified disbursement service
  - Add VAT calculation integration points in DisbursementService
  - Ensure DisbursementVATService remains specialized for VAT operations
  - Update service documentation and type definitions
  - _Requirements: 2.2, 2.5, 6.1_

- [ ]* 3.4 Write integration tests for unified services
  - Create tests to verify ExpensesService compatibility layer works correctly
  - Test that DisbursementService produces same results as original ExpensesService
  - Validate VAT integration works properly
  - _Requirements: 2.4, 2.5, 5.1_

- [ ] 4. Phase 3: Documentation Consolidation (Low Priority)
- [ ] 4.1 Create consolidated project status document
  - Merge information from FEATURE_AUDIT_REPORT.md, TECHNICAL_DEBT_AUDIT.md, and WORKFLOW_AUDIT_REPORT.md
  - Create single PROJECT_STATUS.md with current implementation state
  - Archive original fragmented audit reports
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 4.2 Create accurate feature inventory
  - Remove duplicate features from the 352 feature list
  - Correct attorney portal status to reflect actual implementation
  - Create FEATURE_INVENTORY.md with accurate count (~285 features)
  - _Requirements: 4.1, 4.2, 4.4, 7.1, 7.2_

- [ ] 4.3 Consolidate phase implementation documentation
  - Merge overlapping phase completion files into chronological IMPLEMENTATION_HISTORY.md
  - Archive redundant phase summary files
  - Update internal documentation references
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 5. Phase 4: Feature List Accuracy and Final Cleanup
- [ ] 5.1 Correct feature categorization and counting
  - Remove billing model features counted multiple times across categories
  - Consolidate mobile features that are just responsive versions
  - Remove database features counted in multiple sections
  - _Requirements: 4.2, 4.3, 4.5_

- [ ] 5.2 Update attorney portal documentation accuracy
  - Correct audit reports that incorrectly marked attorney portal as incomplete
  - Document all 6 attorney portal pages as functional
  - Update feature completion percentages
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 5.3 Remove obsolete and unused code
  - Identify and safely remove unused service methods
  - Clean up obsolete migration files after consolidation
  - Remove redundant documentation files after consolidation
  - _Requirements: 6.3, 6.4, 6.6_

- [ ] 6. Validation and Quality Assurance
- [ ] 6.1 Run comprehensive system validation
  - Execute all existing tests to ensure no functionality broken
  - Validate database schema integrity after migration consolidation
  - Test service layer functionality with unified services
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6.2 Performance and maintainability verification
  - Measure code duplication reduction (target: 80% reduction)
  - Verify system performance maintained or improved
  - Validate improved code maintainability metrics
  - _Requirements: 6.5, 6.6_

- [ ] 6.3 Update project documentation and references
  - Update README and project documentation with new structure
  - Fix any broken internal links after consolidation
  - Update development guidelines to reflect consolidated architecture
  - _Requirements: 3.5, 6.1_

- [ ] 7. Deployment and Rollback Preparation
- [ ] 7.1 Prepare production deployment checklist
  - Document step-by-step deployment procedure for consolidated changes
  - Create rollback scripts for each consolidation phase
  - Prepare monitoring and validation procedures for production
  - _Requirements: 5.4, 5.5_

- [ ] 7.2 Create maintenance documentation
  - Document new consolidated architecture for future developers
  - Create guidelines for preventing future duplication
  - Update coding standards and review processes
  - _Requirements: 6.1, 6.2, 6.6_