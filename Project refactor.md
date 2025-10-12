Project Lexo-Refactor: A Comprehensive Plan for a Scalable A+ Application
Objective: To systematically refactor the existing codebase to align perfectly with the database schema, implement all missing critical features, and optimize for performance and scalability.

Guiding Principles:

Schema is Truth: The Full Lexo table.txt file is the single source of truth for all database structures, types, and relationships.

Type Safety First: All new and modified code must be strictly typed.

Atomic Commits: Each iteration should be treated as a single, logical unit of work.

Iteration 1 of 10: Foundational Fix - Unifying Invoice Status Logic
Goal: Correct the database schema and codebase to handle "pro forma" invoices as a proper status, eliminating the need for workarounds.

Rationale: The current method of using internal_notes to identify pro forma invoices is brittle and inefficient. A proper status enum makes queries simpler, faster, and more reliable, which is critical for a core financial feature.

Key Files to Modify:

src/services/api/invoices.service.ts

src/types/index.ts

src/components/invoices/InvoiceList.tsx

src/pages/InvoicesPage.tsx

Database Schema (conceptual modification)

Detailed Instructions:

Database Schema Change (Informational):

You are to assume the invoice_status enum in the database has been updated to include 'pro_forma'.

You are to assume a new boolean column is_pro_forma has been added to the invoices table. This column will be true for pro forma invoices and false otherwise.

Update TypeScript Types:

In src/types/index.ts, find the InvoiceStatus type definition. Add 'Pro Forma' to the union.

In the Invoice interface, add the new field: is_pro_forma: boolean;.

Refactor invoices.service.ts:

Generation: In the generateInvoice and generateProFormaForTempMatter methods, when creating a pro forma invoice, set is_pro_forma: true and status: 'pro_forma'. Remove any logic that writes to the internal_notes field for this purpose.

Conversion: In convertProFormaToFinal, when creating the final invoice, set is_pro_forma: false. The logic should now identify the original pro forma by querying where('id', 'eq', proFormaId).where('is_pro_forma', 'eq', true).

Filtering: In getInvoices, modify the query logic. If the status filter includes 'pro_forma', add a .eq('is_pro_forma', true) to the Supabase query instead of the ilike('internal_notes', ...) filter.

Update UI Components:

In InvoiceList.tsx and other relevant components, update status displays and filters to correctly handle the new 'Pro Forma' status.

Acceptance Criteria:

The application can create, view, and convert pro forma invoices.

The internal_notes field is no longer used to track pro forma status.

Filtering for "Pro Forma" invoices on the InvoicesPage works correctly.

Iteration 2 of 10: Foundational Fix - Consolidating User & Advocate Models
Goal: Unify the advocates and user_profiles tables into a single, cohesive user profile model within the codebase, eliminating data redundancy.

Rationale: The current separation of advocates and user_profiles creates confusion and potential for data synchronization errors. A single, unified user profile model simplifies the code, aligns with Supabase's authentication flow, and provides a clear foundation for multi-role features like "Team Members" and "Attorney Users".

Key Files to Modify:

src/services/api/advocate.service.ts (to be renamed)

src/types/index.ts

src/services/api/matter-api.service.ts

Every file that currently imports advocate.service.ts.

Detailed Instructions:

Database Schema Change (Informational):

You are to assume the advocates table has been deprecated.

All columns from advocates (e.g., practice_number, bar, hourly_rate) have been migrated as nullable columns to the user_profiles table. The user_profiles table is now the single source of truth for all user data, linked directly to auth.users via user_id.

Update TypeScript Types:

In src/types/index.ts, modify the UserProfile interface to include all fields from the old Advocate type. Mark fields specific to advocates (like practice_number, bar) as optional.

Remove the now-redundant Advocate type.

Refactor Services:

Rename src/services/api/advocate.service.ts to src/services/api/user.service.ts.

Inside user.service.ts, create a UserService class.

Rewrite all methods (getAdvocateById, getCurrentAdvocate, etc.) to query the user_profiles table instead of advocates. For example, getUserById, getCurrentUser. The foreign key link to auth.users is id on auth.users and user_id on user_profiles.

Update any functions that create users (like the handle_new_user trigger implies) to insert into user_profiles only.

Update Dependent Services and Components:

In matter-api.service.ts, update the query to join with user_profiles instead of advocates to fetch user details. The join will be on matters.advocate_id -> user_profiles.user_id.

Search the entire codebase for any import of advocateService or AdvocateApiService and replace it with the new userService. Update method calls accordingly (e.g., advocateService.getCurrentAdvocate() becomes userService.getCurrentUser()).

Acceptance Criteria:

The advocates table is no longer referenced anywhere in the codebase.

The application runs correctly, fetching all advocate/user data from the user_profiles table.

The advocate.service.ts file has been successfully renamed and refactored into user.service.ts.

Iteration 3 of 10: Foundational Fix - Centralizing Application Routing
Goal: Refactor the application's navigation and page rendering to be fully controlled by AppRouter.tsx, creating a single, clear source of truth for routing.

Rationale: The current routing logic is split between App.tsx (a state-based router) and AppRouter.tsx (a component-based router). This is confusing and not scalable. Consolidating into AppRouter.tsx using react-router-dom is the standard, most maintainable approach for React applications.

Key Files to Modify:

src/App.tsx

src/AppRouter.tsx

src/main.tsx

Detailed Instructions:

Enhance AppRouter.tsx:

Define the main application layout within AppRouter.tsx, including the NavigationBar. This layout will wrap all protected routes.

Define all application routes using <Route> components within a <Routes> block. Use nested routing for the main layout.

Example structure:

<HashRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/attorney/login" element={<LoginPage />} />
    {/* Protected Routes with Layout */}
    <Route element={<MainLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/matters" element={<MattersPage />} />
      {/* ... other protected routes */}
    </Route>
  </Routes>
</HashRouter>

Simplify App.tsx:

Remove all routing logic from App.tsx. Delete the handlePageChange function, the appState, and the renderPage switch statement.

The App component should become a simple container that renders the AppRouter.

Update main.tsx:

Ensure main.tsx renders the App component, which now contains the fully configured AppRouter.

Acceptance Criteria:

App.tsx no longer contains any state or logic related to page navigation.

All navigation is handled by react-router-dom within AppRouter.tsx.

The application is fully navigable, and all pages render correctly within the main layout.

Iteration 4 of 10: Feature Implementation - Attorney Users & Profiles
Goal: Create the necessary types, services, and UI components to fully support the attorney_users table and their interactions with the system.

Rationale: The attorney portal is a critical feature, but the codebase currently lacks the foundational types and data access layer to support it, representing a major feature gap.

Key Files to Create/Modify:

src/types/index.ts

src/services/api/attorney.service.ts (new file)

Pages under src/pages/attorney/

Detailed Instructions:

Define TypeScript Types:

In src/types/index.ts, create a new AttorneyUser interface that exactly matches the schema of the attorney_users table from Full Lexo table.txt.

Create Attorney Service:

Create a new file: src/services/api/attorney.service.ts.

Implement an AttorneyService class that extends BaseApiService<AttorneyUser>.

Include methods for CRUD operations: getAttorneyById, updateAttorneyProfile, getMattersForAttorney(attorneyId), etc. These methods should query the attorney_users and attorney_matter_access tables.

Integrate into Attorney Pages:

Refactor the pages under src/pages/attorney/ (e.g., AttorneyDashboardPage, AttorneyProfilePage) to use the new AttorneyService and AttorneyUser types.

Fetch and display attorney-specific data, ensuring all interactions are handled through the new service.

Acceptance Criteria:

A fully typed AttorneyUser interface exists.

The AttorneyService provides all necessary data access methods.

The attorney-facing pages are fully functional and type-safe.

Iteration 5 of 10: Feature Implementation - Team Management
Goal: Implement the Team Management feature, allowing advocate organizations to invite and manage team members.

Rationale: This is a core collaborative feature for scaling the application to serve law firms, not just individual advocates. The database schema exists, but the front-end implementation is missing.

Key Files to Create/Modify:

src/types/index.ts

src/services/api/team.service.ts (new file)

src/components/settings/TeamManagement.tsx

src/pages/SettingsPage.tsx

Detailed Instructions:

Define TypeScript Types:

In src/types/index.ts, create interfaces for TeamMember and Organization that match the team_members table schema and any related organization schema (if applicable, or create a basic one). Ensure enums like TeamMemberRole and TeamMemberStatus are also defined.

Create Team Service:

Create a new file: src/services/api/team.service.ts.

Implement a TeamService class.

Add methods like:

getTeamMembers(organizationId)

inviteTeamMember(email, role)

updateMemberRole(memberId, newRole)

removeTeamMember(memberId)

These methods must respect the enforce_team_member_limit trigger mentioned in the schema.

Build UI Component:

In src/components/settings/TeamManagement.tsx, build the UI for listing, inviting, and managing team members.

Use the new TeamService to handle all data operations.

Ensure the component is robust, with proper loading states, error handling, and confirmation dialogs for destructive actions.

Acceptance Criteria:

An organization admin can view, invite, edit roles of, and remove team members.

The UI correctly reflects the state of the team and prevents adding members beyond the subscription limit.

Iteration 6 of 10: Feature Implementation - Financial Workflows (Credit Notes & Disputes)
Goal: Implement the complete workflows for payment disputes and credit notes.

Rationale: These are essential financial features for handling billing errors and client issues. The database tables exist but are not integrated into the application.

Key Files to Create/Modify:

src/types/index.ts

src/services/api/credit-note.service.ts

src/services/api/payment-dispute.service.ts

src/pages/DisputesPage.tsx

src/pages/CreditNotesPage.tsx

src/components/payments/DisputeModal.tsx

src/components/payments/CreditNoteModal.tsx

Detailed Instructions:

Define TypeScript Types:

In src/types/index.ts, create PaymentDispute and CreditNote interfaces based on their respective tables in Full Lexo table.txt.

Flesh out Services:

In credit-note.service.ts and payment-dispute.service.ts, implement the full BaseApiService functionality for their respective tables.

Add business logic methods, e.g., createDisputeForInvoice(invoiceId, reason), issueCreditNote(invoiceId, amount, reason).

Build UI and Pages:

Connect the DisputeModal and CreditNoteModal to their services to allow creation.

Build out the DisputesPage.tsx and CreditNotesPage.tsx to list and manage these items, allowing for status updates and resolution.

Acceptance Criteria:

Users can raise a dispute against an invoice.

Advocates can view and manage disputes.

Advocates can issue credit notes, which are then reflected in invoice balances.

Iteration 7 of 10: Feature Implementation - Advanced Workflows (Scope Amendments & Approvals)
Goal: Implement the workflows for scope amendments and partner approvals on matters.

Rationale: These features are critical for maintaining compliance, transparency, and formalizing changes in legal matters, which is key for the platform's integrity.

Key Files to Create/Modify:

src/types/index.ts

src/services/api/scope-amendment.service.ts

src/services/api/partner-approval.service.ts

src/pages/partner/PartnerApprovalPage.tsx

src/components/scope/CreateAmendmentModal.tsx

src/components/partner/PartnerApprovalModal.tsx

Detailed Instructions:

Define TypeScript Types:

In src/types/index.ts, create ScopeAmendment and PartnerApproval interfaces based on their tables in Full Lexo table.txt.

Flesh out Services:

Implement the BaseApiService functionality in scope-amendment.service.ts and partner-approval.service.ts.

Add methods like requestAmendment(matterId, reason, newEstimate) and submitForPartnerApproval(matterId).

Build UI and Pages:

Wire up the CreateAmendmentModal to its service.

Enhance the MatterWorkbenchPage or MattersPage to display amendment history and approval status.

Build out the PartnerApprovalPage to show a queue of matters awaiting approval, using the PartnerApprovalModal for review and action.

Acceptance Criteria:

Advocates can create scope amendments for a matter.

Matters can be submitted for partner approval.

Designated partners can view a queue of items and approve or reject them.

Iteration 8 of 10: Feature Implementation - Comprehensive Audit Trail
Goal: Create and integrate a service and UI to display the audit log for key entities.

Rationale: A visible audit trail is crucial for security, compliance, and debugging. The audit_log table is populated by triggers, but there is no way for users to view this data.

Key Files to Create/Modify:

src/types/index.ts

src/services/api/audit.service.ts (new file)

src/pages/AuditTrailPage.tsx

Detailed Instructions:

Define TypeScript Types:

In src/types/index.ts, create an AuditLog interface matching the audit_log table.

Create Audit Service:

Create a new file: src/services/api/audit.service.ts.

Implement an AuditService.

Add methods like getAuditLogsForEntity(entityType, entityId) and getRecentActivity(userId).

Build UI:

In AuditTrailPage.tsx, create a sophisticated UI for viewing and filtering the audit log.

Allow filtering by date, user, entity type, and action.

In relevant pages (like MatterWorkbenchPage), add a component or tab to show the specific audit history for that matter.

Acceptance Criteria:

Users can view a global audit trail on the AuditTrailPage.

Users can view the specific history of an individual matter or invoice.

The audit trail is clear, readable, and provides valuable insight.

Iteration 9 of 10: Performance Optimization - Server-Side Logic
Goal: Offload client-side calculations to the database to improve front-end performance and ensure data consistency.

Rationale: The application currently performs business logic calculations (like identifying overdue matters) on the client. This is inefficient, doesn't scale, and can lead to inconsistent results. Moving this to the database is a key optimization step.

Key Files to Modify:

src/services/api/matter-api.service.ts

Database Schema (conceptual modification)

Detailed Instructions:

Database Schema Change (Informational):

You are to assume a new boolean column is_overdue has been added to the matters table.

You are to assume a database function/trigger exists that automatically updates this flag daily or whenever expected_completion_date is changed.

Refactor matter-api.service.ts:

In the getOverdueMatters method, and in any FilterOptions that include is_overdue, change the logic.

Instead of performing a date calculation on the client, modify the Supabase query to directly filter on the new boolean column: .eq('is_overdue', true).

Remove any remaining client-side logic that calculates "overdue" status.

Acceptance Criteria:

The application no longer contains client-side JavaScript for calculating if a matter is overdue.

Filtering by "Overdue" matters is now a direct, efficient database query.

The UI performance on pages with many matters is noticeably improved.

Iteration 10 of 10: Performance Optimization & Final Review
Goal: Implement remaining database optimizations and conduct a final code review and cleanup.

Rationale: Adding targeted indexes will resolve the final performance bottlenecks. A concluding code review ensures consistency and quality across the newly added and refactored code.

Key Files to Modify:

Database Schema (conceptual modification)

Codebase-wide review.

Detailed Instructions:

Database Indexing (Informational):

You are to assume the following composite indexes have been created to optimize common queries:

On matters(advocate_id, status)

On invoices(advocate_id, is_pro_forma)

Final Code Review:

Scan the entire codebase for any remaining hardcoded values that should be enums.

Ensure consistent error handling across all new services.

Check for consistent use of the UserProfile type and remove any lingering references to the old Advocate type.

Standardize the use of UI components, replacing any one-off styles with components from your design system.

Remove any dead code (unused services, types, or components).

Acceptance Criteria:

The application is fully aligned with the database schema.

All critical features are implemented and type-safe.

The codebase is clean, consistent, and optimized for performance.

The final application is ready for scaling.