/**
 * API Services Index
 * Centralized exports for all API services
 */

// Base service and utilities
export { 
  BaseApiService, 
  ApiErrorHandler, 
  RetryHandler,
  ErrorType,
  type ApiError,
  type ApiResponse,
  type PaginationOptions,
  type FilterOptions,
  type SortOptions
} from './base-api.service';

// Entity-specific services
export { 
  MatterApiService, 
  matterApiService,
  type MatterFilters,
  type MatterStats,
  type MatterSearchOptions
} from './matter-api.service';


export {
  userPreferencesService,
  type UserPreferencesUpdate
} from './user-preferences.service';

export { proformaRequestService } from './proforma-request.service';
export { matterConversionService } from './matter-conversion.service';
export { InvoiceService } from './invoices.service';
export { TimeEntryService } from './time-entries.service';
export { ExpensesService } from './expenses.service';

export { 
  EngagementAgreementService,
  engagementAgreementService,
  type CreateEngagementAgreementRequest,
  type SignEngagementAgreementRequest
} from './engagement-agreement.service';

export {
  ScopeAmendmentService,
  scopeAmendmentService,
  type CreateScopeAmendmentRequest
} from './scope-amendment.service';

export {
  PaymentDisputeService,
  paymentDisputeService,
  type CreateDisputeRequest,
  type ResolveDisputeRequest
} from './payment-dispute.service';

export {
  PaymentService,
  paymentService,
  type RecordPaymentRequest,
  type PaymentSummary
} from './payment.service';

export {
  CreditNoteService,
  creditNoteService,
  type CreateCreditNoteRequest
} from './credit-note.service';

export {
  PartnerApprovalService,
  partnerApprovalService,
  type SubmitForApprovalRequest,
  type ApprovalDecisionRequest,
  type PendingApproval
} from './partner-approval.service';

export {
  BillingReadinessService,
  billingReadinessService,
  type ReadinessCheck
} from './billing-readiness.service';

export {
  RetainerService,
  retainerService,
  type CreateRetainerRequest,
  type DepositRequest,
  type DrawdownRequest,
  type RetainerSummary
} from './retainer.service';

// Re-export commonly used types from the main types file
export type {
  Matter,
  Invoice,
  TimeEntry,
  User,
  MatterStatus,
  InvoiceStatus,
  NewMatterForm,
  NewInvoiceForm
} from '../../types';
