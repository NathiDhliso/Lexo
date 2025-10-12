# Dynamic PDF Headings for Pro Forma and Invoices

## Overview

The PDF generation service now supports dynamic headings that automatically change based on whether you're generating a pro forma (quote/estimate) or an invoice.

## How It Works

The `proFormaPDFService` now accepts an optional `documentType` parameter that determines the heading:

- `'proforma'` → Displays "PRO FORMA INVOICE" (default)
- `'invoice'` → Displays "INVOICE"

## Usage Examples

### 1. Generating a Pro Forma (Quote/Estimate)

```typescript
await proFormaPDFService.downloadProFormaPDF(
  proformaRequest,
  advocateInfo,
  { documentType: 'proforma' }  // Will show "PRO FORMA INVOICE"
);
```

### 2. Generating an Invoice

```typescript
await proFormaPDFService.downloadProFormaPDF(
  proformaRequest,
  advocateInfo,
  { documentType: 'invoice' }  // Will show "INVOICE"
);
```

### 3. Dynamic Based on Status

```typescript
// Automatically determine document type based on request status
const documentType = request.status === 'accepted' && request.converted_matter_id 
  ? 'invoice' 
  : 'proforma';

await proFormaPDFService.downloadProFormaPDF(
  request,
  advocateInfo,
  { documentType }
);
```

## API Reference

### `generateProFormaPDF()`

```typescript
async generateProFormaPDF(
  proforma: ProFormaRequest,
  advocateInfo: {
    full_name: string;
    practice_number: string;
    email?: string;
    phone?: string;
  },
  options?: {
    documentType?: 'proforma' | 'invoice';
  }
): Promise<Blob>
```

### `downloadProFormaPDF()`

```typescript
async downloadProFormaPDF(
  proforma: ProFormaRequest,
  advocateInfo: AdvocateInfo,
  options?: {
    documentType?: 'proforma' | 'invoice';
  }
): Promise<void>
```

### `getProFormaPDFDataUrl()`

```typescript
async getProFormaPDFDataUrl(
  proforma: ProFormaRequest,
  advocateInfo: AdvocateInfo,
  options?: {
    documentType?: 'proforma' | 'invoice';
  }
): Promise<string>
```

## Template Override

If a custom PDF template is configured with a specific title in `template.header.title`, that title will be used instead of the default dynamic titles. This allows for complete customization when needed.

## File Naming

The downloaded PDF filename also changes dynamically:

- Pro Forma: `ProForma_[quote_number].pdf`
- Invoice: `Invoice_[quote_number].pdf`

## Implementation Details

The implementation is in `src/services/proforma-pdf.service.ts` and has been integrated into:

- `src/pages/ProFormaRequestsPage.tsx` - Automatically determines document type based on status
- `src/components/proforma/CreateProFormaModal.tsx` - Always uses 'proforma' for new quotes

## Benefits

1. **Clarity**: Users immediately know if they're viewing a quote or an invoice
2. **Flexibility**: Easy to switch between document types without code changes
3. **Consistency**: Maintains the same PDF structure while changing only the heading
4. **Professional**: Proper document labeling for legal and accounting purposes
