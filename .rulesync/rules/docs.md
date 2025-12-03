---
description: "Mandatory TSDoc Documentation Rule"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: true
  description: "Mandatory TSDoc Documentation Rule"
---
# Mandatory TSDoc Documentation Rule

## 🎯 Overview
This rule enforces comprehensive TSDoc documentation standards and inline comment patterns for ALL code implementations. It ensures consistent, professional documentation that maintains quality standards across the entire codebase and is always applied to guarantee 100% documentation coverage.

## 📋 Core Documentation Principles

### 1. Mandatory TSDoc Coverage
**ALL public exports MUST have comprehensive TSDoc comments:**
- ✅ Controllers and their actions
- ✅ Procedures and their methods
- ✅ Interfaces and types
- ✅ Functions and components
- ✅ Classes and enums
- ✅ Constants and schemas

### 2. TSDoc Structure Requirements
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

### 3. Inline Comment Categories

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

## 📚 TSDoc Tag Standards

### Controller Documentation
```typescript
/**
 * @controller ControllerName
 * @description Controller for managing [entities] with [key features].
 *
 * This controller provides comprehensive [entity] management including [operations],
 * with proper authentication and organization isolation. It supports [streaming/real-time]
 * capabilities and ensures proper data security through [validation/authorization].
 *
 * Key features:
 * - [Feature 1] with implementation details
 * - [Feature 2] with security considerations
 * - [Feature 3] with performance optimizations
 *
 * @example
 * ```typescript
 * // Basic usage examples
 * const result = await api.controller.action.query()
 * const created = await api.controller.action.mutate(data)
 * ```
 */
```

### Action Documentation
```typescript
/**
 * @action actionName
 * @description [Specific action purpose and functionality].
 *
 * This endpoint provides [comprehensive description] with [key features].
 * It ensures [security/validation] and provides [real-time capabilities].
 *
 * @param {type} [param] - Parameter description with validation rules
 * @returns {type} [return] - Detailed return structure and content
 * @throws {status} Error conditions and status codes
 * @example
 * ```typescript
 * // Usage examples with realistic scenarios
 * const result = await api.controller.action.query({ param: value })
 * const updated = await api.controller.action.mutate({ data })
 * ```
 */
```

### Procedure Documentation
```typescript
/**
 * @procedure ProcedureName
 * @description Procedure for managing [business logic] operations.
 *
 * This procedure provides the comprehensive business logic layer for [functionality],
 * handling [database operations], [real-time messaging], and [notification delivery].
 * It manages the complete lifecycle of [entities] including [operations].
 *
 * Key features:
 * - [Feature 1] with implementation details
 * - [Feature 2] with security considerations
 * - [Feature 3] with performance optimizations
 *
 * @example
 * ```typescript
 * // Usage in controllers with realistic examples
 * const result = await context.procedure.method({
 *   param1: value1,
 *   param2: value2
 * })
 * ```
 */
```

### Interface Documentation
```typescript
/**
 * @interface InterfaceName
 * @description Interface for [data structure] with type-safe generic constraints.
 *
 * This interface defines the structure of [entities] in the system,
 * providing type safety for [operations] and their associated data payloads.
 * It ensures that [data] matches the expected format through TypeScript generics.
 *
 * @template TType - The [type] (must extend [constraint])
 * @template TData - The [data] structure (must extend [constraint])
 * @example
 * ```typescript
 * // Usage examples with type parameters
 * const item: InterfaceName<Type, Data> = { ... }
 * const list: InterfaceName<Type, Data>[] = [...]
 * ```
 */
```

### Method Documentation
```typescript
/**
 * @method methodName
 * @description [Method purpose and functionality].
 *
 * This method [performs specific operation] with [security/validation].
 * It [handles data] and [manages state] according to business requirements.
 *
 * @param {type} param - Parameter description with usage context
 * @returns {Promise<type>} [Return description with structure]
 * @throws {Error} When [failure conditions] occur
 */
```

## 🔍 Inline Comment Standards

### 1. Authentication Validation
```typescript
// 🔍 Authentication validation: [Specific purpose and role verification]
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner', 'member'],
})
```

### 2. Business Rules
```typescript
// Business Rule: [Specific validation or security check being performed]
if (!session || !session.organization) {
  return response.unauthorized('Authentication required')
}
```

### 3. Business Logic
```typescript
// Business Logic: [Specific operation being performed with context]
const result = await context.repository.operation({
  param1: value1,
  param2: value2,
})
```

### 4. Observations
```typescript
// Observation: [Specific data extraction or parameter processing with purpose]
const entityId = request.params.id
```

### 5. Data Transformation
```typescript
// Data Transformation: [Specific transformation being performed with context]
const formattedData = data.map(item => ({
  ...item,
  processedField: transformValue(item.field)
}))
```

### 6. Response Construction
```typescript
// Response: [Specific response construction with additional context]
return response.success({
  data: result,
  metadata: {
    processed: true,
    timestamp: new Date(),
  },
})
```

## 📋 Documentation Quality Gates

### ✅ Required for ALL Public APIs
- [ ] **Complete TSDoc** with all required tags
- [ ] **@description** with comprehensive context
- [ ] **@param** tags for all parameters with types and descriptions
- [ ] **@returns** tag with detailed return structure
- [ ] **@throws** tags for error conditions
- [ ] **@example** with practical usage scenarios

### ✅ Required for ALL Functions
- [ ] **Purpose comment** explaining what the function does
- [ ] **Parameter documentation** for complex parameters
- [ ] **Return value documentation** for non-obvious returns
- [ ] **Error handling documentation** for critical functions

### ✅ Required for ALL Business Logic
- [ ] **Authentication validation** comments
- [ ] **Business rule** comments for security checks
- [ ] **Business logic** comments for operations
- [ ] **Data transformation** comments for processing
- [ ] **Response construction** comments for API responses

## 🔧 Implementation Guidelines

### 1. Controller Implementation
```typescript
/**
 * @controller UserController
 * @description Controller for managing user operations with authentication.
 *
 * This controller provides comprehensive user management including creation,
 * updates, and deletion with proper authentication and organization isolation.
 * It ensures data security through recipient and organization validation.
 *
 * @example
 * ```typescript
 * // Create new user
 * const user = await api.user.create.mutate({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * })
 * ```
 */
export const UserController = igniter.controller({
  name: 'user',
  actions: {
    /**
     * @action create
     * @description Creates a new user with validation and notifications.
     *
     * @param {string} name - User display name
     * @param {string} email - User email address
     * @returns {User} Created user object
     * @throws {400} When validation fails
     */
    create: igniter.mutation({
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation: Verify user has admin role for user creation
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner'],
        })

        // Business Rule: Ensure admin access before proceeding with user creation
        if (!session?.organization || !['admin', 'owner'].includes(session.role)) {
          return response.forbidden('Admin access required')
        }

        // Business Logic: Create user with validation and security checks
        const user = await context.user.create(request.body)

        // Response: Return created user with success confirmation
        return response.created(user)
      }
    })
  }
})
```

### 2. Procedure Implementation
```typescript
/**
 * @procedure UserProcedure
 * @description Procedure for managing user data operations and business logic.
 *
 * This procedure provides the business logic layer for user management,
 * handling database operations, validation, and notification delivery.
 * It ensures proper data isolation and manages user lifecycle operations.
 *
 * @example
 * ```typescript
 * const user = await context.user.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   organizationId: 'org_123'
 * })
 * ```
 */
export const UserProcedure = igniter.procedure({
  handler: ({ context }) => ({
    user: {
      /**
       * @method create
       * @description Creates a new user with validation and notifications.
       *
       * @param {CreateUserInput} data - User creation data
       * @returns {Promise<User>} Created user object
       */
      create: async (data: CreateUserInput) => {
        // Business Logic: Validate user data and create user record
        const user = await context.services.database.user.create({
          data: {
            ...data,
            organizationId: data.organizationId,
            createdAt: new Date(),
          }
        })

        // Business Logic: Send welcome notification
        await context.services.notification.send({
          type: 'USER_CREATED',
          context: { organizationId: data.organizationId },
          data: { userName: user.name }
        })

        return user
      }
    }
  })
})
```

### 3. Interface Implementation
```typescript
/**
 * @interface User
 * @description Interface for user data with type-safe operations.
 *
 * This interface defines the structure of user entities in the system,
 * providing type safety for user operations and data validation.
 * It includes all necessary fields for user management and relationships.
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: 'user_123',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   organizationId: 'org_456',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface User {
  /** Unique identifier for the user */
  id: string

  /** User display name */
  name: string

  /** User email address */
  email: string

  /** Organization the user belongs to */
  organizationId: string

  /** Account creation timestamp */
  createdAt: Date

  /** Last update timestamp */
  updatedAt: Date
}
```

## 🎯 Quality Standards

### Documentation Completeness
- **100% TSDoc coverage** for all public APIs
- **Complete parameter documentation** with types and descriptions
- **Detailed return type documentation** with structure examples
- **Comprehensive error documentation** with status codes and conditions

### Code Clarity
- **Meaningful variable names** using descriptive conventions
- **Logical code organization** with clear separation of concerns
- **Consistent formatting** following project standards
- **Professional presentation** suitable for team collaboration

### Maintenance Considerations
- **Self-documenting code** through clear structure and naming
- **Future-proof documentation** that remains accurate as code evolves
- **Team collaboration ready** with comprehensive context for all developers

---

## 📋 Implementation Checklist

### ✅ TSDoc Documentation
- [ ] All controllers have comprehensive TSDoc comments
- [ ] All actions have detailed parameter and return documentation
- [ ] All procedures have complete method documentation
- [ ] All interfaces have type-safe generic documentation
- [ ] All examples use realistic, practical scenarios

### ✅ Inline Comments
- [ ] Authentication validation comments are descriptive
- [ ] Business rules clearly explain security checks
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

## 🚀 Best Practices

1. **Always document before coding** - Write TSDoc first, then implement
2. **Use realistic examples** - Show practical usage scenarios
3. **Be specific about security** - Document authentication and authorization requirements
4. **Explain business logic** - Make decision rationale clear to future developers
5. **Keep documentation current** - Update TSDoc when changing implementations
6. **Use consistent terminology** - Follow established naming conventions
7. **Document error scenarios** - Include all possible error conditions and status codes

This rule ensures all code meets professional documentation standards and maintains consistency across the entire codebase.

## 🔧 Enforcement

This rule is **always applied** to ensure:
- **Consistent documentation** across the entire codebase
- **Professional quality** in all code comments
- **Complete coverage** of all business logic
- **Clear understanding** for future developers
- **Maintainable code** with comprehensive documentation

**ALL code implementations MUST follow these documentation standards without exception.**