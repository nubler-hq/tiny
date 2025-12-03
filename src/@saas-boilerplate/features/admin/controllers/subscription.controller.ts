import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { AdminProcedure } from '../procedures/admin.procedure'
import { SubscriptionProcedure } from '../procedures/subscription.procedure'
import {
  SubscriptionFiltersSchema,
  PlanFiltersSchema,
  type SubscriptionFilters,
  type PlanFilters,
} from '../admin.interface'

/**
 * @controller SubscriptionController
 * @description Controller for subscription and plan management
 *
 * This controller provides comprehensive read-only access to subscription and plan data
 * for administrators. All endpoints require super-authenticated access and follow
 * REST conventions with proper filtering, pagination, and error handling.
 *
 * Key features:
 * - Subscription listing with advanced filtering
 * - Individual subscription details with full context
 * - Plan management and pricing information
 * - Multi-tenancy isolation and security
 * - Efficient database queries with proper includes
 *
 * @example
 * ```typescript
 * // List all subscriptions
 * const subscriptions = await api.admin.subscriptions.query({
 *   status: 'active',
 *   page: 1,
 *   limit: 20
 * })
 *
 * // Get plan details with pricing
 * const plan = await api.admin.plans.detail.query({ id: 'plan_123' })
 * ```
 */
export const SubscriptionController = igniter.controller({
  name: 'Admin -> Subscription',
  path: '/admin',
  description: 'Subscription and plan management',
  actions: {
    // Subscription Endpoints

    /**
     * @action listSubscriptions
     * @description List all subscriptions with optional filtering and pagination
     *
     * @param {SubscriptionFilters} query - Filter and pagination options
     * @returns {Promise<PaginatedResponse<SubscriptionWithDetails>>} Paginated list of subscriptions
     * @throws {401} When user is not super-authenticated
     * @throws {400} When query parameters are invalid
     *
     * @example
     * ```typescript
     * const subscriptions = await api.admin.subscriptions.query({
     *   status: 'active',
     *   organizationId: 'org_123',
     *   page: 1,
     *   limit: 20
     * })
     * ```
     */
    listSubscriptions: igniter.query({
      name: 'ListSubscriptions',
      description: 'List all subscriptions with optional filtering',
      path: '/subscriptions',
      use: [AuthFeatureProcedure(), AdminProcedure(), SubscriptionProcedure()],
      query: SubscriptionFiltersSchema,
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract and process filter parameters
        const filters = request.query as SubscriptionFilters
        const { page = 1, limit = 50 } = filters
        const skip = (page - 1) * limit

        // Business Logic: Build where clause for filtering
        const where: any = {}
        if (filters.organizationId) {
          where.customer = { organizationId: filters.organizationId }
        }
        if (filters.customerId) {
          where.customerId = filters.customerId
        }
        if (filters.status) {
          where.status = filters.status
        }
        if (filters.planId) {
          where.price = { planId: filters.planId }
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
          ? { [filters.sortBy]: filters.sortOrder || ('asc' as const) }
          : { createdAt: 'desc' as const }

        // Business Logic: Retrieve subscriptions with filtering and pagination
        const [subscriptions, total] = await Promise.all([
          context.admin.subscription.findMany({
            where,
            skip,
            take,
            orderBy,
          }),
          context.admin.subscription.count({ where }),
        ])

        // Data Transformation: Calculate pagination metadata
        const totalPages = Math.ceil(total / take)

        // Response: Return paginated results
        return response.success({
          data: subscriptions,
          total,
          page,
          limit: take,
          totalPages,
        })
      },
    }),

    /**
     * @action getSubscription
     * @description Get detailed information about a specific subscription
     *
     * @param {string} id - Subscription ID (UUID)
     * @returns {Promise<SubscriptionWithDetails>} Detailed subscription information
     * @throws {401} When user is not super-authenticated
     * @throws {404} When subscription is not found
     *
     * @example
     * ```typescript
     * const subscription = await api.admin.subscriptions.detail.query({
     *   id: 'sub_123'
     * })
     * ```
     */
    getSubscription: igniter.query({
      name: 'GetSubscription',
      description: 'Get detailed subscription information',
      path: '/subscriptions/:id' as const,
      use: [AuthFeatureProcedure(), AdminProcedure(), SubscriptionProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract subscription ID from request parameters
        const { id } = request.params

        // Business Logic: Retrieve subscription with full details
        const subscription = await context.admin.subscription.findUnique(id)

        // Business Rule: If subscription not found, return 404
        if (!subscription) {
          return response.notFound('Subscription not found')
        }

        // Response: Return subscription details
        return response.success(subscription)
      },
    }),

    // Plan Endpoints

    /**
     * @action listPlans
     * @description List all plans with optional filtering and pagination
     *
     * @param {PlanFilters} query - Filter and pagination options
     * @returns {Promise<PaginatedResponse<PlanWithDetails>>} Paginated list of plans
     * @throws {401} When user is not super-authenticated
     * @throws {400} When query parameters are invalid
     *
     * @example
     * ```typescript
     * const plans = await api.admin.plans.query({
     *   archived: false,
     *   page: 1,
     *   limit: 20
     * })
     * ```
     */
    listPlans: igniter.query({
      name: 'ListPlans',
      description: 'List all plans with optional filtering',
      path: '/plans',
      use: [AuthFeatureProcedure(), AdminProcedure(), SubscriptionProcedure()],
      query: PlanFiltersSchema,
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract and process filter parameters
        const filters = request.query as PlanFilters
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
        if (filters.archived !== undefined) {
          where.archived = filters.archived
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
          ? { [filters.sortBy]: filters.sortOrder || ('asc' as const) }
          : { createdAt: 'desc' as const }

        // Business Logic: Retrieve plans with filtering and pagination
        const [plans, total] = await Promise.all([
          context.subscription.plan.findMany({
            where,
            skip,
            take,
            orderBy,
          }),
          context.subscription.plan.count({ where }),
        ])

        // Data Transformation: Calculate pagination metadata
        const totalPages = Math.ceil(total / take)

        // Response: Return paginated results
        return response.success({
          data: plans,
          total,
          page,
          limit: take,
          totalPages,
        })
      },
    }),

    /**
     * @action getPlan
     * @description Get detailed information about a specific plan including pricing
     *
     * @param {string} id - Plan ID (UUID)
     * @returns {Promise<PlanWithDetails>} Detailed plan information with prices
     * @throws {401} When user is not super-authenticated
     * @throws {404} When plan is not found
     *
     * @example
     * ```typescript
     * const plan = await api.admin.plans.detail.query({
     *   id: 'plan_123'
     * })
     * ```
     */
    getPlan: igniter.query({
      name: 'GetPlan',
      description: 'Get detailed plan information with prices',
      path: '/plans/:id' as const,
      use: [AuthFeatureProcedure(), AdminProcedure(), SubscriptionProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Observation: Extract plan ID from request parameters
        const { id } = request.params

        // Business Logic: Retrieve plan with full details including prices
        const plan = await context.subscription.plan.findUnique(id)

        // Business Rule: If plan not found, return 404
        if (!plan) {
          return response.notFound('Plan not found')
        }

        // Response: Return plan details with prices
        return response.success(plan)
      },
    }),
  },
})
