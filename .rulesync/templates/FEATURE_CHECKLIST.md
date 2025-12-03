# Feature Implementation Checklist Template

Use this template for tracking implementation of any substantial feature in the SaaS Boilerplate.

## Core Implementation
- [ ] **Code Implementation**
  - [ ] Main feature code written
  - [ ] Business logic implemented
  - [ ] Error handling added
  - [ ] Edge cases considered
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Testing**
  - [ ] Unit tests written
  - [ ] Integration tests added
  - [ ] Manual testing completed
  - [ ] Edge cases tested
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Code Review**
  - [ ] Self-review completed
  - [ ] Peer review (if applicable)
  - [ ] Architecture aligned with SaaS Boilerplate patterns
  - Estimated: [Xh] | Actual: [Yh]

## Type Safety & Validation
- [ ] **TypeScript Types**
  - [ ] Full type coverage
  - [ ] No implicit `any`
  - [ ] Types properly exported
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Validation Schemas**
  - [ ] Zod schemas created
  - [ ] Input validation in procedures
  - [ ] Error messages clear
  - Estimated: [Xh] | Actual: [Yh]

## Documentation - Substantial Features
- [ ] **Updates Posts**
  - [ ] Post created in `src/content/updates/`
  - [ ] Following `.rulesync/rules/docs_updates.md` guidelines
  - [ ] Adapted to project personas from PROJECT_MEMORY.md
  - [ ] Images/screenshots added if needed
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Technical Documentation**
  - [ ] Article added to `src/content/docs/`
  - [ ] Following `.rulesync/rules/docs_articles.md` guidelines
  - [ ] Audience mapping applied from PROJECT_MEMORY.md personas
  - [ ] Code examples included and tested
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Help Center**
  - [ ] User guides added to `src/content/help/`
  - [ ] Step-by-step instructions with visuals
  - [ ] Business user perspective considered
  - Estimated: [Xh] | Actual: [Yh]

## Database & Data
- [ ] **Schema Updates**
  - [ ] Prisma schema updated
  - [ ] Migrations created
  - [ ] Backward compatibility considered
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Data Handling**
  - [ ] Seed data added if needed
  - [ ] Data validation implemented
  - [ ] Performance optimized
  - Estimated: [Xh] | Actual: [Yh]

## API & Integration
- [ ] **API Implementation**
  - [ ] Endpoints created following Igniter.js patterns
  - [ ] Query/mutation controllers implemented
  - [ ] Request/response types defined
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **MCP Integration** (if applicable)
  - [ ] Controllers exposed as MCP tools
  - [ ] Tool descriptions clear
  - [ ] Parameters properly documented
  - Estimated: [Xh] | Actual: [Yh]

## UI/UX Implementation
- [ ] **Components**
  - [ ] UI components created/updated
  - [ ] Responsive design verified
  - [ ] Accessibility checked
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **User Experience**
  - [ ] User flow aligned with personas
  - [ ] Error states handled gracefully
  - [ ] Loading states visible
  - [ ] Confirmation dialogs where needed
  - Estimated: [Xh] | Actual: [Yh]

## Performance & Quality
- [ ] **Performance**
  - [ ] No N+1 queries
  - [ ] Database queries optimized
  - [ ] Bundle size impact assessed
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Security**
  - [ ] Authentication required
  - [ ] Authorization checked
  - [ ] Input sanitized
  - [ ] CSRF protection in place
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Code Quality**
  - [ ] Follows project conventions
  - [ ] No console.logs left
  - [ ] Comments added for complex logic
  - [ ] Linting passes
  - Estimated: [Xh] | Actual: [Yh]

## Deployment & Release
- [ ] **Deployment Ready**
  - [ ] Environment variables documented
  - [ ] Secrets managed properly
  - [ ] Database migrations tested
  - Estimated: [Xh] | Actual: [Yh]

- [ ] **Release Documentation**
  - [ ] CHANGELOG updated
  - [ ] Release notes prepared
  - [ ] Breaking changes documented
  - Estimated: [Xh] | Actual: [Yh]

## Time Summary
- **Total Estimated**: [Xh]
- **Total Actual**: [Yh]
- **Variance**: [+/- Yh]
- **Accuracy**: [%]

## Notes & Learnings
- [Key insights from this implementation]
- [What went well]
- [What could be improved for future features]
