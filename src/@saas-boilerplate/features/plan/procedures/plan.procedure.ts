import { igniter } from '@/igniter'
import type { Plan } from '../../billing/billing.interface'

/**
 * @procedure PlanFeatureProcedure
 * @description Procedure for managing subscription plans and pricing operations.
 *
 * This procedure provides the business logic layer for subscription plan management,
 * handling database operations and data transformation between the payment provider
 * and the application layer. It manages the complete lifecycle of subscription plans
 * including retrieval, mapping, and feature configuration.
 *
 * The procedure integrates with the payment provider to fetch plan information
 * and transforms the data into application-specific formats for consistent
 * handling across the system.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const plans = await context.plan.findMany()
 * // Returns: [{ id: 'plan_123', name: 'Pro Plan', features: [...], prices: [...] }]
 * ```
 */
export const PlanFeatureProcedure = igniter.procedure({
  name: 'PlanFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      plan: {
        findMany: async (): Promise<Plan[]> => {
          const plans = await context.services.payment.listPlans()

          // Map API response to Plan type
          return plans.map((plan) => ({
            id: plan.id,
            slug: plan.slug,
            name: plan.name,
            description: plan.description,
            features: (plan.metadata?.features || []).map((feature) => ({
              id: feature.slug, // Use slug as id
              planId: plan.id,
              name: feature.name,
              description: feature.description,
              value: feature.limit || feature.enabled, // Map limit or enabled
              type: feature.limit ? 'limit' : 'boolean',
            })),
            prices: (plan.prices || []).map((price) => ({
              id: price.id,
              planId: price.planId,
              amount: price.amount,
              currency: price.currency,
              interval:
                price.interval === 'month'
                  ? 'month'
                  : price.interval === 'year'
                    ? 'year'
                    : 'month', // fallback to month
              intervalCount: price.intervalCount,
              type: 'recurring', // CyclePeriod doesn't include 'one_time', so always recurring
              metadata: price.metadata,
              createdAt: price.createdAt || new Date(),
              updatedAt: price.updatedAt || new Date(),
            })),
            metadata: plan.metadata,
            createdAt: plan.createdAt || new Date(),
            updatedAt: plan.updatedAt || new Date(),
          }))
        },
      },
    }
  },
})
