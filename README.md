# LexoHub - Legal Practice Management System

> A comprehensive legal practice management system for South African advocates, focusing on the complete workflow from client engagement to payment collection.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-48%25-yellow)](docs/TESTING_STRATEGY.md)
[![Refactor Status](https://img.shields.io/badge/Refactor-100%25%20Complete-success)](REFACTOR_COMPLETE.md)

> **🎉 Major Update:** Complete 10-iteration refactoring completed! See [REFACTOR_INDEX.md](REFACTOR_INDEX.md) for details.

---

## 🎯 Overview

LexoHub is a production-ready legal practice management system designed specifically for South African advocates. It implements a complete 3-step workflow:

```
Pro Forma (Quote) → Matter (Case Management) → Invoice (Billing & Payment)
```

### Key Features

- **Pro Forma Management**: Create and manage legal service quotes
- **Matter Management**: Track cases with WIP (Work in Progress) accumulation
- **Invoice Generation**: Auto-generate invoices from matter data
- **Payment Tracking**: Monitor payments, disputes, and credit notes
- **Retainer & Trust Accounts**: Manage client retainers and trust funds
- **Engagement Agreements**: Digital signature workflows
- **Attorney Portal**: Client-facing portal for attorneys
- **PDF Customization**: Visual PDF template editor with 8 professional presets
- **Cloud Storage Integration**: OneDrive, Google Drive, Dropbox, Box
- **Subscription Management**: Multi-tier subscription system with PayFast/Paystack

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (remote database)
- AWS account (for S3, SES, Bedrock)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lexohub.git
cd lexohub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Environment Setup

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

**Required Environment Variables**:
```bash
# Supabase (Remote Database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS Services
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_S3_BUCKET=your_bucket_name

# See .env.example for complete list
```

⚠️ **Security Note**: Never commit `.env` files. Use AWS IAM roles in production.

---

## 📚 Documentation

### Core Documentation
- **[SYSTEM_PROMPT.md](SYSTEM_PROMPT.md)** - Complete system architecture and workflow
- **[SECURITY.md](SECURITY.md)** - Security best practices and guidelines
- **[TECHNICAL_DEBT.md](TECHNICAL_DEBT.md)** - Technical debt tracking and remediation plan

### Development Guides
- **[docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md)** - Comprehensive testing strategy
- **[docs/COMPONENT_REFACTORING_PLAN.md](docs/COMPONENT_REFACTORING_PLAN.md)** - Component refactoring guidelines
- **[.kiro/specs/](. kiro/specs/)** - Feature specifications and roadmap

---

## 🏗️ Architecture

### Technology Stack

**Frontend**:
- React 18.3 with TypeScript 5.5
- Vite 5.4 (build tool)
- TailwindCSS 3.4 (styling)
- React Router 7.9 (routing)
- TanStack Query 5.90 (data fetching)
- React Hook Form 7.63 (forms)
- Zod 4.1 (validation)

**Backend**:
- Supabase (PostgreSQL database, authentication, storage)
- Row Level Security (RLS) for data isolation

**Cloud Services**:
- AWS S3 (document storage)
- AWS SES (email delivery)
- AWS Bedrock (AI document processing)
- AWS Textract (document analysis)

**Testing**:
- Vitest 3.2 (unit tests)
- Playwright 1.56 (E2E tests)
- Testing Library 16.3 (component tests)

### Database Schema

25 tables supporting complete legal practice workflow:

**Core Tables**:
- `advocates` - User profiles
- `proforma_requests` - Pro forma quotes
- `matters` - Legal matters/cases
- `time_entries` - Time tracking
- `expenses` - Expense tracking
- `invoices` - Invoices
- `payments` - Payment records

**Advanced Features**:
- `engagement_agreements` - Client agreements
- `scope_amendments` - Scope changes
- `retainer_agreements` - Retainer contracts
- `trust_transactions` - Trust account ledger
- `payment_disputes` - Dispute management
- `credit_notes` - Invoice adjustments
- `attorney_users` - Attorney portal
- `audit_log` - Complete audit trail

See [SYSTEM_PROMPT.md](SYSTEM_PROMPT.md) for complete schema documentation.

---

## 🧪 Testing

### Current Test Coverage

- **E2E Tests**: 30/62 passing (48%) - [See improvement plan](docs/TESTING_STRATEGY.md)
- **Unit Tests**: Minimal coverage - [See implementation plan](docs/TESTING_STRATEGY.md)
- **Target Coverage**: 75% overall, 80% for services

### Running Tests

```bash
# Unit tests
npm run test              # Run all unit tests
npm run test:ui           # Run with UI
npm run test:coverage     # Generate coverage report

# E2E tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run in headed mode
npm run test:e2e:debug    # Debug mode
npm run test:e2e:report   # View test report

# Linting
npm run lint              # Run ESLint
npm run typecheck         # TypeScript type checking
```

### Test Implementation Status

See [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) for detailed test implementation plan.

---

## 🔒 Security

### Security Measures

- ✅ Row Level Security (RLS) on all database tables
- ✅ JWT-based authentication via Supabase
- ✅ HTTPS/TLS for all communications
- ✅ Input validation with Zod schemas
- ✅ Rate limiting on authentication endpoints
- ✅ CORS configuration for API access
- ✅ Audit logging for all critical actions

### Security Best Practices

1. **Never commit credentials** - Use `.env` files (already in `.gitignore`)
2. **Use IAM roles in production** - Avoid hardcoded AWS credentials
3. **Rotate credentials regularly** - Every 90 days minimum
4. **Follow least-privilege principle** - Grant minimum required permissions
5. **Monitor security logs** - Review audit logs regularly

See [SECURITY.md](SECURITY.md) for complete security guidelines.

### Reporting Security Issues

If you discover a security vulnerability, please email: security@lexohub.co.za

**DO NOT** create public GitHub issues for security vulnerabilities.

---

## 🛠️ Development

### Project Structure

```
lexohub/
├── src/
│   ├── components/        # React components (27 subdirectories)
│   ├── pages/            # Page components (30+ pages)
│   ├── services/         # Business logic (23+ services)
│   ├── hooks/            # Custom React hooks (17 hooks)
│   ├── contexts/         # React contexts (Auth, Theme, Modal)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── lib/              # Third-party library setup
│   └── styles/           # CSS stylesheets
├── supabase/
│   └── migrations/       # Database migrations (40 files)
├── tests/                # E2E tests (18 test files)
├── docs/                 # Documentation
├── .kiro/                # Kiro AI assistant specs
└── public/               # Static assets
```

### Code Quality Standards

- **ESLint**: Strict rules enforced (errors, not warnings)
- **TypeScript**: Strict mode enabled
- **Component Size**: < 300 lines per file
- **Test Coverage**: 80% for services, 70% for utilities
- **Code Review**: Required for all PRs

See [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) for improvement roadmap.

### Development Workflow

1. Create feature branch from `develop`
2. Implement feature with tests
3. Run linting and tests locally
4. Create pull request
5. Code review and approval
6. Merge to `develop`
7. Deploy to staging
8. Test in staging
9. Merge to `main` for production

---

## 📦 Deployment

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Environment-Specific Configuration

- **Development**: Local `.env` file
- **Staging**: Environment variables in hosting platform
- **Production**: AWS Secrets Manager or equivalent

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## 🤝 Contributing

### Development Policies

1. **Test Coverage**: All new features must have tests
2. **Component Size**: Components should not exceed 300 lines
3. **Code Quality**: All ESLint errors must be fixed
4. **Documentation**: Update docs for new features
5. **Security**: Follow security best practices

### Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request code review
6. Address review feedback
7. Merge after approval

---

## 📊 Project Status

### Current Status

- **Version**: 1.0.0
- **Status**: Production-ready with known technical debt
- **Test Coverage**: 48% E2E, minimal unit tests
- **Active Development**: Yes

### Roadmap

See [.kiro/specs/COMPLETE_ROADMAP.md](.kiro/specs/COMPLETE_ROADMAP.md) for detailed roadmap.

**Completed**:
- ✅ Core 3-step workflow (Pro Forma → Matter → Invoice)
- ✅ PDF template customization system
- ✅ Attorney portal
- ✅ Retainer & trust account management
- ✅ Cloud storage integration
- ✅ Subscription system

**In Progress**:
- 🔄 Test coverage improvement (48% → 100%)
- 🔄 Component refactoring (large files)
- 🔄 Database RLS consolidation

**Planned**:
- 📋 Calendar integration
- 📋 CSV import tool
- 📋 Smart document linking
- 📋 Advanced reporting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Database by [Supabase](https://supabase.com/)
- Cloud services by [AWS](https://aws.amazon.com/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)

---

## 📞 Support

- **Documentation**: See [docs/](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/your-org/lexohub/issues)
- **Email**: support@lexohub.co.za
- **Security**: security@lexohub.co.za

---

**Last Updated**: 2025-01-12  
**Maintained by**: LexoHub Development Team
