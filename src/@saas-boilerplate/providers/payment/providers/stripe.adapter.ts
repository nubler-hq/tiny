import { Stripe } from 'stripe'
import {
  CustomerDTO,
  PlanDTO,
  SubscriptionDTO,
  type Customer,
  type Plan,
  type Price,
} from '../types'
import { PaymentProvider } from '../payment.provider'
import type {
  IPaymentProviderAdapter,
  PaymentProviderAdapterEvent,
} from './provider-adapter.interface'
import { differenceInDays } from 'date-fns'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'

type StripeAdapterOptions = {
  secret: string
  webhook: string
}

class StripePaymentProviderAdapter implements IPaymentProviderAdapter {
  private readonly stripe: Stripe
  private readonly options: StripeAdapterOptions

  constructor(options: StripeAdapterOptions) {
    if (typeof window !== 'undefined' || !options.secret) {
      // Client-side: create a dummy object to satisfy TypeScript
      this.stripe = {} as Stripe
      this.options = options

      return
    }

    this.options = options

    this.stripe = new Stripe(this.options.secret, {
      apiVersion: '2025-02-24.acacia',
    })
  }

  // Customer Management
  /**
   * Creates a new customer in Stripe
   */
  async createCustomer(
    params: Omit<CustomerDTO, 'providerId'>,
  ): Promise<Customer> {
    if (!params.referenceId) {
      throw new Error('Customer referenceId is required')
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      name: params.name,
      email: params.email,
      metadata: {
        referenceId: params.referenceId,
        ...(params.metadata || {}),
      },
    })

    return {
      id: customer.id,
      providerId: customer.id,
      organizationId: params.referenceId,
      name: customer.name || params.name,
      email: customer.email || params.email,
      metadata: customer.metadata as Record<string, any>,
    }
  }

  /**
   * Updates an existing customer in Stripe
   */
  async updateCustomer(
    customerId: string,
    params: Partial<CustomerDTO>,
  ): Promise<Customer> {
    const updateData: Stripe.CustomerUpdateParams = {}

    if (params.name) {
      updateData.name = params.name
    }

    if (params.email) {
      updateData.email = params.email
    }

    if (params.metadata) {
      updateData.metadata = params.metadata
    }

    const customer = await this.stripe.customers.update(customerId, updateData)

    return {
      id: customer.id,
      providerId: customer.id,
      organizationId:
        params.referenceId || (customer.metadata?.referenceId as string),
      name: customer.name || '',
      email: customer.email || '',
      metadata: customer.metadata as Record<string, any>,
    }
  }

  /**
   * Finds a customer by their reference ID
   */
  async findCustomerByReferenceId(
    referenceId: string,
  ): Promise<Customer | null> {
    const customers = await this.stripe.customers.search({
      query: `metadata['referenceId']:'${referenceId}'`,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return null
    }

    const customer = customers.data[0]

    return {
      id: customer.id,
      providerId: customer.id,
      organizationId: referenceId,
      name: customer.name || '',
      email: customer.email || '',
      metadata: customer.metadata as Record<string, any>,
    }
  }

  /**
   * Deletes a customer in Stripe
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await this.stripe.customers.del(customerId)
  }

  // Plans and Prices
  /**
   * Creates a new plan in Stripe
   */
  async createPlan(
    params: Omit<PlanDTO, 'providerId'>,
  ): Promise<{ planId: string }> {
    // Check if a product with the same slug already exists
    const existingProducts = await this.stripe.products.search({
      limit: 1,
      query: `metadata['slug']:'${params.slug}'`,
    })

    if (existingProducts.data.length > 0) {
      const existingProduct = existingProducts.data[0]

      await this.stripe.products.update(existingProduct.id, {
        name: params.name,
        description: params.description,
        active: true,
      })

      return { planId: existingProduct.id }
    }

    // Create new product
    const product = await this.stripe.products.create({
      name: params.name,
      description: params.description,
      metadata: {
        slug: params.slug,
      },
      active: true,
    })

    return { planId: product.id }
  }

  /**
   * Updates an existing plan in Stripe
   */
  async updatePlan(
    planId: string,
    params: Partial<Omit<PlanDTO, 'providerId'>>,
  ): Promise<void> {
    const updateData: Stripe.ProductUpdateParams = {}

    if (params.name) {
      updateData.name = params.name
    }

    if (params.description) {
      updateData.description = params.description
    }

    await this.stripe.products.update(planId, updateData)
  }

  /**
   * Creates a new price for a plan in Stripe
   */
  async createPrice(params: {
    planId: string
    amount: number
    currency: string
    interval: string
    intervalCount: number
    slug: string
    metadata?: Record<string, any>
  }): Promise<string> {
    const price = await this.stripe.prices.create({
      product: params.planId,
      currency: params.currency,
      unit_amount: params.amount,
      metadata: {
        slug: params.slug,
        ...(params.metadata || {}),
      },
      recurring: {
        interval: params.interval as 'day' | 'week' | 'month' | 'year',
        interval_count: params.intervalCount,
      },
    })

    return price.id
  }

  /**
   * Updates a price in Stripe
   */
  async updatePrice(
    priceId: string,
    params: {
      active?: boolean
      metadata?: Record<string, any>
    },
  ): Promise<void> {
    const updateData: Stripe.PriceUpdateParams = {}

    if (params.active !== undefined) {
      updateData.active = params.active
    }

    if (params.metadata) {
      updateData.metadata = params.metadata
    }

    await this.stripe.prices.update(priceId, updateData)
  }

  /**
   * Archives a price in Stripe by setting it to inactive
   */
  async archivePrice(priceId: string): Promise<void> {
    await this.stripe.prices.update(priceId, {
      active: false,
    })
  }

  /**
   * Finds prices by plan ID
   */
  async findPricesByPlanId(planId: string): Promise<Price[]> {
    const prices = await this.stripe.prices.list({
      product: planId,
    })

    return prices.data.map((price) => ({
      id: price.id,
      providerId: price.id,
      planId: price.product as string,
      slug: price.metadata?.slug || '',
      amount: price.unit_amount || 0,
      currency: price.currency,
      interval: price.recurring?.interval || 'month',
      intervalCount: price.recurring?.interval_count || 1,
      metadata: price.metadata || {},
      active: price.active,
    }))
  }

  /**
   * Archives a plan in Stripe by setting it to inactive
   */
  async archivePlan(planId: string): Promise<void> {
    await this.stripe.products.update(planId, {
      active: false,
    })
  }

  /**
   * Finds a plan by its slug
   */
  async findPlanBySlug(slug: string): Promise<Plan | null> {
    const plans = await this.stripe.products.search({
      query: `metadata['slug']:'${slug}'`,
    })

    if (plans.data.length === 0) {
      return null
    }

    const plan = plans.data[0]
    const prices = await this.stripe.prices.list({
      product: plan.id,
      active: true,
    })

    return {
      id: plan.id,
      providerId: plan.id,
      slug: plan.metadata.slug as string,
      name: plan.name || '',
      description: plan.description || '',
      metadata: {
        features: [],
      },
      prices: prices.data.map((price) => ({
        id: price.id,
        providerId: price.id,
        planId: plan.id,
        slug: (price.metadata?.slug as string) || '',
        amount: price.unit_amount || 0,
        currency: price.currency,
        interval:
          (price.recurring?.interval as 'day' | 'week' | 'month' | 'year') ||
          'month',
        intervalCount: price.recurring?.interval_count || 1,
        metadata: price.metadata as Record<string, any> | undefined,
        active: true,
      })),
    }
  }

  // Subscriptions
  /**
   * Creates a new subscription in Stripe
   */
  async createSubscription(
    params: Omit<SubscriptionDTO, 'providerId'>,
  ): Promise<string> {
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: [{ price: params.priceId, quantity: params.quantity || 1 }],
      metadata: params.metadata,
    }

    if (params.trialDays) {
      subscriptionData.trial_period_days = params.trialDays
    }

    if (params.billingCycleAnchor) {
      subscriptionData.billing_cycle_anchor = Math.floor(
        params.billingCycleAnchor.getTime() / 1000,
      )
    }

    if (params.prorationBehavior) {
      subscriptionData.proration_behavior = params.prorationBehavior
    }

    if (params.metadata?.method) {
      subscriptionData.default_payment_method = params.metadata.method.id
    }

    const subscription =
      await this.stripe.subscriptions.create(subscriptionData)

    return subscription.id
  }

  /**
   * Updates an existing subscription in Stripe
   */
  async updateSubscription(
    subscriptionId: string,
    params: Partial<SubscriptionDTO>,
  ): Promise<void> {
    const updateData: Stripe.SubscriptionUpdateParams = {}

    if (params?.priceId) {
      updateData.items = [
        {
          id: await this.getSubscriptionItemId(subscriptionId),
          price: params.priceId,
          quantity: params.quantity || 1,
        },
      ]
    }

    if (params?.prorationBehavior) {
      updateData.proration_behavior = params.prorationBehavior
    }

    if (params?.metadata) {
      updateData.metadata = params.metadata

      // Handle payment method if provided in metadata
      if (params.metadata.method?.id) {
        updateData.default_payment_method = params.metadata.method.id
      }
    }

    await this.stripe.subscriptions.update(subscriptionId, updateData)
  }

  /**
   * Cancels a subscription in Stripe
   */
  async cancelSubscription(
    subscriptionId: string,
    params?: {
      cancelAt?: Date
      invoiceNow?: boolean
      prorate?: boolean
    },
  ): Promise<void> {
    if (params?.cancelAt) {
      // Cancel at a future date
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at: Math.floor(params.cancelAt.getTime() / 1000),
        proration_behavior: params.prorate ? 'create_prorations' : 'none',
      })
    } else {
      // Cancel immediately
      await this.stripe.subscriptions.cancel(subscriptionId, {
        invoice_now: params?.invoiceNow,
        prorate: params?.prorate,
      })
    }
  }

  // Portal and Checkout
  /**
   * Creates a billing manager session in Stripe
   */
  async createBillingPortal(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session.url
  }

  /**
   * Creates a checkout session for a subscription
   */
  async createCheckoutSession(params: {
    customerId: string
    priceId: string
    successUrl: string
    cancelUrl: string
    subscriptionId: string
    trialDays?: number
  }): Promise<string> {
    // For new subscriptions, use checkout sessions
    if (!params.subscriptionId) {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.customerId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        mode: 'subscription',
        subscription_data: {
          trial_period_days: params.trialDays,
        },
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
      })

      if (!session.url) {
        throw new Error('Failed to create checkout session URL')
      }

      return session.url
    }

    // For updating existing subscriptions, use billing portal
    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.successUrl,

      flow_data: {
        type: 'subscription_update_confirm',
        after_completion: {
          type: 'redirect',
          redirect: {
            return_url: params.successUrl,
          },
        },
        subscription_update_confirm: {
          subscription: params.subscriptionId,
          items: [
            {
              id: await this.getSubscriptionItemId(params.subscriptionId),
              price: params.priceId,
              quantity: 1,
            },
          ],
        },
      },
    })

    if (!session.url) {
      throw new Error('Failed to create billing portal session URL')
    }

    return session.url
  }

  // Webhooks
  /**
   * Handles webhook events from Stripe
   */
  async handle(
    request: Request,
  ): Promise<{ event: PaymentProviderAdapterEvent; data: any } | null> {
    const body = await request.text()
    const signature = request.headers.get('Stripe-Signature') as string

    const event = await tryCatch(
      this.stripe.webhooks.constructEventAsync(
        body,
        signature,
        this.options.webhook,
      ),
    )

    if (event.error) {
      return { event: 'error', data: event.error }
    }

    // Processar eventos do webhook baseado em seus tipos
    switch (event.data.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.data.object as Stripe.Subscription
        const price = subscription.items.data[0].price
        const product = await this.stripe.products.retrieve(
          price.product as string,
        )

        const trialPeriodStart = subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : null
        const trialPeriodEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null
        const trialDays =
          trialPeriodEnd && trialPeriodStart
            ? differenceInDays(trialPeriodEnd, trialPeriodStart)
            : null

        return {
          event: 'customer.subscription.created',
          data: {
            id: subscription.id,
            providerId: subscription.id,
            customerId: subscription.customer as string,
            priceId: price.id,
            status: subscription.status,
            quantity: subscription.items.data[0].quantity,
            trialDays,
            billingCycleAnchor: new Date(
              subscription.billing_cycle_anchor * 1000,
            ),
            metadata: subscription.metadata,
            plan: {
              id: product.id,
              providerId: product.id,
              slug: product.metadata.slug as string,
              name: product.name,
              description: product.description || '',
              metadata: {
                features: JSON.parse(product.metadata.features || '[]'),
              },
              price: {
                id: price.id,
                providerId: price.id,
                slug: price.metadata?.slug || '',
                amount: price.unit_amount || 0,
                currency: price.currency,
                interval: price.recurring?.interval || 'month',
              },
            },
          },
        }
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.data.object as Stripe.Subscription
        const price = subscription.items.data[0].price
        const product = await this.stripe.products.retrieve(
          price.product as string,
        )

        const trialPeriodStart = subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : null
        const trialPeriodEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null
        const trialDays =
          trialPeriodEnd && trialPeriodStart
            ? differenceInDays(trialPeriodEnd, trialPeriodStart)
            : null

        return {
          event: 'customer.subscription.updated',
          data: {
            id: subscription.id,
            providerId: subscription.id,
            customerId: subscription.customer as string,
            priceId: price.id,
            status: subscription.status,
            quantity: subscription.items.data[0].quantity,
            trialDays,
            billingCycleAnchor: new Date(
              subscription.billing_cycle_anchor * 1000,
            ),
            metadata: subscription.metadata,
            plan: {
              id: product.id,
              providerId: product.id,
              slug: product.metadata.slug as string,
              name: product.name,
              description: product.description || '',
              price: {
                id: price.id,
                providerId: price.id,
                slug: price.metadata?.slug || '',
                amount: price.unit_amount || 0,
                currency: price.currency,
                interval: price.recurring?.interval || 'month',
              },
            },
          },
        }
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.data.object as Stripe.Subscription
        return {
          event: 'customer.subscription.deleted',
          data: {
            id: subscription.id,
            providerId: subscription.id,
            customerId: subscription.customer as string,
            status: subscription.status,
          },
        }
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.data.object as Stripe.Subscription

        const trialPeriodEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null

        return {
          event: 'customer.subscription.trial_will_end',
          data: {
            id: subscription.id,
            providerId: subscription.id,
            customerId: subscription.customer as string,
            trialEnd: trialPeriodEnd,
          },
        }
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.data.object as Stripe.Invoice
        return {
          event: 'invoice.payment_succeeded',
          data: {
            id: invoice.id,
            providerId: invoice.id,
            customerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            paid: invoice.paid,
          },
        }
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.data.object as Stripe.Invoice
        return {
          event: 'invoice.payment_failed',
          data: {
            id: invoice.id,
            providerId: invoice.id,
            customerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: invoice.status,
            paid: invoice.paid,
          },
        }
      }

      case 'customer.created': {
        const customer = event.data.data.object as Stripe.Customer
        return {
          event: 'customer.created',
          data: {
            id: customer.id,
            providerId: customer.id,
            organizationId: customer.metadata?.referenceId || '',
            name: customer.name || '',
            email: customer.email || '',
          },
        }
      }

      case 'customer.updated': {
        const customer = event.data.data.object as Stripe.Customer
        return {
          event: 'customer.updated',
          data: {
            id: customer.id,
            providerId: customer.id,
            organizationId: customer.metadata?.referenceId || '',
            name: customer.name || '',
            email: customer.email || '',
          },
        }
      }

      case 'customer.deleted': {
        const customer = event.data.data.object as Stripe.Customer
        return {
          event: 'customer.deleted',
          data: {
            id: customer.id,
            providerId: customer.id,
            organizationId: customer.metadata?.referenceId || '',
          },
        }
      }

      case 'product.created': {
        const product = event.data.data.object as Stripe.Product
        return {
          event: 'plan.created',
          data: {
            id: product.id,
            providerId: product.id,
            slug: product.metadata.slug as string,
            name: product.name,
            description: product.description || '',
          },
        }
      }

      case 'product.updated': {
        const product = event.data.data.object as Stripe.Product
        return {
          event: 'plan.updated',
          data: {
            id: product.id,
            providerId: product.id,
            slug: product.metadata.slug as string,
            name: product.name,
            description: product.description || '',
          },
        }
      }

      case 'product.deleted': {
        const product = event.data.data.object as Stripe.Product
        return {
          event: 'plan.deleted',
          data: {
            id: product.id,
            providerId: product.id,
            slug: product.metadata.slug as string,
          },
        }
      }

      case 'price.created': {
        const price = event.data.data.object as Stripe.Price
        return {
          event: 'price.created',
          data: {
            id: price.id,
            providerId: price.id,
            planId: price.product as string,
            slug: price.metadata?.slug || '',
            amount: price.unit_amount || 0,
            currency: price.currency,
            interval: price.recurring?.interval || 'month',
            intervalCount: price.recurring?.interval_count || 1,
          },
        }
      }

      case 'price.updated': {
        const price = event.data.data.object as Stripe.Price
        return {
          event: 'price.updated',
          data: {
            id: price.id,
            providerId: price.id,
            planId: price.product as string,
            slug: price.metadata?.slug || '',
            amount: price.unit_amount || 0,
            currency: price.currency,
            interval: price.recurring?.interval || 'month',
            intervalCount: price.recurring?.interval_count || 1,
            active: price.active,
          },
        }
      }

      case 'price.deleted': {
        const price = event.data.data.object as Stripe.Price
        return {
          event: 'price.deleted',
          data: {
            id: price.id,
            providerId: price.id,
            planId: price.product as string,
          },
        }
      }

      default:
        return null
    }
  }

  /**
   * Helper method to get a subscription item ID
   */
  private async getSubscriptionItemId(
    subscriptionId: string,
    priceId?: string,
  ): Promise<string> {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
      {
        expand: ['items'],
      },
    )

    if (!subscription.items.data.length) {
      throw new Error(`No items found for subscription ${subscriptionId}`)
    }

    if (priceId) {
      // Find the specific subscription item for the price
      const item = subscription.items.data.find(
        (item) => item.price.id === priceId,
      )
      return item?.id || subscription.items.data[0].id
    } else {
      // Return the first subscription item ID
      return subscription.items.data[0].id
    }
  }

  /**
   * Creates or updates a customer in Stripe (for backward compatibility)
   */
  async upsertCustomer(
    params: Omit<CustomerDTO, 'providerId'>,
  ): Promise<Customer> {
    if (!params.referenceId) {
      throw new Error('Customer referenceId is required')
    }

    // Check if customer already exists
    const existingCustomer = await this.findCustomerByReferenceId(
      params.referenceId,
    )

    if (existingCustomer) {
      return this.updateCustomer(existingCustomer.id, params)
    } else {
      return this.createCustomer(params)
    }
  }

  /**
   * Creates or updates a plan in Stripe (for backward compatibility)
   */
  async upsertPlan(
    params: Omit<PlanDTO, 'providerId'>,
  ): Promise<{ planId: string; priceIds: string[] }> {
    // Check if plan already exists
    const existingProducts = await this.stripe.products.search({
      limit: 1,
      query: `metadata['slug']:'${params.slug}'`,
    })

    let product: Stripe.Product
    let priceIds: string[] = []

    if (existingProducts.data.length > 0) {
      // Update existing product
      product = await this.stripe.products.update(existingProducts.data[0].id, {
        name: params.name,
        description: params.description,
        metadata: {
          slug: params.slug,
          features: JSON.stringify(params.metadata.features),
        },
        active: true,
      })

      // Get existing prices for this product
      const existingPrices = await this.stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      })

      // Map prices by slug for easy reference
      const existingPriceBySlug = new Map<string, Stripe.Price>()
      for (const price of existingPrices.data) {
        const slug = price.metadata?.slug
        if (slug) {
          existingPriceBySlug.set(slug, price)
        }
      }

      // Create or reuse prices as needed
      for (const priceData of params.prices) {
        const existingPrice = existingPriceBySlug.get(priceData.slug)

        if (
          existingPrice &&
          existingPrice.unit_amount === priceData.amount &&
          existingPrice.currency === priceData.currency &&
          existingPrice.recurring?.interval === priceData.interval &&
          existingPrice.recurring?.interval_count === priceData.intervalCount
        ) {
          // If existing price matches what we want, reuse it
          priceIds.push(existingPrice.id)
          existingPriceBySlug.delete(priceData.slug)
        } else {
          // If it doesn't exist or doesn't match, create a new price
          const newPrice = await this.stripe.prices.create({
            product: product.id,
            unit_amount: priceData.amount,
            currency: priceData.currency,
            metadata: {
              slug: priceData.slug,
              ...(priceData.metadata || {}),
            },
            recurring: {
              interval: priceData.interval as 'day' | 'week' | 'month' | 'year',
              interval_count: priceData.intervalCount,
            },
          })
          priceIds.push(newPrice.id)

          // If there's a price with the same slug but different attributes, deactivate it
          if (existingPrice) {
            await this.stripe.prices.update(existingPrice.id, {
              active: false,
            })
          }
        }
      }

      // Deactivate prices that are no longer being used
      for (const [, price] of existingPriceBySlug) {
        await this.stripe.prices.update(price.id, { active: false })
      }
    } else {
      // Create new product
      product = await this.stripe.products.create({
        name: params.name,
        description: params.description,
        metadata: {
          slug: params.slug,
          features: JSON.stringify(params.metadata.features),
        },
        active: true,
      })

      // Create new prices for the product
      const pricePromises = params.prices.map((priceData) =>
        this.stripe.prices.create({
          product: product.id,
          unit_amount: priceData.amount,
          currency: priceData.currency,
          metadata: {
            slug: priceData.slug,
            ...(priceData.metadata || {}),
          },
          recurring: {
            interval: priceData.interval as 'day' | 'week' | 'month' | 'year',
            interval_count: priceData.intervalCount,
          },
        }),
      )

      const createdPrices = await Promise.all(pricePromises)
      priceIds = createdPrices.map((price) => price.id)
    }

    return { planId: product.id, priceIds }
  }
}

/**
 * Factory function to create a Stripe adapter instance
 */
export const stripeAdapter = PaymentProvider.provider(
  (options: StripeAdapterOptions) => {
    return new StripePaymentProviderAdapter(options)
  },
)
