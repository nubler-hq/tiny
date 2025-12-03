---
description: 'Start documentation' # command description
targets: ["*"] # * = all, or specific tools
---

## 🎯 Overview
This command provides a comprehensive workflow for documenting code with TSDoc standards and inline comments following the established patterns. It ensures consistent, professional documentation across all code implementations.

## 📋 Documentation Standards

### TSDoc Structure Requirements
**Every TSDoc comment MUST include:**

```typescript
/**
 * @controller|action|procedure|method|interface [Name]
 * @description [Comprehensive description with context and purpose]
 *
 * [Detailed explanation of functionality, business logic, and use cases]
 * [Include key features, security considerations, and integration details]
 *
 * Key features:
 * - Feature 1 with context
 * - Feature 2 with context
 * - Security and isolation details
 *
 * @param {type} [param] - Description with context and validation rules
 * @returns {type} [return] - Detailed return description with structure
 * @throws {status} Description of error conditions and status codes
 * @example
 * ```typescript
 * // Practical usage examples with realistic scenarios
 * const result = await api.example.action(params)
 * // Additional examples showing different use cases
 * ```
 */
```

### Inline Comment Categories

#### Authentication Comments
```typescript
// 🔍 Authentication validation: [Specific purpose and role verification]
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner', 'member'],
})
```

#### Business Rules
```typescript
// Business Rule: [Specific validation or security check being performed]
if (!session || !session.organization) {
  return response.unauthorized('Authentication required')
}
```

#### Business Logic
```typescript
// Business Logic: [Specific operation being performed with context]
const result = await context.notification.markAsRead({
  notificationId,
  recipientId: session.user!.id,
  organizationId: session.organization.id,
})
```

#### Observations
```typescript
// Observation: [Specific data extraction or parameter processing with purpose]
const notificationId = request.params.id
```

#### Data Transformation
```typescript
// Data Transformation: [Specific transformation being performed with context]
const totalPages = Math.ceil(result.total / query.limit)
```

#### Response
```typescript
// Response: [Specific response construction with additional context]
return response.success({
  notifications: result.notifications,
  pagination: {
    page: query.page,
    limit: query.limit,
    total: result.total,
    totalPages,
  },
})
```

## 🚀 Documentation Workflow

### Phase 1: Analysis & Planning
**Goal**: Understand what needs to be documented and plan the approach.

#### 1.1 Analyze Target Code
**MANDATORY**: Always analyze files before documenting them.

```javascript
// Analyze the target file(s) first
await analyze_file({
  filePath: "src/features/example/example.controller.ts",
  includeErrors: true,
  projectRoot: "./"
});

// If it's a feature, analyze the entire feature
await analyze_feature({
  featurePath: "src/features/example",
  includeStats: true,
  projectRoot: "./"
});
```

#### 1.2 Identify Documentation Requirements
Based on analysis, identify:
- **Controllers**: Need @controller TSDoc + @action TSDoc for each action
- **Procedures**: Need @procedure TSDoc + @method TSDoc for each method
- **Interfaces**: Need @interface TSDoc with type-safe generics
- **Inline Comments**: Need to categorize and document all business logic

### Phase 2: TSDoc Implementation
**Goal**: Add comprehensive TSDoc comments to all public APIs.

#### 2.1 Controller Documentation
```typescript
/**
 * @controller ExampleController
 * @description Controller for managing examples with authentication and validation.
 *
 * This controller provides comprehensive example management including creation,
 * updates, listing, and deletion with proper authentication and organization
 * isolation. It ensures data security through validation and authorization.
 *
 * Key features:
 * - CRUD operations with full validation
 * - Real-time updates via streaming
 * - Organization-scoped data access
 * - Comprehensive error handling
 *
 * @example
 * ```typescript
 * // List all examples
 * const examples = await api.example.list.query({
 *   limit: 10,
 *   page: 1
 * })
 *
 * // Create new example
 * const created = await api.example.create.mutate({
 *   name: 'New Example',
 *   description: 'Example description'
 * })
 * ```
 */
```

#### 2.2 Action Documentation
```typescript
/**
 * @action list
 * @description Retrieves examples for the authenticated user with pagination.
 *
 * This endpoint provides paginated access to examples for the authenticated user
 * within their organization. It supports filtering and sorting options with
 * proper security validation and organization isolation.
 *
 * @param {number} [limit=10] - Maximum number of examples to return (1-100)
 * @param {number} [page=1] - Page number for pagination
 * @param {string} [sortBy] - Field to sort by
 * @param {string} [sortOrder] - Sort direction ('asc' or 'desc')
 * @returns {Object} Paginated example list with metadata
 * @returns {Example[]} returns.examples - Array of example objects
 * @returns {Object} returns.pagination - Pagination metadata
 * @throws {401} When user is not authenticated
 * @throws {403} When user lacks organization access
 * @example
 * ```typescript
 * // Get first page with default settings
 * const result = await api.example.list.query()
 *
 * // Get specific page with custom sorting
 * const result = await api.example.list.query({
 *   page: 2,
 *   limit: 20,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * })
 * ```
 */
```

#### 2.3 Procedure Documentation
```typescript
/**
 * @procedure ExampleProcedure
 * @description Procedure for managing example business logic and data operations.
 *
 * This procedure provides the business logic layer for example management,
 * handling database operations, validation, and business rule enforcement.
 * It manages the complete lifecycle of examples with proper data isolation.
 *
 * Key features:
 * - Database operations with security validation
 * - Business rule enforcement
 * - Data transformation and validation
 * - Organization-scoped operations
 *
 * @example
 * ```typescript
 * // Usage in controllers
 * const example = await context.example.create({
 *   name: 'New Example',
 *   organizationId: 'org_123'
 * })
 * ```
 */
```

#### 2.4 Interface Documentation
```typescript
/**
 * @interface Example
 * @description Interface for example data with type-safe operations.
 *
 * This interface defines the structure of example entities in the system,
 * providing type safety for example operations and data validation.
 * It includes all necessary fields for example management.
 *
 * @example
 * ```typescript
 * const example: Example = {
 *   id: 'example_123',
 *   name: 'Example Name',
 *   description: 'Example description',
 *   organizationId: 'org_456',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface Example {
  /** Unique identifier for the example */
  id: string

  /** Example display name */
  name: string

  /** Example description */
  description?: string

  /** Organization the example belongs to */
  organizationId: string

  /** Creation timestamp */
  createdAt: Date

  /** Last update timestamp */
  updatedAt: Date
}
```

### Phase 3: Inline Comments Implementation
**Goal**: Add comprehensive inline comments following established patterns.

#### 3.1 Authentication Validation
```typescript
// 🔍 Authentication validation: Verify user is authenticated and has proper roles for example management
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner', 'member'],
})
```

#### 3.2 Business Rules
```typescript
// Business Rule: Ensure user is authenticated and has organization access before proceeding with example creation
if (!session || !session.organization) {
  return response.unauthorized('Authentication required')
}
```

#### 3.3 Business Logic
```typescript
// Business Logic: Create example with validation and security checks
const example = await context.example.create({
  name: request.body.name,
  description: request.body.description,
  organizationId: session.organization.id,
})
```

#### 3.4 Observations
```typescript
// Observation: Extract example ID from path parameters for update operation
const exampleId = request.params.id
```

#### 3.5 Data Transformation
```typescript
// Data Transformation: Calculate pagination metadata including total pages for UI navigation components
const totalPages = Math.ceil(result.total / query.limit)
```

#### 3.6 Response Construction
```typescript
// Response: Return created example with success confirmation and trigger real-time updates
return response.created(example)
```

## 🔍 Documentation Quality Gates

### ✅ Required for ALL Public APIs
- [ ] **Complete TSDoc** with all required tags (@controller/@action/@procedure/@method/@interface)
- [ ] **@description** with comprehensive context and purpose
- [ ] **@param** tags for all parameters with types and descriptions
- [ ] **@returns** tag with detailed return structure
- [ ] **@throws** tags for error conditions and status codes
- [ ] **@example** with practical, realistic usage scenarios

### ✅ Required for ALL Functions
- [ ] **Authentication validation** comments with specific purpose
- [ ] **Business rule** comments for security checks
- [ ] **Business logic** comments with operation context
- [ ] **Observation** comments for data extraction
- [ ] **Data transformation** comments for processing steps
- [ ] **Response construction** comments for API responses

### ✅ Required for ALL Business Logic
- [ ] **Purpose comment** explaining what the code does
- [ ] **Parameter documentation** for complex parameters
- [ ] **Return value documentation** for non-obvious returns
- [ ] **Error handling documentation** for critical functions

## 📋 Implementation Checklist

### ✅ TSDoc Documentation
- [ ] All controllers have comprehensive @controller TSDoc comments
- [ ] All actions have detailed @action TSDoc with @param, @returns, @throws, @example
- [ ] All procedures have complete @procedure TSDoc with method documentation
- [ ] All interfaces have type-safe @interface TSDoc with examples
- [ ] All examples use realistic, practical scenarios

### ✅ Inline Comments
- [ ] Authentication validation comments are descriptive and specific
- [ ] Business rules clearly explain security checks and validation
- [ ] Business logic comments provide operation context
- [ ] Observation comments explain data extraction purpose
- [ ] Data transformation comments detail processing steps
- [ ] Response comments explain construction and purpose

### ✅ Code Quality
- [ ] All public APIs have complete documentation
- [ ] Comments follow established naming conventions
- [ ] Documentation is consistent across all features
- [ ] Examples are practical and realistic
- [ ] Error conditions are properly documented

## 🚀 Documentation Commands

### Quick Documentation
```bash
# Document a specific file
/docs src/features/example/example.controller.ts

# Document an entire feature
/docs src/features/example

# Document with specific focus
/docs src/features/example --type controller
/docs src/features/example --type procedure
/docs src/features/example --type interface
```

### Batch Documentation
```bash
# Document all controllers in a feature
/docs src/@saas-boilerplate/features/auth --type controller

# Document all procedures in the project
/docs src --type procedure

# Document all interfaces in a specific directory
/docs src/@saas-boilerplate/features --type interface
```

### Advanced Documentation
```bash
# Document with custom options
/docs src/features/example --type all --include-examples --validate

# Document with specific focus on business logic
/docs src/features/example --focus business-logic

# Document with error handling emphasis
/docs src/features/example --focus error-handling
```

## 📚 Best Practices

1. **Always document before coding** - Write TSDoc first, then implement
2. **Use realistic examples** - Show practical usage scenarios, not just syntax
3. **Be specific about security** - Document authentication and authorization requirements
4. **Explain business logic** - Make decision rationale clear to future developers
5. **Keep documentation current** - Update TSDoc when changing implementations
6. **Use consistent terminology** - Follow established naming conventions
7. **Document error scenarios** - Include all possible error conditions and status codes

## 🎯 Documentation Workflow

### 1. Analysis Phase
- **MANDATORY**: Run `analyze_file` or `analyze_feature` first
- Identify what needs documentation (controllers, procedures, interfaces)
- Check existing documentation quality
- Plan documentation approach

### 2. TSDoc Implementation Phase
- Add comprehensive TSDoc to all public APIs
- Include all required tags (@param, @returns, @throws, @example)
- Use realistic, practical examples
- Follow established patterns

### 3. Inline Comments Phase
- Add authentication validation comments
- Add business rule comments for security checks
- Add business logic comments for operations
- Add observation comments for data extraction
- Add data transformation comments for processing
- Add response comments for API construction

### 4. Quality Validation Phase
- Verify all TSDoc requirements are met
- Ensure inline comments follow established patterns
- Test documentation with TypeScript compiler
- Validate examples are realistic and functional

This command ensures all code meets professional documentation standards and maintains consistency across the entire codebase.
