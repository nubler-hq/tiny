# SaaS Boilerplate Changelog

## 1.0.1

### Patch Changes

- fix(hooks): align RHF v7.66 and Zod v4 types in `use-form-with-zod`

  - Use `z.input`/`z.output` generics for resolver compatibility
  - Type `defaultValues` with `DefaultValues<T>` and `onSubmit` with `SubmitHandler<T>`
  - Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`
  - No runtime behavior change; typing-only fix

## 1.0.0

### Major Changes

- [`29dd78e`](https://github.com/vibe-dev/saas-boilerplate/commit/29dd78e1aa142f9b7a0bfa2c392372056f8a3f84) Thanks [@felipebarcelospro](https://github.com/felipebarcelospro)! - **SaaS Boilerplate v1.0.0 - Professional Version Management & Complete Feature Set**

  This release establishes professional version management with automated changelog generation and comprehensive feature baseline documentation.

  ### 🎯 Version Management System

  **Implemented Changesets for automated versioning:**

  - Automated CHANGELOG.md generation from conventional commits
  - GitHub Releases automation with comprehensive notes
  - Semantic versioning enforcement
  - Professional release workflow via GitHub Actions

  **Lia AI Agent responsibilities:**

  - Full ownership of version management
  - Conventional commits enforcement
  - Changeset creation for all significant changes
  - Release validation and monitoring

  ### 🚀 Complete Feature Baseline

  **Authentication & Authorization**

  - Better Auth with 15+ OAuth providers (Google, GitHub, Discord, etc.)
  - Multi-tenant organization system with RBAC
  - Email verification and password reset
  - Session management with auto-refresh

  **Billing & Subscriptions**

  - Stripe integration for payments
  - Flexible plan management
  - Trial period support (14 days default)
  - Usage-based billing
  - Invoice history

  **Multi-Tenancy**

  - Organization-based data isolation
  - Team member management with roles
  - Invitation system with email notifications
  - Granular permissions (owner, admin, member)

  **API & Backend Infrastructure**

  - Igniter.js for type-safe APIs
  - Automated OpenAPI documentation
  - Built-in MCP (Model Context Protocol) server
  - Real-time notifications via SSE
  - Background jobs with BullMQ
  - Redis caching

  **Developer Experience**

  - Next.js 16 with App Router
  - Full TypeScript support
  - Prisma ORM for PostgreSQL
  - Tailwind CSS + shadcn/ui
  - FumaDocs documentation system
  - Hot module replacement

  **AI & Automation**

  - Lia AI agent for development assistance
  - Code Intelligence tools (analyze_file, find_implementation, trace_dependency_chain)
  - Browser automation for E2E testing
  - Next.js Runtime Intelligence (get_errors, get_page_metadata, get_logs)
  - Error-first debugging workflow

  **Integrations & Plugins**

  - Plugin manager system
  - Discord, Slack, Telegram webhooks
  - Mailchimp, Make, Zapier connectors
  - Email (Resend/NodeMailer)
  - S3-compatible storage

  **Content & Documentation**

  - MDX-based content layer
  - Blog system with categories
  - Help center with search
  - Update notes system
  - Multi-language ready

  ### 💡 Recent Enhancements

  **Next.js MCP Server Integration** (added 2025-10-24)

  - Real-time error detection with source maps
  - Complete page rendering hierarchy analysis
  - Development log file access
  - Server Action tracing capabilities
  - 10x faster debugging workflow

  **Professional Workflow** (added 2025-10-24)

  - Changesets for version management
  - Automated changelog generation
  - GitHub Actions for releases
  - Conventional commits standard

  ### 📚 Migration from v2.0.3

  This release **resets the version to 1.0.0** to establish a clean baseline with professional version management. All features from v2.0.3 are included and enhanced. No breaking changes to functionality - only improved versioning infrastructure.

  ### 🔗 Links

  - [Documentation](https://demo.saas-boilerplate.vibedev.com.br/docs)
  - [GitHub Repository](https://github.com/vibe-dev/saas-boilerplate)
  - [Demo](https://demo.saas-boilerplate.vibedev.com.br)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-10-24

### Initial Release

Welcome to SaaS Boilerplate v1.0.0! This is the first official release with automated versioning and changelog management.

#### Core Features

**Authentication & Authorization**

- Better Auth integration with 15+ providers (Google, GitHub, Discord, etc.)
- Multi-tenant organization system with role-based access control
- Session management with automatic refresh
- Email verification and password reset flows
- OAuth2 social authentication

**Billing & Subscriptions**

- Stripe integration for payment processing
- Flexible plan management system
- Trial period support (14 days default)
- Usage-based billing capabilities
- Subscription lifecycle management
- Invoice and payment history

**Multi-Tenancy**

- Organization-based isolation
- Team member management
- Invitation system with email notifications
- Role-based permissions (owner, admin, member)
- Organization settings and customization

**API & Backend**

- Igniter.js framework for type-safe APIs
- Automated OpenAPI documentation generation
- Built-in MCP (Model Context Protocol) server
- Real-time notifications via Server-Sent Events (SSE)
- Background job processing with BullMQ
- Redis caching and session storage

**Developer Experience**

- Next.js 16 with App Router
- TypeScript throughout
- Prisma ORM for database
- Tailwind CSS + shadcn/ui components
- FumaDocs for documentation
- Hot module replacement in development
- Comprehensive type safety

**Integrations**

- Plugin manager system
- Discord, Slack, Telegram webhooks
- Mailchimp, Make, Zapier connectors
- Email service (Resend/NodeMailer)
- File storage (S3-compatible)

**AI & Automation**

- Lia AI agent for development assistance
- Code Intelligence tools
- Browser automation for E2E testing
- Next.js Runtime Intelligence
- Automated error detection and debugging

**Content & Documentation**

- MDX-based content layer
- Blog system
- Help center
- API documentation
- Update notes system
- Multi-language support ready

#### Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Igniter.js, Better Auth
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis, BullMQ
- **Payments**: Stripe
- **Email**: Resend / NodeMailer
- **Storage**: AWS S3 / MinIO
- **Infrastructure**: Docker, Docker Compose

#### Migration from v2.0.3

This release resets the version to 1.0.0 to establish a clean baseline for automated version management. All features from v2.0.3 are included and enhanced.

**What's New:**

- ✅ Automated version management with Changesets
- ✅ Professional CHANGELOG.md generation
- ✅ GitHub Releases automation
- ✅ Conventional commits enforcement
- ✅ Next.js MCP Server integration
- ✅ Enhanced error diagnostics
- ✅ Improved developer workflow

[unreleased]: https://github.com/vibe-dev/saas-boilerplate/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/vibe-dev/saas-boilerplate/releases/tag/v1.0.0
