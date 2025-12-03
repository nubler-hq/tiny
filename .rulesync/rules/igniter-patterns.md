---
description: "Igniter.js Controller & API Development Standards"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: true
  description: "Igniter.js Controller & API Development Standards"
---
# Igniter.js Controller & API Development Standards

This guide provides a **COMPLETE, ACCURATE, and MANDATORY** reference for creating controllers and actions in Igniter.js. It incorporates established architectural patterns, coding best practices, and lessons learned from real-world implementations, ensuring strict adherence for all future development.

## 🚨 CRITICAL: SaaS Boilerplate Authentication System

### 🎯 AuthFeatureProcedure - THE ONLY Auth System

**⚠️ CRITICAL:** Always use `AuthFeatureProcedure` for authentication. Never create custom systems.

```typescript
// ✅ CORRECT - SaaS system usage
import { AuthFeatureProcedure } from "@/features/auth/procedures/auth-procedure";

export const eventsController = igniter.controller({
  actions: {
    create: igniter.mutation({
      use: [AuthFeatureProcedure()], // 🔐 Procedure injects auth methods
      handler: async ({ context }) => {
        // 🔍 Authentication validation inside handler
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member']
        });

        if (!session || !session.organization) {
          return response.unauthorized('Authentication required');
        }

        const userId = session.user!.id;           // Authenticated user ID
        const organizationId = session.organization.id; // Current organization
      },
    }),
  },
});
```

### 🔑 Auth Session Structure

```typescript
interface AppSession {
  user: User;                    // User data
  organization: {               // Current organization
    id: string;
    name: string;
    slug: string;
    billing: Customer;         // Stripe billing data
    metadata: OrganizationMetadata;
  };
}
```

### 📋 How to Use getSession Correctly

**⚠️ CRITICAL:** The `getSession` method is the correct way to get authentication information inside handlers.

```typescript
// ✅ CORRECT PATTERN - Basic validation
const session = await context.auth.getSession({
  requirements: 'authenticated'  // Requires logged user
});

// ✅ CORRECT PATTERN - With role validation
const session = await context.auth.getSession({
  requirements: 'authenticated', // Requires logged user
  roles: ['admin', 'owner']     // Requires one of these roles
});

// ✅ CORRECT PATTERN - For unauthenticated users (optional)
const session = await context.auth.getSession({
  requirements: 'unauthenticated'  // Used in public pages
});

// ❌ WRONG - Don't use directly
// const userId = context.auth.session.user.id; // ERROR: property doesn't exist
```

#### getSession Response Handling

```typescript
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner']
});

// Mandatory checks
if (!session) {
  return response.unauthorized('Authentication required');
}

if (!session.organization) {
  return response.forbidden('Organization access required');
}

// Now it's safe to use properties
const userId = session.user!.id;
const organizationId = session.organization.id;
const userRole = session.membership?.role; // 'owner' | 'admin' | 'member'
```

### 🔑 API Key Authentication

**ℹ️ INFO:** The system also supports API Key authentication for programmatic integrations.

```typescript
// API Key authentication (Bearer token)
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner']  // 🔐 Required for API Keys
});

// For API Key, session.user will be null
if (session && session.user === null) {
  // This is an API Key session
  const organizationId = session.organization!.id;
  const billing = session.organization!.billing;

  // API Key specific logic...
}
```

**How to use API Key:**
```bash
# Authorization header with Bearer token
Authorization: Bearer YOUR_API_KEY_HERE
```

---

## 🚨 CRITICAL ARCHITECTURAL PRINCIPLES

### 1. Separation of Concerns (SoC)
- **Controllers**: Responsible *only* for handling HTTP requests, validating input, orchestrating business logic (via procedures/repositories), and constructing HTTP responses.
- **Procedures**: Responsible for extending the request context, injecting dependencies (like repositories), handling cross-cutting concerns (e.g., authentication, logging), and pre-processing requests.
- **Repositories**: Responsible *only* for direct data access operations (e.g., Prisma calls). They abstract the database layer from the business logic.
- **Interfaces**: Centralize all shared definitions (constants, Zod schemas, types, interfaces) for a given feature.

### 2. Type Safety & Documentation First
- **End-to-End Type Safety**: Leverage TypeScript and Zod to ensure type consistency from request body to database operations.
- **Comprehensive TSDoc**: All exposed components (controllers, actions, procedures, repositories, interfaces, schemas, types, constants) *MUST* be fully documented with TSDoc in English.

### 3. Immutability & Context Extension
- **Context is Extended, Not Mutated**: Procedures extend the Igniter context by returning an object, which is then shallow-merged. Direct mutation of the `context` object in procedures is forbidden.
- **Special Case: `next()` for Post-Action Processing**: The `next()` function in a procedure's handler should **only** be used if the procedure needs to capture and process the *result* of the subsequent action (e.g., for auditing, performance monitoring, or response modification). In such cases, `await next()` should be called, and the result should then be handled. Otherwise, procedures should either return an object to extend the context (e.g., `{ auth: { session: { user } } }`) or `void` (implicitly or explicit `return;`) to simply allow the request to proceed without modifying the context.
- **Procedure Independence**: Procedures are independent. When multiple procedures are used in an action (e.g., `use: [procA, procB]`), the context returned by `procA` is **not** available within the handler of `procB`. Each procedure receives the same initial context. All returned contexts are merged and made available to the final action handler.
- **Default Behavior: Context Extension or Void Return**: In all other scenarios, procedures should either return an object to extend the context (e.g., `{ auth: { session: { user } } }`) or `void` (implicitly or explicitly `return;`) to simply allow the request to proceed without modifying the context.
- **Auth Procedure Context for Optional Authentication**: When an `AuthFeatureProcedure` is used, authentication is handled internally by the `getSession` method called within the controller handler. The procedure injects the auth context for use in the handler.

### 4. No Modification of Default Igniter Files
- **CRITICAL**: Never modify default Igniter files such as `src/igniter.ts`, `src/igniter.context.ts`, or `src/igniter.router.ts`. These files are designed for automatic type inference and core configuration. Any custom context or setup *MUST* be handled in feature-specific procedures that extend the existing context.

## 🚨 CRITICAL: API Response Patterns - The ONLY Valid API

### ❌ WHAT DOESN'T WORK (Forbidden Methods/Patterns):
```typescript
// ❌ INCORRECT - These methods DO NOT EXIST on the response object
return response.ok(data);                    
return response.error(code, message);        
return response.response(data);              
return new IgniterResponseError({...});     // Use response.error(...) instead

// ❌ INCORRECT - Wrong parameter structure or type
return response.badRequest(code, message);  // Parameter order is (message, data)
return response.unauthorized(code, message); // Parameter order is (message, data)
```

### ✅ WHAT ACTUALLY WORKS (Mandatory Correct API):
- **ALWAYS** finalize the response chain with a method call that returns `Response` (e.g., `.toResponse()`, `.created(data)`, etc.).

```typescript
// ✅ CORRECT - Success responses (Always 2xx status codes)
return response.success(data);           // 200 OK
return response.created(data);           // 201 Created
return response.noContent();             // 204 No Content (No body expected)
return response.json(data);              // Custom JSON response, defaults to 200 OK

// ✅ CORRECT - Error responses (Always 4xx or 5xx status codes)
return response.badRequest(message, data);      // 400 Bad Request
return response.unauthorized(message, data);    // 401 Unauthorized
return response.forbidden(message, data);       // 403 Forbidden
return response.notFound(message, data);        // 404 Not Found

// ✅ CORRECT - Custom status or headers
return response
  .status(418)                    // Set custom HTTP status code
  .setHeader('X-Custom', 'value') // Set custom HTTP header
  .setCookie('session', token, {  // Set HTTP cookie
    httpOnly: true,
    secure: true,
    maxAge: 3600
  })
  .success(data)
  ;                  // MANDATORY: Finalize the response

// ✅ CORRECT - Cache Revalidation (for Next.js App Router)
return response
  .revalidate(['users', 'posts'])
  .success(data)
  ;
```

## 🔍 MANDATORY: Development & Documentation Protocols

### 1. SaaS Boilerplate Analysis First
**⚠️ CRITICAL: BEFORE implementing any Igniter.js functionality, you MUST check SaaS Boilerplate files first:**

#### SaaS Boilerplate Files to Always Check:
```typescript
// ✅ MANDATORY: Check these SaaS Boilerplate files FIRST
await read_file({ target_file: "src/igniter.context.ts" });           // Global services structure
await read_file({ target_file: "src/@saas-boilerplate/features/auth/procedures/auth.procedure.ts" }); // Current auth implementation
await read_file({ target_file: "prisma/schema.prisma" });             // Database models
await read_file({ target_file: "src/igniter.router.ts" });            // Available controllers
await read_file({ target_file: "src/@saas-boilerplate/features/auth/auth.interface.ts" }); // Auth types
await read_file({ target_file: "src/services/auth.ts" });             // Better Auth configuration
await read_file({ target_file: "src/config/boilerplate.config.server.ts" }); // Server configuration
```

#### Only After SaaS Boilerplate Analysis - Check Igniter.js Core:
```typescript
// Only after checking SaaS Boilerplate files, analyze Igniter.js core
await explore_source({
  filePath: "node_modules/@igniter-js/core/dist/index.d.ts",
  symbol: "IgniterResponseProcessor"
});
```

#### Analysis Requirements:
- **Read the complete TSDoc/JSDoc documentation** in the `.d.ts` files.
- **Never assume methods exist** based on intuitive naming.
- **Test with minimal examples** before full implementation.
- **Store findings** in memory for future reference.
- **Update examples** to match current SaaS Boilerplate patterns.

### 2. Procedures Naming Convention
- **ALWAYS use concise and clear names** for procedures, matching the file name (e.g., `name: "eventProcedure"` for `event-procedure.ts`). This improves readability, maintainability, and debuggability.

### 3. Documentation Standard for Interfaces, Schemas & Constants (`*.interfaces.ts`)
- **CRITICAL**: All exported constants, Zod schemas, types, and interfaces within `src/features/[feature]/[feature].interfaces.ts` files **MUST** include comprehensive TSDoc comments in English. This promotes clarity, type safety, and auto-generated documentation.

```typescript
// src/features/auth/auth.interfaces.ts (Example)
import { z } from "zod";

/**
 * @constant SALT_ROUNDS
 * @description The number of salt rounds to use when hashing passwords with bcrypt.
 * A higher number increases security but also computation time.
 */
export const SALT_ROUNDS = 10;

/**
 * @schema SignUpBodySchema
 * @description Zod schema for validating the request body when a new user signs up.
 * Ensures name, email, and password meet specified criteria.
 */
export const SignUpBodySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * @typedef {import("zod").infer<typeof SignUpBodySchema>} SignUpBody
 * @description Type definition for the sign-up request body, inferred from SignUpBodySchema.
 */
export type SignUpBody = z.infer<typeof SignUpBodySchema>;
```

### 4. Inline Comments for Business Logic
- **MANDATORY**: Every significant line of business logic, observation, or rule in controllers, procedures, and repository methods **MUST** be accompanied by an inline comment in English. Use the following structured prefix system:
  - `// Business Rule: [message]` - Explains a specific business requirement, validation, or constraint.
  - `// Observation: [message]` - Notes an observed state, data extraction, or pre-condition.
  - `// Business Logic: [message]` - Describes a core operation, calculation, or data transformation.
  - `// Security Rule: [message]` - Highlights a security-related control, check, or mechanism (e.g., password hashing, JWT).
  - `// Session Management: [message]` - Details actions related to user sessions (e.g., cookie setting/clearing, JWT generation).
  - `// Data Transformation: [message]` - Explains data formatting, mapping, or conversion steps.
  - `// Context Extension: [message]` - Describes how the Igniter context is being extended by a procedure.
  - `// Response: [message]` - Explains the content, status, and side-effects (e.g., cookies) of the HTTP response.

### 5. `zod` Import in Controllers
- **MANDATORY**: Keep `import { z } from "zod";` in controller files, even if the `z` object is not directly used within the handler function. This ensures clarity regarding schema definitions and project consistency.

### 6. `as const` for Path Parameters
- **CRITICAL**: For all action `path` definitions that include parameters (e.g., `/:id`), you **MUST ALWAYS** use `as const` (e.g., `path: '/:id' as const`). This is essential for enabling TypeScript to infer the correct type for `request.params` in the handler, eliminating the risk of `unknown` types and ensuring type safety throughout your codebase.
- **Handler Typing**: The `ctx` parameter in a procedure's handler should **never** be explicitly typed. The return type may be typed, but you should review existing procedures in the project to maintain consistency.

### 7. **NEVER Define a Params Schema for Actions**
- **CRITICAL**: You **MUST NEVER** define or use a Zod schema (or any other schema) for the `params` of an action. The only source of truth for route parameters is the `path` property itself, combined with the `as const` assertion. This is a fundamental architectural rule:
  - **Why?** The `as const` on the `path` allows TypeScript to automatically and accurately infer the shape and type of `request.params` for your handler. Introducing a schema for `params` is redundant, error-prone, and can cause type mismatches or unnecessary validation overhead.
  - **What to do:** Simply define your action with a `path` (e.g., `path: '/:eventId' as const`) and do **not** add a `params` schema or validation. TypeScript will ensure the correct type for you.
  - **What NOT to do:** Do **not** write `params: z.object({ ... })` or any similar construct in your action definition. This is strictly prohibited and will be considered a critical violation of the project's patterns.
- **Summary:** The combination of `path` and `as const` is both necessary and sufficient for safe, type-checked access to route parameters. Any attempt to add a params schema is not only unnecessary, but also actively harmful to maintainability and type safety.

## ✅ Core Architectural Pattern: Repository Injection via Procedures

This pattern centralizes database interactions and separates concerns, making controllers cleaner and business logic more testable.

### 1. Repository Definition (`src/features/[feature]/repositories/[feature]-repository.ts`)
- **Purpose**: Encapsulate all direct Prisma ORM calls related to a specific entity or feature.
- **Location**: `src/features/[feature]/repositories/[feature]-repository.ts`
- **TSDoc**: Every repository class and *all* its public methods **MUST** have comprehensive TSDoc comments in English, detailing their purpose, parameters, and return types.

```typescript
// src/features/event/repositories/event-repository.ts (Example)
import { PrismaClient, Event } from "@prisma/client";
import { CreateEventBody, UpdateEventBody } from "../event.interfaces";

/**
 * @class EventRepository
 * @description Repository for managing event-related data operations with Prisma.
 * Centralizes all direct database interactions for events, providing a clean API for services and controllers.
 */
export class EventRepository {
  private prisma: PrismaClient;

  /**
   * @param {PrismaClient} prisma - The Prisma client instance for database access.
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * @method create
   * @description Creates a new event record in the database.
   * @param {CreateEventBody & { userId: string }} data - The event data, including title, description, duration, and the ID of the user creating the event.
   * @returns {Promise<Event>} A promise that resolves to the newly created event object.
   */
  async create(data: CreateEventBody & { userId: string }): Promise<Event> {
    // Business Logic: Use Prisma to create a new event record.
    return this.prisma.event.create({ data });
  }

  // ... other repository methods (list, getById, update, delete) ...
}
```

### 2. Procedure for Repository Injection (`src/features/[feature]/procedures/[feature]-procedure.ts`)
- **Purpose**: Instantiate the feature's repository and inject it into the Igniter context under a hierarchical structure, making it available to downstream controllers/actions.
- **Location**: `src/features/[feature]/procedures/[feature]-procedure.ts`
- **TSDoc**: The procedure's `handler` and its associated `Context` type **MUST** have TSDoc comments.

```typescript
// src/features/event/procedures/event-procedure.ts (Example)
import { igniter } from "@/igniter";
import { EventRepository } from "../repositories/event-repository";

/**
 * @const eventProcedure
 * @description Igniter.js procedure to inject an instance of EventRepository into the context under a hierarchical structure.
 * This creates a consistent pattern: context.{featureName}.{resourceType}.{resourceName}
 * @returns {EventContext} An object containing the event repository in hierarchical structure.
 */
export const eventProcedure = igniter.procedure({
  name: "eventProcedure", // Adhering to naming convention
  handler: (options, { context }) => {
    // Context Extension: Instantiate EventRepository with the database client from the global context.
    const eventRepository = new EventRepository(context.database);

    // Context Extension: Return the repository instance in hierarchical structure for consistency.
    return {
      event: {
        repository: eventRepository,
      },
    };
  },
});
```

### 3. Controller Usage (`src/features/[feature]/controllers/[feature]-controller.ts`)
- **Purpose**: Use the injected repository methods to perform data operations, keeping the controller focused on request handling and business logic orchestration.
- **`use` property**: The procedure is added to the `use` array of the controller or individual actions.
- **Context Access**: Use the structure `context.{featureName}.{resourceType}.{resourceName}` for consistent access.

```typescript
// src/features/event/controllers/event-controller.ts (Example)
import { igniter } from "@/igniter";
import { z } from "zod"; // MANDATORY: Keep z import as per preference
import { AuthFeatureProcedure } from "@/features/auth/procedures/auth-procedure";
import { eventProcedure } from "../procedures/event-procedure";
import { CreateEventBodySchema, UpdateEventBodySchema } from "../event.interfaces";

export const eventController = igniter.controller({
  name: "event",
  path: "/events",
  description: "Manage user event types",
  actions: {
    create: igniter.mutation({
      name: "Create",
      description: "Create new event type",
      path: "/",
      method: "POST",
      use: [AuthFeatureProcedure()], // 🔐 Procedure injects auth methods
      body: CreateEventBodySchema,
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation inside handler
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member']
        });

        if (!session || !session.organization) {
          return response.unauthorized('Authentication required');
        }

        // Observation: Extract event details from the request body.
        const { title, description, duration } = request.body;

        // Authentication: Retrieve the authenticated user's ID from the session.
        const userId = session.user!.id;

        // Business Logic: Create a new event using the EventRepository.
        const event = await context.event.repository.create({
          title,
          description,
          duration,
          userId,
        });

        // Response: Return the newly created event with a 201 status.
        return response.created(event);
      },
    }),
    list: igniter.query({
      name: "List",
      description: "List all user events",
      path: "/",
      use: [AuthFeatureProcedure()], // 🔐 Procedure injects auth methods
      handler: async ({ response, context }) => {
        // 🔍 Authentication validation inside handler
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member']
        });

        if (!session?.organization) {
          return response.unauthorized('Organization access required');
        }

        // Authentication: Retrieve the authenticated user's ID from the session.
        const userId = session.user!.id;

        // Business Logic: Retrieve all events belonging to the authenticated user using the EventRepository.
        const events = await context.event.repository.list(userId);

        // Response: Return the list of events with a 200 status.
        return response.success(events);
      },
    }),
    // ... other controller actions (getById, update, delete) ...
  },
});
```


## ✅ Core Architectural Pattern: Service Injection via Procedures

This pattern centralizes external library interactions (e.g., hashing, token generation) and injects them into the Igniter context via procedures, making them readily available to downstream controllers and promoting reusability and testability.

### 1. Service Definition (`src/services/[service-name].service.ts`)
- **Purpose**: Encapsulate all direct external library calls or complex business logic related to a specific domain (e.g., password management, JWT operations, external API integrations).
- **Location**: `src/services/` (or `src/services/[domain]/` for larger projects).
- **TSDoc**: Every service class and *all* its public methods **MUST** have comprehensive TSDoc comments in English, detailing their purpose, parameters, and return types.

```typescript
// src/services/password.service.ts (Example)
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "@/features/auth/auth.interfaces";

/**
 * @class PasswordService
 * @description Encapsulates password hashing and comparison logic using bcrypt.
 * Provides a clean interface for securely managing user passwords.
 */
export class PasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  /**
   * @method hashPassword
   * @description Hashes a plain text password using bcrypt.
   * @param {string} password - The plain text password to hash.
   * @returns {Promise<string>} A promise that resolves to the hashed password string.
   */
  async hashPassword(password: string): Promise<string> {
    // Business Logic: Hash the password with the configured salt rounds.
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * @method comparePassword
   * @description Compares a plain text password with a hashed password.
   * @param {string} password - The plain text password to compare.
   * @param {string} hash - The hashed password to compare against.
   * @returns {Promise<boolean>} A promise that resolves to true if passwords match, false otherwise.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    // Business Logic: Compare the provided password with the stored hash.
    return bcrypt.compare(password, hash);
  }
}
```

```typescript
// src/services/jwt.service.ts (Example)
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/features/auth/auth.interfaces";

/**
 * @class JwtService
 * @description Encapsulates JWT token generation and verification logic.
 * Provides a secure interface for handling authentication tokens.
 */
export class JwtService {
  private readonly secret: string;

  constructor(secret: string = JWT_SECRET) {
    this.secret = secret;
  }

  /**
   * @method generateToken
   * @description Generates a new JWT token.
   * @param {object} payload - The payload to include in the token (e.g., userId).
   * @param {object} [options={ expiresIn: '1h' }] - Options for token generation (e.g., expiration time).
   * @returns {string} The generated JWT token string.
   */
  generateToken(payload: object, options: object = { expiresIn: "1h" }): string {
    // Security Rule: Sign the JWT token with the configured secret and options.
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * @method verifyToken
   * @description Verifies a JWT token.
   * @param {string} token - The JWT token string to verify.
   * @returns {object | string} The decoded payload if verification is successful, or throws an error.
   */
  verifyToken(token: string): object | string {
    // Security Rule: Verify the JWT token with the configured secret.
    return jwt.verify(token, this.secret);
  }
}
```

### 2. Procedure for Service Injection (`src/features/[feature]/procedures/[feature].procedure.ts`)
- **Purpose**: Instantiate the feature's services and inject them into the Igniter context, making them available to downstream controllers/actions.
- **Location**: `src/features/[feature]/procedures/[feature].procedure.ts`
- **TSDoc**: The procedure's `handler` and its associated `Context` type **MUST** have TSDoc comments.

```typescript
// NOTE: This example has been removed as it shows an outdated pattern.
// For current SaaS Boilerplate authentication, use AuthFeatureProcedure()
// and call context.auth.getSession() inside the controller handler.
// See the updated controller examples above for the correct pattern.
```

### 3. Controller Usage (`src/features/[feature]/controllers/[feature].controller.ts`)
- **Purpose**: Use the injected service methods to perform logic, keeping the controller focused on request handling and business logic orchestration.

```typescript
// src/@saas-boilerplate/features/auth/controllers/auth.controller.ts (SaaS Boilerplate Example)
import { z } from 'zod'
import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '../procedures/auth.procedure'

export const AuthController = igniter.controller({
  name: 'Authentication',
  description: 'Authentication management',
  path: '/auth',
  actions: {
    getActiveSocialProvider: igniter.query({
      name: 'getActiveSocialProvider',
      description: 'List available providers',
      method: 'GET',
      path: '/social-provider',
      use: [AuthFeatureProcedure()],
      handler: async ({ response }) => {
        return response.success(['google', 'github'])
      },
    }),

    signInWithProvider: igniter.mutation({
      name: 'signInWithProvider',
      description: 'Sign in with OAuth provider',
      method: 'POST',
      path: '/sign-in',
      use: [AuthFeatureProcedure()],
      body: z.object({
        provider: z.string(),
        callbackURL: z.string().optional(),
      }),
      handler: async ({ request, response, context }) => {
        const result = await context.auth.signInWithProvider(request.body)

        if (result.error) {
          throw new Error(result.error.code)
        }

        return response.success(result.data)
      },
    }),

    signInWithOTP: igniter.mutation({
      name: 'signInWithOtp',
      description: 'Sign in with OTP code',
      method: 'POST',
      path: '/sign-in/otp',
      use: [AuthFeatureProcedure()],
      body: z.object({
        email: z.string(),
        otpCode: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        const result = await context.auth.signInWithOTP(request.body)

        if (result.error) {
          return response.badRequest(result.error.message)
        }

        return response.success(result.data)
      },
    }),

    sendOTPVerificationCode: igniter.mutation({
      name: 'sendOtpCode',
      description: 'Send OTP verification code',
      method: 'POST',
      path: '/send-otp-verification',
      use: [AuthFeatureProcedure()],
      body: z.object({
        email: z.string(),
        type: z.enum(['sign-in', 'email-verification', 'forget-password']),
      }),
      handler: async ({ request, response, context }) => {
        await context.auth.sendOTPVerificationCode(request.body)
        return response.success({ email: request.body.email })
      },
    }),

    signOut: igniter.mutation({
      name: 'signOut',
      description: 'Sign out current user',
      method: 'POST',
      path: '/sign-out',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        await context.auth.signOut()
        return response.success({ callbackURL: '/' })
      },
    }),

    getSession: igniter.query({
      name: 'getCurrentSession',
      description: 'Get current user session',
      method: 'GET',
      path: '/session',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        try {
          const result = await context.auth.getSession({
            requirements: 'authenticated',
            roles: ['admin', 'member', 'owner'],
          })
          return response.success(result)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'

          switch (errorMessage) {
            case 'UNAUTHORIZED':
              return response.unauthorized('Authentication required')
            case 'INSUFFICIENT_PERMISSIONS':
              return response.forbidden(
                'Insufficient permissions for this organization',
              )
            case 'NO_ORGANIZATION_ACCESS':
              return response.forbidden('Organization access required')
            case 'USER_NOT_FOUND':
              return response.unauthorized('User not found')
            case 'ALREADY_AUTHENTICATED':
              return response.badRequest('User is already authenticated')
            default:
              return response.badRequest('Failed to retrieve session')
          }
        }
      },
    }),

    setActiveOrganization: igniter.mutation({
      name: 'setActiveOrganization',
      description: 'Set active organization',
      method: 'POST',
      path: '/set-active-organization',
      use: [AuthFeatureProcedure()],
      body: z.object({
        organizationId: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        await context.auth.setActiveOrganization(request.body)
        return response.success({
          organizationId: request.body.organizationId,
        })
      },
    }),
  },
})

```

## 7. Best Practices Summary (SaaS Boilerplate Standards)

### 🔐 Authentication Best Practices
1.  **MANDATORY: Use AuthFeatureProcedure**: Always use `AuthFeatureProcedure()` in the `use` array without parameters.
2.  **MANDATORY: Call getSession Inside Handler**: Never call `getSession` outside the controller handler. Always use `await context.auth.getSession({...})` inside the handler.
3.  **MANDATORY: Check Organization Access**: Always validate `session.organization` exists before using organization data.
4.  **MANDATORY: Use Session Properties**: Access user data via `session.user!.id` and organization data via `session.organization.id`.
5.  **MANDATORY: Role-Based Access**: Use `roles: ['admin', 'owner', 'member']` for proper RBAC validation.
6.  **MANDATORY: API Key Support**: Use `roles` parameter for API Key authentication when required.

### 🏗️ Architectural Best Practices
7.  **MANDATORY: Follow Separation of Concerns**: Controllers handle requests, procedures inject dependencies, repositories handle data access.
8.  **MANDATORY: Type Safety First**: Use TypeScript interfaces, Zod schemas, and TSDoc comments throughout.
9.  **MANDATORY: Hierarchical Context**: Use `context.{feature}.{resource}.{name}` for injected dependencies.
10. **MANDATORY: Global Services**: Access global services via `context.{serviceName}`.
11. **MANDATORY: SaaS Boilerplate Files**: Always check essential files before development (see section 1.1).

### 📋 Development Best Practices
12. **MANDATORY: Use `as const` for Paths**: Ensure `path: '/:id' as const` for proper type inference.
13. **MANDATORY: `zod` Import**: Keep `import { z } from "zod";` in all controller files.
14. **MANDATORY: Structured Comments**: Use Business Rule:, Observation:, Security Rule: prefixes.
15. **MANDATORY: Repository Pattern**: Implement data access through repositories, not direct Prisma calls in controllers.
16. **MANDATORY: Centralize Interfaces**: Store all schemas, types, and constants in `[feature].interfaces.ts` files.
17. **MANDATORY: Error Handling**: Use appropriate HTTP status codes and meaningful error messages.
18. **MANDATORY: Organization Isolation**: Always filter queries by `organizationId` for multi-tenant data.
19. **MANDATORY: Testing**: Validate authentication, success scenarios, and error handling after implementation.
20. **MANDATORY: Documentation**: Provide comprehensive TSDoc comments for all public APIs.

### ❌ Common Mistakes to Avoid
- ❌ Using `AuthFeatureProcedure({ required: true })` with parameters
- ❌ Calling `getSession()` outside controller handlers
- ❌ Using `context.auth.session.user.id` directly (use `getSession` first)
- ❌ Using flat context structure (`context.eventsRepository`)
- ❌ Direct Prisma calls in controllers
- ❌ Missing organization isolation in queries
- ❌ Not using `as const` for path parameters
- ❌ Missing TSDoc documentation
- ❌ Using `any` or untyped parameters
- ❌ Not validating authentication and roles properly

This refined guide provides the absolute necessary clarity and detail for LLMs to consistently apply the established development patterns.

## ✅ Core Architectural Pattern: Service and Repository Injection Decision

This pattern defines the intelligent decision-making process for where to inject services and repositories to maintain a clean, organized, and scalable codebase, adhering to dependency injection best practices.

### 1. Decision Criteria
- **Global Services/Repositories**: Dependencies that are used in *multiple features* or are considered *low-level utilities* without strong coupling to a single feature (e.g., `PasswordService`, `JwtService`).
- **Contextual/Feature-Specific Services/Repositories**: Dependencies that are *specific to a single feature* or require *specific procedure state* (e.g., an `EventRepository` that operates only in the context of events, or the authenticated `user` within the `auth.procedure`). `UserRepository` is also considered a feature-specific repository in this context, instantiated within `auth.procedure` to manage user-related database operations relevant to authentication.

### 2. Injection Locations
- **`src/igniter.context.ts` (Global Injection)**:
  - **Purpose**: For global services that are always needed and are not tied to a specific request context.
  - **Advantages**: Immediate availability throughout the Igniter.js context, guaranteed singletons, easy access from any controller or procedure.
  - **Examples**: `PasswordService`, `JwtService`, `DatabaseService`.

- **Feature-Specific Procedures (`src/features/[feature]/procedures/[feature].procedure.ts`)**:
  - **Purpose**: For contextual or feature-specific dependencies. Instantiated and injected into the context *only when the procedure is used* under a hierarchical structure.
  - **Advantages**: Lazy loading of dependencies (only created if the procedure is executed), encapsulation of complex injection logic, access to request data for instantiation (e.g., `context.database` for a repository).
  - **Examples**: `EventRepository` (injected under `context.event.repository`), `BookingRepository` (injected under `context.booking.repository`), `AvailabilityRepository` (injected under `context.availability.repository`).

### 3. Updated Context Structure (Example from `src/igniter.context.ts`)

```typescript
import { database } from "@/services/database";
import { PasswordService } from "@/services/password.service";
import { JwtService } from "@/services/jwt.service";
import { JWT_SECRET, SALT_ROUNDS } from "@/features/auth/auth.interfaces";

export const createIgniterAppContext = () => {
  const passwordService = new PasswordService(SALT_ROUNDS);
  const jwtService = new JwtService(JWT_SECRET);

  return {
    services: { // Global services - always available
      database,
      password: passwordService,
      jwt: jwtService,
    }
    // Note: Feature-specific resources are injected by procedures
    // e.g., context.event.repository (from eventProcedure)
  }
}

export type IgniterAppContext = ReturnType<typeof createIgniterAppContext>;
```

### 4. Migration Notes

**Note**: The `auth-procedure.ts` maintains the old pattern for backward compatibility with existing authentication flows. New feature procedures (like `event-procedure.ts`, `booking-procedure.ts`, etc.) should use the direct structure with `context.{featureName}.{resourceType}.{resourceName}`.

### 5. Best Practices for New Patterns

1. **Use Direct Structure**: Always use `context.{featureName}.{resourceType}.{resourceName}` for new features
2. **Global Services**: Keep global services in `context.{serviceName}`
3. **Consistent Naming**: Use `repository`, `service`, etc. as resource type names
4. **Lazy Loading**: Feature-specific resources are only loaded when procedures are executed
5. **Type Safety**: Leverage TypeScript's structural typing for better inference

### 6. Complete Migration Example

**Old Pattern (Deprecated):**
```typescript
// Controller
const eventsRepository = context.events.repository;
const userId = context.auth.session.user.id;

// Procedure
return {
  eventsRepository,
  auth: { user }
};
```

## 7. Summary of Changes

### New Hierarchical Context Pattern

**Before (Old Pattern):**
```typescript
// Flat structure
context.events.repository
context.auth.session.user.id
context.database
context.jwt
```

**After (New Hierarchical Pattern):**
```typescript
// Hierarchical structure
context.event.repository
context.auth.session.user.id
context.database
context.jwt
```

### Key Improvements

1. **Consistency**: All features follow the same organizational pattern
2. **Scalability**: Easy to add new resource types (services, repositories, etc.)
3. **Type Safety**: Better TypeScript inference with predictable structure
4. **Maintainability**: Clear separation between global and feature-specific resources
5. **Future-Proof**: Extensible structure for complex applications

### Migration Strategy

- **Global Services**: Keep in `context.*` (database, password, jwt)
- **Feature Resources**: Move to `context.{feature}.{type}.{name}`
- **Auth Context**: Maintain backward compatibility for existing flows
- **New Features**: Use hierarchical structure from the start

This refined guide provides the absolute necessary clarity and detail for LLMs to consistently apply the established development patterns with the new hierarchical context structure.

**New Pattern (Recommended):**
```typescript
// Controller
const eventsRepository = context.events.repository;
const userId = context.auth.session.user.id;

// Procedure
return {
  event: {
    repository: eventsRepository,
  },
  auth: { session: { user } }
};
```

## 7. Summary of Changes

### New Hierarchical Context Pattern

**Before (Old Pattern):**
```typescript
// Flat structure
context.events.repository
context.auth.session.user.id
context.database
context.jwt
```

**After (New Hierarchical Pattern):**
```typescript
// Hierarchical structure
context.event.repository
context.auth.session.user.id
context.database
context.jwt
```

### Key Improvements

1. **Consistency**: All features follow the same organizational pattern
2. **Scalability**: Easy to add new resource types (services, repositories, etc.)
3. **Type Safety**: Better TypeScript inference with predictable structure
4. **Maintainability**: Clear separation between global and feature-specific resources
5. **Future-Proof**: Extensible structure for complex applications

### Migration Strategy

- **Global Services**: Keep in `context.*` (database, password, jwt)
- **Feature Resources**: Move to `context.{feature}.{type}.{name}`
- **Auth Context**: Maintain backward compatibility for existing flows
- **New Features**: Use hierarchical structure from the start

This refined guide provides the absolute necessary clarity and detail for LLMs to consistently apply the established development patterns with the new hierarchical context structure.
