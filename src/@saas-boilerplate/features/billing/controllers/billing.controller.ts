import { igniter } from '@/igniter'
import { BillingFeatureProcedure } from '../procedures/billing.procedure'
import { AuthFeatureProcedure } from '../../auth/procedures/auth.procedure'
import { z } from 'zod'
import type { CyclePeriod } from '../billing.interface'

/**
 * @controller BillingController
 * @description Controller for managing subscription billing and payment processing operations.
 *
 * This controller provides comprehensive billing management capabilities including
 * subscription information retrieval, checkout session creation, and customer portal
 * access. It integrates with Stripe payment processor to handle the complete subscription
 * lifecycle from trial to cancellation with advanced features like multi-currency support,
 * usage tracking, and grace period management.
 *
 * Key features:
 * - Complete subscription lifecycle management (trial, active, past_due, canceled)
 * - Real-time usage tracking and quota enforcement
 * - Customer portal integration for self-service subscription management
 * - Multi-currency payment processing with automatic conversion
 * - Trial period management with configurable duration and notifications
 * - Grace period handling for overdue payments
 * - Comprehensive error handling and validation
 *
 * The controller ensures secure payment processing, proper authentication validation,
 * and organization-scoped data access for multi-tenant SaaS applications.
 *
 * @example
 * ```typescript
 * // Get comprehensive billing information for the organization
 * const billing = await api.billing.getSessionCustomer.query()
 * // Returns: { customer: {...}, subscription: {...}, paymentMethods: [...], invoices: [...] }
 *
 * // Create checkout session for subscription upgrade
 * const checkout = await api.billing.createCheckoutSession.mutate({
 *   plan: 'pro',
 *   cycle: 'month'
 * })
 * // Returns: { url: 'https://checkout.stripe.com/...', sessionId: 'cs_...' }
 *
 * // Access customer portal for subscription management
 * const portal = await api.billing.createSessionManager.mutate({
 *   returnUrl: 'https://app.example.com/billing'
 * })
 * // Returns: { url: 'https://billing.stripe.com/...', sessionId: 'cs_...' }
 * ```
 */
export const BillingController = igniter.controller({
  name: 'Billing',
  description:
    'Subscription billing management with checkout sessions and customer portal access',
  path: '/billing',
  actions: {
    /**
     * @action getSessionCustomer
     * @description Retrieve comprehensive billing and subscription information for the authenticated organization.
     *
     * This endpoint provides complete billing information including current subscription status,
     * plan details with feature limits, real-time usage metrics, available payment methods,
     * and recent invoice history. It's the primary endpoint for billing dashboards and
     * subscription management interfaces.
     *
     * The response includes:
     * - Customer information and contact details
     * - Current subscription with plan features and usage limits
     * - Real-time usage tracking for all plan features
     * - Available payment methods and default options
     * - Recent invoice history for billing transparency
     *
     * @returns {BillingInfo} Complete billing information for the organization
     * @returns {Customer} returns.customer - Customer details and metadata
     * @returns {Subscription} returns.subscription - Current subscription with plan and usage
     * @returns {PaymentMethod[]} returns.paymentMethods - Available payment methods
     * @returns {Invoice[]} returns.invoices - Recent invoice history
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {403} When user doesn't have admin/member/owner role for billing access
     * @throws {404} When organization billing information is not found
     * @example
     * ```typescript
     * // Get complete billing information for dashboard display
     * const billing = await api.billing.getSessionCustomer.query()
     *
     * // Access subscription details
     * const { subscription, customer, paymentMethods } = billing.data
     * console.log(`Current plan: ${subscription.plan.name}`)
     * console.log(`Trial days left: ${subscription.trialDays}`)
     *
     * // Check usage limits
     * subscription.usage.forEach(feature => {
     *   console.log(`${feature.name}: ${feature.usage}/${feature.limit}`)
     * })
     * ```
     */
    getSessionCustomer: igniter.query({
      name: 'getSessionCustomer',
      description:
        'Get comprehensive billing and subscription information for the organization',
      method: 'GET',
      path: '/subscription',
      use: [BillingFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Verify user has access to billing information
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        // Business Logic: Retrieve billing information for the organization
        const billingInfo = await context.billing.getBilling({
          id: session.organization.id,
        })

        // Response: Return billing information with a 200 status
        return response.success(billingInfo)
      },
    }),

    /**
     * @action createCheckoutSession
     * @description Create a Stripe checkout session for subscription purchase or plan upgrade.
     *
     * This endpoint initiates a secure payment checkout session for subscribing to or upgrading
     * a subscription plan. It handles plan validation, pricing calculation, trial eligibility,
     * and redirects the customer to Stripe's secure checkout interface. The session includes
     * all necessary metadata for subscription creation and webhook processing.
     *
     * Key features:
     * - Plan and pricing validation against available options
     * - Trial period handling for new subscriptions
     * - Multi-currency support with automatic conversion
     * - Success and cancel URL configuration
     * - Metadata inclusion for subscription tracking
     * - Secure session creation with Stripe
     *
     * @param {string} plan - The subscription plan slug identifier (e.g., 'free', 'pro', 'enterprise')
     * @param {CyclePeriod} cycle - The billing cycle period ('month' | 'year' | 'week' | 'day')
     * @returns {CheckoutSession} Checkout session information with secure redirect URL
     * @returns {string} returns.url - Stripe checkout session URL for payment processing
     * @returns {string} returns.sessionId - Stripe checkout session identifier for tracking
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {403} When user doesn't have admin/member/owner role for billing changes
     * @throws {400} When plan slug is invalid or not available for the organization
     * @throws {400} When billing cycle is not supported by the selected plan
     * @throws {404} When organization is not found in billing system
     * @throws {500} When Stripe session creation fails
     * @example
     * ```typescript
     * // Create checkout session for new subscription
     * const checkout = await api.billing.createCheckoutSession.mutate({
     *   plan: 'pro',
     *   cycle: 'month'
     * })
     *
     * // Redirect customer to secure checkout
     * if (checkout.data?.url) {
     *   window.location.href = checkout.data.url
     * }
     *
     * // Handle subscription upgrade
     * const upgrade = await api.billing.createCheckoutSession.mutate({
     *   plan: 'enterprise',
     *   cycle: 'year'  // 2 months free with annual billing
     * })
     * ```
     */
    createCheckoutSession: igniter.mutation({
      name: 'createCheckoutSession',
      description: 'Create payment checkout session for subscription purchase',
      method: 'POST',
      path: '/subscription',
      use: [BillingFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        plan: z.string(),
        cycle: z.enum(['month', 'year', 'week', 'day']),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has access to create checkout sessions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        // Business Logic: Create checkout session for the specified plan and cycle
        const result = await context.billing.createBillingCheckoutSession({
          id: session.organization.id,
          plan: request.body.plan,
          cycle: request.body.cycle as CyclePeriod,
        })

        // Response: Return checkout session with a 201 status
        return response.created(result)
      },
    }),

    /**
     * @action createSessionManager
     * @description Create a Stripe customer portal session for subscription and billing management.
     *
     * This endpoint generates a secure customer portal session that allows customers to
     * manage their subscriptions, update payment methods, view billing history, and download
     * invoices. The portal provides a self-service interface for all billing-related operations,
     * reducing support overhead and improving customer experience.
     *
     * Key features:
     * - Secure access to customer portal with session-based authentication
     * - Subscription management (upgrade, downgrade, cancel)
     * - Payment method updates and management
     * - Invoice history and download access
     * - Billing address management
     * - Usage analytics and quota information
     * - Configurable return URL for seamless UX
     *
     * @param {string} returnUrl - URL to redirect customer to after portal session ends
     * @returns {SessionManager} Session manager information with secure portal URL
     * @returns {string} returns.url - Stripe customer portal URL for subscription management
     * @returns {string} returns.sessionId - Customer portal session identifier for tracking
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {403} When user doesn't have admin/member/owner role for billing access
     * @throws {404} When organization is not found in billing system
     * @throws {500} When customer portal session creation fails
     * @example
     * ```typescript
     * // Create customer portal session for subscription management
     * const portal = await api.billing.createSessionManager.mutate({
     *   returnUrl: 'https://app.example.com/settings/billing'
     * })
     *
     * // Redirect to customer portal for self-service billing
     * if (portal.data?.url) {
     *   window.location.href = portal.data.url
     * }
     *
     * // Handle different portal actions
     * const handleBillingAction = async (action: string) => {
     *   const portal = await api.billing.createSessionManager.mutate({
     *     returnUrl: window.location.href
     *   })
     *   window.location.href = portal.data.url
     * }
     * ```
     */
    createSessionManager: igniter.mutation({
      name: 'createSessionManager',
      description: 'Create billing session manager for customer portal access',
      method: 'POST',
      path: '/subscription/open',
      use: [BillingFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        returnUrl: z.string(),
      }),
      handler: async ({ response, request, context }) => {
        // Authentication: Verify user has access to create session managers
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        // Business Logic: Create session manager for customer portal access
        const result = await context.billing.createBillingSessionManager({
          id: session.organization.id,
          returnUrl: request.body.returnUrl,
        })

        // Response: Return session manager with a 201 status
        return response.created(result)
      },
    }),
  },
})
