# Design Document: Smart Document Linking

## Overview

The Smart Document Linking feature enables advocates to link external documents (from cloud storage or local files) to matters within LexoHub. This design leverages the existing architecture while adding minimal new components to maintain system simplicity and performance.

### Design Philosophy

- **Metadata-only storage**: Store only document metadata and links, never actual file content
- **External storage agnostic**: Support any storage provider via URL/path linking
- **Minimal UI friction**: Integrate seamlessly into existing matter workflows
- **Progressive enhancement**: Start simple, add advanced features incrementally
- **Security by delegation**: Rely on external storage providers for authentication and access control

### Key Design Decisions

1. **No file hosting**: LexoHub will not store or host documents, only metadata and links
2. **Simple URL-based linking**: Initial version uses direct URL/path linking rather than OAuth integrations
3. **Matter-centric**: Documents are always linked to a specific matter
4. **Audit trail integration**: All document operations logged in existing audit system
5. **Mobile-first responsive**: Design works equally well on desktop and mobile devices

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                         LexoHub                              │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │   Matter     │───▶│   Document   │──▶│    Audit     │   │
│  │  Management  │    │    Links     │   │     Log      │   │
│  └──────────────┘    └──────────────┘   └──────────────┘   │
│         │                    │                               │
└─────────┼────────────────────┼───────────────────────────────┘
          │                    │
          ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│              External Storage Providers                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dropbox  │  │  Google  │  │ OneDrive │  │  Local   │   │
│  │          │  │  Drive   │  │          │  │  Files   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema


#### New Table: `matter_document_links`

```sql
CREATE TABLE matter_document_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  -- Document metadata
  document_name VARCHAR(255) NOT NULL,
  document_url TEXT NOT NULL,
  document_type VARCHAR(50), -- 'url', 'dropbox', 'google_drive', 'onedrive', 'local'
  storage_provider VARCHAR(50), -- 'dropbox', 'google_drive', 'onedrive', 'local', 'other'
  
  -- Organization
  category VARCHAR(50), -- 'pleadings', 'correspondence', 'evidence', etc.
  description TEXT,
  tags TEXT[], -- Array of tags for flexible organization
  
  -- File metadata (optional, for display purposes)
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  
  -- Relationships
  linked_time_entry_id UUID REFERENCES time_entries(id) ON DELETE SET NULL,
  linked_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_document_name CHECK (LENGTH(document_name) > 0),
  CONSTRAINT valid_document_url CHECK (LENGTH(document_url) > 0)
);

-- Indexes for performance
CREATE INDEX idx_matter_document_links_matter_id ON matter_document_links(matter_id);
CREATE INDEX idx_matter_document_links_advocate_id ON matter_document_links(advocate_id);
CREATE INDEX idx_matter_document_links_category ON matter_document_links(category);
CREATE INDEX idx_matter_document_links_tags ON matter_document_links USING GIN(tags);
CREATE INDEX idx_matter_document_links_created_at ON matter_document_links(created_at DESC);
CREATE INDEX idx_matter_document_links_deleted_at ON matter_document_links(deleted_at) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE matter_document_links ENABLE ROW LEVEL SECURITY;

-- Advocates can only access document links for their own matters
CREATE POLICY "Advocates can view their own matter document links"
  ON matter_document_links FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create document links for their matters"
  ON matter_document_links FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own document links"
  ON matter_document_links FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own document links"
  ON matter_document_links FOR DELETE
  USING (advocate_id = auth.uid());
```

#### Updated Table: `matters`

Add computed field for document count (via view or function):

```sql
-- Add function to get document count for a matter
CREATE OR REPLACE FUNCTION get_matter_document_count(matter_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM matter_document_links
  WHERE matter_id = matter_uuid
    AND deleted_at IS NULL;
$$ LANGUAGE SQL STABLE;
```

## Components and Interfaces

### Frontend Architecture

```
src/
├── components/
│   └── documents/
│       ├── DocumentLinkList.tsx          # Main list view
│       ├── DocumentLinkCard.tsx          # Individual document card
│       ├── AddDocumentLinkModal.tsx      # Add/edit modal
│       ├── BulkAddDocumentModal.tsx      # Bulk add interface
│       ├── DocumentQuickPreview.tsx      # Quick preview dropdown
│       ├── DocumentCategoryFilter.tsx    # Category filter component
│       └── DocumentSearchBar.tsx         # Search/filter bar
├── services/
│   └── api/
│       └── document-links.service.ts     # API service
├── hooks/
│   ├── useDocumentLinks.ts               # Document links hook
│   └── useDocumentSearch.ts              # Search/filter hook
└── types/
    └── document-link.types.ts            # TypeScript types
```

### Component Specifications

#### 1. DocumentLinkList Component

**Purpose**: Display all document links for a matter with filtering and sorting

**Props**:
```typescript
interface DocumentLinkListProps {
  matterId: string;
  showQuickActions?: boolean;
  compact?: boolean;
  onDocumentClick?: (documentLink: DocumentLink) => void;
}
```

**Features**:
- Grid/list view toggle
- Category filtering
- Tag filtering
- Search by name/description
- Sort by date, name, or type
- Bulk selection for batch operations
- Empty state with call-to-action

#### 2. AddDocumentLinkModal Component

**Purpose**: Modal for adding or editing a single document link

**Props**:
```typescript
interface AddDocumentLinkModalProps {
  matterId: string;
  documentLink?: DocumentLink; // For editing
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (documentLink: DocumentLink) => void;
}
```

**Form Fields**:
- Document Name (required)
- Document URL/Path (required)
- Storage Provider (dropdown: Dropbox, Google Drive, OneDrive, Local, Other)
- Category (dropdown with predefined options)
- Description (textarea)
- Tags (multi-select or comma-separated input)

**Validation**:
- URL format validation
- Duplicate URL detection (warn user)
- Required field validation

#### 3. DocumentQuickPreview Component

**Purpose**: Dropdown showing recent documents from matter card

**Props**:
```typescript
interface DocumentQuickPreviewProps {
  matterId: string;
  maxDocuments?: number; // Default: 5
  trigger: React.ReactNode; // Button or icon to trigger dropdown
}
```

**Features**:
- Shows most recent N documents
- Click to open document in new tab
- "View all" link to full document list
- Document count badge

#### 4. BulkAddDocumentModal Component

**Purpose**: Interface for adding multiple document links at once

**Props**:
```typescript
interface BulkAddDocumentModalProps {
  matterId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}
```

**Features**:
- Textarea for pasting multiple URLs (one per line)
- Common category/tags applied to all
- URL validation with error reporting
- Progress indicator during save
- Summary of successful/failed additions

### API Service Layer

#### DocumentLinksService

```typescript
export class DocumentLinksService extends BaseApiService<DocumentLink> {
  constructor() {
    super('matter_document_links', '*');
  }

  // Get all document links for a matter
  async getByMatter(
    matterId: string,
    options?: {
      category?: string;
      tags?: string[];
      search?: string;
      sort?: SortOptions;
      pagination?: PaginationOptions;
    }
  ): Promise<ApiResponse<DocumentLink[]>>;

  // Create a single document link
  async createDocumentLink(
    data: CreateDocumentLinkRequest
  ): Promise<ApiResponse<DocumentLink>>;

  // Create multiple document links
  async createBulk(
    matterId: string,
    documents: BulkDocumentLinkRequest[]
  ): Promise<ApiResponse<DocumentLink[]>>;

  // Update document link
  async updateDocumentLink(
    id: string,
    data: Partial<DocumentLink>
  ): Promise<ApiResponse<DocumentLink>>;

  // Soft delete document link
  async deleteDocumentLink(id: string): Promise<ApiResponse<void>>;

  // Track document access
  async trackAccess(id: string): Promise<ApiResponse<void>>;

  // Get document count for matter
  async getDocumentCount(matterId: string): Promise<ApiResponse<number>>;

  // Get recent documents for matter
  async getRecentDocuments(
    matterId: string,
    limit?: number
  ): Promise<ApiResponse<DocumentLink[]>>;

  // Search documents across all matters for an advocate
  async searchDocuments(
    advocateId: string,
    query: string,
    options?: SearchOptions
  ): Promise<ApiResponse<DocumentLink[]>>;

  // Get documents by category
  async getByCategory(
    matterId: string,
    category: DocumentCategory
  ): Promise<ApiResponse<DocumentLink[]>>;

  // Get documents by tags
  async getByTags(
    matterId: string,
    tags: string[]
  ): Promise<ApiResponse<DocumentLink[]>>;
}
```



## Data Models

### TypeScript Interfaces

```typescript
// Document category enum
export type DocumentCategory =
  | 'pleadings'
  | 'correspondence'
  | 'evidence'
  | 'contracts'
  | 'court_orders'
  | 'client_documents'
  | 'billing_documents'
  | 'other';

// Storage provider enum
export type StorageProvider =
  | 'dropbox'
  | 'google_drive'
  | 'onedrive'
  | 'local'
  | 'other';

// Document type enum
export type DocumentType =
  | 'url'
  | 'dropbox'
  | 'google_drive'
  | 'onedrive'
  | 'local';

// Main document link interface
export interface DocumentLink {
  id: string;
  matter_id: string;
  advocate_id: string;
  
  // Document metadata
  document_name: string;
  document_url: string;
  document_type: DocumentType;
  storage_provider: StorageProvider;
  
  // Organization
  category?: DocumentCategory;
  description?: string;
  tags?: string[];
  
  // File metadata
  file_size_bytes?: number;
  mime_type?: string;
  
  // Relationships
  linked_time_entry_id?: string;
  linked_invoice_id?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_accessed_at?: string;
  access_count: number;
}

// Request types
export interface CreateDocumentLinkRequest {
  matter_id: string;
  document_name: string;
  document_url: string;
  storage_provider: StorageProvider;
  category?: DocumentCategory;
  description?: string;
  tags?: string[];
  file_size_bytes?: number;
  mime_type?: string;
  linked_time_entry_id?: string;
  linked_invoice_id?: string;
}

export interface BulkDocumentLinkRequest {
  document_name: string;
  document_url: string;
}

export interface UpdateDocumentLinkRequest {
  document_name?: string;
  document_url?: string;
  category?: DocumentCategory;
  description?: string;
  tags?: string[];
  storage_provider?: StorageProvider;
}

// Filter and search types
export interface DocumentLinkFilters {
  category?: DocumentCategory;
  tags?: string[];
  storage_provider?: StorageProvider;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface DocumentSearchOptions {
  query: string;
  filters?: DocumentLinkFilters;
  pagination?: PaginationOptions;
  sort?: SortOptions;
}

// Response types
export interface DocumentLinkStats {
  total_documents: number;
  by_category: Record<DocumentCategory, number>;
  by_provider: Record<StorageProvider, number>;
  total_size_bytes: number;
  most_accessed: DocumentLink[];
}
```

## Error Handling

### Error Scenarios and Handling

1. **Invalid URL Format**
   - Validation: Client-side URL format check
   - Error Message: "Please enter a valid URL or file path"
   - Recovery: Allow user to correct input

2. **Duplicate Document URL**
   - Detection: Check existing URLs before insert
   - Warning: "This document is already linked to this matter"
   - Action: Allow user to proceed or cancel

3. **Document Not Accessible**
   - Detection: When user clicks to open document
   - Error Message: "Unable to access document. The link may be broken or you may not have permission."
   - Recovery: Offer to edit or remove link

4. **Matter Not Found**
   - Detection: API service layer
   - Error Type: NOT_FOUND_ERROR
   - User Message: "Matter not found"
   - Recovery: Redirect to matters list

5. **Permission Denied**
   - Detection: RLS policy enforcement
   - Error Type: AUTHORIZATION_ERROR
   - User Message: "You don't have permission to access these documents"
   - Recovery: Redirect to appropriate page

6. **Bulk Add Partial Failure**
   - Detection: During bulk insert operation
   - Handling: Save successful entries, report failures
   - User Message: "Added X of Y documents. Z failed: [reasons]"
   - Recovery: Show failed URLs for user to retry

7. **Network Errors**
   - Detection: API call failures
   - Error Type: NETWORK_ERROR
   - User Message: "Connection error. Please check your internet and try again."
   - Recovery: Retry button with exponential backoff

### Error Logging

All document link operations will be logged to the audit trail:

```typescript
// Audit log entries for document operations
{
  entity_type: 'document_link',
  entity_id: documentLinkId,
  action: 'create' | 'update' | 'delete' | 'access',
  user_id: advocateId,
  metadata: {
    matter_id: matterId,
    document_name: documentName,
    category: category,
    // Additional context
  }
}
```

## Testing Strategy

### Unit Tests

1. **DocumentLinksService Tests**
   - Test CRUD operations
   - Test filtering and search
   - Test bulk operations
   - Test error handling
   - Test access tracking

2. **Component Tests**
   - DocumentLinkList: rendering, filtering, sorting
   - AddDocumentLinkModal: form validation, submission
   - BulkAddDocumentModal: URL parsing, validation
   - DocumentQuickPreview: dropdown behavior, document loading

3. **Hook Tests**
   - useDocumentLinks: data fetching, caching, mutations
   - useDocumentSearch: search logic, debouncing

### Integration Tests

1. **Document Lifecycle**
   - Create document link → Verify in database
   - Update document link → Verify changes
   - Delete document link → Verify soft delete
   - Access document → Verify tracking

2. **Matter Integration**
   - Create matter → Add documents → Verify association
   - Delete matter → Verify cascade delete of documents
   - View matter → Verify document count display

3. **Search and Filter**
   - Search by name → Verify results
   - Filter by category → Verify filtered list
   - Filter by tags → Verify tag matching
   - Combined filters → Verify AND logic

4. **Bulk Operations**
   - Bulk add valid URLs → Verify all created
   - Bulk add with errors → Verify partial success
   - Bulk add duplicates → Verify warning

### End-to-End Tests

1. **Complete User Flow**
   ```
   1. Navigate to matter detail page
   2. Click "Add Document"
   3. Fill in document details
   4. Save document link
   5. Verify document appears in list
   6. Click document link
   7. Verify opens in new tab
   8. Edit document details
   9. Verify changes saved
   10. Delete document
   11. Verify removed from list
   ```

2. **Bulk Add Flow**
   ```
   1. Navigate to matter documents
   2. Click "Bulk Add"
   3. Paste multiple URLs
   4. Set common category
   5. Submit
   6. Verify success message
   7. Verify all documents in list
   ```

3. **Quick Access Flow**
   ```
   1. Navigate to matters list
   2. Hover over matter with documents
   3. Click document indicator
   4. Verify quick preview shows
   5. Click document in preview
   6. Verify opens document
   ```

### Performance Tests

1. **Large Document Lists**
   - Test with 100+ documents per matter
   - Verify pagination works correctly
   - Verify search performance
   - Verify filter performance

2. **Bulk Operations**
   - Test bulk add with 50+ URLs
   - Verify transaction handling
   - Verify error reporting
   - Verify UI responsiveness

3. **Concurrent Access**
   - Multiple users accessing same matter documents
   - Verify no race conditions
   - Verify proper locking/transactions

## Security Considerations

### Data Protection

1. **URL Storage**
   - Store URLs as-is, no modification
   - Do not expose full local file paths in UI
   - Sanitize URLs for XSS prevention

2. **Access Control**
   - RLS policies enforce advocate-only access
   - Document links inherit matter permissions
   - Future: Support for attorney portal access

3. **Audit Trail**
   - Log all document operations
   - Track access patterns
   - Enable compliance reporting

### Privacy

1. **No Content Storage**
   - Never store actual document content
   - Only store metadata and links
   - Rely on external storage for security

2. **Metadata Minimization**
   - Store only necessary metadata
   - No sensitive content in descriptions
   - Tags should not contain PII

3. **Deletion**
   - Soft delete by default
   - Hard delete option for compliance
   - Cascade delete with matter deletion

## Performance Optimization

### Database Optimization

1. **Indexes**
   - matter_id for fast matter-based queries
   - category for filtering
   - GIN index on tags for array searches
   - created_at for sorting

2. **Query Optimization**
   - Use pagination for large result sets
   - Limit joins to necessary data
   - Use COUNT queries efficiently

3. **Caching Strategy**
   - Cache document counts per matter
   - Cache recent documents list
   - Invalidate on create/update/delete

### Frontend Optimization

1. **Lazy Loading**
   - Load documents on-demand
   - Paginate large lists
   - Virtual scrolling for 100+ items

2. **Debouncing**
   - Search input debounced (300ms)
   - Filter changes debounced
   - Prevent excessive API calls

3. **Optimistic Updates**
   - Immediate UI feedback on actions
   - Rollback on error
   - Show loading states

## Mobile Responsiveness

### Mobile-Specific Design

1. **Touch-Friendly**
   - Larger tap targets (44x44px minimum)
   - Swipe gestures for actions
   - Bottom sheet modals

2. **Simplified UI**
   - Collapsible filters
   - Compact card view
   - Sticky action buttons

3. **Performance**
   - Smaller initial load
   - Progressive enhancement
   - Offline capability (future)

## Integration Points

### Existing System Integration

1. **Matter Detail Page**
   - Add "Documents" tab/section
   - Show document count badge
   - Quick add button in header

2. **Matter Card (List View)**
   - Document count indicator
   - Quick preview dropdown
   - Recent document tooltip

3. **Time Entry Form**
   - Optional document link field
   - Dropdown of matter documents
   - Quick add new document

4. **Invoice Generation**
   - Attach supporting documents
   - Reference documents in narrative
   - Include in PDF metadata

5. **Audit Trail**
   - Log document operations
   - Include in matter activity timeline
   - Compliance reporting

## Future Enhancements

### Phase 2 Features (Out of Scope for MVP)

1. **OAuth Integration**
   - Direct Dropbox API integration
   - Google Drive API integration
   - OneDrive API integration
   - Automatic metadata extraction

2. **Document Preview**
   - In-app PDF preview
   - Image preview
   - Document thumbnails

3. **Version Control**
   - Track document versions
   - Compare versions
   - Restore previous versions

4. **Collaboration**
   - Share documents with attorneys
   - Comment on documents
   - Document approval workflow

5. **Advanced Search**
   - Full-text search (if content accessible)
   - OCR integration
   - AI-powered categorization

6. **Automation**
   - Auto-link documents from email
   - Auto-categorize based on content
   - Deadline extraction from documents

## Implementation Phases

### Phase 1: Core Functionality (MVP)
- Database schema and migrations
- Basic CRUD API service
- Document list component
- Add/edit modal
- Matter detail page integration
- Basic search and filtering

### Phase 2: Enhanced UX
- Bulk add functionality
- Quick preview from matter cards
- Advanced filtering (tags, categories)
- Document statistics
- Mobile optimization

### Phase 3: Workflow Integration
- Time entry linking
- Invoice document attachment
- Audit trail integration
- Matter activity timeline

### Phase 4: Advanced Features
- Document access analytics
- Duplicate detection
- Broken link detection
- Export document list

## Success Metrics

### Technical Metrics
- API response time < 200ms (p95)
- Document list load time < 500ms
- Zero data loss incidents
- 99.9% uptime

### User Metrics
- 70%+ adoption rate within 30 days
- Average 5+ documents per active matter
- 50%+ reduction in app-switching
- NPS increase of 15+ points

### Business Metrics
- 30% increase in daily active users
- 20% increase in session duration
- 40% reduction in support tickets about document management
- 25% increase in user retention
