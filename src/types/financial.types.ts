/**
 * Financial Workflow Types
 * Credit notes, payment disputes, scope amendments, partner approvals
 */

export interface CreditNote {
  id: string;
  credit_note_number: string;
  invoice_id: string;
  dispute_id?: string;
  advocate_id: string;
  amount: number;
  reason: string;
  reason_category?: 'billing_error' | 'service_issue' | 'client_dispute' | 'goodwill' | 'other';
  issued_at?: string;
  applied_at?: string;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PaymentDispute {
  id: string;
  invoice_id: string;
  advocate_id: string;
  dispute_reason: string;
  dispute_type: 'amount' | 'service' | 'quality' | 'timing' | 'other';
  disputed_amount?: number;
  client_notes?: string;
  advocate_response?: string;
  evidence_urls?: string[];
  resolution_type?: 'credit_note' | 'adjustment' | 'dismissed' | 'refund';
  resolution_notes?: string;
  resolved_at?: string;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ScopeAmendment {
  id: string;
  matter_id: string;
  engagement_agreement_id?: string;
  advocate_id: string;
  amendment_type: 'scope_increase' | 'scope_decrease' | 'timeline_extension' | 'fee_adjustment';
  reason: string;
  description?: string;
  original_estimate?: number;
  new_estimate?: number;
  variance_amount?: number;
  variance_percentage?: number;
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
  client_notified_at?: string;
  client_approved_at?: string;
  client_rejection_reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'client_review';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PartnerApproval {
  id: string;
  matter_id: string;
  partner_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  comments?: string;
  checklist?: {
    conflict_check: boolean;
    fee_agreement: boolean;
    scope_defined: boolean;
    risk_assessed: boolean;
    [key: string]: boolean;
  };
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditNoteCreate {
  invoice_id: string;
  amount: number;
  reason: string;
  reason_category?: CreditNote['reason_category'];
  dispute_id?: string;
}

export interface PaymentDisputeCreate {
  invoice_id: string;
  dispute_reason: string;
  dispute_type: PaymentDispute['dispute_type'];
  disputed_amount?: number;
  client_notes?: string;
  evidence_urls?: string[];
}

export interface ScopeAmendmentCreate {
  matter_id: string;
  amendment_type: ScopeAmendment['amendment_type'];
  reason: string;
  description?: string;
  new_estimate?: number;
}

export interface PartnerApprovalCreate {
  matter_id: string;
  partner_id: string;
  comments?: string;
}
