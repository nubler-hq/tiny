---
description: "How create controllers on Igniter.js"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: true
  description: "How create controllers on Igniter.js"
---
This guide provides a **COMPLETE and ACCURATE** reference for creating controllers and actions in Igniter.js, based on direct analysis of the source code and real-world implementation experience.

## 🚨 CRITICAL: SaaS Boilerplate Authentication System

**⚠️ MANDATORY: Always use the SaaS Boilerplate's AuthProcedure for authentication**

### 🔍 Essential Files to Always Check:
**BEFORE implementing any authentication or context-related functionality, you MUST check:**

1. **`src/igniter.context.ts`** - Understand global services and context structure
2. **`src/@saas-boilerplate/features/auth/procedures/auth.procedure.ts`** - Current auth procedure implementation
3. **`prisma/schema.prisma`** - Database models and relationships
4. **`src/igniter.router.ts`** - Available controllers and routes
5. **`src/@saas-boilerplate/features/auth/auth.interface.ts`** - Auth types and schemas

### ✅ SaaS Boilerplate AuthProcedure Usage:

```typescript
// ✅ CORRECT - Using SaaS Boilerplate AuthProcedure
import { igniter } from "@/igniter";
import { AuthFeatureProcedure } from "@/features/auth/procedures/auth-procedure"; // SaaS Boilerplate auth
import { z } from "zod";

export const eventsController = igniter.controller({
  name: "events",
  path: "/events",
  actions: {
    create: igniter.mutation({
      name: "Create",
      description: "Create new event",
      path: "/",
      method: "POST",
      use: [AuthFeatureProcedure()], // 🔐 Procedure injects auth methods
      body: z.object({ title: z.string(), description: z.string() }),
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation inside handler
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member']
        });

        if (!session || !session.organization) {
          return response.unauthorized('Authentication required');
        }

        // Authentication: Access authenticated user from SaaS Boilerplate auth
        const userId = session.user!.id;

        // Business Logic: Use injected repository
        const event = await context.database.event.create({
          data: {
            title: request.body.title,
            description: request.body.description,
            userId,
          }
        });

        return response.created(event);
      },
    }),

    list: igniter.query({
      name: "List",
      description: "List user events",
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

        const userId = session.user!.id;

        const events = await context.database.event.findMany({
          where: { userId }
        });

        return response.success(events);
      },
    }),
  },
});
```

### ❌ What NOT to Do (Common Mistakes):

```typescript
// ❌ INCORRECT - Using old auth patterns
import { authProcedure } from "../procedures/auth-procedure"; // Wrong import path

// ❌ INCORRECT - Wrong context access
const userId = context.auth.userId; // Old flat structure

// ❌ INCORRECT - Wrong service access
const database = context.database; // Should use context.database

// ❌ INCORRECT - Not checking SaaS Boilerplate auth files first
// Never implement auth without checking the current auth.procedure.ts
```

### **✅ WHAT ACTUALLY WORKS (Correct API):**
```typescript
// ✅ CORRECT - Success responses
return response.success(data);           // 200 OK
return response.created(data);           // 201 Created
return response.noContent();             // 204 No Content
return response.json(data);              // Custom JSON

// ✅ CORRECT - Error responses
return response.badRequest(message, data);      // 400 Bad Request
return response.unauthorized(message, data);    // 401 Unauthorized
return response.forbidden(message, data);       // 403 Forbidden
return response.notFound(message, data);        // 404 Not Found

// ✅ CORRECT - Custom error
return response.error({
  code: "CUSTOM_ERROR_CODE",
  message: "Custom error message",
  data: additionalData
});
```

## 🔍 MANDATORY: SaaS Boilerplate Source Code Analysis Protocol

**⚠️ CRITICAL: BEFORE implementing any Igniter.js functionality, you MUST check SaaS Boilerplate files first:**

### 1. SaaS Boilerplate Files to Always Check:
```typescript
// ✅ MANDATORY: Check these SaaS Boilerplate files FIRST
await read_file({ target_file: "src/igniter.context.ts" });           // Global services structure
await read_file({ target_file: "src/@saas-boilerplate/features/auth/procedures/auth.procedure.ts" }); // Current auth implementation
await read_file({ target_file: "prisma/schema.prisma" });             // Database models
await read_file({ target_file: "src/igniter.router.ts" });            // Available controllers
await read_file({ target_file: "src/@saas-boilerplate/features/auth/auth.interface.ts" }); // Auth types
await read_file({ target_file: "src/services/auth.ts" });             // Better Auth configuration
```

### 2. Igniter.js Core Analysis (After checking SaaS Boilerplate):
```typescript
// Only after checking SaaS Boilerplate files, analyze Igniter.js core
await explore_source({
  filePath: "node_modules/@igniter-js/core/dist/index.d.ts",
  symbol: "IgniterResponseProcessor"
});
```

### 3. Analysis Requirements:
- **Never assume methods exist** based on intuitive naming, ALWAYS check THE ORIGINAL SOURCE CODE and TYPES.
- **Test with minimal examples** before full implementation.
- **Store findings** in memory for future reference.
- **Update examples** to match current SaaS Boilerplate patterns.

## 1. Controllers (`igniter.controller`)

### 1.1. Definition
```typescript
import { igniter } from "@/igniter";
import { z } from "zod";

export const authController = igniter.controller({
  name: "auth",                    // ✅ REQUIRED - Descriptive name
  path: "/auth",                   // ✅ REQUIRED - Base URL path
  description: "User authentication endpoints including sign-up, sign-in, and session management.", // ✅ REQUIRED for OpenAPI
  actions: {
    // ... actions defined here
  },
});
```

### 1.2. Controller Properties
| Property      | Type     | Required | Description                                                                 |
| :--- | :---- | :---- | :----- |
| `name`        | `string` | **Yes**  | A descriptive name for the controller, used in documentation and debugging. |
| `path`        | `string` | **Yes**  | The base URL segment for all actions within this controller (e.g., `/auth`). |
| `actions`     | `object` | **Yes**  | An object containing all the API endpoints (actions) for this controller.   |
| `description` | `string` | **Yes**  | A detailed description for OpenAPI documentation generation. Explain the controller's purpose and scope. |
| `use`         | `array`  | No       | An array of procedures (middlewares) to be executed for every action in this controller. |

## 1.3. Procedures Naming Convention
- **ALWAYS use concise and clear names** for procedures, matching the file name (e.g., `name: "authProcedure"` for `auth-procedure.ts`). This improves readability, maintainability, and debuggability.

## 1.4. Architectural Rule: No Modification of Default Igniter Files
- **CRITICAL**: Never modify default Igniter files such as `src/igniter.ts`, `src/igniter.context.ts`, or `src/igniter.router.ts`. These files are designed for automatic type inference and configuration. Any custom context or setup should be handled in feature-specific procedures that extend the existing context.

## 2. Actions (`igniter.query` & `igniter.mutation`)

### 2.1. Action Properties

Both `query` and `mutation` actions share a similar set of properties:

| Property      | Type     | Required | Description                                                                 |
| :--- | :---- | :---- | :----- |
| `path`        | `string` | Yes      | The URL path segment for this action, appended to the controller's path. Supports parameters like `/:id`. |
| `handler`     | `function`| Yes      | The function that contains the business logic for the endpoint.             |
| `method`      | `string` | **Yes** for `mutation` | The HTTP method (`POST`, `PUT`, `PATCH`, `DELETE`). For `query`, it defaults to `GET`. |
| `body`        | `zod schema`| No   | A Zod schema to validate the request body. Only for `mutation`.             |
| `query`       | `zod schema`| No   | A Zod schema to validate the URL query parameters.                          |
| `use`         | `array`  | No       | An array of procedures (middlewares) to be executed before the handler for this specific action. |
| `name`        | `string` | No       | A short, descriptive name for the action, used in documentation.            |
| `description` | `string` | **Yes**  | A detailed description of what the action does, including expected behavior, parameters, and return values. |

## 2.4. Repository Pattern Integration
- **Centralized Database Access**: For each feature (excluding `auth`), implement a dedicated repository class in `src/features/[feature]/repositories/[feature].repository.ts`. This class should centralize all direct Prisma database calls for that entity.
- **Procedure Injection**: Create a corresponding procedure in `src/features/[feature]/procedures/[feature].procedure.ts` that instantiates the repository and injects it into the Igniter context under a hierarchical structure.
- **Controller Usage**: Controllers should then use the injected repository object via the structure (e.g., `context.events.repository.create(...)`) instead of making direct Prisma calls (`context.database.event.create(...)`).
- **TSDoc Documentation**: All repository classes and their methods, as well as the procedure handlers, **MUST** be documented with comprehensive TSDoc comments in English, explaining their purpose, parameters, return values, and business logic.

## 2.5. Documentation Standard for Interfaces and Schemas
- **CRITICAL**: All exported constants, Zod schemas, types, and interfaces within `src/features/[feature]/[feature].interfaces.ts` files **MUST** include comprehensive TSDoc comments in English. This promotes clarity, type safety, and auto-generated documentation.

```typescript
// src/features/auth/auth.interfaces.ts (Example)
import { z } from "zod";
 * @description Type definition for the sign-up request body, inferred from SignUpBodySchema.
 */
export type SignUpBody = z.infer<typeof SignUpBodySchema>;
```

## 2.6. Inline Comments for Business Logic
- **Structured Comments**: Every significant line of business logic, observation, or security rule in controllers and procedures **MUST** be accompanied by an inline comment in English. Use a clear prefix system:
  - `// Business Rule: [message]` - Explains a specific business requirement or validation.
  - `// Observation: [message]` - Notes an observed state or data extraction.
  - `// Business Logic: [message]` - Describes a core operation or transformation.
  - `// Security Rule: [message]` - Highlights a security-related control.
  - `// Session Management: [message]` - Details session-related actions.
  - `// Data Transformation: [message]` - Explains data formatting or conversion.
  - `// Context Extension: [message]` - Describes how the context is being extended.
  - `// Response: [message]` - Explains the content and status of the HTTP response.

## 2.7. `zod` Import in Controllers
- **Maintain `z` import**: Keep `import { z } from "zod";` in controller files, even if `z` is not directly used within the handler function, as it is integral to defining schemas that are then imported.

### 2.2. Query Action (`igniter.query`)
Used for fetching data, corresponding to `GET` requests.

```typescript
    list: igniter.query({
      name: 'List',
      description: 'List all users',
      path: '/',
      query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '10')),
    role: z.enum(['user', 'admin']).optional(),
    search: z.string().optional(),
  }),
  handler: async ({ request, response, context }) => {
    // Observation: Extract pagination and filtering parameters from the request query.
    const { page, limit, role, search } = request.query;

    // Business Logic: Query users from the database with filtering and pagination.
    const users = await context.database.user.findMany({
      where: {
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Security Rule: passwordHash is intentionally excluded for security
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Business Logic: Count total users for pagination metadata.
    const total = await context.database.user.count({
      where: {
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    });

    // Response: Return paginated users list with metadata.
    return response
      .success({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
      ;
  },
}),

    getById: igniter.query({
      name: 'GetById',
      description: 'Get user by ID',
      path: '/:id' as const,  // ✅ CRITICAL: Use 'as const' for type inference
  handler: async ({ request, response, context, params }) => {
    // Observation: Extract user ID from the request parameters.
    const { id } = request.params;

    // Business Logic: Query user by ID from the database.
    const user = await context.database.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Security Rule: passwordHash is intentionally excluded for security
      }
    });

    // Business Rule: If user is not found, return 404 Not Found.
    if (!user) {
      return response
        .notFound('User not found')
        ;
    }

    // Response: Return the found user.
    return response
      .success(user)
      ;
  },
})
```

### 2.3. Mutation Action (`igniter.mutation`)
Used for creating, updating, or deleting data. Corresponds to `POST`, `PUT`, `PATCH`, or `DELETE` requests.

```typescript
    create: igniter.mutation({
      name: 'Create',
      description: 'Create new user',
      path: '/',
      method: 'POST',
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['user', 'admin']).default('user'),
  }),
  handler: async ({ request, response, context }) => {
    // Observation: Extract user details from the request body.
    const { name, email, password, role } = request.body;

    // Business Rule: Check if a user with the provided email already exists.
    const existingUser = await context.database.user.findUnique({
      where: { email }
    });

    // Business Rule: If user with email exists, return bad request to prevent duplicates.
    if (existingUser) {
      return response
        .badRequest('User with this email already exists')
        ;
    }

    // Security Rule: Hash the password securely using the injected password service.
    const passwordHash = await context.password.hash(password);

    // Business Logic: Create a new user record in the database.
    const user = await context.database.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Security Rule: passwordHash is intentionally excluded for security
      }
    });

    // Response: Return the created user with 201 Created status.
    return response
      .created(user)
      ;
  },
}),

    update: igniter.mutation({
      name: 'Update',
      description: 'Update existing user',
      path: '/:id' as const,  // ✅ CRITICAL: Use 'as const' for type inference
      method: 'PUT',
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
  }),
  handler: async ({ request, response, context, params }) => {
    // Observation: Extract user ID from parameters and updates from request body.
    const { id } = request.params;
    const updates = request.body;

    // Business Rule: Check if user exists before updating.
    const existingUser = await context.database.user.findUnique({
      where: { id }
    });

    // Business Rule: If user doesn't exist, return 404 Not Found.
    if (!existingUser) {
      return response
        .notFound('User not found')
        ;
    }

    // Business Rule: Check email uniqueness if updating email.
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await context.database.user.findUnique({
        where: { email: updates.email }
      });

      // Business Rule: If email is already in use, return bad request.
      if (emailExists) {
        return response
          .badRequest('Email already in use')
          ;
      }
    }

    // Business Logic: Update the user record in the database.
    const user = await context.database.user.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Security Rule: passwordHash is intentionally excluded for security
      }
    });

    // Response: Return the updated user with 200 OK status.
    return response
      .success(user)
      ;
  },
}),

    delete: igniter.mutation({
      name: 'Delete',
      description: 'Delete user permanently',
      path: '/:id' as const,  // ✅ CRITICAL: Use 'as const' for type inference
      method: 'DELETE',
  handler: async ({ request, response, context, params }) => {
    // Observation: Extract user ID from the request parameters.
    const { id } = request.params;

    // Business Rule: Check if user exists before deletion.
    const existingUser = await context.database.user.findUnique({
      where: { id }
    });

    // Business Rule: If user doesn't exist, return 404 Not Found.
    if (!existingUser) {
      return response
        .notFound('User not found')
        ;
    }

    // Business Logic: Delete the user record from the database.
    // Note: Prisma will handle cascade deletes if configured in schema.
    await context.database.user.delete({
      where: { id }
    });

    // Response: Return 204 No Content for successful deletion.
    return response
      .noContent()
      ;
  },
})
```

## 3. The Handler Context - COMPLETE REFERENCE

The `handler` function receives a single context object with these properties:

### 3.1. Request Object
```typescript
handler: async ({ request, response, context, params }) => {
  // request.body - Validated request body (from Zod schema)
  const { name, email, password } = request.body;
  
  // request.query - Validated query parameters (from Zod schema)
  const { page, limit } = request.query;
  
  // request.headers - HTTP headers
  const authHeader = request.headers.get('authorization');
  
  // request.cookies - HTTP cookies
  const sessionToken = request.cookies.get('session');
  
  // request.method - HTTP method
  const method = request.method;
  
  // request.path - Request path
  const path = request.path;
}
```

### 3.2. Response Object - COMPLETE API
```typescript
// ✅ SUCCESS RESPONSES
return response.success(data);           // 200 OK
return response.created(data);           // 201 Created
return response.noContent();             // 204 No Content
return response.json(data);              // Custom JSON

// ✅ ERROR RESPONSES
return response.badRequest(message, data);      // 400 Bad Request
return response.unauthorized(message, data);    // 401 Unauthorized
return response.forbidden(message, data);       // 403 Forbidden
return response.notFound(message, data);        // 404 Not Found

// ✅ CUSTOM RESPONSES
return response
  .status(418)                    // Custom status code
  .setHeader('X-Custom', 'value') // Set custom header
  .setCookie('session', token, {  // Set cookie
    httpOnly: true,
    secure: true,
    maxAge: 3600
  })
  .success(data)
  ;

// ✅ STREAMING RESPONSES
return response
  .stream({
    channelId: 'notifications:user:123',
    initialData: { status: 'connected' }
  })
  ;

// ✅ CACHE REVALIDATION
return response
  .revalidate(['users', 'posts'])
  .success(data)
  ;
```

### 3.3. Context Object
```typescript
handler: async ({ request, response, context, params, realtime }) => {
  // Database access via global services
  const users = await context.database.user.findMany();

  // Authentication context (hierarchical structure)
  const userId = context.auth.session.user?.id;
  const authUser = context.auth.session.user;

  // Feature-specific repositories (hierarchical structure)
  const eventsRepository = context.events.repository;
  const authRepository = context.auth.repository;

  // Global services (password, JWT, etc.)
  const { password: passwordService, jwt: jwtService } = context.services;

  // Logging
  igniter.logger.info('User created', { userId });

  // Real-time services
  realtime.publish('user:created', { userId });

  // Store/cache
  await igniter.store.set('user:123', userData, { ttl: 3600 });
}
```

### 3.4. Params Object (with `as const`)
```typescript
// ✅ CORRECT: Use 'as const' for type inference
getById: igniter.query({
  path: '/:id' as const,  // This enables params.id type inference
  handler: async ({ params }) => {
    // params.id is automatically typed as string
    const userId = params.id;
    
    // TypeScript knows this is a string, not unknown
    const user = await context.database.user.findUnique({
      where: { id: userId }
    });
  }
})

// ❌ INCORRECT: Without 'as const', params.id is unknown
getById: igniter.query({
  path: '/:id',  // Missing 'as const'
  handler: async ({ params }) => {
    // params.id is typed as unknown - TypeScript error!
    const userId = params.id; // Error: Type 'unknown' is not assignable to type 'string'
  }
})
```

## 4. Complete Working Example - Authentication Controller

```typescript
// ✅ SaaS Boilerplate Auth Controller Example
import { igniter } from "@/igniter";
import { z } from "zod";
import { AuthFeatureProcedure } from "@/features/auth/procedures/auth-procedure"; // SaaS Boilerplate auth

export const eventsController = igniter.controller({
  name: "events",
  path: "/events",
  description: "Manage user events with SaaS Boilerplate authentication",
  actions: {
    create: igniter.mutation({
      name: "Create",
      description: "Create new event",
      path: "/",
      method: "POST",
      use: [AuthFeatureProcedure()], // ✅ SaaS Boilerplate auth
      body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        date: z.string().datetime()
      }),
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation inside handler
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member']
        });

        if (!session || !session.organization) {
          return response.unauthorized('Authentication required');
        }

        // Authentication: Access user from SaaS Boilerplate auth system
        const userId = session.user!.id;

        // Business Logic: Create event using global database service
        const event = await context.database.event.create({
          data: {
            title: request.body.title,
            description: request.body.description,
            date: new Date(request.body.date),
            userId,
          }
        });

        return response.created(event);
      },
    }),

    list: igniter.query({
      name: "List",
      description: "List user events",
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

        const userId = session.user!.id;

        const events = await context.database.event.findMany({
          where: { userId },
          orderBy: { date: 'asc' }
        });

        return response.success(events);
      },
    }),

    getById: igniter.query({
      name: "GetById",
      description: "Get event by ID",
      path: "/:id" as const,
      use: [AuthFeatureProcedure()], // ✅ SaaS Boilerplate auth
      handler: async ({ request, response, context }) => {
        const userId = context.auth.session.user!.id;
        const eventId = request.params.id;

        const event = await context.database.event.findFirst({
          where: {
            id: eventId,
            userId, // Security: Only allow access to user's own events
          }
        });

        if (!event) {
          return response.notFound("Event not found");
        }

        return response.success(event);
      },
    }),

    update: igniter.mutation({
      name: "Update",
      description: "Update existing event",
      path: "/:id" as const,
      method: "PUT",
      use: [AuthFeatureProcedure()], // ✅ SaaS Boilerplate auth
      body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        date: z.string().datetime().optional()
      }),
      handler: async ({ request, response, context }) => {
        const userId = context.auth.session.user!.id;
        const eventId = request.params.id;

        const event = await context.database.event.findFirst({
          where: {
            id: eventId,
            userId, // Security: Only allow updating user's own events
          }
        });

        if (!event) {
          return response.notFound("Event not found");
        }

        const updatedEvent = await context.database.event.update({
          where: { id: eventId },
          data: {
            ...(request.body.title && { title: request.body.title }),
            ...(request.body.description !== undefined && { description: request.body.description }),
            ...(request.body.date && { date: new Date(request.body.date) }),
          }
        });

        return response.success(updatedEvent);
      },
    }),

    delete: igniter.mutation({
      name: "Delete",
      description: "Delete event",
      path: "/:id" as const,
      method: "DELETE",
      use: [AuthFeatureProcedure()], // ✅ SaaS Boilerplate auth
      handler: async ({ request, response, context }) => {
        const userId = context.auth.session.user!.id;
        const eventId = request.params.id;

        const event = await context.database.event.findFirst({
          where: {
            id: eventId,
            userId, // Security: Only allow deleting user's own events
          }
        });

        if (!event) {
          return response.notFound("Event not found");
        }

        await context.database.event.delete({
          where: { id: eventId }
        });

        return response.success({ deleted: true });
      },
    }),
  },
});
```

## 5. Common Pitfalls and Solutions

### 5.1. Response API Mistakes
```typescript
// ❌ WRONG - These don't exist
return response.ok(data);
return response.error(code, message);
return response.response(data);

// ✅ CORRECT - Use the actual API
return response.success(data);
return response.badRequest(message);
return response.created(data);
```

### 5.2. Type Inference Issues
```typescript
// ❌ WRONG - Missing 'as const'
path: '/:id',  // params.id will be 'unknown'

// ✅ CORRECT - With 'as const'
path: '/:id' as const,  // params.id will be 'string'
```

### 5.3. Missing Required Properties
```typescript
// ❌ WRONG - Missing required properties
export const controller = igniter.controller({
  path: '/users',  // Missing 'name' and 'actions'
  actions: {}
});

// ✅ CORRECT - All required properties
export const controller = igniter.controller({
  name: 'Users',           // ✅ Required
  path: '/users',          // ✅ Required
  description: 'User management endpoints', // ✅ Required
  actions: {               // ✅ Required
    // ... actions
  }
});
```

### 5.4. Incorrect Handler Parameters
```typescript
// ❌ WRONG - Wrong parameter destructuring
handler: async ({ body, context, response }) => {
  // 'body' doesn't exist, should be 'request.body'
}

// ✅ CORRECT - Proper parameter destructuring
handler: async ({ request, context, response }) => {
  const { name, email } = request.body;
}
```

### 5.4. Incorrect Context Access Patterns
```typescript
// ❌ WRONG - Old flat context pattern (deprecated)
handler: async ({ context }) => {
  const eventsRepo = context.eventsRepository;           // ❌ Old pattern
  const userId = context.auth.userId;                   // ❌ Old pattern
  const database = context.database;                     // ❌ Old pattern
  const jwtService = context.jwt;                        // ❌ Old pattern
}

// ✅ CORRECT - New hierarchical context pattern
handler: async ({ context }) => {
  const eventsRepo = context.events.repository; // ✅ New pattern
  const userId = context.auth.session.user.id;          // ✅ New pattern
  const database = context.database;            // ✅ New pattern
  const jwtService = context.jwt;               // ✅ New pattern
}
```

### 5.5. Incorrect Service Usage
```typescript
// ❌ WRONG - Using services directly instead of injected services
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

handler: async ({ context }) => {
  const hash = await bcrypt.hash(password, 10);           // ❌ Direct import
  const token = jwt.sign(payload, JWT_SECRET);           // ❌ Direct import
}

// ✅ CORRECT - Using injected global services
handler: async ({ context }) => {
  const hash = await context.password.hash(password);     // ✅ Injected service
  const token = context.jwt.generateToken(payload);      // ✅ Injected service
}
```

### 5.6. Missing Procedure Usage
```typescript
// ❌ WRONG - Missing procedure injection for repository access
export const eventsController = igniter.controller({
  name: "events",
  path: "/events",
  actions: {
    create: igniter.mutation({
      path: "/",
      // ❌ Missing 'use: [authProcedure(), eventsProcedure()]'
      handler: async ({ context }) => {
        // ❌ This will fail - repository not injected
        const event = await context.events.repository.create(data);
      },
    }),
  },
});

// ✅ CORRECT - Proper procedure injection
export const eventsController = igniter.controller({
  name: "events",
  path: "/events",
  actions: {
    create: igniter.mutation({
      path: "/",
      use: [authProcedure({ required: true }), eventsProcedure()], // ✅ Required procedures
      handler: async ({ context }) => {
        // ✅ Repository properly injected via procedures
        const event = await context.events.repository.create(data);
      },
    }),
  },
});
```

### 5.7. Incorrect Repository Method Calls
```typescript
// ❌ WRONG - Wrong repository method names (based on old patterns)
handler: async ({ context }) => {
  const event = await context.events.repository.createEvent(data); // ❌ Wrong method name
  const events = await context.events.repository.listEvents(userId); // ❌ Wrong method name
}

// ✅ CORRECT - Correct repository method names
handler: async ({ context }) => {
  const event = await context.events.repository.create(data); // ✅ Correct method name
  const events = await context.events.repository.list(userId); // ✅ Correct method name
}
```

## 6. Testing and Validation Protocol

### 6.1. Mandatory Testing Checklist
After implementing any controller or action:

- [ ] **OpenAPI Generation**: Run `generate_docs()` and verify endpoint appears
- [ ] **Schema Validation**: Test with valid and invalid data
- [ ] **Success Scenarios**: Verify correct status codes and response structure
- [ ] **Error Scenarios**: Test validation errors and edge cases
- [ ] **Authentication**: Test protected endpoints with and without auth
- [ ] **Performance**: Verify response times are acceptable (<500ms)

### 6.2. Testing Commands
```bash
# Test success scenario - Auth Controller
await make_api_request(method="POST", url="http://localhost:3000/api/v1/auth/sign-up", headers={"Content-Type": "application/json"}, body={"name": "Test User", "email": "test@example.com", "password": "password123"})

# Test validation error - Auth Controller
await make_api_request(method="POST", url="http://localhost:3000/api/v1/auth/sign-up", headers={"Content-Type": "application/json"}, body={"name": "Jo", "email": "invalid-email", "password": "123"})

# Test authentication required - Events Controller
await make_api_request(method="GET", url="http://localhost:3000/api/v1/events")

# Test hierarchical context - Events Controller with auth
await make_api_request(method="POST", url="http://localhost:3000/api/v1/events", headers={"Content-Type": "application/json", "Cookie": "sessionToken=your-jwt-token"}, body={"title": "Test Event", "description": "Test Description", "duration": 60})

# Test repository injection via procedures
await make_api_request(method="GET", url="http://localhost:3000/api/v1/events", headers={"Cookie": "sessionToken=your-jwt-token"})
```

### 6.3. Validation Documentation Template
```markdown
## Controller Validation: {ControllerName}

### Endpoints Tested
- [ ] POST /api/v1/auth/sign-up - Status: 201, Response time: XXXms
- [ ] POST /api/v1/auth/sign-in - Status: 200, Response time: XXXms
- [ ] GET /api/v1/auth/profile - Status: 200, Response time: XXXms

### Validation Tests
- [ ] Invalid JSON body returns 400
- [ ] Missing required fields returns 400
- [ ] Invalid email format returns 400
- [ ] Duplicate email returns 400
- [ ] Invalid credentials return 401

### Security Validations
- [ ] Password hash not exposed in responses
- [ ] Sensitive data properly filtered
- [ ] Input sanitization prevents injection

### Issues Found
- List any issues discovered during testing
- Include status codes, error messages, and reproduction steps
```
## 7. Best Practices Summary

1. **Always add descriptions** to controllers and actions for better API documentation
2. **Use `analyze_file`** before and after modifying controller files
3. **Test endpoints immediately** after implementation using API validation tools
4. **Store validation patterns** in memory for reuse and learning
5. **Use appropriate HTTP methods** and status codes
6. **Implement proper error handling** with meaningful error messages
7. **Add authentication/authorization** where appropriate using procedures
8. **Use `as const`** for routes with parameters to enable type inference
9. **Never assume methods exist** - always check the source code
10. **Use the correct response API** - success(), created(), badRequest(), etc.
11. **Always call ``** at the end of response chains
12. **Use hierarchical context structure** - `context.{feature}.repository`
13. **Use global services** - `context.password`, `context.jwt`, `context.database`
14. **Exclude sensitive data** from responses using proper select statements
15. **Validate input thoroughly** with Zod schemas from interfaces
16. **Handle errors gracefully** with appropriate HTTP status codes
17. **Test with real HTTP requests** using curl or similar tools
18. **Use structured inline comments** with Business Rule:, Observation:, Security Rule: prefixes
19. **Apply procedures consistently** with `use: [authProcedure(), featureProcedure()]`
20. **Follow repository pattern** with hierarchical injection via procedures

## 8. Memory Storage for Patterns

Store successful patterns using:

```typescript
await store_memory({
  type: "api_mapping",
  title: "Igniter.js Controller Pattern - {Feature}",
  content: `# {Feature} Controller Implementation

## Endpoints
- POST /api/v1/{feature} - Create
- GET /api/v1/{feature} - List
- GET /api/v1/{feature}/:id - Get by ID
- PUT /api/v1/{feature}/:id - Update
- DELETE /api/v1/{feature}/:id - Delete

## Implementation Patterns
- Hierarchical context access: \`context.{feature}.repository\`
- Global services: \`context.password\`, \`context.jwt\`, \`context.database\`
- Procedure injection with \`use: [authProcedure(), {feature}Procedure()]\`
- Inline comments: Business Rule:, Observation:, Security Rule:, etc.

## Validation Patterns
- Body validation with Zod schemas from interfaces
- Query parameter validation with \`as const\` for type inference
- Error handling with proper HTTP status codes
- Response formatting with consistent API patterns

## Security Considerations
- Data filtering to exclude sensitive fields (passwordHash)
- Authentication using injected auth procedures
- Input sanitization via Zod validation
- Cookie management for session tokens`,
  tags: ["igniter-js", "controller", "api", "pattern", "hierarchical-context", "services-injection"],
  confidence: 0.95
});
```
## 9. Updated Context Access Patterns (New Hierarchical Structure)

### 9.1. Modern Context Structure
```typescript
// ✅ NEW PATTERN: Hierarchical feature-based structure
context.{featureName}.{resourceType}.{resourceName}

// Examples:
const eventsRepository = context.events.repository;
const authUser = context.auth.session.user;
const globalServices = context.services; // password, jwt, database, etc.

// ❌ OLD PATTERN: Flat structure (deprecated)
const eventsRepository = context.eventsRepository;
const authUser = context.auth.userId;
```

### 9.2. Complete Example - Events Controller (New Pattern)
```typescript
import { igniter } from "@/igniter";
import { z } from "zod";
import { authProcedure } from "../../auth/procedures/auth-procedure";
import { eventsProcedure } from "../procedures/events-procedure";
import { CreateEventBodySchema, UpdateEventBodySchema } from "../events.interfaces";

export const eventsController = igniter.controller({
  name: "events",
  path: "/events",
  description: "Manage user event types with hierarchical context structure",
  actions: {
    create: igniter.mutation({
      name: "Create",
      description: "Create new event type",
      path: "/",
      method: "POST",
      use: [authProcedure({ required: true }), eventsProcedure()],
      body: CreateEventBodySchema,
      handler: async ({ request, response, context }) => {
        // Observation: Extract event details from the request body.
        const { title, description, duration } = request.body;

        // Authentication: Retrieve the authenticated user's ID from the context.
        const userId = context.auth.session.user!.id;

        // Business Logic: Create a new event using the EventsRepository via hierarchical context.
        const event = await context.events.repository.create({
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
      use: [authProcedure({ required: true }), eventsProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Retrieve the authenticated user's ID from the context.
        const userId = context.auth.session.user!.id;

        // Business Logic: Retrieve all events belonging to the authenticated user.
        const events = await context.events.repository.list(userId);

        // Response: Return the list of events with a 200 status.
        return response.success(events);
      },
    }),

    getById: igniter.query({
      name: "GetById",
      description: "Get event by ID",
      path: "/:id" as const,
      use: [authProcedure({ required: true }), eventsProcedure()],
      handler: async ({ response, context, request }) => {
        // Observation: Extract the event ID from the request parameters.
        const { id } = request.params;

        // Authentication: Retrieve the authenticated user's ID from the context.
        const userId = context.auth.session.user!.id;

        // Business Rule: Retrieve the event, ensuring it belongs to the authenticated user.
        const event = await context.events.repository.getById(id);

        // Business Rule: If no event is found or the user does not own it, return a 404 not found response.
        if (!event) {
          return response.notFound("Event not found");
        }

        // Response: Return the found event with a 200 status.
        return response.success(event);
      },
    }),

    update: igniter.mutation({
      name: "Update",
      description: "Update existing event",
      path: "/:id" as const,
      method: "PUT",
      use: [authProcedure({ required: true }), eventsProcedure()],
      body: UpdateEventBodySchema,
      handler: async ({ request, response, context }) => {
        // Observation: Extract the event ID from the request parameters.
        const { id } = request.params;

        // Authentication: Retrieve the authenticated user's ID from the context.
        const userId = context.auth.session.user!.id;

        // Business Rule: Check if the event exists and belongs to the authenticated user.
        const existingEvent = await context.events.repository.getById(id);

        // Business Rule: If the event is not found or not owned by the user, return a 404 not found response.
        if (!existingEvent) {
          return response.notFound("Event not found");
        }

        // Business Logic: Update the event record in the database using the EventsRepository.
        const updatedEvent = await context.events.repository.update(id, request.body);

        // Response: Return the updated event with a 200 status.
        return response.success(updatedEvent);
      },
    }),

    delete: igniter.mutation({
      name: "Delete",
      description: "Delete event permanently",
      path: "/:id" as const,
      method: "DELETE",
      use: [authProcedure({ required: true }), eventsProcedure()],
      handler: async ({ response, context, request }) => {
        // Observation: Extract the event ID from the request parameters.
        const { id } = request.params as { id: string };

        // Authentication: Retrieve the authenticated user's ID from the context.
        const userId = context.auth.session.user!.id;

        // Business Rule: Check if the event exists and belongs to the authenticated user.
        const existingEvent = await context.events.repository.getById(id);

        // Business Rule: If the event is not found or not owned by the user, return a 404 not found response.
        if (!existingEvent) {
          return response.notFound("Event not found");
        }

        // Business Logic: Delete the event record from the database using the EventsRepository.
        await context.events.repository.delete(id);

        // Response: Confirm successful deletion with a 200 status.
        return response.success({ deleted: true });
      },
    }),
  },
});
```

### 9.3. Migration Guide: Old vs New Pattern

| Context | Old Pattern (Deprecated) | New Pattern (Recommended) |
|---------|-------------------------|---------------------------|
| **Events Repository** | `context.eventsRepository` | `context.events.repository` |
| **Auth Repository** | `context.auth.repository` | `context.auth.repository` |
| **Auth User** | `context.auth.userId` | `context.auth.session.user.id` |
| **Global Services** | `context.database` | `context.database` |
| **JWT Service** | `context.jwt` | `context.jwt` |
| **Password Service** | `context.password` | `context.password` |

### 9.4. Benefits of New Hierarchical Structure

✅ **Consistency**: All features follow the same organizational pattern  
✅ **Scalability**: Easy to add new resource types (services, repositories, etc.)  
✅ **Type Safety**: Better TypeScript inference with predictable structure  
✅ **Maintainability**: Clear separation between global and feature-specific resources  
✅ **Future-Proof**: Extensible structure for complex applications  

This comprehensive guide ensures you'll never make the same mistakes I did during the authentication implementation and provides a solid foundation for building robust Igniter.js APIs with the new hierarchical context structure.

## 9. SaaS Boilerplate Files - ALWAYS Check First

### 🚨 CRITICAL REMINDER: Essential Files to Always Verify

**⚠️ MANDATORY: BEFORE implementing any Igniter.js functionality, you MUST check these SaaS Boilerplate files:**

1. **`src/igniter.context.ts`** - Global services and context structure
2. **`src/@saas-boilerplate/features/auth/procedures/auth.procedure.ts`** - Current auth implementation
3. **`prisma/schema.prisma`** - Database models and relationships
4. **`src/igniter.router.ts`** - Available controllers and routes
5. **`src/@saas-boilerplate/features/auth/auth.interface.ts`** - Auth types and schemas
6. **`src/services/auth.ts`** - Better Auth configuration
7. **`src/config/boilerplate.config.server.ts`** - Server configuration

### Analysis Commands - Run These FIRST:

```typescript
// ✅ MANDATORY: Check these files BEFORE any development
await read_file({ target_file: "src/igniter.context.ts" });
await read_file({ target_file: "src/@saas-boilerplate/features/auth/procedures/auth.procedure.ts" });
await read_file({ target_file: "prisma/schema.prisma" });
await read_file({ target_file: "src/igniter.router.ts" });
await read_file({ target_file: "src/@saas-boilerplate/features/auth/auth.interface.ts" });
await read_file({ target_file: "src/services/auth.ts" });
await read_file({ target_file: "src/config/boilerplate.config.server.ts" });
```

### Current SaaS Boilerplate Architecture:

```typescript
// ✅ CORRECT: Current Auth Usage
import { AuthFeatureProcedure } from "@/features/auth/procedures/auth-procedure";

const userId = context.auth.session.user!.id;           // Current auth access
const database = context.database;             // Current database access
const passwordService = context.password;      // Current password service
const jwtService = context.jwt;               // Current JWT service
```

### ❌ What NOT to Do:

```typescript
// ❌ WRONG - Old patterns (don't use)
const userId = context.auth.userId;                    // Old flat structure
const database = context.database;                      // Old service access
import { authProcedure } from "../procedures/auth-procedure"; // Wrong import
```

**REMEMBER: Always check the SaaS Boilerplate files first. The architecture may have changed since these examples were written.**
