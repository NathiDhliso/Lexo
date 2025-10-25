# Design Document - Attorney Invitation Workflow

## Overview

The Attorney Invitation Workflow transforms firm management into a complete onboarding system. Advocates invite attorneys via secure links, attorneys self-register and submit matter requests, and the system automatically maintains all relationships.

This design leverages existing components (Modal, Button, Form patterns) and services (attorney.service.ts, matter-api.service.ts) to minimize new code.

---

## Architecture

### High-Level Flow

```
Advocate (FirmsPage) 
  → Click "Invite Attorney" 
  → InviteAttorneyModal generates token
  → Copy invitation link
  → Send to attorney (email/SMS)

Attorney (External)
  → Click invitation link
  → AttorneyRegisterPage (public route)
  → Verify token & display firm info
  → Fill registration form
  → Submit → Create account
  → Redirect to SubmitMatterRequestPage

Attorney (Authenticated)
  → SubmitMatterRequestPage
  → Fill matter request form
  → Submit → Create matter with status "new_request"
  → Success confirmation

Advocate (MattersPage)
  → See new matter with "New Request" status
  → Review details
  → Accept/Reject matter
```

---

## Components and Interfaces

### 1. InviteAttorneyModal Component

**Location:** `src/components/firms/InviteAttorneyModal.tsx`

**Purpose:** Generate and display invitation link for a firm

**Props:**
```typescript
interface InviteAttorneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: Firm; // Contains firm_id, firm_name, email
}
```

**State:**
```typescript
const [invitationLink, setInvitationLink] = useState<string>('');
const [loading, setLoading] = useState(false);
const [copied, setCopied] = useState(false);
```

**Behavior:**
1. On mount (when isOpen becomes true), call `attorneyService.generateInvitationToken(firm.id)`
2. Receive token and construct link: `${window.location.origin}/register-firm?firm_id=${firm.id}&token=${token}`
3. Display link in a copyable text field
4. Provide "Copy Link" button with visual feedback
5. Show expiration info: "This link expires in 7 days"

**UI Pattern:** Reuse Modal component from `src/components/ui/Modal.tsx`

---

### 2. FirmCard Component Updates

**Location:** `src/components/firms/FirmCard.tsx` (existing, needs update)

**Changes:**
- Add "Invite Attorney" button to card actions
- Add state for InviteAttorneyModal: `const [showInviteModal, setShowInviteModal] = useState(false)`
- Wire button to open modal: `onClick={() => setShowInviteModal(true)}`
- Render InviteAttorneyModal conditionally

**Button Placement:** Next to existing action buttons (Edit, Delete, etc.)

---

### 3. FirmsPage Component Updates

**Location:** `src/pages/FirmsPage.tsx` (existing, needs update)

**Changes:**
- Pass firm data to FirmCard components
- FirmCard handles its own invite modal (no changes needed at page level)

**Alternative:** If preferred, manage modal state at page level and pass handlers to FirmCard

---

### 4. AttorneyRegisterPage Component

**Location:** `src/pages/attorney/AttorneyRegisterPage.tsx` (new file)

**Purpose:** Public-facing registration page for invited attorneys

**URL Parameters:**
- `firm_id`: UUID of the firm
- `token`: Invitation token

**State:**
```typescript
const [firmData, setFirmData] = useState<Firm | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [formData, setFormData] = useState({
  attorney_name: '',
  phone_number: '',
  email: '',
  password: '',
  confirmPassword: ''
});
```

**Lifecycle:**
1. **On Mount:**
   - Extract firm_id and token from URL
   - Call `attorneyService.verifyInvitationToken(firm_id, token)`
   - If valid: fetch firm data and pre-fill form
   - If invalid: show error message

2. **On Submit:**
   - Validate form (passwords match, email format, etc.)
   - Call `attorneyService.registerViaInvitation({ ...formData, firm_id, token })`
   - On success: redirect to `/submit-matter-request`
   - On error: display error message

**UI Pattern:** Reuse form components from `src/components/ui/FormInput.tsx`

---

### 5. SubmitMatterRequestPage Component

**Location:** `src/pages/attorney/SubmitMatterRequestPage.tsx` (new file)

**Purpose:** Allow newly registered attorneys to submit matter requests

**Authentication:** Requires authenticated attorney user

**State:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  matter_type: '',
  urgency_level: 'standard' as 'low' | 'standard' | 'high',
  documents: [] as File[]
});
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [matterReference, setMatterReference] = useState<string>('');
```

**Lifecycle:**
1. **On Mount:**
   - Get firm_id from authenticated user's session
   - Display form

2. **On Submit:**
   - Call `matterApiService.createMatterRequest({ ...formData, firm_id })`
   - On success: show confirmation with matter reference number
   - Provide option to submit another request or view submitted requests

**UI Pattern:** Reuse form components and AsyncButton from existing UI library

---

## Data Models

### Firm Table Updates

**Migration:** `supabase/migrations/YYYYMMDD_add_invitation_tokens_to_firms.sql`

```sql
ALTER TABLE firms
ADD COLUMN invitation_token TEXT,
ADD COLUMN invitation_token_expires_at TIMESTAMPTZ,
ADD COLUMN invitation_token_used_at TIMESTAMPTZ,
ADD COLUMN onboarded_at TIMESTAMPTZ;

CREATE INDEX idx_firms_invitation_token ON firms(invitation_token) 
WHERE invitation_token IS NOT NULL;

COMMENT ON COLUMN firms.invitation_token IS 'Secure token for attorney invitation links';
COMMENT ON COLUMN firms.invitation_token_expires_at IS 'Expiration timestamp for invitation token';
COMMENT ON COLUMN firms.invitation_token_used_at IS 'Timestamp when token was used for registration';
COMMENT ON COLUMN firms.onboarded_at IS 'Timestamp when attorney completed registration';
```

### Matter Status Updates

**Migration:** Same file or separate

```sql
-- Add new status to matter_status enum if it exists
-- Or ensure 'new_request' is a valid status value

ALTER TYPE matter_status ADD VALUE IF NOT EXISTS 'new_request';

COMMENT ON TYPE matter_status IS 'Includes: active, pending, settled, closed, new_request';
```

### TypeScript Types

**Location:** `src/types/financial.types.ts`

```typescript
export interface Firm {
  id: string;
  firm_name: string;
  attorney_name: string;
  practice_number?: string;
  phone_number?: string;
  email: string;
  address?: string;
  status: 'active' | 'inactive';
  invitation_token?: string;
  invitation_token_expires_at?: string;
  invitation_token_used_at?: string;
  onboarded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationTokenResponse {
  token: string;
  expires_at: string;
  invitation_link: string;
}

export interface AttorneyRegistrationData {
  firm_id: string;
  token: string;
  attorney_name: string;
  phone_number: string;
  email: string;
  password: string;
}

export interface MatterRequest {
  title: string;
  description: string;
  matter_type: string;
  urgency_level: 'low' | 'standard' | 'high';
  firm_id: string;
  documents?: File[];
}
```

---

## Service Layer

### AttorneyService Updates

**Location:** `src/services/api/attorney.service.ts` (existing, needs updates)

#### New Methods:

```typescript
/**
 * Generate invitation token for a firm
 */
static async generateInvitationToken(firmId: string): Promise<InvitationTokenResponse> {
  // 1. Generate cryptographically secure token (32+ characters)
  const token = crypto.randomUUID() + crypto.randomUUID(); // 72 chars
  
  // 2. Calculate expiration (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // 3. Update firm with token
  const { data, error } = await supabase
    .from('firms')
    .update({
      invitation_token: token,
      invitation_token_expires_at: expiresAt.toISOString(),
      invitation_token_used_at: null // Reset if re-inviting
    })
    .eq('id', firmId)
    .select()
    .single();
  
  if (error) throw error;
  
  // 4. Construct invitation link
  const invitationLink = `${window.location.origin}/register-firm?firm_id=${firmId}&token=${token}`;
  
  return {
    token,
    expires_at: expiresAt.toISOString(),
    invitation_link: invitationLink
  };
}

/**
 * Verify invitation token
 */
static async verifyInvitationToken(firmId: string, token: string): Promise<Firm> {
  const { data: firm, error } = await supabase
    .from('firms')
    .select('*')
    .eq('id', firmId)
    .eq('invitation_token', token)
    .single();
  
  if (error || !firm) {
    throw new Error('Invalid invitation link');
  }
  
  // Check expiration
  if (firm.invitation_token_expires_at) {
    const expiresAt = new Date(firm.invitation_token_expires_at);
    if (expiresAt < new Date()) {
      throw new Error('This invitation link has expired');
    }
  }
  
  // Check if already used
  if (firm.invitation_token_used_at) {
    throw new Error('This invitation has already been used');
  }
  
  return firm;
}

/**
 * Register attorney via invitation
 */
static async registerViaInvitation(data: AttorneyRegistrationData): Promise<void> {
  // 1. Verify token again (security)
  await this.verifyInvitationToken(data.firm_id, data.token);
  
  // 2. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        attorney_name: data.attorney_name,
        phone_number: data.phone_number,
        firm_id: data.firm_id,
        user_type: 'attorney'
      }
    }
  });
  
  if (authError) throw authError;
  
  // 3. Update firm record
  await supabase
    .from('firms')
    .update({
      attorney_name: data.attorney_name,
      phone_number: data.phone_number,
      email: data.email,
      invitation_token_used_at: new Date().toISOString(),
      onboarded_at: new Date().toISOString(),
      status: 'active'
    })
    .eq('id', data.firm_id);
  
  // 4. Auto-login the user
  // (Supabase signUp already logs them in)
}
```

---

### MatterApiService Updates

**Location:** `src/services/api/matter-api.service.ts` (existing, needs updates)

#### New Method:

```typescript
/**
 * Create matter request from attorney
 */
static async createMatterRequest(data: MatterRequest): Promise<Matter> {
  // 1. Get current user (attorney)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }
  
  // 2. Get firm to find advocate_id
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .select('id, advocate_id')
    .eq('id', data.firm_id)
    .single();
  
  if (firmError || !firm) {
    throw new Error('Firm not found');
  }
  
  // 3. Create matter with status 'new_request'
  const { data: matter, error: matterError } = await supabase
    .from('matters')
    .insert({
      advocate_id: firm.advocate_id, // Link to advocate who owns the firm
      firm_id: data.firm_id,
      title: data.title,
      description: data.description,
      matter_type: data.matter_type,
      urgency: data.urgency_level,
      status: 'new_request',
      client_name: user.user_metadata.attorney_name || 'Unknown',
      client_email: user.email,
      instructing_attorney: user.user_metadata.attorney_name || 'Unknown',
      instructing_firm: firm.firm_name
    })
    .select()
    .single();
  
  if (matterError) throw matterError;
  
  // 4. Handle document uploads if provided
  if (data.documents && data.documents.length > 0) {
    // Upload to storage and link to matter
    // Implementation depends on your storage setup
  }
  
  toast.success('Matter request submitted successfully');
  return matter;
}
```

---

## Routing Updates

**Location:** `src/AppRouter.tsx`

### New Public Routes:

```typescript
// Add to public routes section (before authenticated routes)
<Route path="/register-firm" element={<AttorneyRegisterPage />} />
<Route path="/submit-matter-request" element={
  <ProtectedRoute requireAuth={true}>
    <SubmitMatterRequestPage />
  </ProtectedRoute>
} />
```

**Note:** `/register-firm` is public (no auth required), but `/submit-matter-request` requires authentication.

---

## Error Handling

### Token Verification Errors

```typescript
try {
  await attorneyService.verifyInvitationToken(firmId, token);
} catch (error) {
  if (error.message.includes('expired')) {
    setError('This invitation link has expired. Please contact the advocate for a new invitation.');
  } else if (error.message.includes('already been used')) {
    setError('This invitation has already been used. If you need access, please log in or contact the advocate.');
  } else {
    setError('Invalid invitation link. Please check the link and try again.');
  }
}
```

### Registration Errors

```typescript
try {
  await attorneyService.registerViaInvitation(formData);
} catch (error) {
  if (error.message.includes('already registered')) {
    setError('An account with this email already exists. Please log in instead.');
  } else if (error.message.includes('weak password')) {
    setError('Password is too weak. Please use at least 8 characters with numbers and symbols.');
  } else {
    setError('Registration failed. Please try again or contact support.');
  }
}
```

---

## Testing Strategy

### Unit Tests

1. **Token Generation:**
   - Test token is cryptographically secure
   - Test expiration date is set correctly
   - Test token is stored in database

2. **Token Verification:**
   - Test valid token passes
   - Test expired token fails
   - Test used token fails
   - Test invalid token fails

3. **Registration:**
   - Test successful registration flow
   - Test duplicate email handling
   - Test password validation

### Integration Tests

1. **End-to-End Invitation Flow:**
   - Advocate generates invitation
   - Attorney registers via link
   - Attorney submits matter request
   - Advocate sees new matter

2. **Error Scenarios:**
   - Expired token handling
   - Network failure recovery
   - Invalid form data

### Manual Testing Checklist

- [ ] Generate invitation link from FirmsPage
- [ ] Copy link works correctly
- [ ] Link opens registration page
- [ ] Firm name displays correctly
- [ ] Registration form validates inputs
- [ ] Password confirmation works
- [ ] Registration creates user account
- [ ] Redirect to matter request page works
- [ ] Matter request form submits correctly
- [ ] Matter appears on advocate's MattersPage
- [ ] Matter shows correct firm linkage

---

## Security Considerations

### Token Security

1. **Generation:** Use cryptographically secure random generation
2. **Storage:** Store hashed tokens (optional, but recommended)
3. **Transmission:** Always use HTTPS
4. **Expiration:** Default 7 days, configurable
5. **Single-use:** Mark as used after successful registration

### Rate Limiting

1. **Token Generation:** Max 5 invitations per firm per hour
2. **Token Verification:** Max 10 attempts per IP per hour
3. **Registration:** Max 3 attempts per email per day

### Input Validation

1. **Email:** Valid format, not already registered
2. **Password:** Minimum 8 characters, complexity requirements
3. **Phone:** Valid format (optional)
4. **Matter Description:** Max length, sanitize HTML

---

## Performance Considerations

### Database Indexes

```sql
CREATE INDEX idx_firms_invitation_token ON firms(invitation_token) 
WHERE invitation_token IS NOT NULL;

CREATE INDEX idx_matters_status ON matters(status) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_firm_id_status ON matters(firm_id, status) 
WHERE deleted_at IS NULL;
```

### Caching

- Cache firm data during registration flow (avoid multiple DB calls)
- Cache user session data after registration

### Optimization

- Lazy load document upload functionality
- Paginate matter requests list
- Use optimistic UI updates for better perceived performance

---

## Accessibility

### Keyboard Navigation

- All forms fully keyboard navigable
- Tab order follows logical flow
- Enter key submits forms
- Escape key closes modals

### Screen Readers

- ARIA labels on all form inputs
- Error messages announced
- Success states announced
- Loading states announced

### Visual Design

- High contrast text
- Clear focus indicators
- Large touch targets (min 44x44px)
- Responsive design for mobile

---

## Future Enhancements

### Phase 2 Features (Not in MVP)

1. **Email Integration:** Auto-send invitation emails
2. **SMS Integration:** Send invitation via SMS
3. **Bulk Invitations:** Invite multiple attorneys at once
4. **Invitation History:** Track all sent invitations
5. **Custom Expiration:** Allow advocates to set custom expiration
6. **Resend Invitation:** Easy resend with new token
7. **Attorney Dashboard:** Portal for attorneys to view their matters
8. **Matter Status Updates:** Notify attorneys of status changes

