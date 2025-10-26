# API Documentation - Pre-Launch Financial Features

## Table of Contents

1. [Payment Service API](#payment-service-api)
2. [Disbursement Service API](#disbursement-service-api)
3. [Invoice Numbering Service API](#invoice-numbering-service-api)
4. [Dashboard Service API](#dashboard-service-api)
5. [Matter Search Service API](#matter-search-service-api)

---

## Payment Service API

### Base URL
```
/api/payments
```

### Endpoints

#### Record Payment
```http
POST /api/payments
```

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "amount": 500.00,
  "payment_date": "2025-01-27",
  "payment_method": "EFT",
  "reference_number": "REF123",
  "notes": "Partial payment"
}
```

**Response:**
```json
{
  "id": "uuid",
  "invoice_id": "uuid",
  "amount": 500.00,
  "payment_date": "2025-01-27",
  "payment_method": "EFT",
  "reference_number": "REF123",
  "notes": "Partial payment",
  "created_at": "2025-01-27T10:30:00Z",
  "created_by": "uuid"
}
```

**Status Codes:**
- `201 Created`: Payment recorded successfully
- `400 Bad Request`: Invalid data (amount > outstanding balance, negative amount, etc.)
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't own the invoice
- `404 Not Found`: Invoice not found

---

#### Get Payment History
```http
GET /api/payments/invoice/:invoiceId
```

**Response:**
```json
{
  "invoice_id": "uuid",
  "invoice_number"