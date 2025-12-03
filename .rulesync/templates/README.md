# `.rulesync/templates/` - Standardized Templates Guide

This directory contains standardized templates for all recurring documentation and tracking files used in SaaS Boilerplate projects. Using these templates ensures consistency, clarity, and efficiency across all projects.

## Available Templates

### 1. **PROJECT_MEMORY.md**
**Location**: `.rulesync/templates/PROJECT_MEMORY.md`
**Usage**: Copy to project root as `PROJECT_MEMORY.md`
**Purpose**: Central repository for project evolution, personas, decisions, and time tracking

**Key Sections**:
- Target Audience & Personas (required for all copy, UX, UI decisions)
- Project Overview
- Schedule and Time (timestamped historical log)
- Customized Features (with implementation time)
- Architectural Decisions
- Pending work with priorities
- General notes and patterns

**When to Update**:
- At end of each work session
- After major features/decisions
- When user feedback requires persona updates
- Monthly review of personas and metrics

### 2. **USER_MEMORY.md**
**Location**: `.rulesync/templates/USER_MEMORY.md`
**Usage**: Copy to project root as `USER_MEMORY.md`
**Purpose**: Track user profile, preferences, performance patterns for better personalization

**Key Sections**:
- User Profile (name, type, experience, timezone, availability)
- Preferences and work style
- Interaction and task history (with time data)
- Performance Metrics (average duration, estimation accuracy)
- Patterns and special notes
- Communication history
- Project-specific preferences

**Time Tracking Features**:
- Track estimated vs actual time per interaction
- Build performance metrics over time
- Identify patterns in task estimation

**When to Update**:
- After each significant interaction
- When new user patterns emerge
- When user preferences change
- Quarterly review of metrics

### 3. **PROPOSAL.md**
**Location**: `.rulesync/templates/PROPOSAL.md`
**Usage**: Copy to `.specs/changes/[feature-name]/PROPOSAL.md` for each feature
**Purpose**: Define feature rationale, objectives, and comprehensive time tracking

**Key Sections**:
- Why (problem/opportunity)
- What (implementation details)
- Thesis (core idea/hypothesis)
- Objective (measurable outcome)
- Time Tracking Table (estimated vs actual for each phase)
- Insights & Learnings
- Next Steps

**Time Tracking Table**:
| Phase | Task | Estimated | Actual | Notes |
|-------|------|-----------|--------|-------|
| Research | Investigation & Analysis | [Xh] | [Yh] | [Details] |
| Planning | Design & Architecture | [Xh] | [Yh] | [Details] |
| Implementation | Core Development | [Xh] | [Yh] | [Details] |
| Testing | QA & Validation | [Xh] | [Yh] | [Details] |
| Documentation | Docs & Communication | [Xh] | [Yh] | [Details] |

**Usage Pattern**:
1. Create proposal with estimated hours based on PROJECT_MEMORY.md historical patterns
2. During implementation, track actual time spent on each phase
3. At completion, calculate variance and document learnings
4. Update PROJECT_MEMORY.md with new patterns learned

### 4. **TASKS.md**
**Location**: `.rulesync/templates/TASKS.md`
**Usage**: Copy to `.specs/changes/[feature-name]/TASKS.md` for task breakdowns
**Purpose**: Detailed task tracking with time estimates for each task and phase

**Key Sections**:
- Overview of what the task set accomplishes
- Status Summary (progress, time spent, remaining)
- Tasks Checklist (organized by phases)
- Time Tracking Summary Table
- Efficiency Metrics (accuracy, velocity, blockers)
- Lessons Learned
- Status Updates Log

**Task Format**:
```
- [ ] Task Name: [Description]
  - Estimated: [Xh] | Actual: [Yh] | Status: [not-started/in-progress/completed]
  - Notes: [Any relevant details]
```

**When to Use**:
- Breaking down large features into detailed tasks
- Projects that benefit from granular tracking
- Features with multiple parallel work streams

### 5. **FEATURE_CHECKLIST.md**
**Location**: `.rulesync/templates/FEATURE_CHECKLIST.md`
**Usage**: Copy to `.specs/changes/[feature-name]/FEATURE_CHECKLIST.md` for substantial features
**Purpose**: Comprehensive implementation tracking covering all aspects of feature delivery

**Key Sections**:
- Core Implementation (code, tests, review)
- Type Safety & Validation (TypeScript, Zod schemas)
- Documentation (updates, technical docs, help center)
- Database & Data (schema, migrations)
- API & Integration (endpoints, MCP tools)
- UI/UX Implementation (components, experience)
- Performance & Quality (optimization, security, code quality)
- Deployment & Release
- Time Summary with accuracy metrics

**Coverage**:
- Every section has estimated and actual time fields
- Tracks approximately 40+ sub-tasks across feature lifecycle
- Connects to documentation requirements and personas

## Best Practices for Using Templates

### 1. **Time Tracking Discipline**
- Always fill in estimated hours BEFORE starting work (based on historical patterns)
- Track actual time as work progresses
- Record blockers and their resolution time
- Calculate variance at completion

### 2. **Personas-First Approach**
- Consult TARGET AUDIENCE & PERSONAS section in PROJECT_MEMORY.md before any decision
- Reference personas when writing copy, designing UX, creating docs
- Update personas when user feedback changes understanding

### 3. **Historical Data Accumulation**
- Each project/task builds knowledge for future estimates
- Track patterns like "Documentation: avg 0.5h per article"
- Use USER_MEMORY.md performance metrics to refine user-specific estimates
- Reference PROJECT_MEMORY.md for similar feature patterns

### 4. **Timestamp Everything**
- Use format: `[YYYY-MM-DD HH:MM:SS]`
- Helps track temporal patterns and bottlenecks
- Enables velocity calculations

### 5. **Never Lose History**
- Templates are append-only structures
- Delete nothing, only add and mark as completed
- Preserve all historical entries for pattern analysis

## Integration with AGENTS.md

All templates are referenced in AGENTS.md (Section 10 and Section 11) as the system foundation for:
- Spec-Driven Development process
- Memory-based personalization
- Time estimation refinement
- Consistent documentation across projects

## Creating a New Project

When starting a new SaaS Boilerplate project:

1. Copy `.rulesync/templates/PROJECT_MEMORY.md` → `PROJECT_MEMORY.md`
2. Copy `.rulesync/templates/USER_MEMORY.md` → `USER_MEMORY.md`
3. Fill in project and user details in onboarding conversation
4. For each feature:
   - Copy `.rulesync/templates/PROPOSAL.md` → `.specs/changes/[feature-name]/PROPOSAL.md`
   - Copy `.rulesync/templates/TASKS.md` → `.specs/changes/[feature-name]/TASKS.md` (if needed)
   - Copy `.rulesync/templates/FEATURE_CHECKLIST.md` → `.specs/changes/[feature-name]/FEATURE_CHECKLIST.md` (for substantial features)

## Example: Time Tracking Workflow

```
1. PROPOSAL.md created with estimated times (based on PROJECT_MEMORY.md patterns)
   - Research: 2h (similar investigation took 1.5-2.5h)
   - Implementation: 4h (similar CRUD feature took 3-5h)
   - Testing: 1.5h (QA usually takes 1-2h)

2. During implementation, update actual times:
   - Research: Actual 2.5h (research more complex than expected)
   - Implementation: Actual 3.5h (less complexity, good reusability)
   - Testing: Actual 1.2h (good test coverage, few issues)

3. At completion, record in PROJECT_MEMORY.md:
   - Pattern: "Documentation features: avg 3.2h implementation"
   - Variance: +0.7h on research, -0.3h on implementation overall

4. For next similar feature, use improved estimate: 3-3.5h instead of 3-5h
```

## Tips for Accuracy

- **Start with broad estimates**: First features use 20-30% buffers
- **Refine over time**: After 3-5 similar features, estimates become accurate within 10%
- **Track blockers**: Document time spent on unexpected issues
- **Update personas regularly**: As you learn user preferences, update PROJECT_MEMORY.md
- **Review patterns quarterly**: Look for trends in estimation accuracy

---

For more details, see AGENTS.md Section 10 (Persistent Memory Maintenance).
