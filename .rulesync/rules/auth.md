---
description: "Authentication and Authorization System"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "Authentication and Authorization System"
---
# Authentication and Authorization System Guide for SaaS Boilerplate

This guide provides a comprehensive overview of the authentication and authorization system in SaaS Boilerplate, explaining its architecture, key concepts, and implementation patterns for secure user authentication and multi-tenant access control.

## 1. Authentication System Overview

The Authentication system in SaaS Boilerplate is built on a multi-tenant architecture with organization-based isolation. It provides:

- Multi-provider authentication (social, email/password, OTP)
- Session management
- Role-based access control within organizations
- Organization membership and ownership
- Secure API access

## 2. Key Components

### 2.1 Auth Feature

The `auth` feature is a core module that manages authentication, session, and organization access:

```
src/@saas-boilerplate/features/auth/
├── auth.interface.ts       # Core types and interfaces
├── controllers/
│   └── auth.controller.ts  # API endpoints for auth
├── procedures/
│   └── auth.procedure.ts   # Business logic
└── presentation/
    └── components/         # UI components
```

### 2.2 Auth Interface

The `auth.interface.ts` defines key types for authentication:

```typescript
// Core auth interfaces
export type AppSession<
  TRequirements extends AuthRequirements | undefined = undefined,
  TRoles extends OrganizationMembershipRole[] | undefined = undefined,
> = {
  session: any
  user: User & { email: string }
  organization: Organization & { billing: any } | null
  membership: OrganizationMembership | null
} | null

export type AuthRequirements = 'authenticated' | 'unauthenticated'

export enum OrganizationMembershipRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

// Input types
export type SignInInput = {
  provider: AccountProvider
  callbackURL?: string
}

export type SendVerificationOTPInput = {
  email: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
}

export type GetSessionInput<
  TRequirements extends AuthRequirements | undefined = undefined,
  TRoles extends OrganizationMembershipRole[] | undefined = undefined,
> = {
  requirements?: TRequirements
  roles?: TRoles
}
```

### 2.3 Auth Controller

The `auth.controller.ts` exposes API endpoints for authentication operations:

```typescript
export const AuthController = igniter.controller({
  name: 'auth',
  path: '/auth',
  actions: {
    // Sign in with a social provider
    signInWithProvider: igniter.mutation({
      method: 'POST',
      path: '/sign-in',
      use: [AuthFeatureProcedure()],
      body: z.object({
        provider: z.nativeEnum(AccountProvider),
        callbackURL: z.string().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Implementation
      },
    }),
    
    // Sign in with OTP (one-time password)
    signInWithOTP: igniter.mutation({
      method: 'POST',
      path: '/sign-in/otp',
      // Implementation
    }),
    
    // Send verification code
    sendOTPVerificationCode: igniter.mutation({
      method: 'POST',
      path: '/send-otp-verification',
      // Implementation
    }),
    
    // Sign out
    signOut: igniter.mutation({
      method: 'POST',
      path: '/sign-out',
      // Implementation
    }),
    
    // Get current session
    getSession: igniter.query({
      method: 'GET',
      path: '/session',
      // Implementation
    }),
    
    // Set active organization
    setActiveOrganization: igniter.mutation({
      method: 'POST',
      path: '/set-active-organization',
      // Implementation
    }),
  },
})
```

### 2.4 Auth Procedure

The `auth.procedure.ts` implements the complete business logic for authentication, including advanced features like API Key authentication, organization management, and billing integration:

```typescript
export const AuthFeatureProcedure = igniter.procedure({
  name: 'AuthFeatureProcedure',
  handler: async (options, { request, context }) => {
    return {
      auth: {
        // Set active organization
        setActiveOrganization: async (input: { organizationId: string }) => {
          await tryCatch(
            context.auth.api.setActiveOrganization({
              body: input,
              headers: request.headers,
            }),
          )
        },

        // List user sessions
        listSession: async () => {
          return tryCatch(
            context.auth.api.listSessions({
              headers: request.headers,
            }),
          )
        },

        // Sign in with social provider
        signInWithProvider: async (input: SignInInput) => {
          const response = await tryCatch(
            context.auth.api.signInSocial({
              headers: request.headers,
              body: {
                provider: input.provider,
                callbackURL: Url.get('/app'),
                newUserCallbackURL: Url.get('/get-started'),
                errorCallbackURL: Url.get('/auth?error=true'),
              },
            }),
          )

          if (response.error) {
            return {
              error: {
                code: 'ERR_BAD_REQUEST',
                message: response.error.message,
              },
            }
          }

          return {
            data: {
              redirect: true,
              url: response.data.url,
            },
          }
        },

        // Sign in with OTP
        signInWithOTP: async (input: { email: string; otpCode: string }) => {
          const response = await tryCatch(
            context.auth.api.signInEmailOTP({
              headers: request.headers,
              body: {
                email: input.email,
                otp: input.otpCode,
              },
            }),
          )

          if (response.error) {
            return {
              error: {
                code: 'ERR_BAD_REQUEST',
                message: response.error.message,
              },
            }
          }

          return {
            data: {
              success: true,
            },
          }
        },

        // Send verification code
        sendOTPVerificationCode: async (input: SendVerificationOTPInput) => {
          const response = await tryCatch(
            context.auth.api.sendVerificationOTP({
              headers: request.headers,
              body: input,
            }),
          )

          if (response.error) {
            return {
              error: {
                code: 'ERR_BAD_REQUEST',
                message: response.error.message,
              },
            }
          }

          return {
            data: {
              success: true,
            },
          }
        },

        // Sign out
        signOut: async () => {
          await tryCatch(
            context.auth.api.signOut({
              headers: request.headers,
            }),
          )
        },

        // Get current session with advanced validation and API Key support
        getSession: async <
          TRequirements extends AuthRequirements | undefined = undefined,
          TRoles extends OrganizationMembershipRole[] | undefined = undefined,
        >(
          options?: GetSessionInput<TRequirements, TRoles>,
        ): Promise<AppSession<TRequirements, TRoles>> => {
          // Get regular session
          const session = await context.auth.api.getSession({
            headers: request.headers,
          })

          // API Key authentication fallback
          let apiKeyOrganization = null
          if (!session) {
            const authHeader = request.headers.get('Authorization')
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const token = authHeader.substring(7)
              
              const apiKey = await context.database.apiKey.findUnique({
                where: { key: token, enabled: true },
                include: { organization: true },
              })

              if (apiKey) {
                // Validate API Key expiration
                if (!apiKey.neverExpires && apiKey.expiresAt && new Date() > apiKey.expiresAt) {
                  throw new Error('API_KEY_EXPIRED')
                }

                // API Keys require organization endpoints
                if (!options?.roles || options.roles.length === 0) {
                  throw new Error('API_KEY_REQUIRES_ORGANIZATION_ENDPOINT')
                }

                apiKeyOrganization = apiKey.organization
              }
            }
          }

          // Handle unauthenticated requirement
          if (options?.requirements === 'unauthenticated') {
            if (session || apiKeyOrganization) {
              throw new Error('ALREADY_AUTHENTICATED')
            }
            return null as any
          }

          // Handle authenticated requirement
          if (options?.requirements === 'authenticated' && !session && !apiKeyOrganization) {
            throw new Error('UNAUTHORIZED')
          }

          // Return null if no session or API Key
          if (!session && !apiKeyOrganization) {
            return null as AppSession<TRequirements, TRoles>
          }

          // Handle API Key authentication
          if (apiKeyOrganization && !session) {
            const organization = apiKeyOrganization
            organization.metadata = organization.metadata
              ? JSON.parse(organization.metadata)
              : {}

            const billing = await context.payment.getCustomerById(organization.id)

            return {
              user: null, // No user for API Key authentication
              organization: { ...organization, billing },
            } as any
          }

          // Handle regular session authentication
          if (!session) {
            return null as AppSession<TRequirements, TRoles>
          }

          // Retrieve user from database
          const user = await context.database.user.findUnique({
            where: { id: session.user.id },
          })

          if (!user) {
            throw new Error('USER_NOT_FOUND')
          }

          // Get organization and membership
          let organization = await context.auth.api.getFullOrganization({
            headers: request.headers,
          })

          if (!organization) {
            const userOrganizations = await context.auth.api.listOrganizations({
              headers: request.headers,
            })

            if (userOrganizations.length > 0) {
              await context.auth.api.setActiveOrganization({
                body: { organizationId: userOrganizations[0].id },
                headers: request.headers,
              })

              organization = await context.auth.api.getFullOrganization({
                query: { organizationId: userOrganizations[0].id },
                headers: request.headers,
              })
            }
          }

          const membership = await context.auth.api.getActiveMember({
            headers: request.headers,
          })

          // Validate roles if specified
          if (options?.roles && options.roles.length > 0 && session) {
            if (!organization || !membership) {
              throw new Error('NO_ORGANIZATION_ACCESS')
            }

            if (!options.roles.includes(membership.role as OrganizationMembershipRole)) {
              throw new Error('INSUFFICIENT_PERMISSIONS')
            }
          }

          // Handle organization-only responses
          if (!organization) {
            return {
              ...session,
              user,
              organization: undefined,
            } as any
          }

          // Parse organization metadata and get billing
          organization.metadata = parseMetadata<OrganizationMetadata>(organization.metadata)
          const billing = await context.payment.getCustomerById(organization.id)

          return {
            ...session,
            user,
            organization: { ...organization, billing },
          } as any
        },
      },
    }
  },
})
```

#### Key Features Implemented:

**🔑 API Key Authentication:**
- Supports Bearer token authentication for programmatic access
- Validates API Key expiration and enabled status
- Restricts API Key usage to organization-scoped endpoints only
- Creates virtual sessions for API Key authentication

**🏢 Advanced Organization Management:**
- Automatic organization selection when user has multiple organizations
- Metadata parsing and billing integration
- Membership validation with role-based access control
- Support for users without active organizations

**💳 Billing Integration:**
- Automatic retrieval of organization billing status
- Integration with payment services for customer data
- Billing data included in session responses

**🛡️ Comprehensive Security:**
- Multiple authentication methods (session, API Key)
- Role-based permission validation
- Expiration handling for API Keys
- Secure error handling with tryCatch utility

## 3. Multi-tenant Authentication Flow

### 3.1 Authentication Process

1. **User Sign In**:
   - User authenticates via social provider or OTP
   - System creates/retrieves user account
   - Session is established

2. **Organization Context**:
   - System identifies organizations the user belongs to
   - User selects an active organization
   - Session is updated with organization context

3. **Access Control**:
   - System validates user's role in the active organization
   - Access is granted based on role permissions

### 3.2 Session Management

Sessions in SaaS Boilerplate contain information about:

- The authenticated user
- The active organization
- User's role/membership in the organization
- Billing status of the organization

This information is retrieved using the `getSession` method:

```typescript
// Get authenticated session with role requirements
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner'],
})

if (!session) {
  // Handle unauthenticated/unauthorized access
}

// Access session data
const { user, organization, membership } = session
```

## 4. Implementation Patterns

### 4.1 Protecting API Routes

Use the `AuthFeatureProcedure` to protect API routes:

```typescript
export const ProtectedController = igniter.controller({
  name: 'protected',
  path: '/protected',
  actions: {
    getData: igniter.query({
      method: 'GET',
      path: '/',
      // Add auth procedure to protect the route
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Get session with required authentication and roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner'],
        })
        
        if (!session) {
          return response.unauthorized('You must be an admin or owner')
        }
        
        // Proceed with protected operation
        return response.success({ 
          data: "Protected data",
          user: session.user.email,
          organization: session.organization.name
        })
      },
    }),
  },
})
```

### 4.2 Organization-Specific Data Access

Enforce data isolation between organizations:

```typescript
// Example: Get leads for the current organization
const getOrganizationLeads = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
  })
  
  if (!session || !session.organization) {
    throw new Error('Unauthorized or no active organization')
  }
  
  // Use organization ID to scope the query
  const leads = await context.providers.database.lead.findMany({
    where: { organizationId: session.organization.id },
  })
  
  return leads
}
```

### 4.3 Role-Based Access Control

Implement permission checks based on user roles:

```typescript
// Example: Organization settings access control
const OrganizationSettings = () => {
  const { data: session } = api.auth.getSession.useQuery()
  
  // Check if user has admin privileges
  const isAdmin = session?.membership?.role === 'admin' || 
                  session?.membership?.role === 'owner'
  
  if (!isAdmin) {
    return <AccessDenied message="You need admin privileges to access settings" />
  }
  
  return (
    <SettingsLayout>
      {/* Settings UI */}
    </SettingsLayout>
  )
}
```

### 4.4 Client-Side Authentication

React hooks for auth state:

```typescript
// Example: useAuth hook
export function useAuth() {
  const { data: session, isLoading } = api.auth.getSession.useQuery()
  
  const signOut = async () => {
    await api.auth.signOut.mutate()
    // Redirect or refresh session
  }
  
  const setActiveOrganization = async (organizationId: string) => {
    await api.auth.setActiveOrganization.mutate({ organizationId })
    // Refresh session
  }
  
  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    user: session?.user,
    organization: session?.organization,
    membership: session?.membership,
    signOut,
    setActiveOrganization,
  }
}
```

## 5. Organization Management

### 5.1 Organization Controller

The `organization.controller.ts` manages organization operations:

```typescript
export const OrganizationController = igniter.controller({
  name: 'organization',
  path: '/organization',
  actions: {
    // Create new organization
    create: igniter.mutation({
      method: 'POST',
      path: '/',
      use: [OrganizationFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        name: z.string(),
        slug: z.string(),
        // Other fields
      }),
      handler: async ({ request, response, context }) => {
        // Implementation
      },
    }),
    
    // Get organization stats
    stats: igniter.query({
      method: 'GET',
      path: '/stats',
      use: [OrganizationFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Implementation
      },
    }),
    
    // Verify organization slug availability
    verify: igniter.mutation({
      method: 'POST',
      path: '/verify',
      // Implementation
    }),
    
    // Update organization
    update: igniter.mutation({
      method: 'PUT',
      path: '/',
      // Implementation
    }),
    
    // Delete organization
    delete: igniter.mutation({
      method: 'DELETE',
      path: '/:id',
      // Implementation
    }),
    
    // Get organization by slug (public)
    getBySlug: igniter.query({
      method: 'GET',
      path: '/public/:slug',
      // Implementation
    }),
  },
})
```

### 5.2 Organization Model

The organization data model includes:

```typescript
// Organization types
export type Organization = {
  id: string
  name: string
  slug: string
  logo: string | null
  metadata: OrganizationMetadata
  createdAt: Date
  updatedAt?: Date | null
}

// Organization metadata
export type OrganizationMetadata = {
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  social?: {
    twitter?: string
    facebook?: string
    linkedin?: string
    instagram?: string
  }
  custom?: Record<string, any>
}
```

## 6. Authentication Providers and Methods

### 6.1 Social Authentication

Support for multiple social providers:

```typescript
export enum AccountProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  // Add other providers as needed
}

// Example: Sign in with Google
const signInWithGoogle = async () => {
  const result = await api.auth.signInWithProvider.mutate({
    provider: 'google',
    callbackURL: '/dashboard',
  })
  
  if (result.redirect) {
    window.location.href = result.url
  }
}
```

### 6.2 OTP Authentication

Email-based one-time password flow:

```typescript
// Step 1: Request OTP code
const requestOTP = async (email: string) => {
  await api.auth.sendOTPVerificationCode.mutate({
    email,
    type: 'sign-in',
  })
}

// Step 2: Verify OTP code
const verifyOTP = async (email: string, otpCode: string) => {
  const result = await api.auth.signInWithOTP.mutate({
    email,
    otpCode,
  })

  if (result.success) {
    // Redirect to dashboard
  }
}
```

### 6.3 API Key Authentication

Programmatic authentication using Bearer tokens for API access:

```typescript
// Example: API Key authentication for programmatic access
const authenticateWithApiKey = async (apiKey: string) => {
  // Set Authorization header with Bearer token
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }

  // Make authenticated API request
  const result = await fetch('/api/v1/leads', {
    method: 'GET',
    headers
  })

  if (result.ok) {
    const data = await result.json()
    return data
  } else {
    throw new Error('API Key authentication failed')
  }
}

// Usage in server-side context (within controllers/procedures)
const getSessionWithApiKey = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
    roles: ['admin', 'owner'], // API Keys require organization roles
  })

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}
```

**API Key Features:**
- **Bearer Token Format**: `Authorization: Bearer <api-key>`
- **Expiration Handling**: Automatic validation of API Key expiration dates
- **Organization-Scoped**: API Keys only work with organization-specific endpoints
- **Virtual Sessions**: Creates session-like objects for API Key authentication
- **Database Validation**: Checks `enabled` status and expiration dates

## 7. Advanced Implementation Patterns

### 7.1 API Key Integration

When implementing API Key authentication in your controllers:

```typescript
export const ApiController = igniter.controller({
  name: 'api',
  path: '/api-endpoint',
  actions: {
    getData: igniter.query({
      method: 'GET',
      path: '/',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // API Keys automatically create virtual sessions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner'], // Required for API Key access
        })

        if (!session) {
          return response.unauthorized('API Key authentication failed')
        }

        // Access organization-scoped data
        if (!session.organization) {
          return response.badRequest('API Key requires organization context')
        }

        // Your business logic here
        return response.success({
          data: 'Organization-specific data',
          organizationId: session.organization.id,
          billing: session.organization.billing,
        })
      },
    }),
  },
})
```

### 7.2 Organization Context Management

Handle users with multiple organizations:

```typescript
const OrganizationContextHandler = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
  })

  if (!session) {
    throw new Error('Authentication required')
  }

  // Handle users without organizations
  if (!session.organization) {
    // User exists but hasn't set up an organization yet
    return {
      user: session.user,
      organizations: await context.auth.api.listOrganizations({
        headers: context.request.headers,
      }),
      needsOrganizationSetup: true,
    }
  }

  // User has active organization
  return {
    user: session.user,
    organization: session.organization,
    membership: session.membership,
    billing: session.organization.billing,
  }
}
```

### 7.3 Billing Integration

Access billing information in authenticated contexts:

```typescript
const BillingAwareHandler = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
    roles: ['owner', 'admin'], // Billing access typically requires elevated permissions
  })

  if (!session?.organization?.billing) {
    throw new Error('Billing information not available')
  }

  const billingStatus = session.organization.billing

  // Use billing information for business logic
  if (billingStatus.status === 'past_due') {
    return {
      restricted: true,
      message: 'Payment required to access this feature',
      billing: billingStatus,
    }
  }

  return {
    billing: billingStatus,
    features: billingStatus.subscription?.features || [],
  }
}
```

## 8. Best Practices

### 8.1 Security Considerations

- **API Key Security**: Store API Keys securely, never expose them in client-side code
- **Expiration Management**: Regularly rotate API Keys and monitor expiration dates
- **Role Validation**: Always validate user roles for sensitive operations
- **Session Validation**: Check session validity on every authenticated request
- **HTTPS Enforcement**: Use HTTPS for all authentication and API requests
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Rate Limiting**: Apply rate limits to authentication endpoints
- **Input Sanitization**: Validate and sanitize all user inputs

### 8.2 Session Management

Handle different session types and validation scenarios:

```typescript
// Basic session validation
const getProtectedData = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
  })

  if (!session) {
    throw new Error('Unauthorized')
  }

  // Access protected data
  return session
}

// Role-based session validation
const getAdminData = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
    roles: ['admin', 'owner'], // Multiple roles allowed
  })

  if (!session) {
    throw new Error('Admin access required')
  }

  return session
}

// API Key session handling (virtual sessions)
const getApiData = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
    roles: ['admin', 'owner'], // Required for API Key access
  })

  if (!session) {
    throw new Error('Valid API Key required')
  }

  // API Key sessions have user: null but valid organization
  if (!session.organization) {
    throw new Error('API Key requires organization context')
  }

  return {
    organization: session.organization,
    billing: session.organization.billing,
  }
}

// Handle unauthenticated-only routes (login/signup pages)
const redirectIfAuthenticated = async (context) => {
  try {
    const session = await context.auth.getSession({
      requirements: 'unauthenticated', // Throws if already authenticated
    })
    return { shouldRedirect: false }
  } catch (error) {
    if (error.message === 'ALREADY_AUTHENTICATED') {
      return { shouldRedirect: true, redirectTo: '/app' }
    }
    throw error
  }
}
```

### 8.3 Error Handling & Recovery

Handle authentication-specific errors:

```typescript
const handleAuthErrors = (error) => {
  switch (error.message) {
    case 'UNAUTHORIZED':
      return { status: 401, message: 'Authentication required' }

    case 'API_KEY_EXPIRED':
      return { status: 401, message: 'API Key has expired' }

    case 'API_KEY_REQUIRES_ORGANIZATION_ENDPOINT':
      return { status: 403, message: 'API Key authentication requires organization context' }

    case 'INSUFFICIENT_PERMISSIONS':
      return { status: 403, message: 'Insufficient permissions for this operation' }

    case 'NO_ORGANIZATION_ACCESS':
      return { status: 403, message: 'No active organization or membership found' }

    case 'USER_NOT_FOUND':
      return { status: 401, message: 'User account not found' }

    case 'ALREADY_AUTHENTICATED':
      return { status: 400, message: 'User is already authenticated' }

    default:
      return { status: 500, message: 'Authentication service error' }
  }
}

// Usage in controllers
const AuthenticatedController = async (context) => {
  try {
    const session = await context.auth.getSession({
      requirements: 'authenticated',
      roles: ['admin'],
    })

    // Business logic here
    return { success: true, data: session }

  } catch (error) {
    const errorResponse = handleAuthErrors(error)
    return {
      success: false,
      status: errorResponse.status,
      message: errorResponse.message,
    }
  }
}
```

### 8.4 Organization Switching

Enable users to switch between organizations:

```typescript
const OrganizationSwitcher = () => {
  const { session, setActiveOrganization } = useAuth()
  const [organizations, setOrganizations] = useState([])

  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      const session = await api.auth.getSession.query()
      if (session?.user) {
        // This would need to be implemented in the auth API
        const orgs = await api.organization.list.query()
        setOrganizations(orgs)
      }
    }
    fetchOrganizations()
  }, [])

  const handleOrganizationSwitch = async (organizationId: string) => {
    try {
      await api.auth.setActiveOrganization.mutate({ organizationId })
      // Session will automatically update
      window.location.reload() // Or use router refresh
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  return (
    <Select
      value={session?.organization?.id}
      onValueChange={handleOrganizationSwitch}
    >
      {organizations.map(org => (
        <SelectItem key={org.id} value={org.id}>
          {org.name}
        </SelectItem>
      ))}
    </Select>
  )
}
```

### 8.5 Legacy Error Handling

For backward compatibility with existing error handling patterns:

```typescript
const signIn = async (credentials) => {
  try {
    const result = await api.auth.signIn.mutate(credentials)
    return { success: true, data: result }
  } catch (error) {
    let message = 'Authentication failed'

    // Provide specific error messages
    if (error.code === 'INVALID_CREDENTIALS') {
      message = 'Invalid email or password'
    } else if (error.code === 'ACCOUNT_LOCKED') {
      message = 'Account locked. Please contact support'
    }

    return { success: false, error: message }
  }
}
```

## 9. Complete Examples

### 9.1 Protected API Route with API Key Support

```typescript
export const LeadController = igniter.controller({
  name: 'lead',
  path: '/leads',
  actions: {
    list: igniter.query({
      method: 'GET',
      path: '/',
      // Protect the route with auth
      use: [AuthFeatureProcedure()],
      query: z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
      }),
      handler: async ({ request, response, context }) => {
        // Verify authenticated session (supports both regular and API Key auth)
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner'], // API Keys require organization roles
        })

        if (!session) {
          return response.unauthorized('Authentication required')
        }

        if (!session.organization) {
          return response.badRequest('Organization context required')
        }

        // Get leads for the current organization
        const leads = await context.database.lead.findMany({
          where: { organizationId: session.organization.id },
          skip: (request.query.page - 1) * request.query.limit,
          take: request.query.limit,
        })

        const total = await context.database.lead.count({
          where: { organizationId: session.organization.id },
        })

        return response.success({
          data: leads,
          pagination: {
            page: request.query.page,
            limit: request.query.limit,
            total,
            pages: Math.ceil(total / request.query.limit),
          },
          // Include billing info for API Key consumers
          billing: session.organization.billing,
        })
      },
    }),

    // Other actions...
  },
})
```

### 9.2 API Key-Only Endpoint

```typescript
export const ApiOnlyController = igniter.controller({
  name: 'api-data',
  path: '/api-data',
  actions: {
    export: igniter.query({
      method: 'GET',
      path: '/export',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // This endpoint only accepts API Key authentication
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner'],
        })

        if (!session) {
          return response.unauthorized('API Key authentication required')
        }

        // API Key sessions have user: null
        if (session.user !== null) {
          return response.forbidden('This endpoint only accepts API Key authentication')
        }

        if (!session.organization) {
          return response.badRequest('Valid organization context required')
        }

        // Export organization data
        const exportData = {
          organization: session.organization,
          billing: session.organization.billing,
          timestamp: new Date().toISOString(),
        }

        return response.success(exportData)
      },
    }),
  },
})
```

### 9.3 Multi-Organization User Handler

```typescript
export const UserDashboardController = igniter.controller({
  name: 'user-dashboard',
  path: '/dashboard',
  actions: {
    overview: igniter.query({
      method: 'GET',
      path: '/overview',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        const session = await context.auth.getSession({
          requirements: 'authenticated',
        })

        if (!session) {
          return response.unauthorized()
        }

        const result = {
          user: session.user,
          organizations: [],
          currentOrganization: session.organization,
          membership: session.membership,
        }

        // If user has no active organization, get all their organizations
        if (!session.organization) {
          const userOrganizations = await context.auth.api.listOrganizations({
            headers: context.request.headers,
          })

          result.organizations = userOrganizations
          result.needsOrganizationSetup = userOrganizations.length === 0
        } else {
          result.organizations = [session.organization]
          result.billing = session.organization.billing
        }

        return response.success(result)
      },
    }),
  },
})
```

### 9.4 Billing-Aware Feature Controller

```typescript
export const PremiumFeatureController = igniter.controller({
  name: 'premium-feature',
  path: '/premium',
  actions: {
    useFeature: igniter.mutation({
      method: 'POST',
      path: '/use',
      use: [AuthFeatureProcedure()],
      body: z.object({
        featureData: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner'],
        })

        if (!session?.organization?.billing) {
          return response.badRequest('Billing information not available')
        }

        const billing = session.organization.billing

        // Check if feature is included in current plan
        const hasFeature = billing.subscription?.features?.includes('premium-feature')

        if (!hasFeature && billing.status !== 'active') {
          return response.forbidden('Premium feature requires active subscription')
        }

        // Use the premium feature
        // Your business logic here

        return response.success({
          success: true,
          billing: {
            status: billing.status,
            plan: billing.subscription?.plan,
            features: billing.subscription?.features,
          },
        })
      },
    }),
  },
})
```

### 8.2 Authentication UI Component

```tsx
import { useState } from 'react'
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useFormWithZod } from '@/hooks/use-form-with-zod'
import { api } from '@/igniter.client'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const otpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits'),
})

export function AuthForm() {
  const [authMethod, setAuthMethod] = useState('password')
  const [otpSent, setOtpSent] = useState(false)
  
  // Password login form
  const passwordForm = useFormWithZod({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
    onSubmit: async (values) => {
      // Implementation for password login
    },
  })
  
  // OTP login form
  const otpForm = useFormWithZod({
    schema: otpSchema,
    defaultValues: { email: '', otpCode: '' },
    onSubmit: async (values) => {
      if (!otpSent) {
        // Request OTP
        await api.auth.sendOTPVerificationCode.mutate({
          email: values.email,
          type: 'sign-in',
        })
        setOtpSent(true)
      } else {
        // Verify OTP
        await api.auth.signInWithOTP.mutate({
          email: values.email,
          otpCode: values.otpCode,
        })
        // Redirect on success
      }
    },
  })
  
  // Social login handlers
  const handleGoogleLogin = async () => {
    const result = await api.auth.signInWithProvider.mutate({
      provider: 'google',
    })
    
    if (result.redirect) {
      window.location.href = result.url
    }
  }
  
  return (
    <div className="auth-container">
      <h1>Sign In</h1>
      
      <Tabs defaultValue="password" onValueChange={setAuthMethod}>
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="otp">One-Time Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="password">
          <form onSubmit={passwordForm.onSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input 
                id="email"
                type="email"
                {...passwordForm.register('email')}
              />
              {passwordForm.formState.errors.email && (
                <p className="text-red-500">
                  {passwordForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input 
                id="password"
                type="password"
                {...passwordForm.register('password')}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-red-500">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="otp">
          <form onSubmit={otpForm.onSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="otp-email">Email</label>
              <Input 
                id="otp-email"
                type="email"
                {...otpForm.register('email')}
              />
              {otpForm.formState.errors.email && (
                <p className="text-red-500">
                  {otpForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            {/* OTP field - only shown after requesting OTP */}
            {otpSent && (
              <div className="space-y-2">
                <label htmlFor="otpCode">One-Time Code</label>
                <Input 
                  id="otpCode"
                  {...otpForm.register('otpCode')}
                />
                {otpForm.formState.errors.otpCode && (
                  <p className="text-red-500">
                    {otpForm.formState.errors.otpCode.message}
                  </p>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full">
              {otpSent ? 'Verify Code' : 'Send Code'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <p className="text-center mb-4">Or continue with</p>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
          >
            Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              api.auth.signInWithProvider.mutate({
                provider: 'github',
              })
            }}
          >
            GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 10. Implementation Guide & Troubleshooting

### 10.1 Common Implementation Patterns

#### Pattern 1: Basic Protected Route
```typescript
// Quick pattern for protecting any route
const protectedHandler = async (context, requiredRoles?: string[]) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
    roles: requiredRoles,
  })

  if (!session) throw new Error('Unauthorized')
  return session
}
```

#### Pattern 2: API Key Validation
```typescript
// Validate API Key for external integrations
const validateApiKey = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
    roles: ['admin', 'owner'],
  })

  if (session.user !== null) {
    throw new Error('API Key authentication required')
  }

  return session.organization
}
```

#### Pattern 3: Organization Context
```typescript
// Ensure organization context is available
const requireOrganization = async (context) => {
  const session = await context.auth.getSession({
    requirements: 'authenticated',
  })

  if (!session.organization) {
    // Auto-select first organization if user has multiple
    const orgs = await context.auth.api.listOrganizations({
      headers: context.request.headers,
    })

    if (orgs.length > 0) {
      await context.auth.setActiveOrganization({
        organizationId: orgs[0].id,
      })
      // Retry session
      return await context.auth.getSession({
        requirements: 'authenticated',
      })
    }

    throw new Error('Organization setup required')
  }

  return session
}
```

### 10.2 Troubleshooting Common Issues

#### Issue: "API Key requires organization context"
**Solution**: Ensure your API endpoints include role requirements when using API Key authentication:
```typescript
// ❌ Wrong - API Key will fail
const session = await context.auth.getSession({
  requirements: 'authenticated',
})

// ✅ Correct - API Key works
const session = await context.auth.getSession({
  requirements: 'authenticated',
  roles: ['admin', 'owner'], // Required for API Key
})
```

#### Issue: "No organization access" error
**Solution**: Check if user has an active organization:
```typescript
const session = await context.auth.getSession({
  requirements: 'authenticated',
})

if (!session.organization) {
  // Handle user without organization
  return response.redirect('/get-started')
}
```

#### Issue: Session not updating after organization switch
**Solution**: Call the API and refresh the session:
```typescript
await api.auth.setActiveOrganization.mutate({ organizationId })
// Force session refresh
window.location.reload()
```

#### Issue: API Key authentication failing
**Common causes**:
- API Key expired: Check `expiresAt` and `neverExpires` fields
- API Key disabled: Ensure `enabled: true` in database
- Missing Bearer token: Use `Authorization: Bearer <token>` header
- Wrong endpoint: API Keys only work with organization-scoped endpoints

This comprehensive guide provides everything needed to implement and troubleshoot authentication and authorization in the SaaS Boilerplate. The system supports both traditional session-based authentication and programmatic API Key access, with full multi-tenant organization isolation and billing integration.

**Key Takeaways:**
- Use `context.auth.getSession()` for all authentication checks
- API Keys require role specifications and organization context
- Sessions automatically include billing and organization data
- Handle both authenticated and unauthenticated scenarios
- Use proper error handling for all authentication edge cases 
