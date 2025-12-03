import { igniter } from '@/igniter'
import type { CyclePeriod } from '../billing.interface'
import { isPaymentEnabled } from '../presentation/utils/is-payment-enabled'

/**
 * @procedure BillingFeatureProcedure
 * @description Procedure for managing billing business logic and payment service integration.
 *
 * This procedure provides the comprehensive business logic layer for billing operations,
 * integrating with the payment provider to handle customer management, subscription
 * lifecycle, checkout session creation, and customer portal access. It manages the
 * complete billing workflow from initial customer creation to subscription management.
 *
 * Key features:
 * - Customer information retrieval and validation
 * - Subscription checkout session creation with plan validation
 * - Customer portal session management for self-service
 * - Organization-scoped billing data access
 * - Payment provider integration and error handling
 * - Multi-currency and multi-cycle billing support
 * - Trial period and subscription status management
 *
 * The procedure ensures proper authentication, organization isolation, and secure
 * payment processing while providing a clean API for billing operations.
 *
 * @example
 * ```typescript
 * // Usage in billing controllers for payment operations
 * const billingInfo = await context.billing.getBilling({
 *   id: organizationId
 * })
 *
 * const checkout = await context.billing.createBillingCheckoutSession({
 *   id: organizationId,
 *   plan: 'pro',
 *   cycle: 'month'
 * })
 *
 * const portal = await context.billing.createBillingSessionManager({
 *   id: organizationId,
 *   returnUrl: 'https://app.example.com/billing'
 * })
 * ```
 */
export const BillingFeatureProcedure = igniter.procedure({
  name: 'BillingFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      billing: {
        /**
         * @method getBilling
         * @description Retrieve comprehensive billing information for an organization.
         *
         * This method fetches complete billing data including customer information,
         * subscription details, payment methods, usage metrics, and invoice history.
         * It validates organization existence and retrieves data from the payment provider.
         *
         * @param {Object} params - Parameters for billing retrieval
         * @param {string} params.id - Organization identifier for billing lookup
         * @returns {Promise<BillingInfo>} Complete billing information for the organization
         * @throws {Error} When organization is not found in database
         * @throws {Error} When payment provider fails to retrieve customer data
         */
        getBilling: async (params: { id: string }) => {
          // Business Rule: If payment is disabled, return null
          if (!isPaymentEnabled()) {
            return null
          }

          // Business Logic: Validate organization exists before retrieving billing data.
          const organization =
            await context.services.database.organization.findUnique({
              where: { id: params.id },
            })

          // Business Rule: Ensure organization access before proceeding with billing retrieval.
          if (!organization) throw new Error('Organization not found')

          // Business Logic: Retrieve complete billing information from payment provider.
          return context.services.payment.getCustomerById(params.id)
        },

        /**
         * @method createBillingCheckoutSession
         * @description Create a Stripe checkout session for subscription purchase or upgrade.
         *
         * This method initiates the payment checkout process by validating the organization,
         * plan availability, and billing cycle compatibility. It creates a secure checkout
         * session with Stripe that handles payment processing, trial eligibility, and
         * subscription creation with proper metadata for webhook processing.
         *
         * Key validation steps:
         * - Organization existence and access validation
         * - Plan availability and compatibility checking
         * - Billing cycle validation against plan pricing
         * - Success and cancel URL configuration
         *
         * @param {Object} params - Parameters for checkout session creation
         * @param {string} params.id - Organization identifier for subscription
         * @param {string} params.plan - Plan slug identifier (e.g., 'free', 'pro', 'enterprise')
         * @param {CyclePeriod} params.cycle - Billing cycle ('month' | 'year' | 'week' | 'day')
         * @param {string} [params.cancelUrl] - Optional URL to redirect on checkout cancellation
         * @param {string} [params.successUrl] - Optional URL to redirect on successful payment
         * @returns {Promise<CheckoutSession>} Checkout session information with secure payment URL
         * @throws {Error} When organization is not found
         * @throws {Error} When plan is invalid or unavailable
         * @throws {Error} When billing cycle is not supported by plan
         * @throws {Error} When checkout session creation fails
         */
        createBillingCheckoutSession: async (params: {
          id: string
          plan: string
          cycle: CyclePeriod
          cancelUrl?: string
          successUrl?: string
        }) => {
          // Business Rule: If payment is disabled, throw error
          if (!isPaymentEnabled()) {
            throw new Error('Payment provider is not enabled')
          }

          // Business Logic: Validate organization exists before creating checkout session.
          const organization =
            await context.services.database.organization.findUnique({
              where: { id: params.id },
            })

          // Business Rule: Ensure organization access before proceeding with checkout creation.
          if (!organization) throw new Error('Organization not found')

          // Business Logic: Create secure checkout session with payment provider integration.
          return context.services.payment.createCheckoutSession({
            customerId: params.id,
            plan: params.plan,
            cycle: params.cycle,
            cancelUrl: params.cancelUrl,
            successUrl: params.successUrl,
          })
        },

        /**
         * @method createBillingSessionManager
         * @description Create a Stripe customer portal session for subscription management.
         *
         * This method generates a secure customer portal session that provides customers
         * with self-service access to their subscription and billing information. The portal
         * allows customers to manage payment methods, view invoices, update billing details,
         * and modify their subscription without requiring support intervention.
         *
         * Key features:
         * - Secure session-based authentication with Stripe
         * - Self-service subscription management capabilities
         * - Payment method and billing address updates
         * - Invoice history and download access
         * - Configurable return URL for seamless UX
         *
         * @param {Object} params - Parameters for portal session creation
         * @param {string} params.id - Organization identifier for portal access
         * @param {string} params.returnUrl - URL to redirect customer after portal session
         * @returns {Promise<SessionManager>} Portal session information with secure access URL
         * @throws {Error} When organization is not found in database
         * @throws {Error} When customer portal session creation fails
         * @throws {Error} When payment provider portal creation fails
         */
        createBillingSessionManager: async (params: {
          id: string
          returnUrl: string
        }) => {
          // Business Rule: If payment is disabled, throw error
          if (!isPaymentEnabled()) {
            throw new Error('Payment provider is not enabled')
          }

          // Business Logic: Validate organization exists before creating portal session.
          const organization =
            await context.services.database.organization.findUnique({
              where: { id: params.id },
            })

          // Business Rule: Ensure organization access before proceeding with portal creation.
          if (!organization) throw new Error('Organization not found')

          // Business Logic: Create secure customer portal session with payment provider.
          return context.services.payment.createBillingPortal(
            organization.id,
            params.returnUrl,
          )
        },
      },
    }
  },
})
