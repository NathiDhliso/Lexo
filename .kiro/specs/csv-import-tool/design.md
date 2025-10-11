# Design Document: CSV Import Tool

## Overview

The CSV Import Tool provides a user-friendly interface for advocates to bulk import their existing contacts (clients and attorneys) into LexoHub. The design focuses on simplicity, error prevention, and clear feedback throughout the multi-step import process.

### Design Philosophy

- **Progressive Disclosure**: Show only relevant information at each step
- **Error Prevention**: Validate early and often, provide clear guidance
- **Transparency**: Show exactly what will happen before committing
- **Recoverability**: Allow undo/rollback for mistakes
- **Guidance**: Provide templates and examples to ensure success

### Key Design Decisions

1. **Multi-Step Wizard**: Break import into clear, manageable steps
2. **Separate Flows**: Different flows for clients vs attorneys (different fields/validation)
3. **Auto-Mapping**: Intelligent column detection to reduce manual work
4. **Batch Processing**: Process large imports in batches to prevent timeouts
5. **Optimistic UI**: Show progress immediately, handle errors gracefully

## Architecture

### Component Hierarchy

```
ImportPage (new route: /import)
├── ImportTypeSelector (new)
│   ├── ClientImportCard
│   └── AttorneyImportCard
│
├── ImportWizard (new)
│   ├── Step1: FileUpload (new)
│   ├── Step2: ColumnMapping (new)
│   ├── Step3: ValidationReview (new)
│   ├── Step4: DuplicateResolution (new)
│   ├── Step5: ImportPreview (new)
│   ├── Step6: ImportProgress (new)
│   └── Step7: ImportComplete (new)
│
└── ImportHistory (new)
    ├── ImportHistoryList (new)
    └── ImportDetailModal (new)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │   Import     │───▶│  useImport   │──▶│   Import     │   │
│  │  Components  │    │    Hook      │   │   Service    │   │
│  └──────────────┘    └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CSV Processing                            │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │   Parse CSV  │───▶│   Validate   │──▶│   Transform  │   │
│  │              │    │     Data     │   │     Data     │   │
│  └──────────────┘    └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │   clients    │    │  attorneys   │   │   import_    │   │
│  │              │    │              │   │   history    │   │
│  └──────────────┘    └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### New Table: `import_history`

```sql
CREATE TABLE import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  -- Import metadata
  import_type VARCHAR(20) NOT NULL, -- 'clients' or 'attorneys'
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER,
  
  -- Import results
  status VARCHAR(20) NOT NULL, -- 'success', 'partial', 'failed'
  total_rows INTEGER NOT NULL,
  imported_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Import details
  column_mapping JSONB, -- Store the column mapping used
  validation_errors JSONB, -- Array of validation errors
  duplicate_resolutions JSONB, -- How duplicates were handled
  imported_record_ids TEXT[], -- Array of created/updated record IDs
  
  -- Rollback support
  can_rollback BOOLEAN DEFAULT true,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  rolled_back_by UUID REFERENCES advocates(id),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_import_type CHECK (import_type IN ('clients', 'attorneys')),
  CONSTRAINT valid_status CHECK (status IN ('success', 'partial', 'failed', 'in_progress'))
);

-- Indexes
CREATE INDEX idx_import_history_advocate_id ON import_history(advocate_id);
CREATE INDEX idx_import_history_created_at ON import_history(created_at DESC);
CREATE INDEX idx_import_history_status ON import_history(status);
CREATE INDEX idx_import_history_type ON import_history(import_type);

-- RLS Policies
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view their own import history"
  ON import_history FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create their own import records"
  ON import_history FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own import records"
  ON import_history FOR UPDATE
  USING (advocate_id = auth.uid());
```

### Note on Existing Tables

The import tool will use existing `clients` and `attorneys` tables (or similar - need to verify exact table names in your schema). No modifications to these tables are required.

## Components and Interfaces

### 1. ImportPage Component

**Purpose**: Main page for CSV import functionality

**Location**: New route `/import`

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Import Contacts                                             │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Import Clients      │  │  Import Attorneys    │        │
│  │                      │  │                      │        │
│  │  📋 Upload your      │  │  👔 Upload your      │        │
│  │  client list         │  │  attorney contacts   │        │
│  │                      │  │                      │        │
│  │  [Start Import]      │  │  [Start Import]      │        │
│  │  [Download Template] │  │  [Download Template] │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  Recent Imports                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2024-10-10  Clients    clients.csv    45 imported  │  │
│  │  2024-10-09  Attorneys  attorneys.csv  12 imported  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ImportPageProps {
  // No props - top-level page
}
```

### 2. ImportWizard Component

**Purpose**: Multi-step wizard for import process

**Props**:
```typescript
interface ImportWizardProps {
  importType: 'clients' | 'attorneys';
  onComplete: (result: ImportResult) => void;
  onCancel: () => void;
}
```

**State Management**:
```typescript
interface ImportWizardState {
  currentStep: number;
  file: File | null;
  parsedData: ParsedCSV | null;
  columnMapping: ColumnMapping;
  validationResults: ValidationResult[];
  duplicates: DuplicateMatch[];
  duplicateResolutions: DuplicateResolution[];
  importProgress: ImportProgress;
}
```

### 3. FileUploadStep Component

**Purpose**: Step 1 - Upload and parse CSV file

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Upload CSV File                              [1/7]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │         📁 Drag and drop your CSV file here         │    │
│  │                  or click to browse                  │    │
│  │                                                      │    │
│  │              Maximum file size: 5MB                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Don't have a CSV file ready?                               │
│  [Download Template] to get started                         │
│                                                              │
│  Tips:                                                       │
│  • First row should contain column headers                  │
│  • Use UTF-8 encoding for special characters               │
│  • Save as .csv format (not .xlsx)                         │
│                                                              │
│                                    [Cancel]  [Next →]        │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface FileUploadStepProps {
  importType: 'clients' | 'attorneys';
  onFileSelected: (file: File, parsedData: ParsedCSV) => void;
  onCancel: () => void;
}
```

**Features**:
- Drag-and-drop file upload
- File validation (type, size)
- CSV parsing using Papa Parse library
- Preview of first 5 rows
- Template download button

### 4. ColumnMappingStep Component

**Purpose**: Step 2 - Map CSV columns to system fields

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Map Columns                                  [2/7]  │
├─────────────────────────────────────────────────────────────┤
│  Map your CSV columns to LexoHub fields                     │
│                                                              │
│  CSV Column          →    LexoHub Field                     │
│  ┌─────────────────┐     ┌──────────────────────┐         │
│  │ Name            │  →  │ Client Name *        │         │
│  └─────────────────┘     └──────────────────────┘         │
│  ┌─────────────────┐     ┌──────────────────────┐         │
│  │ Email Address   │  →  │ Email                │         │
│  └─────────────────┘     └──────────────────────┘         │
│  ┌─────────────────┐     ┌──────────────────────┐         │
│  │ Phone           │  →  │ Phone                │         │
│  └─────────────────┘     └──────────────────────┘         │
│  ┌─────────────────┐     ┌──────────────────────┐         │
│  │ Address         │  →  │ Address              │         │
│  └─────────────────┘     └──────────────────────┘         │
│  ┌─────────────────┐     ┌──────────────────────┐         │
│  │ Notes           │  →  │ (Skip this column)   │         │
│  └─────────────────┘     └──────────────────────┘         │
│                                                              │
│  * Required field                                            │
│  ✓ All required fields mapped                               │
│                                                              │
│                              [← Back]  [Next →]              │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ColumnMappingStepProps {
  parsedData: ParsedCSV;
  importType: 'clients' | 'attorneys';
  initialMapping?: ColumnMapping;
  onMappingComplete: (mapping: ColumnMapping) => void;
  onBack: () => void;
}
```

**Features**:
- Auto-detection of common column names
- Dropdown for manual mapping
- Required field validation
- Save mapping for future use
- Preview of mapped data

### 5. ValidationReviewStep Component

**Purpose**: Step 3 - Review validation errors

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Review Data                                  [3/7]  │
├─────────────────────────────────────────────────────────────┤
│  Validation Results                                          │
│                                                              │
│  ✓ 45 valid records                                         │
│  ⚠️ 3 records with errors                                   │
│                                                              │
│  Errors Found:                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Row 12: Invalid email format "john@invalid"         │  │
│  │ Row 23: Missing required field "Client Name"        │  │
│  │ Row 34: Invalid phone format "123"                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  How would you like to proceed?                             │
│  ○ Skip invalid rows and import 45 valid records           │
│  ○ Download error report, fix issues, and re-upload        │
│  ○ Cancel import                                            │
│                                                              │
│                              [← Back]  [Next →]              │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ValidationReviewStepProps {
  validationResults: ValidationResult[];
  onResolutionSelected: (resolution: 'skip' | 'fix' | 'cancel') => void;
  onBack: () => void;
}
```

### 6. DuplicateResolutionStep Component

**Purpose**: Step 4 - Resolve duplicate records

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Resolve Duplicates                           [4/7]  │
├─────────────────────────────────────────────────────────────┤
│  Found 2 potential duplicates                                │
│                                                              │
│  Duplicate 1 of 2                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Existing Record          New Record                  │  │
│  │ John Smith               John Smith                  │  │
│  │ john@example.com         john@example.com            │  │
│  │ (555) 123-4567          (555) 123-4567              │  │
│  │ 123 Main St              456 Oak Ave                 │  │
│  │                                                       │  │
│  │ ○ Skip (keep existing)                               │  │
│  │ ○ Update (merge new data)                            │  │
│  │ ○ Create anyway                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Apply to All Similar]                                      │
│                              [← Back]  [Next →]              │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface DuplicateResolutionStepProps {
  duplicates: DuplicateMatch[];
  onResolutionsComplete: (resolutions: DuplicateResolution[]) => void;
  onBack: () => void;
}
```

### 7. ImportPreviewStep Component

**Purpose**: Step 5 - Final preview before import

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Review and Confirm                           [5/7]  │
├─────────────────────────────────────────────────────────────┤
│  Import Summary                                              │
│                                                              │
│  📊 Total rows in CSV: 48                                   │
│  ✓ Valid records to import: 45                              │
│  ⚠️ Invalid records to skip: 3                              │
│  🔄 Duplicates detected: 2                                  │
│  ➕ New records to create: 43                               │
│  ✏️ Existing records to update: 2                           │
│                                                              │
│  Preview (first 10 records):                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Name            Email              Phone             │  │
│  │ John Smith      john@example.com   (555) 123-4567   │  │
│  │ Jane Doe        jane@example.com   (555) 234-5678   │  │
│  │ ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚠️ This action cannot be easily undone. Please review      │
│     carefully before proceeding.                             │
│                                                              │
│                              [← Back]  [Start Import]        │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ImportPreviewStepProps {
  summary: ImportSummary;
  previewData: any[];
  onConfirm: () => void;
  onBack: () => void;
}
```

### 8. ImportProgressStep Component

**Purpose**: Step 6 - Show import progress

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Importing...                                 [6/7]  │
├─────────────────────────────────────────────────────────────┤
│  Importing your contacts                                     │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  75% complete (34 of 45 records)                            │
│                                                              │
│  Creating clients...                                         │
│                                                              │
│  Estimated time remaining: 15 seconds                        │
│                                                              │
│  Please don't close this window                             │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ImportProgressStepProps {
  progress: ImportProgress;
}
```

**Features**:
- Real-time progress bar
- Records processed count
- Current operation display
- Estimated time remaining
- Prevent window close during import

### 9. ImportCompleteStep Component

**Purpose**: Step 7 - Show import results

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Import Complete!                             [7/7]  │
├─────────────────────────────────────────────────────────────┤
│  ✓ Successfully imported 43 clients                         │
│                                                              │
│  Import Results:                                             │
│  • 43 new records created                                   │
│  • 2 existing records updated                               │
│  • 3 records skipped (errors)                               │
│                                                              │
│  [View Imported Records]  [Download Report]                 │
│                                                              │
│  What's next?                                                │
│  • Start creating matters for your clients                  │
│  • Import your attorneys list                               │
│  • Set up your billing preferences                          │
│                                                              │
│                                            [Done]            │
└─────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ImportCompleteStepProps {
  result: ImportResult;
  onViewRecords: () => void;
  onDownloadReport: () => void;
  onDone: () => void;
}
```



## Data Models

### TypeScript Interfaces

```typescript
// CSV parsing
export interface ParsedCSV {
  headers: string[];
  rows: any[][];
  rowCount: number;
}

// Column mapping
export interface ColumnMapping {
  [csvColumn: string]: string | null; // Maps CSV column to system field
}

export interface FieldDefinition {
  name: string;
  label: string;
  required: boolean;
  type: 'text' | 'email' | 'phone' | 'select';
  validation?: (value: any) => boolean;
  options?: string[]; // For select fields
}

// Validation
export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  validRowCount: number;
  invalidRowCount: number;
}

// Duplicate detection
export interface DuplicateMatch {
  csvRow: number;
  csvData: any;
  existingRecord: any;
  matchScore: number; // 0-100
  matchFields: string[]; // Which fields matched
}

export interface DuplicateResolution {
  csvRow: number;
  action: 'skip' | 'update' | 'create';
  existingRecordId?: string;
}

// Import process
export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicatesFound: number;
  newRecordsToCreate: number;
  existingRecordsToUpdate: number;
}

export interface ImportProgress {
  status: 'idle' | 'processing' | 'complete' | 'error';
  processedCount: number;
  totalCount: number;
  currentOperation: string;
  estimatedTimeRemaining?: number;
  errors: Array<{ row: number; error: string }>;
}

export interface ImportResult {
  success: boolean;
  importHistoryId: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  importedRecordIds: string[];
  errors: ValidationError[];
}

// Import history
export interface ImportHistory {
  id: string;
  advocate_id: string;
  import_type: 'clients' | 'attorneys';
  file_name: string;
  file_size_bytes: number;
  status: 'success' | 'partial' | 'failed' | 'in_progress';
  total_rows: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  column_mapping: ColumnMapping;
  validation_errors: ValidationError[];
  duplicate_resolutions: DuplicateResolution[];
  imported_record_ids: string[];
  can_rollback: boolean;
  rolled_back_at?: string;
  rolled_back_by?: string;
  created_at: string;
  completed_at?: string;
}
```

## Services and Utilities

### CSVParserService

```typescript
export class CSVParserService {
  /**
   * Parse CSV file to structured data
   */
  static async parseFile(file: File): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.data[0] as string[];
          const rows = results.data.slice(1);
          
          resolve({
            headers,
            rows,
            rowCount: rows.length
          });
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Generate CSV template for download
   */
  static generateTemplate(type: 'clients' | 'attorneys'): string {
    const templates = {
      clients: {
        headers: ['Client Name*', 'Email', 'Phone', 'Address', 'Client Type', 'Notes'],
        example: ['John Smith', 'john@example.com', '(555) 123-4567', '123 Main St', 'Individual', 'Referred by Jane']
      },
      attorneys: {
        headers: ['Attorney Name*', 'Firm Name*', 'Email', 'Phone', 'Practice Number', 'Notes'],
        example: ['Jane Doe', 'Doe & Associates', 'jane@doelaw.com', '(555) 234-5678', 'ATT12345', 'Corporate law specialist']
      }
    };

    const template = templates[type];
    const csv = Papa.unparse({
      fields: template.headers,
      data: [template.example]
    });

    return csv;
  }

  /**
   * Export data to CSV
   */
  static exportToCSV(data: any[], filename: string): void {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}
```

### ColumnMappingService

```typescript
export class ColumnMappingService {
  /**
   * Auto-detect column mappings based on header names
   */
  static autoMapColumns(
    headers: string[],
    fieldDefinitions: FieldDefinition[]
  ): ColumnMapping {
    const mapping: ColumnMapping = {};
    
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Try to find matching field
      const matchedField = fieldDefinitions.find(field => {
        const fieldName = field.name.toLowerCase();
        const fieldLabel = field.label.toLowerCase();
        
        return (
          normalizedHeader === fieldName ||
          normalizedHeader === fieldLabel ||
          normalizedHeader.includes(fieldName) ||
          fieldName.includes(normalizedHeader)
        );
      });
      
      mapping[header] = matchedField ? matchedField.name : null;
    });
    
    return mapping;
  }

  /**
   * Validate that all required fields are mapped
   */
  static validateMapping(
    mapping: ColumnMapping,
    fieldDefinitions: FieldDefinition[]
  ): { isValid: boolean; missingFields: string[] } {
    const requiredFields = fieldDefinitions
      .filter(f => f.required)
      .map(f => f.name);
    
    const mappedFields = Object.values(mapping).filter(v => v !== null);
    const missingFields = requiredFields.filter(
      field => !mappedFields.includes(field)
    );
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}
```

### DataValidationService

```typescript
export class DataValidationService {
  /**
   * Validate all rows of data
   */
  static validateData(
    rows: any[][],
    mapping: ColumnMapping,
    fieldDefinitions: FieldDefinition[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    let validRowCount = 0;
    
    rows.forEach((row, index) => {
      const rowErrors = this.validateRow(row, mapping, fieldDefinitions);
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors.map(e => ({ ...e, row: index + 2 }))); // +2 for header and 0-index
      } else {
        validRowCount++;
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      validRowCount,
      invalidRowCount: rows.length - validRowCount
    };
  }

  /**
   * Validate a single row
   */
  private static validateRow(
    row: any[],
    mapping: ColumnMapping,
    fieldDefinitions: FieldDefinition[]
  ): Omit<ValidationError, 'row'>[] {
    const errors: Omit<ValidationError, 'row'>[] = [];
    const headers = Object.keys(mapping);
    
    fieldDefinitions.forEach(field => {
      // Find CSV column mapped to this field
      const csvColumn = headers.find(h => mapping[h] === field.name);
      if (!csvColumn) return;
      
      const columnIndex = headers.indexOf(csvColumn);
      const value = row[columnIndex];
      
      // Check required fields
      if (field.required && (!value || value.trim() === '')) {
        errors.push({
          field: field.name,
          value,
          error: `${field.label} is required`,
          severity: 'error'
        });
        return;
      }
      
      // Skip validation if empty and not required
      if (!value || value.trim() === '') return;
      
      // Type-specific validation
      if (field.type === 'email' && !this.isValidEmail(value)) {
        errors.push({
          field: field.name,
          value,
          error: 'Invalid email format',
          severity: 'error'
        });
      }
      
      if (field.type === 'phone' && !this.isValidPhone(value)) {
        errors.push({
          field: field.name,
          value,
          error: 'Invalid phone format',
          severity: 'warning'
        });
      }
      
      // Custom validation
      if (field.validation && !field.validation(value)) {
        errors.push({
          field: field.name,
          value,
          error: `Invalid ${field.label}`,
          severity: 'error'
        });
      }
    });
    
    return errors;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Accept various phone formats
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  }
}
```

### DuplicateDetectionService

```typescript
export class DuplicateDetectionService {
  /**
   * Detect duplicate records
   */
  static async detectDuplicates(
    rows: any[][],
    mapping: ColumnMapping,
    existingRecords: any[],
    importType: 'clients' | 'attorneys'
  ): Promise<DuplicateMatch[]> {
    const duplicates: DuplicateMatch[] = [];
    const headers = Object.keys(mapping);
    
    rows.forEach((row, index) => {
      const rowData = this.mapRowToObject(row, headers, mapping);
      
      existingRecords.forEach(existing => {
        const match = this.calculateMatch(rowData, existing, importType);
        
        if (match.score >= 80) { // 80% similarity threshold
          duplicates.push({
            csvRow: index + 2,
            csvData: rowData,
            existingRecord: existing,
            matchScore: match.score,
            matchFields: match.fields
          });
        }
      });
    });
    
    return duplicates;
  }

  private static mapRowToObject(
    row: any[],
    headers: string[],
    mapping: ColumnMapping
  ): any {
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const fieldName = mapping[header];
      if (fieldName) {
        obj[fieldName] = row[index];
      }
    });
    
    return obj;
  }

  private static calculateMatch(
    newData: any,
    existing: any,
    type: 'clients' | 'attorneys'
  ): { score: number; fields: string[] } {
    const matchFields: string[] = [];
    let totalScore = 0;
    let maxScore = 0;
    
    // Define matching criteria by type
    const criteria = type === 'clients'
      ? [
          { field: 'email', weight: 40 },
          { field: 'client_name', weight: 30 },
          { field: 'phone', weight: 30 }
        ]
      : [
          { field: 'email', weight: 40 },
          { field: 'attorney_name', weight: 30 },
          { field: 'firm_name', weight: 30 }
        ];
    
    criteria.forEach(({ field, weight }) => {
      maxScore += weight;
      
      const newValue = newData[field]?.toLowerCase().trim();
      const existingValue = existing[field]?.toLowerCase().trim();
      
      if (newValue && existingValue && newValue === existingValue) {
        totalScore += weight;
        matchFields.push(field);
      }
    });
    
    return {
      score: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      fields: matchFields
    };
  }
}
```

### ImportService

```typescript
export class ImportService extends BaseApiService<ImportHistory> {
  constructor() {
    super('import_history', '*');
  }

  /**
   * Execute import in batches
   */
  async executeImport(
    rows: any[][],
    mapping: ColumnMapping,
    duplicateResolutions: DuplicateResolution[],
    importType: 'clients' | 'attorneys',
    onProgress: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    const batchSize = 50;
    const totalBatches = Math.ceil(rows.length / batchSize);
    let processedCount = 0;
    const importedRecordIds: string[] = [];
    const errors: ValidationError[] = [];
    
    // Create import history record
    const importHistory = await this.createImportHistory({
      import_type: importType,
      total_rows: rows.length,
      status: 'in_progress'
    });
    
    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, rows.length);
      const batch = rows.slice(batchStart, batchEnd);
      
      try {
        const result = await this.processBatch(
          batch,
          mapping,
          duplicateResolutions,
          importType
        );
        
        importedRecordIds.push(...result.recordIds);
        processedCount += batch.length;
        
        // Update progress
        onProgress({
          status: 'processing',
          processedCount,
          totalCount: rows.length,
          currentOperation: `Processing batch ${i + 1} of ${totalBatches}...`,
          estimatedTimeRemaining: this.estimateTimeRemaining(
            processedCount,
            rows.length,
            Date.now()
          ),
          errors: []
        });
      } catch (error) {
        console.error('Batch processing error:', error);
        errors.push({
          row: batchStart,
          field: 'batch',
          value: null,
          error: error.message,
          severity: 'error'
        });
      }
    }
    
    // Update import history
    await this.updateImportHistory(importHistory.id, {
      status: errors.length === 0 ? 'success' : 'partial',
      imported_count: importedRecordIds.length,
      error_count: errors.length,
      imported_record_ids: importedRecordIds,
      completed_at: new Date().toISOString()
    });
    
    return {
      success: errors.length === 0,
      importHistoryId: importHistory.id,
      importedCount: importedRecordIds.length,
      updatedCount: 0, // Track separately if needed
      skippedCount: rows.length - importedRecordIds.length,
      errorCount: errors.length,
      importedRecordIds,
      errors
    };
  }

  /**
   * Process a batch of rows
   */
  private async processBatch(
    batch: any[][],
    mapping: ColumnMapping,
    duplicateResolutions: DuplicateResolution[],
    importType: 'clients' | 'attorneys'
  ): Promise<{ recordIds: string[] }> {
    const records = batch.map((row, index) => {
      return this.mapRowToRecord(row, Object.keys(mapping), mapping);
    });
    
    // Insert records
    const tableName = importType === 'clients' ? 'clients' : 'attorneys';
    const { data, error } = await supabase
      .from(tableName)
      .insert(records)
      .select('id');
    
    if (error) throw error;
    
    return {
      recordIds: data.map(r => r.id)
    };
  }

  /**
   * Rollback an import
   */
  async rollbackImport(importHistoryId: string): Promise<void> {
    const importHistory = await this.getById(importHistoryId);
    
    if (!importHistory.data || !importHistory.data.can_rollback) {
      throw new Error('Import cannot be rolled back');
    }
    
    const recordIds = importHistory.data.imported_record_ids;
    const tableName = importHistory.data.import_type === 'clients' 
      ? 'clients' 
      : 'attorneys';
    
    // Delete imported records
    const { error } = await supabase
      .from(tableName)
      .delete()
      .in('id', recordIds);
    
    if (error) throw error;
    
    // Update import history
    await this.update(importHistoryId, {
      rolled_back_at: new Date().toISOString(),
      can_rollback: false
    });
  }
}

export const importService = new ImportService();
```

## Error Handling

### Error Scenarios

1. **Invalid File Format**
   - Detection: File extension check
   - Message: "Please upload a valid CSV file (.csv)"
   - Recovery: Allow user to select different file

2. **File Too Large**
   - Detection: File size check (>5MB)
   - Message: "File size exceeds 5MB limit. Please split into smaller files."
   - Recovery: Suggest splitting file

3. **CSV Parsing Error**
   - Detection: Papa Parse error
   - Message: "Unable to parse CSV file. Please check file encoding and format."
   - Recovery: Suggest UTF-8 encoding, provide template

4. **Missing Required Fields**
   - Detection: Column mapping validation
   - Message: "Required field '[Field Name]' is not mapped"
   - Recovery: Highlight unmapped required fields

5. **Validation Errors**
   - Detection: Row-by-row validation
   - Message: "Found [N] validation errors. Review and fix or skip invalid rows."
   - Recovery: Download error report, fix and re-upload

6. **Import Timeout**
   - Detection: Long-running import
   - Message: "Import is taking longer than expected. Please wait..."
   - Recovery: Continue processing, show progress

7. **Partial Import Failure**
   - Detection: Some batches fail
   - Message: "Imported [N] of [M] records. [X] records failed."
   - Recovery: Show which records failed, allow retry

## Testing Strategy

### Unit Tests

1. **CSV Parsing**
   - Test valid CSV parsing
   - Test invalid CSV handling
   - Test various encodings
   - Test empty files

2. **Column Mapping**
   - Test auto-detection
   - Test manual mapping
   - Test required field validation

3. **Data Validation**
   - Test email validation
   - Test phone validation
   - Test required field checks
   - Test custom validation rules

4. **Duplicate Detection**
   - Test exact matches
   - Test partial matches
   - Test no matches
   - Test match scoring

### Integration Tests

1. **Complete Import Flow**
   - Upload CSV → Map columns → Validate → Import
   - Verify records created in database
   - Verify import history recorded

2. **Error Handling**
   - Import with validation errors
   - Import with duplicates
   - Import with partial failures

3. **Rollback**
   - Import records → Rollback → Verify deletion
   - Test rollback time limit

### End-to-End Tests

1. **Client Import Flow**
   ```
   1. Navigate to import page
   2. Click "Import Clients"
   3. Upload valid CSV
   4. Review auto-mapped columns
   5. Proceed through validation
   6. Resolve duplicates
   7. Confirm import
   8. Verify success message
   9. View imported clients
   ```

2. **Error Recovery Flow**
   ```
   1. Upload CSV with errors
   2. Review validation errors
   3. Download error report
   4. Fix errors in CSV
   5. Re-upload fixed CSV
   6. Complete import successfully
   ```

## Performance Optimization

### Batch Processing
- Process imports in batches of 50 records
- Prevent database timeouts
- Allow progress updates

### Client-Side Validation
- Validate before sending to server
- Reduce server load
- Faster feedback to user

### Caching
- Cache column mappings for reuse
- Cache field definitions
- Cache existing records for duplicate detection

## Mobile Responsiveness

### Mobile Adaptations

1. **File Upload**
   - Native file picker on mobile
   - Clear file size limits
   - Progress indicator for large files

2. **Column Mapping**
   - Vertical layout for mapping pairs
   - Touch-friendly dropdowns
   - Swipe to scroll wide tables

3. **Review Steps**
   - Collapsible error details
   - Simplified duplicate resolution
   - Bottom sheet for actions

## Success Metrics

- **Adoption**: 80%+ of new advocates use import
- **Time Savings**: 90%+ reduction in setup time
- **Success Rate**: 85%+ of imports complete successfully
- **Data Quality**: 95%+ of imported records valid
- **User Satisfaction**: 90%+ rate as "easy to use"
