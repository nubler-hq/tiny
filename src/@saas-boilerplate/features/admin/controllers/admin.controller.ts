import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { AdminProcedure } from '../procedures/admin.procedure'
import {
  OrganizationFiltersSchema,
  UserFiltersSchema,
  type OrganizationFilters,
  type UserFilters,
} from '../admin.interface'

/**
 * @controller AdminController
 * @description Controller for administrative operations on organizations and users
 *
 * This controller provides comprehensive read-only access to organization and user management
 * for super-administrators. All endpoints require super-authenticated access and follow
 * REST conventions with proper filtering, pagination, and error handling.
 *
 * Key features:
 * - Organization listing with advanced filtering
 * - User management and detailed user information
 * - Membership and invitation tracking
 * - Activity monitoring and statistics
 * - Multi-tenancy isolation and security
 *
 * @example
 * ```typescript
 * // List all organizations
 * const organizations = await api.admin.organizations.query()
 *
 * // Get user details with memberships
 * const user = await api.admin.users.detail.query({ id: 'user_123' })
 * ```
 */
export const AdminController = igniter.controller({
  name: 'Admin',
  path: '/admin',
  description: 'Administrative operations for organizations and users',
  actions: {
    // Organization Endpoints

    /**
     * @action listOrganizations
     * @description List all organizations with optional filtering and pagination
     *
     * @param {OrganizationFilters} query - Filter and pagination options
     * @returns {Promise<PaginatedResponse<OrganizationWithDetails>>} Paginated list of organizations
     * @throws {401} When user is not super-authenticated
     * @throws {400} When query parameters are invalid
     *
     * @example
     * ```typescript
     * const organizations = await api.admin.organizations.query({
     *   search: 'acme',
     *   status: 'active',
     *   page: 1,
     *   limit: 20
     * })
     * ```
     */
    listOrganizations: igniter.query({
      name: 'ListOrganizations',
      description: 'List all organizations with optional filtering',
      path: '/organizations',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      query: OrganizationFiltersSchema,
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract and process filter parameters
        const filters = request.query as OrganizationFilters
        const { page = 1, limit = 50 } = filters
        const skip = (page - 1) * limit

        // Business Logic: Build where clause for filtering
        const where: any = {}
        if (filters.name) {
          where.name = { contains: filters.name, mode: 'insensitive' }
        }
        if (filters.slug) {
          where.slug = { contains: filters.slug, mode: 'insensitive' }
        }
        if (filters.status) {
          // Filter by subscription status
          where.customer =
            filters.status === 'active'
              ? { subscriptions: { some: { status: 'active' } } }
              : { subscriptions: { none: { status: 'active' } } }
        }
        if (filters.createdAfter) {
          where.createdAt = { ...where.createdAt, gte: filters.createdAfter }
        }
        if (filters.createdBefore) {
          where.createdAt = { ...where.createdAt, lte: filters.createdBefore }
        }

        // Business Logic: Calculate pagination parameters
        const take = Math.min(limit, 100) // Enforce maximum limit
        const orderBy = filters.sortBy
          ? { [filters.sortBy]: filters.sortOrder || 'asc' }
          : { createdAt: 'desc' }

        // Business Logic: Retrieve organizations with filtering and pagination
        const [organizations, total] = await Promise.all([
          context.admin.organization.findMany({
            where,
            skip,
            take,
            orderBy,
          }),
          context.admin.organization.count({ where }),
        ])

        // Data Transformation: Calculate pagination metadata
        const totalPages = Math.ceil(total / take)

        // Response: Return paginated results
        return response.success({
          data: organizations,
          total,
          page,
          limit: take,
          totalPages,
        })
      },
    }),

    /**
     * @action getOrganization
     * @description Get detailed information about a specific organization
     *
     * @param {string} id - Organization ID (UUID)
     * @returns {Promise<OrganizationWithDetails>} Detailed organization information
     * @throws {401} When user is not super-authenticated
     * @throws {404} When organization is not found
     *
     * @example
     * ```typescript
     * const organization = await api.admin.organizations.detail.query({
     *   id: 'org_123'
     * })
     * ```
     */
    getOrgById: igniter.query({
      name: 'GetOrganization',
      description: 'Get detailed organization information',
      path: '/organizations/:id' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract organization ID from request parameters
        const { id } = request.params

        // Business Logic: Retrieve organization with full details
        const organization = await context.admin.organization.findUnique(id)

        // Business Rule: If organization not found, return 404
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Response: Return organization details
        return response.success(organization)
      },
    }),

    /**
     * @action getOrganizationMemberships
     * @description Get all memberships for a specific organization
     *
     * @param {string} id - Organization ID (UUID)
     * @returns {Promise<Member[]>} List of organization memberships
     * @throws {401} When user is not super-authenticated
     * @throws {404} When organization is not found
     *
     * @example
     * ```typescript
     * const members = await api.admin.organizations.memberships.query({
     *   id: 'org_123'
     * })
     * ```
     */
    getOrgMemberships: igniter.query({
      name: 'GetOrganizationMemberships',
      description: 'Get all memberships for an organization',
      path: '/organizations/:id/memberships' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract organization ID from request parameters
        const { id } = request.params

        // Business Logic: Verify organization exists
        const organization = await context.admin.organization.findUnique(id)
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Business Logic: Retrieve all memberships for the organization
        const memberships = await context.admin.organization.findMemberships(id)

        // Response: Return memberships list
        return response.success(memberships)
      },
    }),

    /**
     * @action getOrganizationSubscriptions
     * @description Get all subscriptions for a specific organization
     *
     * @param {string} id - Organization ID (UUID)
     * @returns {Promise<SubscriptionWithDetails[]>} List of organization subscriptions
     * @throws {401} When user is not super-authenticated
     * @throws {404} When organization is not found
     *
     * @example
     * ```typescript
     * const subscriptions = await api.admin.organizations.subscriptions.query({
     *   id: 'org_123'
     * })
     * ```
     */
    getOrgSubscriptions: igniter.query({
      name: 'getOrgSubscriptions',
      description: 'Get all subscriptions for an organization',
      path: '/organizations/:id/subscriptions' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract organization ID from request parameters
        const { id } = request.params

        // Business Logic: Verify organization exists
        const organization = await context.admin.organization.findUnique(id)
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Business Logic: Retrieve all subscriptions for the organization
        const subscriptions =
          await context.admin.organization.findSubscriptions(id)

        // Response: Return subscriptions list
        return response.success(subscriptions)
      },
    }),

    /**
     * @action getOrganizationInvites
     * @description Get all pending invitations for a specific organization
     *
     * @param {string} id - Organization ID (UUID)
     * @returns {Promise<Invitation[]>} List of pending invitations
     * @throws {401} When user is not super-authenticated
     * @throws {404} When organization is not found
     *
     * @example
     * ```typescript
     * const invites = await api.admin.organizations.invites.query({
     *   id: 'org_123'
     * })
     * ```
     */
    getOrgInvites: igniter.query({
      name: 'GetOrganizationInvites',
      description: 'Get all pending invitations for an organization',
      path: '/organizations/:id/invites' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract organization ID from request parameters
        const { id } = request.params

        // Business Logic: Verify organization exists
        const organization = await context.admin.organization.findUnique(id)
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Business Logic: Retrieve all pending invitations for the organization
        const invites = await context.admin.organization.findInvites(id)

        // Response: Return invitations list
        return response.success(invites)
      },
    }),

    /**
     * @action getOrganizationStats
     * @description Get statistics for a specific organization
     *
     * @param {string} id - Organization ID (UUID)
     * @returns {Promise<any>} Organization statistics
     * @throws {401} When user is not super-authenticated
     * @throws {404} When organization is not found
     *
     * @example
     * ```typescript
     * const stats = await api.admin.organizations.stats.query({
     *   id: 'org_123'
     * })
     * ```
     */
    getOrgStats: igniter.query({
      name: 'GetOrganizationStats',
      description: 'Get statistics for an organization',
      path: '/organizations/:id/stats' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract organization ID from request parameters
        const { id } = request.params

        // Business Logic: Verify organization exists
        const organization = await context.admin.organization.findUnique(id)
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Business Logic: Retrieve organization statistics
        const stats = await context.admin.organization.findStats(id)

        // Response: Return organization statistics
        return response.success(stats)
      },
    }),

    /**
     * @action getOrganizationActivity
     * @description Get recent activity for a specific organization
     *
     * @param {string} id - Organization ID (UUID)
     * @returns {Promise<any[]>} Recent activity events
     * @throws {401} When user is not super-authenticated
     * @throws {404} When organization is not found
     *
     * @example
     * ```typescript
     * const activity = await api.admin.organizations.activity.query({
     *   id: 'org_123'
     * })
     * ```
     */
    getOrgActivity: igniter.query({
      name: 'GetOrganizationActivity',
      description: 'Get recent activity for an organization',
      path: '/organizations/:id/activity' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract organization ID from request parameters
        const { id } = request.params

        // Business Logic: Verify organization exists
        const organization = await context.admin.organization.findUnique(id)
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Business Logic: Retrieve recent activity for the organization
        const activity = await context.admin.organization.findActivity(id)

        // Response: Return activity list
        return response.success(activity)
      },
    }),

    // User Endpoints

    /**
     * @action listUsers
     * @description List all users with optional filtering and pagination
     *
     * @param {UserFilters} query - Filter and pagination options
     * @returns {Promise<PaginatedResponse<UserWithDetails>>} Paginated list of users
     * @throws {401} When user is not super-authenticated
     * @throws {400} When query parameters are invalid
     *
     * @example
     * ```typescript
     * const users = await api.admin.users.query({
     *   search: 'john',
     *   role: 'admin',
     *   emailVerified: true,
     *   page: 1,
     *   limit: 20
     * })
     * ```
     */
    listUsers: igniter.query({
      name: 'ListUsers',
      description: 'List all users with optional filtering',
      path: '/users',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      query: UserFiltersSchema,
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract and process filter parameters
        const filters = request.query as UserFilters
        const { page = 1, limit = 50 } = filters
        const skip = (page - 1) * limit

        // Business Logic: Build where clause for filtering
        const where: any = {}
        if (filters.email) {
          where.email = { contains: filters.email, mode: 'insensitive' }
        }
        if (filters.name) {
          where.name = { contains: filters.name, mode: 'insensitive' }
        }
        if (filters.role) {
          where.role = filters.role
        }
        if (filters.emailVerified !== undefined) {
          where.emailVerified = filters.emailVerified
        }
        if (filters.lastActiveAfter) {
          where.sessions = {
            some: {
              createdAt: { gte: filters.lastActiveAfter },
              expiresAt: { gt: new Date() },
            },
          }
        }
        if (filters.createdAfter) {
          where.createdAt = { ...where.createdAt, gte: filters.createdAfter }
        }
        if (filters.createdBefore) {
          where.createdAt = { ...where.createdAt, lte: filters.createdBefore }
        }

        // Business Logic: Calculate pagination parameters
        const take = Math.min(limit, 100) // Enforce maximum limit
        const orderBy = filters.sortBy
          ? { [filters.sortBy]: filters.sortOrder || 'asc' }
          : { createdAt: 'desc' }

        // Business Logic: Retrieve users with filtering and pagination
        const [users, total] = await Promise.all([
          context.admin.user.findMany({
            where,
            skip,
            take,
            orderBy,
          }),
          context.admin.user.count({ where }),
        ])

        // Data Transformation: Calculate pagination metadata
        const totalPages = Math.ceil(total / take)

        // Response: Return paginated results
        return response.success({
          data: users,
          total,
          page,
          limit: take,
          totalPages,
        })
      },
    }),

    /**
     * @action getUser
     * @description Get detailed information about a specific user
     *
     * @param {string} id - User ID (UUID)
     * @returns {Promise<UserWithDetails>} Detailed user information
     * @throws {401} When user is not super-authenticated
     * @throws {404} When user is not found
     *
     * @example
     * ```typescript
     * const user = await api.admin.users.detail.query({
     *   id: 'user_123'
     * })
     * ```
     */
    getUser: igniter.query({
      name: 'GetUser',
      description: 'Get detailed user information',
      path: '/users/:id' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract user ID from request parameters
        const { id } = request.params

        // Business Logic: Retrieve user with full details
        const user = await context.admin.user.findUnique(id)

        // Business Rule: If user not found, return 404
        if (!user) {
          return response.notFound('User not found')
        }

        // Response: Return user details
        return response.success(user)
      },
    }),

    /**
     * @action getUserMemberships
     * @description Get all organizations a user is a member of
     *
     * @param {string} id - User ID (UUID)
     * @returns {Promise<Member[]>} List of user memberships
     * @throws {401} When user is not super-authenticated
     * @throws {404} When user is not found
     *
     * @example
     * ```typescript
     * const memberships = await api.admin.users.memberships.query({
     *   id: 'user_123'
     * })
     * ```
     */
    getUserMemberships: igniter.query({
      name: 'GetUserMemberships',
      description: 'Get all organizations a user is a member of',
      path: '/users/:id/memberships' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract user ID from request parameters
        const { id } = request.params

        // Business Logic: Verify user exists
        const user = await context.admin.user.findUnique(id)
        if (!user) {
          return response.notFound('User not found')
        }

        // Business Logic: Retrieve all memberships for the user
        const memberships = await context.admin.user.findMemberships(id)

        // Response: Return memberships list
        return response.success(memberships)
      },
    }),

    /**
     * @action getUserAccounts
     * @description Get all OAuth accounts linked to a user
     *
     * @param {string} id - User ID (UUID)
     * @returns {Promise<Account[]>} List of OAuth accounts
     * @throws {401} When user is not super-authenticated
     * @throws {404} When user is not found
     *
     * @example
     * ```typescript
     * const accounts = await api.admin.users.accounts.query({
     *   id: 'user_123'
     * })
     * ```
     */
    getUserAccounts: igniter.query({
      name: 'GetUserAccounts',
      description: 'Get all OAuth accounts linked to a user',
      path: '/users/:id/accounts' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract user ID from request parameters
        const { id } = request.params

        // Business Logic: Verify user exists
        const user = await context.admin.user.findUnique(id)
        if (!user) {
          return response.notFound('User not found')
        }

        // Business Logic: Retrieve all OAuth accounts for the user
        const accounts = await context.admin.user.findAccounts(id)

        // Response: Return accounts list
        return response.success(accounts)
      },
    }),

    /**
     * @action getUserSessions
     * @description Get all active sessions for a user
     *
     * @param {string} id - User ID (UUID)
     * @returns {Promise<Session[]>} List of active sessions
     * @throws {401} When user is not super-authenticated
     * @throws {404} When user is not found
     *
     * @example
     * ```typescript
     * const sessions = await api.admin.users.sessions.query({
     *   id: 'user_123'
     * })
     * ```
     */
    getUserSessions: igniter.query({
      name: 'GetUserSessions',
      description: 'Get all active sessions for a user',
      path: '/users/:id/sessions' as const,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract user ID from request parameters
        const { id } = request.params

        // Business Logic: Verify user exists
        const user = await context.admin.user.findUnique(id)
        if (!user) {
          return response.notFound('User not found')
        }

        // Business Logic: Retrieve all active sessions for the user
        const sessions = await context.admin.user.findSessions(id)

        // Response: Return sessions list
        return response.success(sessions)
      },
    }),
  },
})
