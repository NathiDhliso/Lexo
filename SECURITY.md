# Security Best Practices & Guidelines

## Overview
This document outlines security best practices for the LexoHub application, addressing identified vulnerabilities and establishing secure development standards.

---

## 🔐 Critical Security Issues Addressed

### 1. AWS Credentials Management ✅ FIXED

**Previous Issue**: Hardcoded AWS credentials in `.env` file  
**Status**: File removed from version control, credentials to be rotated

#### Current Best Practices:

**Development Environment**:
```bash
# Use local .env file (never commit)
VITE_AWS_ACCESS_KEY_ID=your_dev_key
VITE_AWS_SECRET_ACCESS_KEY=your_dev_secret
```

**Production Environment**:
- Use AWS IAM roles attached to EC2/ECS instances
- Use AWS Secrets Manager for credential storage
- Rotate credentials every 90 days
- Use least-privilege IAM policies

**Recommended IAM Policy Structure**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::lexohub-documents/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/*"
    }
  ]
}
```

---

### 2. Browser-Based Credential Testing ✅ REMOVED

**Previous Issue**: `test-aws-credentials.html` exposed credential testing in browser  
**Action Taken**: File deleted  
**Alternative**: Use `verify-aws-setup.ps1` for secure CLI-based validation

---

### 3. Environment Variable Security

#### Rules:
1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use `.env.example`** - Template without sensitive values
3. **Validate on startup** - Check for required variables
4. **Rotate regularly** - Change credentials every 90 days

#### Environment Variable Checklist:
- [ ] All sensitive values in `.env` (not committed)
- [ ] `.env.example` updated with new variables (no values)
- [ ] Production uses secure secret management
- [ ] Development team has access to dev credentials
- [ ] Credentials rotated on team member departure

---

## 🛡️ Application Security

### 1. Authentication & Authorization

#### Supabase Auth Configuration:
```typescript
// src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

#### Protected Routes:
- All routes wrapped in `<ProtectedRoute>` component
- Session validation on every request
- Automatic redirect to login on auth failure

#### Row Level Security (RLS):
- All database tables have RLS enabled
- Policies enforce user-level data isolation
- Regular RLS policy audits (see TECHNICAL_DEBT.md)

---

### 2. API Security

#### Request Validation:
```typescript
// All API requests use Zod schemas
import { z } from 'zod';

const CreateMatterSchema = z.object({
  title: z.string().min(1).max(200),
  attorney_id: z.string().uuid(),
  // ... other fields
});

// Validate before processing
const validated = CreateMatterSchema.parse(requestData);
```

#### Rate Limiting:
```typescript
// Implemented in auth.service.ts
VITE_AUTH_SIGNIN_MAX_ATTEMPTS=5
VITE_AUTH_SIGNIN_WINDOW_MS=60000
VITE_AUTH_SIGNUP_MAX_ATTEMPTS=3
VITE_AUTH_SIGNUP_WINDOW_MS=300000
```

#### CORS Configuration:
```json
// s3-cors-config.json
{
  "AllowedOrigins": [
    "http://localhost:5173",
    "https://*.vercel.app"
  ],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}
```

---

### 3. Data Protection

#### Sensitive Data Handling:
- **PII**: Attorney names, contact info, case details
- **Financial**: Invoice amounts, payment details, trust account balances
- **Legal**: Case documents, briefs, engagement agreements

#### Encryption:
- **In Transit**: HTTPS/TLS for all communications
- **At Rest**: Supabase encryption for database
- **S3**: Server-side encryption enabled

#### Data Retention:
- Audit logs: 7 years (legal requirement)
- Financial records: 7 years (tax requirement)
- Case files: Per client agreement
- User data: Until account deletion + 30 days

---

### 4. File Upload Security

#### Allowed File Types:
```typescript
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

#### Upload Validation:
1. Check file size
2. Validate MIME type
3. Scan for malware (recommended: AWS GuardDuty)
4. Generate unique filename (UUID)
5. Store in isolated S3 bucket

#### S3 Bucket Security:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::lexohub-documents/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

---

## 🔍 Security Monitoring

### 1. Logging & Auditing

#### What to Log:
- Authentication attempts (success/failure)
- Authorization failures
- Data access (who accessed what)
- Data modifications (who changed what)
- File uploads/downloads
- Payment transactions
- Admin actions

#### Audit Trail Implementation:
```sql
-- supabase/migrations/20250111000005_add_attorney_portal.sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Log Retention:
- Security logs: 1 year minimum
- Audit logs: 7 years (legal requirement)
- Application logs: 90 days

---

### 2. Vulnerability Scanning

#### Automated Scans:
```bash
# NPM audit (run weekly)
npm audit

# Dependency updates (run monthly)
npm outdated
npm update

# OWASP Dependency Check (recommended)
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm --output-file bom.json
```

#### Manual Security Reviews:
- Code review for all PRs
- Security-focused review for auth/payment code
- Quarterly penetration testing (recommended)

---

### 3. Incident Response

#### Security Incident Procedure:
1. **Detect**: Monitor logs, alerts, user reports
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerability, rotate credentials
5. **Document**: Record incident details
6. **Review**: Post-mortem analysis

#### Emergency Contacts:
- Security Lead: [To be assigned]
- DevOps Lead: [To be assigned]
- Legal Counsel: [To be assigned]

---

## 🚨 Security Checklist for Developers

### Before Committing Code:
- [ ] No hardcoded credentials or API keys
- [ ] No console.log with sensitive data
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (Supabase handles this)
- [ ] Error messages don't leak sensitive info

### Before Deploying:
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Regular Maintenance:
- [ ] Weekly: npm audit
- [ ] Monthly: Dependency updates
- [ ] Quarterly: Security review
- [ ] Annually: Penetration testing

---

## 📚 Security Resources

### Internal Documentation:
- [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) - Technical debt tracking
- [SYSTEM_PROMPT.md](./SYSTEM_PROMPT.md) - System architecture

### External Resources:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

### Compliance:
- POPIA (Protection of Personal Information Act) - South Africa
- GDPR (if serving EU clients)
- PCI DSS (for payment processing)

---

## 🔄 Security Review Schedule

- **Daily**: Automated vulnerability scans
- **Weekly**: Security log review
- **Monthly**: Dependency updates
- **Quarterly**: Security audit
- **Annually**: Penetration testing

---

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email: security@lexohub.co.za (to be set up)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

We will respond within 24 hours and provide updates every 48 hours until resolved.

---

**Last Updated**: 2025-01-12  
**Next Review**: 2025-04-12  
**Document Owner**: Security Team
