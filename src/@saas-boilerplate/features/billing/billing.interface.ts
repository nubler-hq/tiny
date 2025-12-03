/**
 * Billing Feature Interfaces
 *
 * Comprehensive type definitions for the SaaS billing system including subscription management,
 * payment processing, quota tracking, and customer portal functionality. These interfaces
 * support the complete billing lifecycle from trial to cancellation with advanced features
 * like multi-currency support, usage analytics, and grace period handling.
 *
 * @module BillingInterface
 */

/**
 * @interface Plan
 * @description Represents a subscription plan with features and pricing
 */
export interface Plan {
  id: string
  slug: string
  name: string
  description?: string
  features: PlanFeature[]
  prices: Price[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

/**
 * @interface Price
 * @description Pricing details for a subscription plan
 */
export interface Price {
  id: string
  planId: string
  amount: number
  currency: string
  interval: 'month' | 'year' | 'one_time'
  intervalCount: number
  type: 'recurring' | 'one_time'
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface PlanFeature {
  id: string
  planId: string
  name: string
  description?: string
  value: string | number | boolean
  type: 'boolean' | 'number' | 'string' | 'limit'
  metadata?: Record<string, any>
}

export interface Subscription {
  id: string
  organizationId: string
  planId: string
  priceId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt?: Date
  trialStart?: Date
  trialEnd?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

/**
 * @type SubscriptionStatus
 * @description Possible statuses for a subscription
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'

/**
 * @type BillingInterval
 * @description Billing interval options for subscription plans
 */
export type BillingInterval = 'month' | 'year'

/**
 * @type CyclePeriod
 * @description Cycle period for feature limits and usage tracking
 */
export type CyclePeriod = 'month' | 'year'

/**
 * @interface BillingInfo
 * @description Complete billing information for an organization including subscription details,
 * payment methods, usage metrics, and customer portal access.
 */
export interface BillingInfo {
  /**
   * @property customer
   * @description Customer information including contact details and metadata
   */
  customer: {
    id: string
    providerId: string
    organizationId: string
    name: string
    email: string
    metadata?: Record<string, any>
    createdAt: Date
    updatedAt: Date
  }

  /**
   * @property subscription
   * @description Current subscription details including plan, status, and billing cycle
   */
  subscription?: {
    id: string
    providerId: string
    status: SubscriptionStatus
    trialDays: number | null

    /**
     * @property plan
     * @description The subscription plan with features and limits
     */
    plan: {
      id: string
      providerId: string
      slug: string
      name: string
      description: string

      /**
       * @property metadata
       * @description Plan features and their limits
       */
      metadata: {
        features: Array<{
          slug: string
          name: string
          enabled: boolean
          description?: string
          table?: string
          limit?: number
          cycle?: CyclePeriod
        }>
      }

      /**
       * @property price
       * @description Current price for the subscription
       */
      price: {
        id: string
        providerId: string
        slug: string
        amount: number
        currency: string
        interval: CyclePeriod
      }
    }

    /**
     * @property usage
     * @description Current usage metrics for all plan features
     */
    usage: Array<{
      slug: string
      name: string
      description?: string
      usage: number
      limit: number
      lastReset?: Date
      nextReset?: Date
      cycle: CyclePeriod
    }>

    createdAt: Date
    updatedAt: Date
  }

  /**
   * @property paymentMethods
   * @description Available payment methods for the customer
   */
  paymentMethods?: Array<{
    id: string
    type: 'card' | 'bank_account'
    last4: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
    isDefault: boolean
  }>

  /**
   * @property invoices
   * @description Recent invoice history
   */
  invoices?: Array<{
    id: string
    number: string
    amount: number
    currency: string
    status: 'paid' | 'pending' | 'failed' | 'canceled'
    date: Date
    pdfUrl?: string
    hostedInvoiceUrl?: string
  }>
}

/**
 * @interface CheckoutSession
 * @description Stripe checkout session information for payment processing
 */
export interface CheckoutSession {
  /**
   * @property url
   * @description Checkout session URL to redirect customer to
   */
  url: string

  /**
   * @property sessionId
   * @description Stripe checkout session identifier
   */
  sessionId: string
}

/**
 * @interface SessionManager
 * @description Customer portal session for billing management
 */
export interface SessionManager {
  /**
   * @property url
   * @description Customer portal URL for subscription management
   */
  url: string

  /**
   * @property sessionId
   * @description Customer portal session identifier
   */
  sessionId: string
}

/**
 * @interface BillingResponse
 * @description Generic billing response interface for API consistency
 */
export interface BillingResponse {
  /**
   * @property message
   * @description Response message describing the operation result
   */
  message: string
}

/**
 * @interface BillingError
 * @description Error response for billing operations
 */
export interface BillingError {
  /**
   * @property error
   * @description Error message describing what went wrong
   */
  error: string

  /**
   * @property code
   * @description Error code for programmatic handling
   */
  code?: string
}

/**
 * @interface BillingPortalSession
 * @description Customer portal session for subscription management
 */
export interface BillingPortalSession {
  /**
   * @property url
   * @description Customer portal URL for subscription and billing management
   */
  url: string

  /**
   * @property returnUrl
   * @description URL to redirect customer to after portal session
   */
  returnUrl: string
}

/**
 * @interface SubscriptionMetrics
 * @description Analytics and metrics for subscription performance
 */
export interface SubscriptionMetrics {
  /**
   * @property totalRevenue
   * @description Total revenue generated from subscriptions
   */
  totalRevenue: number

  /**
   * @property monthlyRecurringRevenue
   * @description Current MRR (Monthly Recurring Revenue)
   */
  monthlyRecurringRevenue: number

  /**
   * @property annualRecurringRevenue
   * @description Current ARR (Annual Recurring Revenue)
   */
  annualRecurringRevenue: number

  /**
   * @property churnRate
   * @description Customer churn rate percentage
   */
  churnRate: number

  /**
   * @property trialConversionRate
   * @description Trial to paid conversion rate percentage
   */
  trialConversionRate: number

  /**
   * @property averageRevenuePerUser
   * @description ARPU (Average Revenue Per User)
   */
  averageRevenuePerUser: number
}

/**
 * @interface UsageAlert
 * @description Alert configuration for usage thresholds
 */
export interface UsageAlert {
  /**
   * @property featureSlug
   * @description Feature identifier for the alert
   */
  featureSlug: string

  /**
   * @property threshold
   * @description Usage percentage threshold to trigger alert (0-100)
   */
  threshold: number

  /**
   * @property enabled
   * @description Whether the alert is active
   */
  enabled: boolean

  /**
   * @property notifyOn
   * @description When to send notifications ('exceeded' | 'approaching')
   */
  notifyOn: 'exceeded' | 'approaching'
}

/**
 * @interface BillingConfiguration
 * @description Billing system configuration settings
 */
export interface BillingConfiguration {
  /**
   * @property trial
   * @description Trial period configuration
   */
  trial: {
    enabled: boolean
    duration: number
    gracePeriodDays?: number
  }

  /**
   * @property quotas
   * @description Quota enforcement settings
   */
  quotas: {
    enabled: boolean
    enforceHardLimits: boolean
    allowGracePeriod: boolean
  }

  /**
   * @property notifications
   * @description Notification settings for billing events
   */
  notifications: {
    trialExpiring: boolean
    paymentFailed: boolean
    quotaExceeded: boolean
    subscriptionCanceled: boolean
  }

  /**
   * @property currency
   * @description Default currency and supported currencies
   */
  currency: {
    default: string
    supported: string[]
    allowConversion: boolean
  }
}
