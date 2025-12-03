import { igniter } from '@/igniter'
import { PlanFeatureProcedure } from '../procedures/plan.procedure'

/**
 * @controller PlanController
 * @description Controller for managing subscription plans and pricing information.
 *
 * This controller provides access to subscription plan data including pricing,
 * features, and plan details. It's designed for displaying plan information
 * to users and managing subscription offerings.
 *
 * @example
 * ```typescript
 * // List all available subscription plans
 * const plans = await api.plan.findMany.query()
 * ```
 */
export const PlanController = igniter.controller({
  name: 'Plan',
  description: 'Subscription plan management and pricing information',
  path: '/plan',
  actions: {
    /**
     * @action findMany
     * @description Lists all available subscription plans.
     *
     * This endpoint returns all subscription plans with their pricing,
     * features, and configuration details.
     *
     * @returns {Plan[]} Array of subscription plan objects
     * @example
     * ```typescript
     * const plans = await api.plan.findMany.query()
     * // Returns: [{ id: 'basic', name: 'Basic Plan', price: 9.99, features: [...] }]
     * ```
     */
    findMany: igniter.query({
      name: 'listPlans',
      description: 'List subscription plans',
      method: 'GET',
      path: '/',
      use: [PlanFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Business Logic: Retrieve all subscription plans
        const result = await context.plan.findMany()

        // Response: Return plans list with a 200 status
        return response.success(result)
      },
    }),
  },
})
