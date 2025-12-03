import { igniter } from '@/igniter'

/**
 * @typedef SubscriptionContext
 * @description Context extension for subscription and plan-related repositories
 *
 * @property {object} subscription - Subscription feature context container
 * @property {object} subscription.subscription - Subscription-related database operations
 * @property {object} subscription.plan - Plan-related database operations
 * @property {object} subscription.price - Price-related database operations
 */
export type SubscriptionContext = {
  subscription: {
    subscription: {
      findMany: (filters: any) => Promise<any[]>
      findUnique: (id: string) => Promise<any | null>
      count: (filters: any) => Promise<number>
    }
    plan: {
      findMany: (filters: any) => Promise<any[]>
      findUnique: (id: string) => Promise<any | null>
      count: (filters: any) => Promise<number>
    }
    price: {
      findMany: (filters: any) => Promise<any[]>
      count: (filters: any) => Promise<number>
    }
  }
}

/**
 * @procedure SubscriptionProcedure
 * @description Igniter.js procedure that injects subscription and plan repositories into the context
 *
 * This procedure provides access to subscription, plan, and price-related database operations
 * for administrative purposes. It follows the hierarchical context pattern for consistent
 * access across controllers and includes proper relationship loading for detailed views.
 *
 * @returns {SubscriptionContext} Object containing subscription repositories in hierarchical structure
 *
 * @example
 * ```typescript
 * // In a controller action
 * const subscriptions = await context.subscription.subscription.findMany({})
 * const plan = await context.subscription.plan.findUnique(planId)
 * ```
 */
export const SubscriptionProcedure = igniter.procedure({
  name: 'SubscriptionProcedure',
  handler: async (_, { context }) => {
    // Context Extension: Return subscription repositories in hierarchical structure
    return {
      subscription: {
        subscription: {
          /**
           * @method count
           * @description Count subscriptions with optional filtering
           * @param {any} filters - Filter criteria for subscriptions
           * @returns {Promise<number>} Number of subscriptions
           */
          count: async (filters: any) => {
            // Business Logic: Count subscriptions with optional filtering
            return context.services.database.subscription.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple subscriptions with optional filtering
           * @param {any} filters - Filter criteria for subscriptions
           * @returns {Promise<any[]>} Array of subscriptions
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve subscriptions with optional filtering and pagination
            return context.services.database.subscription.findMany({
              where: filters.where || {},
              include: {
                customer: {
                  include: {
                    organization: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                price: {
                  include: {
                    plan: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },

          /**
           * @method findUnique
           * @description Find a single subscription by ID
           * @param {string} id - Subscription ID
           * @returns {Promise<any | null>} Subscription object or null
           */
          findUnique: async (id: string) => {
            // Business Logic: Retrieve single subscription with full details
            return context.services.database.subscription.findUnique({
              where: { id },
              include: {
                customer: {
                  include: {
                    organization: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        createdAt: true,
                      },
                    },
                  },
                },
                price: {
                  include: {
                    plan: true,
                  },
                },
              },
            })
          },
        },

        plan: {
          /**
           * @method count
           * @description Count plans with optional filtering
           * @param {any} filters - Filter criteria for plans
           * @returns {Promise<number>} Number of plans
           */
          count: async (filters: any) => {
            // Business Logic: Count plans with optional filtering
            return context.services.database.plan.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple plans with optional filtering
           * @param {any} filters - Filter criteria for plans
           * @returns {Promise<any[]>} Array of plans
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve plans with optional filtering and pagination
            return context.services.database.plan.findMany({
              where: filters.where || {},
              include: {
                _count: {
                  select: {
                    prices: true,
                  },
                },
                prices: {
                  orderBy: { createdAt: 'asc' },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },

          /**
           * @method findUnique
           * @description Find a single plan by ID
           * @param {string} id - Plan ID
           * @returns {Promise<any | null>} Plan object or null
           */
          findUnique: async (id: string) => {
            // Business Logic: Retrieve single plan with full details including prices
            return context.services.database.plan.findUnique({
              where: { id },
              include: {
                prices: {
                  orderBy: { createdAt: 'asc' },
                },
              },
            })
          },
        },

        price: {
          /**
           * @method count
           * @description Count prices with optional filtering
           * @param {any} filters - Filter criteria for prices
           * @returns {Promise<number>} Number of prices
           */
          count: async (filters: any) => {
            // Business Logic: Count prices with optional filtering
            return context.services.database.price.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple prices with optional filtering
           * @param {any} filters - Filter criteria for prices
           * @returns {Promise<any[]>} Array of prices
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve prices with optional filtering
            return context.services.database.price.findMany({
              where: filters.where || {},
              include: {
                plan: true,
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },
        },
      },
    }
  },
})
