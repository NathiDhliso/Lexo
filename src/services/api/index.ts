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
  QuickBriefTemplateService,
  quickBriefTemplateService
} from './quick-brief-template.service';

// Re-export types from quick-brief.types through the service
export type { 
  TemplateItem as QuickBriefTemplate,
  TemplateCategory,
  TemplateExport as TemplateExportData,
  TemplateImportResult
} from '../../types/quick-brief.types';

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
  paymentDisputeService
} from './payment-dispute.service';

export {
  PaymentService,
  paymentService
} from './payment.service';

export {
  CreditNoteService,
  creditNoteService
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

export {
  subscriptionService
} from './subscription.service';

export {
  dashboardService,
  type DashboardMetrics,
  type UrgentAttentionItem,
  type ThisWeekDeadline,
  type FinancialSnapshot,
  type ActiveMatterWithProgress,
  type PendingActions,
  type QuickStats
} from './dashboard.service';

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
