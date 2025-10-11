# CSV Import Tool Feature Spec

## Overview

The CSV Import Tool removes the biggest barrier to adoption for established advocates: the manual effort of setting up LexoHub with existing contacts. This feature allows advocates to bulk import their client lists and attorney contacts from CSV files, reducing setup time from hours to minutes.

## Problem Statement

Established advocates typically have dozens or hundreds of clients, instructing attorneys, and law firms in spreadsheets or other systems. Manually entering each contact is time-consuming and frustrating, often causing advocates to abandon the onboarding process before completing setup. This creates a significant barrier to adoption and prevents LexoHub from reaching its full market potential.

## Solution

A user-friendly 7-step wizard that guides advocates through importing their contacts:
1. Upload CSV file
2. Map columns to system fields
3. Review validation errors
4. Resolve duplicates
5. Preview import
6. Execute import with progress tracking
7. View results and next steps

The tool includes intelligent column detection, comprehensive validation, duplicate detection, and rollback capability to ensure data quality and user confidence.

## Spec Documents

1. **[requirements.md](./requirements.md)** - Complete requirements with user stories and acceptance criteria
2. **[design.md](./design.md)** - Comprehensive technical design including wizard flow, services, and components
3. **[tasks.md](./tasks.md)** - Detailed implementation plan with 19 major tasks broken into 60+ actionable sub-tasks

## Key Features

### Core Functionality
- Separate import flows for clients and attorneys
- CSV file upload with validation (type, size)
- Intelligent column mapping with auto-detection
- Comprehensive data validation (email, phone, required fields)
- Duplicate detection with resolution options (skip, update, create)
- Preview before import with detailed summary
- Batch processing for large imports (50 records per batch)
- Real-time progress tracking

### Data Quality
- Email format validation
- Phone number format validation
- Required field enforcement
- Duplicate detection based on email or name combinations
- Error reporting with row numbers and details
- Download error report for fixing and re-import

### User Experience
- 7-step wizard with clear progress indication
- Template download for easy CSV formatting
- Auto-save column mappings for future imports
- Import history with filtering and search
- Rollback capability (within 24 hours)
- Mobile-responsive design

### Import History
- Complete audit trail of all imports
- Filter by type, status, date range
- View detailed results for each import
- Export import reports
- Rollback recent imports

## Success Metrics

- **Adoption Rate**: 80%+ of new advocates use CSV import during onboarding
- **Time Savings**: 90%+ reduction in contact setup time (hours → minutes)
- **Data Quality**: 95%+ of imported records are valid and usable
- **Completion Rate**: 85%+ of started imports complete successfully
- **User Satisfaction**: 90%+ rate import tool as "easy to use"
- **Support Reduction**: 60%+ reduction in onboarding support tickets

## Implementation Approach

### Phase 1: Core Import Flow (Week 1-2)
- Database schema and migrations
- CSV parsing and validation services
- File upload and column mapping steps
- Basic import execution

### Phase 2: Advanced Features (Week 2-3)
- Duplicate detection and resolution
- Import preview and progress tracking
- Error handling and recovery
- Template generation

### Phase 3: History & Management (Week 3-4)
- Import history display
- Rollback functionality
- Filtering and search
- Export reports

### Phase 4: Polish & Optimization (Week 4-5)
- Mobile responsiveness
- Accessibility improvements
- Performance optimization
- User testing and refinements

## Technical Stack

- **CSV Parsing**: Papa Parse library (battle-tested, handles edge cases)
- **Database**: PostgreSQL (Supabase) with new `import_history` table
- **Frontend**: React + TypeScript with multi-step wizard
- **State Management**: Custom hooks for wizard state
- **File Handling**: Browser File API with drag-and-drop
- **Batch Processing**: Server-side batching to prevent timeouts

## User Flow

```
1. Navigate to /import page
2. Choose import type (Clients or Attorneys)
3. Upload CSV file (or download template first)
4. Review auto-mapped columns, adjust if needed
5. Review validation errors, choose resolution
6. Resolve any duplicates found
7. Preview import summary
8. Confirm and watch progress
9. View results and imported records
```

## CSV Template Format

### Clients Template
```csv
Client Name*,Email,Phone,Address,Client Type,Notes
John Smith,john@example.com,(555) 123-4567,123 Main St,Individual,Referred by Jane
```

### Attorneys Template
```csv
Attorney Name*,Firm Name*,Email,Phone,Practice Number,Notes
Jane Doe,Doe & Associates,jane@doelaw.com,(555) 234-5678,ATT12345,Corporate law specialist
```

## Error Handling

The tool handles various error scenarios gracefully:
- Invalid file format → Clear message, suggest template
- File too large → Suggest splitting file
- CSV parsing errors → Suggest UTF-8 encoding
- Missing required fields → Highlight unmapped fields
- Validation errors → Download error report for fixing
- Duplicates → Interactive resolution interface
- Import failures → Partial success with error details
- Rollback → Restore previous state

## Data Validation Rules

### Email Validation
- Must contain @ symbol
- Must have domain with extension
- Format: `user@domain.com`

### Phone Validation
- Accept various formats: (555) 123-4567, 555-123-4567, 5551234567
- Minimum 10 digits
- Allow international formats with +

### Duplicate Detection
**Clients**: Match on email OR (name + phone)
**Attorneys**: Match on email OR (name + firm)

Similarity threshold: 80%+ match score

## Rollback Capability

- Available for 24 hours after import
- Deletes all records created by import
- Restores updated records to previous state
- Warns if imported records have been modified
- Requires confirmation before proceeding

## Getting Started

To begin implementing this feature:

1. Review the [requirements.md](./requirements.md) to understand user needs
2. Study the [design.md](./design.md) for technical architecture
3. Follow the [tasks.md](./tasks.md) implementation plan sequentially
4. Start with Task 1 (Database schema) and work through incrementally

## Dependencies

- Papa Parse library for CSV parsing
- Existing client/attorney tables in database
- Supabase authentication system
- Existing UI component library
- File API support in browsers

## Future Enhancements (Out of Scope for MVP)

- Import active matters with full details
- Import historical time entries and invoices
- Import from Excel (.xlsx) files directly
- Import from other legal practice management systems
- Automated data cleaning using AI
- Real-time sync with external CRM systems
- Import scheduling and automation
- Advanced duplicate matching with ML
- Bulk update existing records via CSV

## Questions or Feedback

This spec is ready for implementation. To execute tasks:

1. Open the [tasks.md](./tasks.md) file
2. Click "Start task" next to any task item
3. Follow the task details and requirements references
4. Complete tasks sequentially for best results

---

**Spec Status**: ✅ Complete - Ready for Implementation  
**Priority**: Phase 2 - User Growth  
**Estimated Effort**: 4-5 weeks for complete tool (3 weeks for core functionality)  
**Created**: 2025-10-11  
**Impact**: Removes biggest onboarding barrier for established advocates
