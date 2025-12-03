# Contributing to SaaS Boilerplate

Thanks for your interest in contributing! This guide explains the expectations, tooling, and workflow we follow to keep the project healthy and consistent.

## Quickstart Checklist

- [ ] Review the [Code of Conduct](CODE_OF_CONDUCT.md)
- [ ] Read the [Contribution Checklist](.github/docs/contribution-checklist.md)
- [ ] Install dependencies with `npm install`
- [ ] Run `npm run lint`, `npm run typecheck`, and `npm test` before submitting

## Development Environment

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the app**
   ```bash
   npm run dev
   ```
3. **Run ancillary services (optional)**
   - `npm run docker:up` to start Docker services defined in `docker-compose.yml`
   - `npm run db:migrate:dev` to sync local database schema
   - `npm run db:studio` to open Prisma Studio

## Coding Standards

- **TypeScript first:** All new code must be strongly typed. Keep `tsconfig.json` strictness in mind and avoid `any`.
- **Linting & formatting:** Run `npm run lint` and fix issues with `npm run lint -- --fix` when possible. Align with repository ESLint and Prettier settings; do not introduce ad-hoc configs.
- **TSDoc**: Add TSDoc blocks for exported functions, components, and classes as described in `docs.md`.
- **UI components:** Follow the patterns described in `.codex/memories/frontend.md` and `.codex/memories/data-table.md` when working on front-end features.
- **Igniter.js services:** Align with guidelines in `.codex/memories/igniter-patterns.md` and related documents.

## Branches, Commits, and PRs

- **Branch naming:** Use `type/brief-description` (e.g. `feature/billing-metrics`, `bugfix/login-redirect`).
- **Commits:** Keep commits scoped to a logical change. Reference issue numbers with `#123` when applicable.
- **Pull Requests:** Use the PR template and link relevant issues. Each PR must pass CI and include test coverage for new functionality.

## Testing

- Use `npm test` for unit tests (Vitest).
- Use `npm run typecheck` to validate TypeScript types.
- For database-related changes, include Prisma migrations and describe validation steps.

## Documentation Expectations

- Update `README.md` when user-facing behavior or setup steps change.
- Maintain contributor-facing docs under `.github/docs/`. When creating new modules, include usage notes or architectural decisions.
- Document API changes with OpenAPI specs or usage examples where applicable.
- For licensed customers, note any implications for premium assets or deployment guides.

## Submitting a Pull Request

1. Fork the repository and create a feature branch.
2. Ensure your branch is rebased on `main`.
3. Use the issue templates to track work and link the corresponding issue in your branch or PR description.
4. Run linting, tests, and type checking.
5. Fill out the PR template completely, including testing evidence.
6. Request reviews from maintainers or subject-matter experts.

Premium license holders can reach the core team at `felipe@igniterjs.com` for guidance before submitting significant changes.

Thank you for helping us grow the SaaS Boilerplate ecosystem! Reach out via issues or discussions if you have questions before starting work.
