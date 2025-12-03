# Contribution Readiness Checklist

Use this checklist before opening a pull request. It keeps contributions consistent and reduces review cycles.

## Planning

- [ ] Confirm the feature or fix aligns with the project roadmap or an approved issue.
- [ ] Capture requirements, acceptance criteria, and edge cases in the related issue.
- [ ] Review relevant architecture docs under `.codex/memories/` for affected domains.

## Implementation

- [ ] Follow existing patterns for services, controllers, procedures, and UI components.
- [ ] Add TSDoc comments for new exported functions, classes, or React components.
- [ ] Keep configuration changes documented and reversible.
- [ ] Update feature flags or environment variables documentation when new ones are introduced.

## Validation

- [ ] Run `npm run lint` and ensure no errors remain.
- [ ] Run `npm run typecheck` and fix all TypeScript violations.
- [ ] Run `npm test` and add coverage for new logic.
- [ ] Manual test critical paths touched by your changes; describe the steps in the PR.

## Documentation & Metadata

- [ ] Update `README.md` or other docs for user-facing changes.
- [ ] Add migration guides or schema notes when updating Prisma or infrastructure.
- [ ] Ensure issue references and labels are accurate.
- [ ] Attach screenshots or recordings for UI updates.

## Pull Request Preparation

- [ ] Rebase onto the latest `main` and resolve conflicts locally.
- [ ] Fill out every section of the PR template.
- [ ] Summarize testing results and risks clearly.
- [ ] Request review from maintainers and subject-matter experts as needed.
