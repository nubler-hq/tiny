import { igniter } from '@/igniter'
import type { OverviewStatsData } from '../admin.interface'

/**
 * @typedef StatsContext
 * @description Context extension for statistics-related services and data access
 *
 * @property {object} stats - Statistics feature context container
 * @property {object} stats.overview - Overview statistics methods
 * @property {object} stats.users - User statistics methods
 * @property {object} stats.organizations - Organization statistics methods
 * @property {object} stats.subscriptions - Subscription statistics methods
 * @property {object} stats.plans - Plan statistics methods
 * @property {object} stats.sessions - Session statistics methods
 * @property {object} stats.accounts - Account statistics methods
 * @property {object} stats.invitations - Invitation statistics methods
 */
export type StatsContext = {
  stats: {
    overview: {
      getSystemOverview: () => Promise<any>
      getStatsByPeriod: (
        period: 'daily' | 'weekly' | 'monthly',
        days?: number,
        weeks?: number,
        months?: number,
      ) => Promise<OverviewStatsData[]>
    }
    users: {
      getRoleDistribution: () => Promise<any>
      getVerificationStats: () => Promise<any>
      getGrowthStats: (period: string, value: number) => Promise<any>
      getActivityStats: (lastDays: number) => Promise<any>
    }
    organizations: {
      getSizeDistribution: () => Promise<any>
      getGrowthStats: (period: string, value: number) => Promise<any>
      getActivityStats: () => Promise<any>
    }
    subscriptions: {
      getStatusDistribution: () => Promise<any>
      getPlanDistribution: () => Promise<any>
      getRevenueMetrics: () => Promise<any>
      getChurnRate: () => Promise<any>
    }
    plans: {
      getPopularityStats: () => Promise<any>
      getRevenueStats: () => Promise<any>
    }
    sessions: {
      getActiveStats: () => Promise<any>
    }
    accounts: {
      getProviderDistribution: () => Promise<any>
    }
    invitations: {
      getStatusStats: () => Promise<any>
      getAcceptanceRate: () => Promise<any>
    }
  }
}

/**
 * @procedure StatsProcedure
 * @description Igniter.js procedure that provides statistical query methods and data aggregation
 *
 * This procedure extends the Igniter context with specialized methods for calculating
 * various system statistics and analytics. It uses efficient database queries and
 * aggregations to provide insights into user behavior, organization metrics,
 * subscription data, and platform growth.
 *
 * @returns {StatsContext} Object containing statistics methods in hierarchical structure
 *
 * @example
 * ```typescript
 * // In a controller action
 * const overview = await context.stats.overview.getSystemOverview()
 * const userGrowth = await context.stats.users.getGrowthStats('monthly', 12)
 * ```
 */
export const StatsProcedure = igniter.procedure({
  name: 'StatsProcedure',
  handler: async (_, { context }) => {
    // Context Extension: Return statistics methods in hierarchical structure
    return {
      stats: {
        overview: {
          /**
           * @method getSystemOverview
           * @description Get comprehensive system overview statistics
           * @returns {Promise<any>} System overview data
           */
          getSystemOverview: async () => {
            // Business Logic: Calculate comprehensive system statistics
            const [
              totalUsers,
              totalOrganizations,
              totalSubscriptions,
              activeUsers,
              activeOrganizations,
            ] = await Promise.all([
              context.services.database.user.count(),
              context.services.database.organization.count(),
              context.services.database.subscription.count(),
              context.services.database.user.count({
                where: {
                  sessions: {
                    some: {
                      expiresAt: { gt: new Date() },
                    },
                  },
                },
              }),
              context.services.database.organization.count({
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

            return {
              totalUsers,
              totalOrganizations,
              totalSubscriptions,
              activeUsers,
              activeOrganizations,
              lastUpdated: new Date(),
            }
          },

          /**
           * @method getStatsByPeriod
           * @description Get statistics data grouped by the specified time period
           * @param {'daily'|'weekly'|'monthly'} period - Time period for grouping
           * @param {number} [days] - Number of days to look back (default: 30, for daily)
           * @param {number} [weeks] - Number of weeks to look back (default: 12, for weekly)
           * @param {number} [months] - Number of months to look back (default: 12, for monthly)
           * @returns {Promise<OverviewStatsData[]>} Statistics data grouped by period
           */
          getStatsByPeriod: async (
            period: 'daily' | 'weekly' | 'monthly',
            days: number = 30,
            weeks: number = 12,
            months: number = 12,
          ): Promise<OverviewStatsData[]> => {
            // Calculate start date based on period
            const startDate = new Date()
            if (period === 'weekly') {
              startDate.setDate(startDate.getDate() - weeks * 7)
            } else if (period === 'monthly') {
              startDate.setMonth(startDate.getMonth() - months)
            } else {
              startDate.setDate(startDate.getDate() - days)
            }

            // Map period to SQL date_trunc argument and output column
            let dateTruncArg: string
            let groupCol: string
            if (period === 'daily') {
              dateTruncArg = 'day'
              groupCol = 'date'
            } else if (period === 'weekly') {
              dateTruncArg = 'week'
              groupCol = 'week'
            } else {
              dateTruncArg = 'month'
              groupCol = 'month'
            }

            // Use parameterized query to avoid SQL injection and fix column aliasing
            const stats = await context.services.database.$queryRawUnsafe(
              `
                SELECT
                  DATE_TRUNC($1, "createdAt") as "${groupCol}",
                  COUNT(DISTINCT CASE WHEN table_name = 'user' THEN id END) as users,
                  COUNT(DISTINCT CASE WHEN table_name = 'organization' THEN id END) as organizations,
                  COUNT(DISTINCT CASE WHEN table_name = 'subscription' THEN id END) as subscriptions,
                  COALESCE(SUM(CASE WHEN table_name = 'subscription' THEN quantity END), 0) as revenue
                FROM (
                  SELECT 'user' as table_name, id, "createdAt", NULL::integer as quantity FROM "user" WHERE "createdAt" >= $2
                  UNION ALL
                  SELECT 'organization' as table_name, id, "createdAt", NULL::integer as quantity FROM organization WHERE "createdAt" >= $2
                  UNION ALL
                  SELECT 'subscription' as table_name, id, "createdAt", quantity FROM subscription WHERE "createdAt" >= $2
                ) combined
                GROUP BY DATE_TRUNC($1, "createdAt")
                ORDER BY "${groupCol}" ASC
              `,
              dateTruncArg,
              startDate,
            )

            return stats as OverviewStatsData[]
          },
        },

        users: {
          /**
           * @method getRoleDistribution
           * @description Get distribution of users by role
           * @returns {Promise<any>} User role distribution
           */
          getRoleDistribution: async () => {
            // Business Logic: Calculate user distribution by role
            const [admin, owner, member] = await Promise.all([
              context.services.database.user.count({
                where: { role: 'admin' },
              }),
              context.services.database.user.count({
                where: { role: 'owner' },
              }),
              context.services.database.user.count({
                where: { role: 'member' },
              }),
            ])

            return {
              admin,
              owner,
              member,
              total: admin + owner + member,
            }
          },

          /**
           * @method getVerificationStats
           * @description Get verification statistics
           * @returns {Promise<any>} Verification statistics
           */
          getVerificationStats: async () => {
            // Business Logic: Calculate verification statistics
            const [verified, unverified] = await Promise.all([
              context.services.database.user.count({
                where: { emailVerified: true },
              }),
              context.services.database.user.count({
                where: { emailVerified: false },
              }),
            ])

            const total = verified + unverified
            const verificationRate = total > 0 ? (verified / total) * 100 : 0

            return {
              verified,
              unverified,
              total,
              verificationRate: Math.round(verificationRate * 100) / 100,
            }
          },

          /**
           * @method getGrowthStats
           * @description Get user growth statistics for a period
           * @param {string} period - Period type ('daily', 'weekly', 'monthly')
           * @param {number} value - Number of periods to look back
           * @returns {Promise<any>} Growth statistics
           */
          getGrowthStats: async (period: string, value: number) => {
            // Business Logic: Calculate user growth for the specified period
            let startDate: Date
            switch (period) {
              case 'daily':
                startDate = new Date()
                startDate.setDate(startDate.getDate() - value)
                break
              case 'weekly':
                startDate = new Date()
                startDate.setDate(startDate.getDate() - value * 7)
                break
              case 'monthly':
                startDate = new Date()
                startDate.setMonth(startDate.getMonth() - value)
                break
              default:
                startDate = new Date()
                startDate.setMonth(startDate.getMonth() - 12)
            }

            const growthData = await context.services.database.$queryRaw<
              Array<{ period: Date; value: number }>
            >`
              SELECT
                DATE_TRUNC(${period}, "createdAt") as period,
                COUNT(*) as value
              FROM "user"
              WHERE "createdAt" >= ${startDate}
              GROUP BY DATE_TRUNC(${period}, "createdAt")
              ORDER BY period ASC
            `

            const current =
              (growthData as Array<{ period: Date; value: number }>)?.[
                growthData.length - 1
              ]?.value || 0
            const previous =
              (growthData as Array<{ period: Date; value: number }>)?.[
                growthData.length - 2
              ]?.value || 0
            const growth = current - previous
            const growthRate = previous > 0 ? (growth / previous) * 100 : 0

            return {
              data: growthData as Array<{ period: Date; value: number }>,
              current,
              previous,
              growth,
              growthRate: Math.round(growthRate * 100) / 100,
            }
          },

          /**
           * @method getActivityStats
           * @description Get user activity statistics
           * @param {number} lastDays - Number of days to consider for activity
           * @returns {Promise<any>} Activity statistics
           */
          getActivityStats: async (lastDays: number = 7) => {
            // Business Logic: Calculate user activity statistics
            const sinceDate = new Date()
            sinceDate.setDate(sinceDate.getDate() - lastDays)

            const [total, active] = await Promise.all([
              context.services.database.user.count(),
              context.services.database.user.count({
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

            return {
              total,
              active,
              inactive,
              activityRate: Math.round(activityRate * 100) / 100,
            }
          },
        },

        organizations: {
          /**
           * @method getSizeDistribution
           * @description Get organization size distribution
           * @returns {Promise<any>} Size distribution statistics
           */
          getSizeDistribution: async () => {
            // Business Logic: Calculate organization size distribution
            const memberCounts = await context.services.database.member.groupBy(
              {
                by: ['organizationId'],
                _count: {
                  organizationId: true,
                },
              },
            )

            const distribution = {
              small: 0, // 1-10 members
              medium: 0, // 11-50 members
              large: 0, // 51-200 members
              enterprise: 0, // 200+ members
              total: memberCounts.length,
            }

            memberCounts.forEach(({ _count }) => {
              const count = _count.organizationId
              if (count >= 1 && count <= 10) distribution.small++
              else if (count >= 11 && count <= 50) distribution.medium++
              else if (count >= 51 && count <= 200) distribution.large++
              else if (count > 200) distribution.enterprise++
            })

            return distribution
          },

          /**
           * @method getGrowthStats
           * @description Get organization growth statistics for a period
           * @param {string} period - Period type ('daily', 'weekly', 'monthly')
           * @param {number} value - Number of periods to look back
           * @returns {Promise<any>} Growth statistics
           */
          getGrowthStats: async (period: string, value: number) => {
            // Business Logic: Calculate organization growth for the specified period
            let startDate: Date
            switch (period) {
              case 'daily':
                startDate = new Date()
                startDate.setDate(startDate.getDate() - value)
                break
              case 'weekly':
                startDate = new Date()
                startDate.setDate(startDate.getDate() - value * 7)
                break
              case 'monthly':
                startDate = new Date()
                startDate.setMonth(startDate.getMonth() - value)
                break
              default:
                startDate = new Date()
                startDate.setMonth(startDate.getMonth() - 12)
            }

            const growthData = await context.services.database.$queryRaw<
              Array<{ period: Date; value: number }>
            >`
              SELECT
                DATE_TRUNC(${period}, "createdAt") as period,
                COUNT(*) as value
              FROM organization
              WHERE "createdAt" >= ${startDate}
              GROUP BY DATE_TRUNC(${period}, "createdAt")
              ORDER BY period ASC
            `

            const current =
              (growthData as Array<{ period: Date; value: number }>)?.[
                growthData.length - 1
              ]?.value || 0
            const previous =
              (growthData as Array<{ period: Date; value: number }>)?.[
                growthData.length - 2
              ]?.value || 0
            const growth = current - previous
            const growthRate = previous > 0 ? (growth / previous) * 100 : 0

            return {
              data: growthData as Array<{ period: Date; value: number }>,
              current,
              previous,
              growth,
              growthRate: Math.round(growthRate * 100) / 100,
            }
          },

          /**
           * @method getActivityStats
           * @description Get organization activity statistics
           * @returns {Promise<any>} Activity statistics
           */
          getActivityStats: async () => {
            // Business Logic: Calculate organization activity statistics
            const [total, active] = await Promise.all([
              context.services.database.organization.count(),
              context.services.database.organization.count({
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

            return {
              total,
              active,
              inactive,
              activityRate: Math.round(activityRate * 100) / 100,
            }
          },
        },

        subscriptions: {
          /**
           * @method getStatusDistribution
           * @description Get subscription status distribution
           * @returns {Promise<any>} Status distribution
           */
          getStatusDistribution: async () => {
            // Business Logic: Calculate subscription status distribution
            const statusCounts =
              await context.services.database.subscription.groupBy({
                by: ['status'],
                _count: true,
              })

            const distribution = {
              active: 0,
              canceled: 0,
              past_due: 0,
              incomplete: 0,
              total: 0,
            }

            statusCounts.forEach(({ status, _count }) => {
              distribution[status as keyof typeof distribution] = _count
              distribution.total += _count
            })

            return distribution
          },

          /**
           * @method getPlanDistribution
           * @description Get subscription distribution by plan
           * @returns {Promise<any>} Plan distribution
           */
          getPlanDistribution: async () => {
            // Business Logic: Calculate subscription distribution by plan
            const planCounts =
              await context.services.database.subscription.groupBy({
                by: ['priceId'],
                _count: true,
              })

            const distribution = await Promise.all(
              planCounts.map(async ({ priceId, _count }) => {
                const price = await context.services.database.price.findUnique({
                  where: { id: priceId },
                  include: {
                    plan: true,
                  },
                })

                return {
                  planId: priceId,
                  planName: price?.plan?.name || 'Unknown',
                  count: _count,
                }
              }),
            )

            return {
              data: distribution,
              total: distribution.reduce((sum, item) => sum + item.count, 0),
            }
          },

          /**
           * @method getRevenueMetrics
           * @description Get revenue-related metrics
           * @returns {Promise<any>} Revenue metrics
           */
          getRevenueMetrics: async () => {
            // Business Logic: Calculate revenue metrics
            const revenueData =
              await context.services.database.subscription.aggregate({
                _sum: {
                  quantity: true,
                },
                _count: true,
              })

            const totalRevenue = revenueData._sum.quantity || 0
            const subscriptionCount = revenueData._count

            return {
              mrr: totalRevenue, // Monthly Recurring Revenue
              arr: totalRevenue * 12, // Annual Recurring Revenue
              totalRevenue,
              averageRevenuePerUser:
                subscriptionCount > 0 ? totalRevenue / subscriptionCount : 0,
              averageRevenuePerOrganization: 0, // Would need organization count
            }
          },

          /**
           * @method getChurnRate
           * @description Get subscription churn rate
           * @returns {Promise<any>} Churn rate metrics
           */
          getChurnRate: async () => {
            // Business Logic: Calculate churn rate
            const now = new Date()
            const lastMonth = new Date()
            lastMonth.setMonth(lastMonth.getMonth() - 1)

            const [canceledThisMonth, activeAtStartOfMonth] = await Promise.all(
              [
                context.services.database.subscription.count({
                  where: {
                    status: 'canceled',
                    updatedAt: { gte: lastMonth },
                  },
                }),
                context.services.database.subscription.count({
                  where: {
                    status: { in: ['active', 'canceled'] },
                    createdAt: { lt: now },
                  },
                }),
              ],
            )

            const churnRate =
              activeAtStartOfMonth > 0
                ? (canceledThisMonth / activeAtStartOfMonth) * 100
                : 0

            return {
              churnRate: Math.round(churnRate * 100) / 100,
              canceledThisMonth,
              activeAtStartOfMonth,
            }
          },
        },

        plans: {
          /**
           * @method getPopularityStats
           * @description Get plan popularity statistics
           * @returns {Promise<any>} Popularity statistics
           */
          getPopularityStats: async () => {
            // Business Logic: Calculate plan popularity
            const planCounts =
              await context.services.database.subscription.groupBy({
                by: ['priceId'],
                _count: true,
                // @ts-expect-error - _count is not typed correctly
                orderBy: { _count: 'desc' },
                take: 10,
              })

            const popularityData = await Promise.all(
              planCounts.map(async ({ priceId, _count }) => {
                const price = await context.services.database.price.findUnique({
                  where: { id: priceId },
                  include: {
                    plan: true,
                  },
                })

                return {
                  planId: priceId,
                  planName: price?.plan?.name || 'Unknown',
                  subscriptionCount: _count,
                }
              }),
            )

            return {
              data: popularityData,
              total: popularityData.reduce(
                (sum, item) => sum + Number(item.subscriptionCount || 0),
                0,
              ),
            }
          },

          /**
           * @method getRevenueStats
           * @description Get revenue statistics by plan
           * @returns {Promise<any>} Revenue statistics
           */
          getRevenueStats: async () => {
            // Business Logic: Calculate revenue by plan
            const revenueByPlan = (await context.services.database.$queryRaw`
              SELECT
                p."planId" as "planId",
                pl.name as "planName",
                COUNT(s.id) as "subscriptionCount",
                COALESCE(SUM(s.quantity), 0) as revenue
              FROM subscription s
              JOIN price p ON s."priceId" = p.id
              JOIN plan pl ON p."planId" = pl.id
              GROUP BY p."planId", pl.name
              ORDER BY revenue DESC
            `) as Array<{
              planId: string
              planName: string
              subscriptionCount: number
              revenue: number
            }>

            return {
              data: revenueByPlan,
              total: revenueByPlan.reduce(
                (sum: number, item: any) => sum + item.revenue,
                0,
              ),
            }
          },
        },

        sessions: {
          /**
           * @method getActiveStats
           * @description Get active session statistics
           * @returns {Promise<any>} Session statistics
           */
          getActiveStats: async () => {
            // Business Logic: Calculate active session statistics
            const [total, active, expired] = await Promise.all([
              context.services.database.session.count(),
              context.services.database.session.count({
                where: {
                  expiresAt: { gt: new Date() },
                },
              }),
              context.services.database.session.count({
                where: {
                  expiresAt: { lte: new Date() },
                },
              }),
            ])

            return {
              total,
              active,
              expired,
              activeRate: total > 0 ? (active / total) * 100 : 0,
            }
          },
        },

        accounts: {
          /**
           * @method getProviderDistribution
           * @description Get OAuth provider distribution
           * @returns {Promise<any>} Provider distribution
           */
          getProviderDistribution: async () => {
            // Business Logic: Calculate OAuth provider distribution
            const providerCounts =
              await context.services.database.account.groupBy({
                by: ['providerId'],
                _count: true,
                orderBy: {
                  _count: {
                    id: 'desc',
                  },
                },
              })

            const distribution = {
              data: providerCounts.map(({ providerId, _count }) => ({
                provider: providerId,
                count: _count,
              })),
              total: providerCounts.reduce(
                (sum, { _count }) => sum + _count,
                0,
              ),
            }

            return distribution
          },
        },

        invitations: {
          /**
           * @method getStatusStats
           * @description Get invitation status statistics
           * @returns {Promise<any>} Status statistics
           */
          getStatusStats: async () => {
            // Business Logic: Calculate invitation status distribution
            const statusCounts =
              await context.services.database.invitation.groupBy({
                by: ['status'],
                _count: true,
              })

            const distribution = {
              pending: 0,
              accepted: 0,
              expired: 0,
              total: 0,
            }

            statusCounts.forEach(({ status, _count }) => {
              distribution[status as keyof typeof distribution] = _count
              distribution.total += _count
            })

            return distribution
          },

          /**
           * @method getAcceptanceRate
           * @description Get invitation acceptance rate
           * @returns {Promise<any>} Acceptance rate metrics
           */
          getAcceptanceRate: async () => {
            // Business Logic: Calculate invitation acceptance rate
            const [accepted, total] = await Promise.all([
              context.services.database.invitation.count({
                where: { status: 'accepted' },
              }),
              context.services.database.invitation.count(),
            ])

            const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0

            return {
              accepted,
              total,
              acceptanceRate: Math.round(acceptanceRate * 100) / 100,
            }
          },
        },
      },
    }
  },
})
