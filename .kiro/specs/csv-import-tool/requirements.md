# Requirements Document: CSV Import Tool

## Introduction

One of the biggest barriers to adoption for established advocates is the manual effort required to set up LexoHub with their existing contacts. Advocates typically have dozens or hundreds of clients, instructing attorneys, and law firms in spreadsheets or other systems. Manually entering each contact is time-consuming and frustrating, often causing advocates to abandon the onboarding process.

The CSV Import Tool solves this by allowing advocates to import their existing contact lists (clients and instructing attorneys/firms) via simple CSV file uploads. This dramatically reduces setup time from hours to minutes, making it far more likely that established advocates will complete onboarding and actively use the platform.

### Scope

**In Scope for MVP**:
- Import clients (individuals and organizations)
- Import instructing attorneys and their firms
- CSV file validation and error reporting
- Duplicate detection and handling
- Preview before import
- Import history and rollback

**Out of Scope for MVP**:
- Import active matters (future phase)
- Import time entries or invoices
- Import from other formats (Excel, JSON, etc.)
- Automated data mapping/AI suggestions
- Integration with external CRM systems

## Requirements

### Requirement 1: CSV File Upload and Validation

**User Story:** As a solo advocate setting up LexoHub, I want to upload a CSV file containing my client list, so that I can quickly populate my system without manual data entry.

#### Acceptance Criteria

1. WHEN accessing the import tool THEN the system SHALL provide separate upload options for "Import Clients" and "Import Attorneys"
2. WHEN uploading a CSV file THEN the system SHALL validate the file format (must be .csv)
3. WHEN uploading a CSV file THEN the system SHALL validate file size (maximum 5MB)
4. WHEN uploading a CSV file THEN the system SHALL parse the CSV and detect column headers
5. WHEN CSV parsing fails THEN the system SHALL display a clear error message explaining the issue
6. WHEN CSV has no headers THEN the system SHALL prompt the user to confirm if first row is data or headers
7. WHEN CSV is successfully parsed THEN the system SHALL display a preview of the first 5 rows

### Requirement 2: Column Mapping for Clients

**User Story:** As a solo advocate with a client spreadsheet, I want to map my CSV columns to LexoHub fields, so that my data is imported into the correct fields even if my column names don't match exactly.

#### Acceptance Criteria

1. WHEN viewing the import preview THEN the system SHALL display a column mapping interface
2. WHEN displaying column mapping THEN the system SHALL show required fields: Client Name, Email (optional but recommended), Phone (optional)
3. WHEN displaying column mapping THEN the system SHALL show optional fields: Address, Client Type, Notes
4. WHEN the system detects common column names THEN the system SHALL auto-map columns (e.g., "Name" → "Client Name", "Email Address" → "Email")
5. WHEN a required field is not mapped THEN the system SHALL display a warning and prevent import
6. WHEN the user manually maps columns THEN the system SHALL save the mapping for future imports
7. WHEN multiple CSV columns could map to one field THEN the system SHALL allow the user to choose or combine them

### Requirement 3: Column Mapping for Attorneys

**User Story:** As a solo advocate with an attorney contact list, I want to map my CSV columns to LexoHub attorney fields, so that I can import my professional network efficiently.

#### Acceptance Criteria

1. WHEN importing attorneys THEN the system SHALL display required fields: Attorney Name, Firm Name, Email (optional but recommended)
2. WHEN importing attorneys THEN the system SHALL display optional fields: Phone, Practice Number, Notes
3. WHEN the system detects common attorney column names THEN the system SHALL auto-map appropriately
4. WHEN a firm name is provided THEN the system SHALL group attorneys by firm for better organization
5. WHEN the same firm name appears multiple times THEN the system SHALL recognize it as the same firm
6. WHEN attorney email is provided THEN the system SHALL validate email format
7. WHEN practice number is provided THEN the system SHALL validate format (if applicable)

### Requirement 4: Data Validation and Error Detection

**User Story:** As a solo advocate importing contacts, I want the system to validate my data and identify errors before importing, so that I can fix issues and ensure data quality.

#### Acceptance Criteria

1. WHEN validating import data THEN the system SHALL check for required fields in each row
2. WHEN validating import data THEN the system SHALL check email format for all email addresses
3. WHEN validating import data THEN the system SHALL check phone number format (allow various formats)
4. WHEN validation errors are found THEN the system SHALL display an error summary with row numbers
5. WHEN validation errors are found THEN the system SHALL allow the user to: Fix in CSV and re-upload, Skip invalid rows, or Cancel import
6. WHEN displaying errors THEN the system SHALL show: Row number, Field name, Error type, Current value
7. WHEN the user chooses to skip invalid rows THEN the system SHALL import only valid rows and report skipped count

### Requirement 5: Duplicate Detection and Handling

**User Story:** As a solo advocate importing contacts, I want the system to detect duplicates and let me decide how to handle them, so that I don't create duplicate records in my system.

#### Acceptance Criteria

1. WHEN importing clients THEN the system SHALL check for duplicates based on: Email (if provided) or Name + Phone combination
2. WHEN importing attorneys THEN the system SHALL check for duplicates based on: Email (if provided) or Name + Firm combination
3. WHEN duplicates are detected THEN the system SHALL display a duplicate resolution interface
4. WHEN displaying duplicates THEN the system SHALL show: Existing record details, New record details, Similarity score
5. WHEN resolving duplicates THEN the system SHALL provide options: Skip (keep existing), Update (merge new data), Create anyway (allow duplicate)
6. WHEN the user chooses "Update" THEN the system SHALL merge non-empty fields from CSV into existing record
7. WHEN the user chooses "Create anyway" THEN the system SHALL create a new record and flag it as potential duplicate

### Requirement 6: Import Preview and Confirmation

**User Story:** As a solo advocate about to import contacts, I want to preview exactly what will be imported before committing, so that I can verify the data looks correct and avoid mistakes.

#### Acceptance Criteria

1. WHEN data validation is complete THEN the system SHALL display an import summary
2. WHEN displaying import summary THEN the system SHALL show: Total rows in CSV, Valid rows to import, Invalid rows to skip, Duplicates detected, New records to create, Existing records to update
3. WHEN displaying import summary THEN the system SHALL show a preview table of the first 10 records to be imported
4. WHEN viewing preview THEN the system SHALL allow the user to: Proceed with import, Go back to adjust mappings, Cancel import
5. WHEN the user proceeds with import THEN the system SHALL display a confirmation dialog with final counts
6. WHEN the user confirms THEN the system SHALL begin the import process
7. WHEN import is in progress THEN the system SHALL display a progress indicator with percentage complete

### Requirement 7: Import Execution and Progress

**User Story:** As a solo advocate importing a large contact list, I want to see real-time progress of the import, so that I know the system is working and can estimate completion time.

#### Acceptance Criteria

1. WHEN import begins THEN the system SHALL process records in batches (50 records per batch)
2. WHEN processing batches THEN the system SHALL update progress indicator after each batch
3. WHEN import is in progress THEN the system SHALL display: Records processed, Records remaining, Estimated time remaining, Current operation (e.g., "Creating clients...")
4. WHEN an error occurs during import THEN the system SHALL log the error and continue with remaining records
5. WHEN import completes THEN the system SHALL display a success summary
6. WHEN displaying success summary THEN the system SHALL show: Total records imported, Records skipped, Records updated, Errors encountered (if any)
7. WHEN import completes THEN the system SHALL provide a link to view the imported records

### Requirement 8: Import History and Audit Trail

**User Story:** As a solo advocate who has imported contacts, I want to view a history of my imports, so that I can track what was imported when and troubleshoot any issues.

#### Acceptance Criteria

1. WHEN accessing the import tool THEN the system SHALL display an "Import History" section
2. WHEN viewing import history THEN the system SHALL show: Import date/time, Import type (Clients/Attorneys), File name, Records imported, Status (Success/Partial/Failed)
3. WHEN clicking on an import history entry THEN the system SHALL display detailed import results
4. WHEN viewing import details THEN the system SHALL show: Full summary, List of imported records with links, List of skipped records with reasons, List of errors (if any)
5. WHEN viewing import details THEN the system SHALL provide an "Export Report" button to download import log as CSV
6. WHEN viewing import history THEN the system SHALL allow filtering by: Date range, Import type, Status
7. WHEN viewing import history THEN the system SHALL paginate results (20 imports per page)

### Requirement 9: Rollback and Undo

**User Story:** As a solo advocate who made a mistake during import, I want to undo/rollback an import, so that I can remove incorrectly imported records and try again.

#### Acceptance Criteria

1. WHEN viewing import history THEN the system SHALL provide a "Rollback" button for recent imports (within 24 hours)
2. WHEN clicking "Rollback" THEN the system SHALL display a confirmation dialog warning about data deletion
3. WHEN confirming rollback THEN the system SHALL delete all records created by that import
4. WHEN confirming rollback THEN the system SHALL restore any records that were updated to their previous state
5. WHEN rollback is in progress THEN the system SHALL display a progress indicator
6. WHEN rollback completes THEN the system SHALL display a success message with count of records removed/restored
7. IF records from the import have been modified since import THEN the system SHALL warn the user and ask for confirmation before proceeding

### Requirement 10: CSV Template Download

**User Story:** As a solo advocate preparing to import contacts, I want to download a CSV template with the correct column headers, so that I can format my data correctly before importing.

#### Acceptance Criteria

1. WHEN accessing the import tool THEN the system SHALL provide "Download Template" buttons for both Clients and Attorneys
2. WHEN clicking "Download Template" THEN the system SHALL generate and download a CSV file with proper headers
3. WHEN downloading client template THEN the CSV SHALL include columns: Client Name*, Email, Phone, Address, Client Type, Notes (* = required)
4. WHEN downloading attorney template THEN the CSV SHALL include columns: Attorney Name*, Firm Name*, Email, Phone, Practice Number, Notes (* = required)
5. WHEN downloading template THEN the CSV SHALL include a sample row with example data
6. WHEN downloading template THEN the CSV SHALL include comments/notes explaining each field (if CSV format supports)
7. WHEN template is downloaded THEN the system SHALL display a tooltip with quick tips for filling out the template

### Requirement 11: Error Recovery and Partial Imports

**User Story:** As a solo advocate whose import partially failed, I want to understand what went wrong and easily re-import only the failed records, so that I don't have to start over completely.

#### Acceptance Criteria

1. WHEN an import completes with errors THEN the system SHALL generate an "Errors Report" CSV
2. WHEN viewing errors report THEN the CSV SHALL include: Original row data, Error message, Row number from original file
3. WHEN errors report is available THEN the system SHALL provide a "Download Errors" button
4. WHEN the user downloads errors report THEN the system SHALL suggest: "Fix the errors in this file and re-import"
5. WHEN re-importing a fixed errors file THEN the system SHALL process it like a new import
6. WHEN import has partial success THEN the system SHALL clearly communicate: What succeeded, What failed, Next steps
7. WHEN import fails completely THEN the system SHALL provide troubleshooting tips and support contact

### Requirement 12: Mobile and Accessibility

**User Story:** As a solo advocate working from various devices, I want to access the import tool from my tablet or phone if needed, so that I can set up my system from anywhere.

#### Acceptance Criteria

1. WHEN accessing import tool on mobile THEN the system SHALL display a responsive layout
2. WHEN uploading CSV on mobile THEN the system SHALL use native file picker
3. WHEN viewing import preview on mobile THEN the system SHALL use horizontal scroll for wide tables
4. WHEN mapping columns on mobile THEN the system SHALL use touch-friendly dropdowns
5. WHEN import is in progress on mobile THEN the system SHALL prevent screen sleep/timeout
6. WHEN using screen reader THEN all import steps SHALL be announced clearly
7. WHEN using keyboard only THEN all import functions SHALL be accessible via keyboard navigation

## Success Metrics

- **Adoption Rate**: 80%+ of new advocates use CSV import during onboarding
- **Time Savings**: 90%+ reduction in contact setup time (from hours to minutes)
- **Data Quality**: 95%+ of imported records are valid and usable
- **Completion Rate**: 85%+ of started imports complete successfully
- **User Satisfaction**: 90%+ rate import tool as "easy to use" or "very easy to use"
- **Support Reduction**: 60%+ reduction in onboarding support tickets

## Out of Scope (Future Considerations)

- Import active matters with full details
- Import historical time entries and invoices
- Import from Excel (.xlsx) files directly
- Import from other legal practice management systems
- Automated data cleaning and normalization using AI
- Real-time sync with external CRM systems
- Import scheduling and automation
- Advanced duplicate matching algorithms
- Bulk update existing records via CSV
- Export and re-import for bulk editing
