/**
 * @file Payment Provider Type Definitions
 * @description This module contains all type definitions for the payment provider system.
 * It includes entity types, data transfer objects, configuration options, and interface
 * definitions needed for implementing payment functionality across different providers.
 */

/* eslint-disable no-use-before-define */
import type {
  DatabaseAdapterQueryParams,
  IPaymentProviderDatabaseAdapter,
} from './databases/database-adapter.interface'
import type { IPaymentProviderAdapter } from './providers/provider-adapter.interface'

// ------------------------------------------------------------------------------
// Core Types
// ------------------------------------------------------------------------------

/**
 * Represents the billing cycle period for subscriptions and features.
 * @enum {string}
 */
export type CyclePeriod = 'day' | 'week' | 'month' | 'year'

/**
 * Represents the status of a subscription.
 * @enum {string}
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'trialing'

// ------------------------------------------------------------------------------
// Entity Types
// ------------------------------------------------------------------------------

/**
 * Represents a customer in the payment system.
 * @interface Customer
 * @property {string} id - Unique identifier for the customer
 * @property {string} providerId - Provider-specific identifier
 * @property {string} organizationId - Organization this customer belongs to
 * @property {string} name - Customer's full name
 * @property {string} email - Customer's email address
 * @property {Record<string, any>} [metadata] - Additional custom properties
 * @property {Object} [subscription] - Active subscription details if any
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Last update timestamp
 */
export type Customer = {
  id: string
  providerId: string
  organizationId: string
  name: string
  email: string
  metadata?: Record<string, any>

  subscription?: {
    id: string
    providerId: string
    status: SubscriptionStatus
    trialDays: number | null

    plan: {
      id: string
      providerId: string
      slug: string
      name: string
      description: string
      metadata: PlanMetadata
      price: {
        id: string
        providerId: string
        slug: string
        amount: number
        currency: string
        interval: CyclePeriod
      }
    }

    usage: Usage[]

    createdAt?: Date
    updatedAt?: Date
  }

  createdAt?: Date
  updatedAt?: Date
}

/**
 * Represents a feature of a subscription plan with usage limits and conditions.
 * @interface PlanFeature
 * @property {string} slug - Unique identifier for the feature
 * @property {string} name - Human-readable name of the feature
 * @property {boolean} enabled - Whether this feature is enabled
 * @property {string} [description] - Detailed explanation of the feature
 * @property {string} [table] - Database table associated with this feature for usage tracking
 * @property {number} [limit] - Maximum usage allowed for this feature
 * @property {CyclePeriod} [cycle] - Time period for resetting usage limits
 */
export type PlanFeature = {
  slug: string
  name: string
  enabled: boolean
  description?: string
  table?: string
  limit?: number
  cycle?: CyclePeriod
}

/**
 * Represents metadata associated with a subscription plan.
 * @interface PlanMetadata
 * @property {PlanFeature[]} features - List of features included in this plan
 */
export type PlanMetadata = {
  features: PlanFeature[]
}

/**
 * Represents a subscription plan offering in the payment system.
 * @interface Plan
 * @property {string} id - Unique identifier for the plan
 * @property {string} providerId - Provider-specific identifier
 * @property {string} slug - URL-friendly identifier
 * @property {string} name - Human-readable name
 * @property {string} description - Detailed explanation of the plan
 * @property {PlanMetadata} metadata - Additional plan details including features
 * @property {Price[]} prices - Available pricing options for this plan
 * @property {boolean} [archived] - Whether this plan is no longer offered
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Last update timestamp
 */
export type Plan = {
  id: string
  providerId: string
  slug: string
  name: string
  description: string
  metadata: PlanMetadata
  prices: Price[]
  archived?: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Represents a specific price point for a subscription plan.
 * @interface Price
 * @property {string} id - Unique identifier for the price
 * @property {string} providerId - Provider-specific identifier
 * @property {string} planId - ID of the plan this price belongs to
 * @property {string} slug - URL-friendly identifier
 * @property {number} amount - Numeric price amount
 * @property {string} currency - Three-letter currency code (e.g., USD)
 * @property {CyclePeriod} interval - Billing frequency
 * @property {number} intervalCount - Number of intervals between billings
 * @property {Record<string, any>} [metadata] - Additional custom properties
 * @property {boolean} [active] - Whether this price is currently available
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Last update timestamp
 */
export type Price = {
  id: string
  providerId: string
  planId: string
  slug: string
  amount: number
  currency: string
  interval: CyclePeriod
  intervalCount: number
  metadata?: Record<string, any>
  active?: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Represents a customer's subscription to a specific plan.
 * @interface Subscription
 * @property {string} id - Unique identifier for the subscription
 * @property {string} providerId - Provider-specific identifier
 * @property {string} customerId - ID of the customer who owns this subscription
 * @property {string} priceId - ID of the price selected for this subscription
 * @property {number} [quantity] - Number of subscription units (defaults to 1)
 * @property {number} [trialDays] - Duration of trial period in days
 * @property {Record<string, any>} [metadata] - Additional custom properties
 * @property {Date} [billingCycleAnchor] - Date for aligning billing cycles
 * @property {'create_prorations' | 'none'} [prorationBehavior] - How to handle prorations
 * @property {'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'} status - Current state
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Last update timestamp
 */
export type Subscription = {
  id: string
  providerId: string
  customerId: string
  priceId: string
  quantity?: number
  trialDays?: number
  metadata?: Record<string, any>
  billingCycleAnchor?: Date
  prorationBehavior?: 'create_prorations' | 'none'
  status: SubscriptionStatus
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Represents usage metrics for a specific feature within a subscription.
 * @interface Usage
 * @property {string} slug - Unique identifier for the feature
 * @property {string} name - Human-readable name of the feature
 * @property {string} [description] - Detailed explanation of the feature
 * @property {number} usage - Current usage amount
 * @property {number} limit - Maximum allowed usage
 * @property {Date} [lastReset] - When usage was last reset
 * @property {Date} [nextReset] - When usage will next reset
 * @property {CyclePeriod} cycle - Time period for usage limits
 */
export type Usage = {
  slug: string
  name: string
  description?: string
  usage: number
  limit: number
  lastReset?: Date
  nextReset?: Date
  cycle: CyclePeriod
}

/**
 * Represents a customer portal session for managing billing settings.
 * @interface PortalSession
 * @property {string} id - Unique identifier for the session
 * @property {string} customerId - ID of the customer accessing the portal
 * @property {string} returnUrl - URL to redirect to after portal session ends
 * @property {string} url - URL to access the portal session
 * @property {Record<string, any>} [metadata] - Additional custom properties
 */
export type PortalSession = {
  id: string
  customerId: string
  returnUrl: string
  url: string
  metadata?: Record<string, any>
}

/**
 * Represents a checkout session for completing a payment.
 * @interface CheckoutSession
 * @property {string} id - Unique identifier for the session
 * @property {string} customerId - ID of the customer making the payment
 * @property {string} priceId - ID of the price being purchased
 * @property {string} successUrl - URL to redirect to after successful payment
 * @property {string} cancelUrl - URL to redirect to if checkout is canceled
 * @property {Record<string, any>} [metadata] - Additional custom properties
 */
export type CheckoutSession = {
  id: string
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, any>
}

// ------------------------------------------------------------------------------
// Data Transfer Objects (DTOs)
// ------------------------------------------------------------------------------

/**
 * Data transfer object for customer creation or update operations.
 * @interface CustomerDTO
 * @property {string} [providerId] - Provider-specific identifier
 * @property {string} referenceId - External reference identifier (e.g., user ID)
 * @property {string} name - Customer's full name
 * @property {string} email - Customer's email address
 * @property {Record<string, any>} [metadata] - Additional custom properties
 */
export type CustomerDTO = {
  providerId?: string
  referenceId: string
  name: string
  email: string
  metadata?: Record<string, any>
}

/**
 * Data transfer object for price creation or update operations.
 * @interface PriceDTO
 * @property {string} [providerId] - Provider-specific identifier
 * @property {string} planId - ID of the plan this price belongs to
 * @property {string} slug - URL-friendly identifier
 * @property {number} amount - Numeric price amount
 * @property {string} currency - Three-letter currency code (e.g., USD)
 * @property {CyclePeriod} interval - Billing frequency
 * @property {number} intervalCount - Number of intervals between billings
 * @property {Record<string, any>} [metadata] - Additional custom properties
 */
export type PriceDTO = {
  providerId?: string
  planId: string
  slug: string
  amount: number
  currency: string
  interval: CyclePeriod
  intervalCount: number
  metadata?: Record<string, any>
}

/**
 * Data transfer object for plan creation or update operations.
 * @interface PlanDTO
 * @property {string} [providerId] - Provider-specific identifier
 * @property {string} slug - URL-friendly identifier
 * @property {string} name - Human-readable name
 * @property {string} description - Detailed explanation of the plan
 * @property {PlanMetadata} metadata - Additional plan details including features
 * @property {Array<Object>} prices - Available pricing options for this plan
 */
export type PlanDTO = {
  providerId?: string
  slug: string
  name: string
  description: string
  metadata: PlanMetadata
  prices: Array<{
    providerId?: string
    slug: string
    interval: CyclePeriod
    amount: number
    currency: string
    intervalCount: number
    metadata?: Record<string, any>
  }>
}

/**
 * Data transfer object for subscription creation or update operations.
 * @interface SubscriptionDTO
 * @property {string} [status] - Status to set for the subscription
 * @property {string} [providerId] - Provider-specific identifier
 * @property {string} customerId - ID of the customer who owns this subscription
 * @property {string} priceId - ID of the price selected for this subscription
 * @property {number} [quantity] - Number of subscription units (defaults to 1)
 * @property {number} [trialDays] - Duration of trial period in days
 * @property {Date} [billingCycleAnchor] - Date for aligning billing cycles
 * @property {'create_prorations' | 'none'} [prorationBehavior] - How to handle prorations
 * @property {Record<string, any>} [metadata] - Additional custom properties
 */
export type SubscriptionDTO = {
  status: SubscriptionStatus
  providerId?: string
  customerId: string
  priceId: string
  quantity?: number
  trialDays?: number
  billingCycleAnchor?: Date
  prorationBehavior?: 'create_prorations' | 'none'
  metadata?: Record<string, any>
}

/**
 * Utility type to extract all feature slugs from a plan configuration.
 * @template TPlans - Array of plan configurations
 */
export type ExtractFeatureSlugs<TPlans extends Omit<PlanDTO, 'providerId'>[]> =
  TPlans[number]['metadata']['features'][number]['slug']

/**
 * Utility type to extract all plan slugs from a plan configuration.
 * @template TPlans - Array of plan configurations
 */
export type ExtractPlanSlugs<TPlans extends Omit<PlanDTO, 'providerId'>[]> =
  TPlans[number]['slug']

/**
 * Parameters for creating a new subscription.
 * @interface CreateSubscriptionParams
 * @property {string} customerId - ID of the customer to subscribe
 * @property {string} plan - Slug of the plan to subscribe to
 * @property {CyclePeriod} cycle - Billing cycle period for the subscription
 * @property {number} [quantity] - Number of subscription units (defaults to 1)
 * @property {number} [trialDays] - Duration of trial period in days
 * @property {Record<string, any>} [metadata] - Additional custom properties
 * @property {Date} [billingCycleAnchor] - Date for aligning billing cycles
 * @property {'create_prorations' | 'none'} [prorationBehavior] - How to handle prorations
 */
export type CreateSubscriptionParams<
  TPlans extends Omit<PlanDTO, 'providerId'>[],
> = {
  customerId: string
  plan: ExtractPlanSlugs<TPlans>
  cycle: CyclePeriod
  quantity?: number
  trialDays?: number
  metadata?: Record<string, any>
  billingCycleAnchor?: Date
  prorationBehavior?: 'create_prorations' | 'none'
}

// ------------------------------------------------------------------------------
// Configuration Types
// ------------------------------------------------------------------------------

/**
 * Configuration options for initializing a payment provider.
 * @interface PaymentOptions
 * @property {IPaymentProviderAdapter} adapter - The payment provider adapter implementation
 * @property {IPaymentProviderDatabaseAdapter} database - The database adapter for persistence
 * @property {PaymentEvents} [events] - Event handlers for payment lifecycle events
 * @property {Object} [paths] - URL configuration for redirects
 * @property {Object} [subscriptions] - Subscription configuration
 */
export interface PaymentOptions<TPlans extends Omit<PlanDTO, 'providerId'>[]> {
  adapter: IPaymentProviderAdapter
  database: IPaymentProviderDatabaseAdapter
  events?: PaymentEvents
  paths?: {
    checkoutSuccessUrl?: string
    checkoutCancelUrl?: string
    portalReturnUrl?: string
    endSubscriptionUrl?: string
  }
  subscriptions?: {
    enabled: boolean
    trial?: {
      enabled: boolean
      duration: number
    }
    plans: {
      default: TPlans[number]['slug']
      options: TPlans
    }
  }
}

/**
 * Event handlers for payment lifecycle events.
 * @interface PaymentEvents
 */
export interface PaymentEvents {
  // Subscription events
  /**
   * Called when a new subscription is created.
   * @param {Subscription} subscription - The newly created subscription
   */
  onSubscriptionCreated?: (subscription: Subscription) => Promise<void>

  /**
   * Called when an existing subscription is updated.
   * @param {Subscription} subscription - The updated subscription
   */
  onSubscriptionUpdated?: (subscription: Subscription) => Promise<void>

  /**
   * Called when a subscription is canceled.
   * @param {Subscription} subscription - The canceled subscription
   */
  onSubscriptionCanceled?: (subscription: Subscription) => Promise<void>

  /**
   * Called when a subscription is permanently deleted.
   * @param {string} subscriptionId - ID of the deleted subscription
   */
  onSubscriptionDeleted?: (subscriptionId: string) => Promise<void>

  /**
   * Called when a subscription's trial period is about to end.
   * @param {Subscription} subscription - The subscription with ending trial
   */
  onSubscriptionTrialWillEnd?: (subscription: Subscription) => Promise<void>

  // Customer events
  /**
   * Called when a new customer is created.
   * @param {Customer} customer - The newly created customer
   */
  onCustomerCreated?: (customer: Customer) => Promise<void>

  /**
   * Called when an existing customer is updated.
   * @param {Customer} customer - The updated customer
   */
  onCustomerUpdated?: (customer: Customer) => Promise<void>

  /**
   * Called when a customer is permanently deleted.
   * @param {string} customerId - ID of the deleted customer
   */
  onCustomerDeleted?: (customerId: string) => Promise<void>

  // Invoice events
  /**
   * Called when an invoice payment succeeds.
   * @param {any} invoice - The paid invoice
   */
  onInvoicePaymentSucceeded?: (invoice: any) => Promise<void>

  /**
   * Called when an invoice payment fails.
   * @param {any} invoice - The failed invoice
   */
  onInvoicePaymentFailed?: (invoice: any) => Promise<void>

  // Plan events
  /**
   * Called when a new plan is created.
   * @param {Plan} plan - The newly created plan
   */
  onPlanCreated?: (plan: Plan) => Promise<void>

  /**
   * Called when an existing plan is updated.
   * @param {Plan} plan - The updated plan
   */
  onPlanUpdated?: (plan: Plan) => Promise<void>

  /**
   * Called when a plan is permanently deleted.
   * @param {string} planId - ID of the deleted plan
   */
  onPlanDeleted?: (planId: string) => Promise<void>

  // Price events
  /**
   * Called when a new price is created.
   * @param {Price} price - The newly created price
   */
  onPriceCreated?: (price: Price) => Promise<void>

  /**
   * Called when an existing price is updated.
   * @param {Price} price - The updated price
   */
  onPriceUpdated?: (price: Price) => Promise<void>

  /**
   * Called when a price is permanently deleted.
   * @param {string} priceId - ID of the deleted price
   */
  onPriceDeleted?: (priceId: string) => Promise<void>

  // Generic webhook event
  /**
   * Called when any webhook event is received from the payment provider.
   * @param {any} event - The raw webhook event data
   */
  onWebhookReceived?: (event: any) => Promise<void>
}

// ------------------------------------------------------------------------------
// Service Interfaces
// ------------------------------------------------------------------------------

/**
 * Main payment provider interface that defines the contract for all payment operations.
 * @interface IPaymentProvider
 */
export interface IPaymentProvider<
  TPlans extends Omit<PlanDTO, 'providerId'>[],
> {
  // Customer Management
  /**
   * Creates a new customer in the payment system.
   * @param {CustomerDTO} params - Customer creation parameters
   * @returns {Promise<Customer>} The created customer
   */
  createCustomer(params: CustomerDTO): Promise<Customer>

  /**
   * Updates an existing customer's information.
   * @param {string} customerId - ID of the customer to update
   * @param {Partial<CustomerDTO>} params - Fields to update
   * @returns {Promise<Customer>} The updated customer
   */
  updateCustomer(
    customerId: string,
    params: Partial<CustomerDTO>,
  ): Promise<Customer>

  /**
   * Permanently deletes a customer.
   * @param {string} customerId - ID of the customer to delete
   * @returns {Promise<void>}
   */
  deleteCustomer(customerId: string): Promise<void>

  /**
   * Retrieves a customer by their ID.
   * @param {string} customerId - ID of the customer to retrieve
   * @returns {Promise<Customer | null>} The customer or null if not found
   */
  getCustomerById(customerId: string): Promise<Customer | null>

  /**
   * Lists customers matching the provided search criteria.
   * @param {DatabaseAdapterQueryParams<Customer>} [search] - Search parameters
   * @returns {Promise<Customer[]>} List of matching customers
   */
  listCustomers(
    search?: DatabaseAdapterQueryParams<Customer>,
  ): Promise<Customer[]>

  /**
   * Lists all available subscription plans.
   * @returns {Promise<Plan[]>} List of available plans
   */
  listPlans(): Promise<Plan[]>

  // Subscriptions
  /**
   * Creates a new subscription for a customer.
   * @param {CreateSubscriptionParams} params - Subscription creation parameters
   * @returns {Promise<Subscription>} The created subscription
   */
  createSubscription(
    params: CreateSubscriptionParams<TPlans>,
  ): Promise<Subscription>

  /**
   * Updates an existing subscription.
   * @param {string} subscriptionId - ID of the subscription to update
   * @param {Partial<SubscriptionDTO>} params - Fields to update
   * @returns {Promise<Subscription>} The updated subscription
   */
  updateSubscription(
    subscriptionId: string,
    params: Partial<SubscriptionDTO>,
  ): Promise<Subscription>

  /**
   * Cancels an active subscription.
   * @param {string} subscriptionId - ID of the subscription to cancel
   * @param {Object} [params] - Cancellation options
   * @returns {Promise<void>}
   */
  cancelSubscription(
    subscriptionId: string,
    params?: { cancelAt?: Date; invoiceNow?: boolean; prorate?: boolean },
  ): Promise<void>

  /**
   * Lists subscriptions matching the provided search criteria.
   * @param {DatabaseAdapterQueryParams<Subscription>} [search] - Search parameters
   * @returns {Promise<Subscription[]>} List of matching subscriptions
   */
  listSubscriptions(
    search?: DatabaseAdapterQueryParams<Subscription>,
  ): Promise<Subscription[]>

  // Portal and Checkout
  /**
   * Creates a billing portal session for a customer.
   * @param {string} customerId - ID of the customer
   * @param {string} returnUrl - URL to redirect to after portal session
   * @returns {Promise<string>} URL to access the billing portal
   */
  createBillingPortal(customerId: string, returnUrl: string): Promise<string>

  /**
   * Creates a checkout session for a new subscription.
   * @param {Object} params - Checkout session parameters
   * @returns {Promise<string>} URL to access the checkout page
   */
  createCheckoutSession(params: {
    customerId: string
    plan: string
    cycle: CyclePeriod
    successUrl?: string
    cancelUrl?: string
  }): Promise<string>

  // Webhooks and Sync
  /**
   * Handles incoming webhook requests from the payment provider.
   * @param {Request} request - The incoming webhook request
   * @returns {Promise<Response>} Response to send back to the provider
   */
  handle(request: Request): Promise<Response>

  /**
   * Syncs data between the application and the payment provider.
   * @returns {Promise<void>}
   */
  sync(): Promise<void>

  /**
   * Checks if a customer has quota available for a specific feature.
   * @param customerId - The customer ID
   * @param feature - The feature slug to check
   * @returns Promise<boolean> - Whether the customer has quota available
   */
  hasQuota(
    customerId: string,
    feature: ExtractFeatureSlugs<TPlans>,
  ): Promise<boolean>

  /**
   * Gets detailed quota information for a specific feature.
   * @param customerId - The customer ID
   * @param feature - The feature slug to check
   * @returns Promise with quota details
   */
  getQuotaInfo(
    customerId: string,
    feature: ExtractFeatureSlugs<TPlans>,
  ): Promise<{
    feature: string
    enabled: boolean
    limit: number | null
    usage: number
    remaining: number | null
    unlimited: boolean
  }>

  /**
   * Checks if a customer can use a specific feature (enabled and has quota).
   * @param customerId - The customer ID
   * @param feature - The feature slug to check
   * @returns Promise<boolean> - Whether the customer can use the feature
   */
  canUseFeature(
    customerId: string,
    feature: ExtractFeatureSlugs<TPlans>,
  ): Promise<boolean>
}
