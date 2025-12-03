import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import {
  OverviewStatsQuerySchema,
  type OverviewStatsQuery,
} from '../admin.interface'
import { AdminProcedure } from '../procedures/admin.procedure'
import { StatsProcedure } from '../procedures/stats.procedure'
import { z } from 'zod'

/**
 * @controller StatsController
 * @description Controller for system-wide statistics and analytics
 *
 * This controller provides comprehensive read-only access to various system statistics
 * including user metrics, organization analytics, subscription data, revenue tracking,
 * and growth insights. All endpoints require super-authenticated access and provide
 * valuable insights for administrators to monitor platform health and growth.
 *
 * Key features:
 * - Real-time system overview statistics
 * - Time-based analytics (daily, weekly, monthly)
 * - User behavior and demographic analysis
 * - Organization growth and activity metrics
 * - Subscription and revenue tracking
 * - Multi-dimensional data analysis
 *
 * @example
 * ```typescript
 * // Get system overview
 * const overview = await api.admin.stats.overview.query()
 *
 * // Get user growth over time
 * const growth = await api.admin.stats.users.growth.query({
 *   period: 'monthly',
 *   months: 12
 * })
 * ```
 */
export const StatsController = igniter.controller({
  name: 'Admin -> Stats',
  path: '/admin/stats',
  description: 'System-wide statistics and analytics',
  actions: {
    // Overview Statistics

    /**
     * @action getOverview
     * @description Get system overview statistics with period filtering
     *
     * @param {object} query - Statistics query options
     * @param {'daily'|'weekly'|'monthly'} query.period - Period type for time-series data (required)
     * @param {number} [query.days] - Number of days to look back (default: 30, for daily)
     * @param {number} [query.weeks] - Number of weeks to look back (default: 12, for weekly)
     * @param {number} [query.months] - Number of months to look back (default: 12, for monthly)
     * @returns {Promise<Array<OverviewStatsData>>} Time-series statistics data
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * // Get daily statistics for last 7 days
     * const dailyStats = await api.admin.stats.overview.query({
     *   period: 'daily',
     *   days: 7
     * })
     *
     * // Get monthly statistics for last 3 months
     * const monthlyStats = await api.admin.stats.overview.query({
     *   period: 'monthly',
     *   months: 3
     * })
     * ```
     */
    getOverview: igniter.query({
      name: 'GetOverview',
      description: 'Get system overview statistics with period filtering',
      path: '/overview',
      use: [AuthFeatureProcedure(), AdminProcedure(), StatsProcedure()],
      query: OverviewStatsQuerySchema,
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Business Logic: Delegate to procedure for statistics calculation
        const { period, days, weeks, months } =
          request.query as OverviewStatsQuery

        // Business Logic: Get statistics from procedure based on period
        const stats = await context.stats.overview.getStatsByPeriod(
          period,
          days,
          weeks,
          months,
        )

        // Response: Return statistics data
        return response.success(stats)
      },
    }),

    /**
     * @action getUserStats
     * @description Get general user statistics
     *
     * @returns {Promise<{ total: number; verified: number; unverified: number; withOrganizations: number; active: number }>} User statistics
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const userStats = await api.admin.stats.users.query()
     * ```
     */
    getUserStats: igniter.query({
      name: 'GetUserStats',
      description: 'Get general user statistics',
      path: '/users',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Business Logic: Calculate comprehensive user statistics
        const [total, verified, unverified, withOrganizations, active] =
          await Promise.all([
            context.admin.user.count({}),
            context.admin.user.count({ where: { emailVerified: true } }),
            context.admin.user.count({ where: { emailVerified: false } }),
            context.admin.user.count({
              where: {
                members: {
                  some: {},
                },
              },
            }),
            context.admin.user.count({
              where: {
                sessions: {
                  some: {
                    expiresAt: { gt: new Date() },
                  },
                },
              },
            }),
          ])

        // Response: Return user statistics
        return response.success({
          total,
          verified,
          unverified,
          withOrganizations,
          active,
        })
      },
    }),

    /**
     * @action getUserRoleDistribution
     * @description Get user distribution by role
     *
     * @returns {Promise<UserRoleDistribution>} User role distribution
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const roleDistribution = await api.admin.stats.users.byRole.query()
     * ```
     */
    getUserRoleDistribution: igniter.query({
      name: 'GetUserRoleDistribution',
      description: 'Get user distribution by role',
      path: '/users/by-role',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Business Logic: Calculate user distribution by role
        const [admin, owner, member] = await Promise.all([
          context.admin.user.count({ where: { role: 'admin' } }),
          context.admin.user.count({ where: { role: 'owner' } }),
          context.admin.user.count({ where: { role: 'member' } }),
        ])

        const total = admin + owner + member

        // Response: Return role distribution
        return response.success({
          admin,
          owner,
          member,
          total,
        })
      },
    }),

    /**
     * @action getUserVerificationStats
     * @description Get statistics on verified vs unverified users
     *
     * @returns {Promise<{ verified: number; unverified: number; total: number; verificationRate: number }>} Verification statistics
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const verificationStats = await api.admin.stats.users.byVerification.query()
     * ```
     */
    getUserVerificationStats: igniter.query({
      name: 'GetUserVerificationStats',
      description: 'Get statistics on verified vs unverified users',
      path: '/users/by-verification',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Business Logic: Calculate verification statistics
        const [verified, unverified] = await Promise.all([
          context.admin.user.count({ where: { emailVerified: true } }),
          context.admin.user.count({ where: { emailVerified: false } }),
        ])

        const total = verified + unverified
        const verificationRate = total > 0 ? (verified / total) * 100 : 0

        // Response: Return verification statistics
        return response.success({
          verified,
          unverified,
          total,
          verificationRate: Math.round(verificationRate * 100) / 100,
        })
      },
    }),

    /**
     * @action getUserGrowth
     * @description Get user growth statistics with optional period filters
     *
     * @param {object} query - Growth period options
     * @param {string} [query.period] - Period type ('daily', 'weekly', 'monthly')
     * @param {number} [query.days] - Number of days for daily growth (default: 30)
     * @param {number} [query.weeks] - Number of weeks for weekly growth (default: 12)
     * @param {number} [query.months] - Number of months for monthly growth (default: 12)
     * @returns {Promise<GrowthMetrics>} User growth metrics
     * @throws {401} When user is not super-authenticated
     * @throws {400} When query parameters are invalid
     *
     * @example
     * ```typescript
     * const userGrowth = await api.admin.stats.users.growth.query({
     *   period: 'monthly',
     *   months: 6
     * })
     * ```
     */
    getUserGrowth: igniter.query({
      name: 'GetUserGrowth',
      description: 'Get user growth statistics with period filters',
      path: '/users/growth',
      query: OverviewStatsQuerySchema,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract growth period options
        const { period, days = 30, weeks = 12, months = 12 } = request.query as OverviewStatsQuery

        // Business Logic: Calculate time range based on period
        let startDate: Date
        switch (period) {
          case 'daily':
            startDate = new Date()
            startDate.setDate(startDate.getDate() - days)
            break
          case 'weekly':
            startDate = new Date()
            startDate.setDate(startDate.getDate() - weeks * 7)
            break
          case 'monthly':
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - months)
            break
          default:
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 12)
        }

        // Business Logic: Retrieve user growth data
        const growthData = await context.services.database.$queryRaw<
          Array<{ period: Date; value: bigint }>
        >`
          SELECT
            DATE_TRUNC(${period === 'monthly' ? 'month' : period || 'month'}, "createdAt") as period,
            COUNT(*)::bigint as value
          FROM "user"
          WHERE "createdAt" >= ${startDate}
          GROUP BY DATE_TRUNC(${period === 'monthly' ? 'month' : period || 'month'}, "createdAt"), id
          ORDER BY period ASC
        `

        const current = Number(growthData[growthData.length - 1]?.value || 0)
        const previous = Number(growthData[growthData.length - 2]?.value || 0)
        const growth = current - previous
        const growthRate = previous > 0 ? (growth / previous) * 100 : 0

        // Response: Return growth metrics
        return response.success({
          data: growthData,
          current,
          previous,
          growth,
          growthRate: Math.round(growthRate * 100) / 100,
        })
      },
    }),

    /**
     * @action getActiveUsers
     * @description Get statistics on active users
     *
     * @param {object} query - Active user options
     * @param {number} [query.lastDays] - Number of days to consider for activity (default: 7)
     * @returns {Promise<{ total: number; active: number; inactive: number; activityRate: number }>} Active user statistics
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const activeUsers = await api.admin.stats.users.active.query({
     *   lastDays: 30
     * })
     * ```
     */
    getActiveUsers: igniter.query({
      name: 'GetActiveUsers',
      description: 'Get statistics on active users',
      path: '/users/active',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      query: z.object({
        lastDays: z.coerce.number().int().positive().default(7).optional(),
      }),
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract activity period
        const { lastDays = 7 } = request.query as { lastDays: number }

        const sinceDate = new Date()
        sinceDate.setDate(sinceDate.getDate() - lastDays)

        // Business Logic: Calculate active user statistics
        const [total, active] = await Promise.all([
          context.admin.user.count({}),
          context.admin.user.count({
            where: {
              sessions: {
                some: {
                  createdAt: { gte: sinceDate },
                  expiresAt: { gt: new Date() },
                },
              },
            },
          }),
        ])

        const inactive = total - active
        const activityRate = total > 0 ? (active / total) * 100 : 0

        // Response: Return active user statistics
        return response.success({
          total,
          active,
          inactive,
          activityRate: Math.round(activityRate * 100) / 100,
        })
      },
    }),

    // Organization Statistics

    /**
     * @action getOrganizationStats
     * @description Get general organization statistics
     *
     * @returns {Promise<{ total: number; withSubscriptions: number; averageMembers: number; averageAge: number }>} Organization statistics
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const orgStats = await api.admin.stats.organizations.query()
     * ```
     */
    getOrganizationStats: igniter.query({
      name: 'GetOrganizationStats',
      description: 'Get general organization statistics',
      path: '/organizations',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Business Logic: Calculate comprehensive organization statistics
        const [total, withSubscriptions, memberStats, ageStats] =
          await Promise.all([
            context.admin.organization.count({}),
            context.admin.organization.count({
              where: {
                customer: {
                  subscriptions: {
                    some: {
                      status: 'active',
                    },
                  },
                },
              },
            }),
            context.admin.member.groupBy({
              by: ['organizationId'],
              _count: true,
            }),
            context.admin.organization.aggregate({
              _min: { createdAt: true },
            }),
          ])

        const averageMembers =
          memberStats.length > 0
            ? memberStats.reduce(
                (sum, stat) =>
                  sum +
                  (stat._count &&
                  typeof stat._count === 'object' &&
                  'organizationId' in stat._count
                    ? stat._count.organizationId || 0
                    : 0),
                0,
              ) / memberStats.length
            : 0

        const averageAgeDays = ageStats._min?.createdAt
          ? Math.floor(
              (new Date().getTime() -
                new Date(ageStats._min.createdAt).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0

        // Response: Return organization statistics
        return response.success({
          total,
          withSubscriptions,
          averageMembers: Math.round(averageMembers * 100) / 100,
          averageAge: averageAgeDays,
        })
      },
    }),

    /**
     * @action getOrganizationSizeDistribution
     * @description Get organization distribution by member count
     *
     * @returns {Promise<OrganizationSizeDistribution>} Organization size distribution
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const sizeDistribution = await api.admin.stats.organizations.bySize.query()
     * ```
     */
    getOrganizationSizeDistribution: igniter.query({
      name: 'GetOrganizationSizeDistribution',
      description: 'Get organization distribution by member count',
      path: '/organizations/by-size',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Business Logic: Calculate organization size distribution
        const memberCounts = await context.admin.member.groupBy({
          by: ['organizationId'],
          _count: {
            organizationId: true,
          },
        })

        const distribution = {
          small: 0, // 1-10 members
          medium: 0, // 11-50 members
          large: 0, // 51-200 members
          enterprise: 0, // 200+ members
          total: memberCounts.length,
        }

        memberCounts.forEach((stat) => {
          const count =
            stat._count &&
            typeof stat._count === 'object' &&
            'organizationId' in stat._count
              ? stat._count.organizationId || 0
              : 0
          if (count >= 1 && count <= 10) distribution.small++
          else if (count >= 11 && count <= 50) distribution.medium++
          else if (count >= 51 && count <= 200) distribution.large++
          else if (count > 200) distribution.enterprise++
        })

        // Response: Return size distribution
        return response.success(distribution)
      },
    }),

    /**
     * @action getOrganizationGrowth
     * @description Get organization growth statistics with optional period filters
     *
     * @param {object} query - Growth period options
     * @param {string} [query.period] - Period type ('daily', 'weekly', 'monthly')
     * @param {number} [query.days] - Number of days for daily growth (default: 30)
     * @param {number} [query.weeks] - Number of weeks for weekly growth (default: 12)
     * @param {number} [query.months] - Number of months for monthly growth (default: 12)
     * @returns {Promise<GrowthMetrics>} Organization growth metrics
     * @throws {401} When user is not super-authenticated
     * @throws {400} When query parameters are invalid
     *
     * @example
     * ```typescript
     * const orgGrowth = await api.admin.stats.organizations.growth.query({
     *   period: 'monthly',
     *   months: 6
     * })
     * ```
     */
    getOrganizationGrowth: igniter.query({
      name: 'GetOrganizationGrowth',
      description: 'Get organization growth statistics with period filters',
      path: '/organizations/growth',
      query: OverviewStatsQuerySchema,
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, request, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        const session = await context.auth.getSession({
          requirements: 'super-authenticated',
        })

        if (!session) {
          return response.unauthorized('Super-admin access required')
        }

        // Data Transformation: Extract growth period options
        const { period, days = 30, weeks = 12, months = 12 } = request.query as OverviewStatsQuery

        // Business Logic: Calculate time range based on period
        let startDate: Date
        switch (period) {
          case 'daily':
            startDate = new Date()
            startDate.setDate(startDate.getDate() - days)
            break
          case 'weekly':
            startDate = new Date()
            startDate.setDate(startDate.getDate() - weeks * 7)
            break
          case 'monthly':
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - months)
            break
          default:
            startDate = new Date()
            startDate.setMonth(startDate.getMonth() - 12)
        }

        // Business Logic: Retrieve organization growth data
        const growthData = await context.services.database.$queryRaw<
          Array<{ period: Date; value: bigint }>
        >`
          SELECT
            DATE_TRUNC(${period === 'monthly' ? 'month' : period || 'month'}, "createdAt") as period,
            COUNT(*)::bigint as value
          FROM organization
          WHERE "createdAt" >= ${startDate}
          GROUP BY DATE_TRUNC(${period === 'monthly' ? 'month' : period || 'month'}, "createdAt"), id
          ORDER BY period ASC
        `

        const current = Number(growthData[growthData.length - 1]?.value || 0)
        const previous = Number(growthData[growthData.length - 2]?.value || 0)
        const growth = current - previous
        const growthRate = previous > 0 ? (growth / previous) * 100 : 0

        // Response: Return growth metrics
        return response.success({
          data: growthData,
          current,
          previous,
          growth,
          growthRate: Math.round(growthRate * 100) / 100,
        })
      },
    }),

    /**
     * @action getActiveOrganizations
     * @description Get statistics on active organizations
     *
     * @returns {Promise<{ total: number; active: number; inactive: number; activityRate: number }>} Active organization statistics
     * @throws {401} When user is not super-authenticated
     *
     * @example
     * ```typescript
     * const activeOrgs = await api.admin.stats.organizations.active.query()
     * ```
     */
    getActiveOrganizations: igniter.query({
      name: 'GetActiveOrganizations',
      description: 'Get statistics on active organizations',
      path: '/organizations/active',
      use: [AuthFeatureProcedure(), AdminProcedure()],
      handler: async ({ context, response }) => {
        // Security Rule: Ensure user has admin role for super-authenticated requirement
        // const session = await context.auth.getSession({
        //   requirements: 'super-authenticated',
        // })

        // if (!session) {
        //   return response.unauthorized('Super-admin access required')
        // }

        // Business Logic: Calculate active organization statistics
        const [total, active] = await Promise.all([
          context.admin.organization.count({}),
          context.admin.organization.count({
            where: {
              customer: {
                subscriptions: {
                  some: {
                    status: 'active',
                  },
                },
              },
            },
          }),
        ])

        const inactive = total - active
        const activityRate = total > 0 ? (active / total) * 100 : 0

        // Response: Return active organization statistics
        return response.success({
          total,
          active,
          inactive,
          activityRate: Math.round(activityRate * 100) / 100,
        })
      },
    }),
  },
})
