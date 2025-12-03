---
description: "Billing and Subscription Management System Guide for SaaS Boilerplate"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "Billing and Subscription Management System Guide for SaaS Boilerplate"
---

# Billing and Subscription Management System Guide for SaaS Boilerplate

This comprehensive guide provides a complete overview of the Billing and Subscription Management system in SaaS Boilerplate, covering the entire payment infrastructure, subscription lifecycle, quota management, and integration patterns for a production-ready SaaS application.

## 1. Billing System Overview

The Billing system in SaaS Boilerplate is a comprehensive, multi-tenant subscription management platform built on Stripe with advanced features including:

- **Multi-Plan Architecture**: Flexible plan structures with feature-based limits
- **Advanced Quota Management**: Real-time usage tracking and enforcement
- **Trial Management**: Configurable trial periods with notifications
- **Subscription Lifecycle**: Complete management from trial to cancellation
- **Payment Processing**: Secure Stripe integration with webhooks
- **Usage Analytics**: Detailed usage tracking and reporting
- **Multi-Currency Support**: BRL and other currencies
- **Grace Period Handling**: Automated overdue payment management
- **Billing Portal Integration**: Customer self-service capabilities

## 2. Key Components Architecture

### 2.1 Billing Feature Structure

The `billing` feature follows a clean architecture pattern with separation of concerns:

```
src/@saas-boilerplate/features/billing/
├── billing.interface.ts              # Core types and interfaces
├── controllers/
│   └── billing.controller.ts         # API endpoints for billing operations
├── procedures/
│   └── billing.procedure.ts          # Business logic and service injection
├── hooks/
│   └── use-trial-notifications.ts    # Trial period management
└── presentation/
    └── components/                   # UI components for billing
        ├── billing-alert-page.tsx           # Base alert page component
        ├── billing-alert-page-*.tsx         # Specific alert pages
        ├── billing-alerts-section.tsx       # Alerts display section
        ├── billing-change-email-form.tsx    # Email update form
        ├── billing-current-tier-section.tsx # Current plan display
        ├── billing-current-usage-section.tsx # Usage metrics
        ├── billing-price-transparency-section.tsx # Pricing details
        ├── billing-subscription-status.tsx  # Status information
        ├── billing-trial-alert.tsx          # Trial notifications
        ├── billing-trial-info-section.tsx   # Trial information
        ├── billing-dashboard-sidebar-upgrade-card.tsx # Sidebar upgrade
        ├── billing-upgrade-modal.tsx        # Plan upgrade interface
        └── utils/
            ├── grace-period.ts              # Grace period utilities
            └── subscription-guard.ts        # Subscription validation
```

### 2.2 Payment Provider Architecture

The PaymentProvider is a sophisticated abstraction layer that integrates Stripe with the application:

```
src/@saas-boilerplate/providers/payment/
├── payment.provider.ts               # Main provider class
├── types.ts                          # Complete type definitions
├── databases/
│   ├── prisma.ts                     # Prisma database adapter
│   └── database-adapter.interface.ts # Database abstraction
└── providers/
    ├── stripe.adapter.ts             # Stripe payment adapter
    └── provider-adapter.interface.ts # Provider abstraction
```

## 3. Core Types and Interfaces

### 3.1 Subscription Status Types

```typescript
export type SubscriptionStatus =
  | 'active'      // Subscription is active and billing normally
  | 'canceled'    // Subscription has been canceled
  | 'incomplete'  // Initial payment failed, awaiting completion
  | 'incomplete_expired' // Incomplete subscription expired
  | 'past_due'    // Payment failed, in grace period
  | 'unpaid'      // Payment failed, no grace period
  | 'trialing'    // In free trial period
```

### 3.2 Billing Cycle Periods

```typescript
export type CyclePeriod = 'day' | 'week' | 'month' | 'year'
```

### 3.3 Customer Data Structure

```typescript
export type Customer = {
  id: string
  providerId: string           // Stripe customer ID
  organizationId: string       // Links to SaaS organization
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
        amount: number         // In cents (e.g., 20000 = R$ 200.00)
        currency: string       // 'brl', 'usd', etc.
        interval: CyclePeriod
      }
    }

    usage: Usage[]            // Real-time usage data
    createdAt?: Date
    updatedAt?: Date
  }

  createdAt?: Date
  updatedAt?: Date
}
```

### 3.4 Plan and Feature Structure

```typescript
export type PlanFeature = {
  slug: string              // Unique feature identifier
  name: string              // Display name
  enabled: boolean          // Whether feature is available
  description?: string      // Feature description
  table?: string            // Database table for usage tracking
  limit?: number            // Usage limit (null = unlimited)
  cycle?: CyclePeriod       // Reset cycle for limits
}

export type PlanMetadata = {
  features: PlanFeature[]
}

export type Plan = {
  id: string
  providerId: string        // Stripe product ID
  slug: string              // Unique plan identifier
  name: string              // Display name
  description: string       // Plan description
  metadata: PlanMetadata    // Feature definitions
  prices: Price[]           // Associated prices
  archived?: boolean        // Soft delete flag
  createdAt?: Date
  updatedAt?: Date
}
```

### 3.5 Price Structure

```typescript
export type Price = {
  id: string
  providerId: string        // Stripe price ID
  planId: string
  slug: string              // Unique price identifier
  amount: number            // Amount in cents
  currency: string          // Currency code
  interval: CyclePeriod     // Billing interval
  intervalCount: number     // Multiplier (e.g., 3 for quarterly)
  metadata?: Record<string, any>
  active?: boolean          // Whether price is active
  createdAt?: Date
  updatedAt?: Date
}
```

### 3.6 Usage Tracking

```typescript
export type Usage = {
  slug: string              // Feature slug
  name: string              // Feature display name
  description?: string      // Feature description
  usage: number             // Current usage count
  limit: number             // Maximum allowed usage
  lastReset?: Date          // Last usage reset date
  nextReset?: Date          // Next usage reset date
  cycle: CyclePeriod        // Usage reset cycle
}
```

## 4. Payment Provider Implementation

### 4.1 Core Provider Class

The `PaymentProvider` is the central orchestrator that manages the entire billing lifecycle:

```typescript
export class PaymentProvider<TPlans extends Omit<PlanDTO, 'providerId'>[]> implements IPaymentProvider<TPlans> {
  // Customer Management
  async createCustomer(params: CustomerDTO): Promise<Customer>
  async updateCustomer(customerId: string, params: Partial<CustomerDTO>): Promise<Customer>
  async deleteCustomer(customerId: string): Promise<void>
  async getCustomerById(customerId: string): Promise<Customer | null>

  // Subscription Management
  async createSubscription(params: CreateSubscriptionParams<TPlans>): Promise<Subscription>
  async updateSubscription(subscriptionId: string, params: Partial<SubscriptionDTO>): Promise<Subscription>
  async cancelSubscription(subscriptionId: string, params?: CancelParams): Promise<void>

  // Plan Management
  async listPlans(): Promise<Plan[]>
  async sync(): Promise<void> // Sync with Stripe

  // Portal & Checkout
  async createBillingPortal(customerId: string, returnUrl: string): Promise<string>
  async createCheckoutSession(params: CheckoutParams): Promise<string>

  // Quota Management
  async hasQuota(customerId: string, feature: ExtractFeatureSlugs<TPlans>): Promise<boolean>
  async getQuotaInfo(customerId: string, feature: ExtractFeatureSlugs<TPlans>): Promise<QuotaInfo>
  async canUseFeature(customerId: string, feature: ExtractFeatureSlugs<TPlans>): Promise<boolean>

  // Webhook Processing
  async handle(request: Request): Promise<Response>
}
```

### 4.2 Provider Initialization

```typescript
// Service initialization in src/services/payment.ts
export const payment = PaymentProvider.initialize({
  database: prismaAdapter(prisma),
  adapter: stripeAdapter({
    secret: process.env.STRIPE_SECRET_KEY,
    webhook: process.env.STRIPE_WEBHOOK_SECRET,
  }),
  paths: {
    checkoutCancelUrl: '/app/settings/organization/billing?state=cancel',
    checkoutSuccessUrl: '/app/settings/organization/billing?state=success',
    portalReturnUrl: '/app/settings/organization/billing?state=return',
    endSubscriptionUrl: '/app/upgrade',
  },
  subscriptions: {
    enabled: true,
    trial: {
      enabled: true,
      duration: 14, // 14-day trial
    },
    plans: {
      default: 'free',
      options: [freePlan, plusPlan, proPlan],
    },
  },
  events: {
    onCustomerCreated: async (customer) => {
      console.log('New customer created:', customer.id)
    },
    onSubscriptionCreated: async (subscription) => {
      console.log('New subscription created:', subscription.id)
    },
    // ... other event handlers
  },
})
```

## 5. Billing Feature Implementation

### 5.1 Billing Controller

The billing controller provides REST API endpoints for billing operations:

```typescript
export const BillingController = igniter.controller({
  name: 'Billing',
  description: 'Subscription billing management including checkout sessions and customer portal access',
  path: '/billing',
  actions: {
    // Get customer billing information
    getSessionCustomer: igniter.query({
      name: 'getSessionCustomer',
      description: 'Get billing customer info',
      method: 'GET',
      path: '/subscription',
      use: [BillingFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        const billingInfo = await context.billing.getBilling({
          id: session.organization.id,
        })

        return response.success(billingInfo)
      },
    }),

    // Create checkout session for new subscription
    createCheckoutSession: igniter.mutation({
      name: 'createCheckoutSession',
      description: 'Create payment checkout',
      method: 'POST',
      path: '/subscription',
      use: [BillingFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        plan: z.string(),
        cycle: z.enum(['month', 'year', 'week', 'day']),
      }),
      handler: async ({ request, response, context }) => {
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        const result = await context.billing.createBillingCheckoutSession({
          id: session.organization.id,
          plan: request.body.plan,
          cycle: request.body.cycle as CyclePeriod,
        })

        return response.success(result)
      },
    }),

    // Create billing portal session
    createSessionManager: igniter.mutation({
      name: 'createSessionManager',
      description: 'Create billing manager',
      method: 'POST',
      path: '/subscription/open',
      use: [BillingFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        returnUrl: z.string(),
      }),
      handler: async ({ response, request, context }) => {
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        const result = await context.billing.createBillingSessionManager({
          id: session.organization.id,
          returnUrl: request.body.returnUrl,
        })

        return response.success(result)
      },
    }),
  },
})
```

### 5.2 Billing Procedure

The billing procedure injects payment services into the Igniter context:

```typescript
export const BillingFeatureProcedure = igniter.procedure({
  name: 'BillingFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      billing: {
        // Get billing information for organization
        getBilling: async (params: { id: string }) => {
          const organization = await context.database.organization.findUnique({
            where: { id: params.id },
          })

          if (!organization) throw new Error('Organization not found')

          return context.payment.getCustomerById(params.id)
        },

        // Create checkout session for subscription
        createBillingCheckoutSession: async (params: {
          id: string
          plan: string
          cycle: CyclePeriod
          cancelUrl?: string
          successUrl?: string
        }) => {
          const organization = await context.database.organization.findUnique({
            where: { id: params.id },
          })

          if (!organization) throw new Error('Organization not found')

          return context.payment.createCheckoutSession({
            customerId: params.id,
            plan: params.plan,
            cycle: params.cycle,
            cancelUrl: params.cancelUrl,
            successUrl: params.successUrl,
          })
        },

        // Create billing portal session
        createBillingSessionManager: async (params: {
          id: string
          returnUrl: string
        }) => {
          const organization = await context.database.organization.findUnique({
            where: { id: params.id },
          })

          if (!organization) throw new Error('Organization not found')

          return context.payment.createBillingPortal(
            organization.id,
            params.returnUrl,
          )
        },
      },
    }
  },
})
```

## 6. Plan Configuration System

### 6.1 Plan Definition Structure

Plans are defined as code using the PaymentProvider.plan helper:

```typescript
// src/content/plans/free.ts
export const freePlan = PaymentProvider.plan({
  slug: 'free',
  name: 'Free',
  description: 'Start for free and explore the essential features',
  metadata: {
    features: [
      {
        slug: 'seats',
        name: 'Seats',
        description: 'Add up to 1 member to collaborate with your team',
        table: 'Member',
        enabled: true,
        limit: 1,
      },
      {
        slug: 'leads',
        name: 'Leads',
        description: 'Capture and manage up to 100 leads monthly through the bot',
        table: 'Lead',
        enabled: true,
        limit: 100,
        cycle: 'month',
      },
      // ... more features
    ],
  },
  prices: [
    {
      amount: 0,           // Free plan
      currency: 'brl',
      interval: 'month',
      intervalCount: 1,
      slug: 'free-monthly',
    },
  ],
})
```

### 6.2 Paid Plan Example

```typescript
// src/content/plans/pro.ts
export const proPlan = PaymentProvider.plan({
  slug: 'pro',
  name: 'Pro',
  description: 'Pro Plan with enhanced features. Ideal for growing teams.',
  metadata: {
    features: [
      {
        slug: 'leads',
        name: 'Leads',
        description: 'Capture and manage up to 10000 leads monthly',
        table: 'Lead',
        enabled: true,
        limit: 10000,
        cycle: 'month',
      },
      {
        slug: 'submissions',
        name: 'Submissions',
        description: 'Create up to 100000 submissions per month',
        table: 'Submission',
        enabled: true,
        limit: 100000,
        cycle: 'month',
      },
      {
        slug: 'chat-support',
        name: 'Chat Support',
        description: 'Real-time chat support',
        enabled: true,      // Pro feature enabled
      },
      // ... more features
    ],
  },
  prices: [
    {
      amount: 20000,       // R$ 200.00
      currency: 'brl',
      interval: 'month',
      intervalCount: 1,
      slug: 'pro-monthly',
    },
    {
      amount: 2000000,     // R$ 20,000.00 (2 months free)
      currency: 'brl',
      interval: 'year',
      intervalCount: 1,
      slug: 'pro-yearly',
    },
  ],
})
```

### 6.3 Plan Configuration in Server Config

```typescript
// src/config/boilerplate.config.server.ts
export const AppConfig = {
  providers: {
    billing: {
      subscription: {
        enabled: true,
        trial: {
          enabled: true,
          duration: 14, // 14-day free trial
        },
        plans: {
          default: freePlan.slug,
          options: [freePlan, plusPlan, proPlan],
        },
      },
      keys: {
        publishable: process.env.STRIPE_PUBLISHABLE_KEY,
        secret: process.env.STRIPE_SECRET_KEY,
        webhook: process.env.STRIPE_WEBHOOK_SECRET,
      },
      paths: {
        checkoutCancelUrl: '/app/settings/organization/billing?state=cancel',
        checkoutSuccessUrl: '/app/settings/organization/billing?state=success',
        portalReturnUrl: '/app/settings/organization/billing?state=return',
        endSubscriptionUrl: '/app/upgrade',
      },
    },
  },
}
```

## 7. Quota Management System

### 7.1 Usage Tracking Implementation

The quota system automatically tracks usage based on database tables:

```typescript
// Automatic usage calculation from database
async function getCustomerUsageByRefId(customerId: string): Promise<Usage[]> {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: customerId },
        { organizationId: customerId },
      ],
    },
  })

  if (!customer) return []

  // Get active subscription with plan details
  const subscription = await prisma.subscription.findFirst({
    where: {
      customerId: customer.id,
      status: { in: ['active', 'trialing', 'past_due', 'unpaid'] },
    },
    include: {
      price: {
        include: { plan: true },
      },
    },
  })

  if (!subscription) return []

  // Process each feature from plan metadata
  const planMetadata = subscription.price.plan.metadata as PlanMetadata

  for (const feature of planMetadata.features) {
    if (!feature.enabled || !feature.limit) continue

    let usageCount = 0

    // Automatically count from specified database table
    if (feature.table) {
      const model = String.toCamelCase(feature.table)
      usageCount = await (prisma as any)[model].count({
        where: { organizationId: customer.organizationId },
      })
    }

    usage.push({
      slug: feature.slug,
      name: feature.name,
      description: feature.description,
      limit: feature.limit,
      usage: usageCount,
      cycle: feature.cycle || 'month',
      lastReset: calculateLastReset(feature.cycle),
      nextReset: calculateNextReset(feature.cycle),
    })
  }

  return usage
}
```

### 7.2 Quota Validation Methods

```typescript
// Check if customer has quota for a feature
async hasQuota(customerId: string, feature: string): Promise<boolean> {
  const customer = await this.database.getCustomerById(customerId)
  if (!customer?.subscription?.plan?.metadata?.features) return false

  const planFeature = customer.subscription.plan.metadata.features.find(
    (f) => f.slug === feature
  )

  if (!planFeature) return false
  if (!planFeature.enabled) return false
  if (planFeature.limit === undefined || planFeature.limit === null) return true

  const usage = await this.database.getCustomerUsage({
    customerId,
    feature,
  })

  return usage < planFeature.limit
}

// Get detailed quota information
async getQuotaInfo(customerId: string, feature: string): Promise<QuotaInfo> {
  const customer = await this.database.getCustomerById(customerId)
  if (!customer?.subscription?.plan?.metadata?.features) {
    return {
      feature,
      enabled: false,
      limit: null,
      usage: 0,
      remaining: null,
      unlimited: false,
    }
  }

  const planFeature = customer.subscription.plan.metadata.features.find(
    (f) => f.slug === feature
  )

  if (!planFeature) {
    return {
      feature,
      enabled: false,
      limit: null,
      usage: 0,
      remaining: null,
      unlimited: false,
    }
  }

  const usage = await this.database.getCustomerUsage({
    customerId,
    feature,
  })

  const limit = planFeature.limit ?? null
  const unlimited = limit === null
  const remaining = unlimited ? null : Math.max(0, limit - usage)

  return {
    feature,
    enabled: planFeature.enabled,
    limit,
    usage,
    remaining,
    unlimited,
  }
}
```

## 8. Trial Management System

### 8.1 Trial Configuration

```typescript
// Trial settings in configuration
trial: {
  enabled: true,
  duration: 14, // 14 days
}
```

### 8.2 Trial Notifications Hook

```typescript
export function useTrialNotifications({
  organizationId,
  trialDays,
}: UseTrialNotificationsProps) {
  const [state, setState] = useState<TrialNotificationState>({
    isDismissed: false,
    lastDismissedAt: null,
    shouldShow: false,
  })

  const storageKey = `trial-notification-${organizationId}`

  useEffect(() => {
    // Load dismissal state from localStorage
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const lastDismissedAt = parsed.lastDismissedAt
        const isDismissed = parsed.isDismissed

        // Reset dismissal if dismissed more than 24 hours ago
        const shouldResetDismissal =
          lastDismissedAt &&
          Date.now() - new Date(lastDismissedAt).getTime() > 24 * 60 * 60 * 1000

        setState({
          isDismissed: shouldResetDismissal ? false : isDismissed,
          lastDismissedAt: shouldResetDismissal ? null : lastDismissedAt,
          shouldShow: shouldShowNotification(
            trialDays,
            shouldResetDismissal ? false : isDismissed,
          ),
        })
      } catch (error) {
        console.warn('Failed to parse trial notification state:', error)
      }
    } else {
      setState({
        isDismissed: false,
        lastDismissedAt: null,
        shouldShow: shouldShowNotification(trialDays, false),
      })
    }
  }, [organizationId, trialDays, storageKey])

  const dismiss = () => {
    const newState = {
      isDismissed: true,
      lastDismissedAt: new Date().toISOString(),
      shouldShow: false,
    }

    setState(newState)
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }

  const shouldShowNotification = (days: number, dismissed: boolean): boolean => {
    if (dismissed) return false
    if (days <= 7 && days >= 0) return true // Show for last 7 days
    return false
  }

  const getNotificationUrgency = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (trialDays <= 0) return 'critical'
    if (trialDays <= 1) return 'critical'
    if (trialDays <= 3) return 'high'
    if (trialDays <= 7) return 'medium'
    return 'low'
  }

  const getNotificationMessage = (): string => {
    if (trialDays <= 0) {
      return 'Your trial has expired. Upgrade now to continue using all features.'
    }
    if (trialDays === 1) {
      return 'Your trial expires tomorrow. Upgrade now to avoid interruption.'
    }
    if (trialDays <= 3) {
      return `Your trial expires in ${trialDays} days. Upgrade to continue using all features.`
    }
    return `Your trial expires in ${trialDays} days. Consider upgrading to unlock all features.`
  }

  return {
    shouldShow: state.shouldShow,
    dismiss,
    urgency: getNotificationUrgency(),
    message: getNotificationMessage(),
    trialDays,
  }
}
```

## 9. Webhook Processing System

### 9.1 Webhook Event Types

```typescript
export type PaymentProviderAdapterEvent =
  | 'error'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'plan.created'
  | 'plan.updated'
  | 'plan.deleted'
  | 'price.created'
  | 'price.updated'
  | 'price.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'subscription.trial_will_end'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
```

### 9.2 Webhook Processing Implementation

```typescript
async handle(request: Request): Promise<Response> {
  try {
    // Process webhook through Stripe adapter
    const event = await this.adapter.handle(request)

    if (!event) {
      return new Response(
        JSON.stringify({
          status: 'processed',
          message: 'Event not processed, because event is type not handled.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { event: eventType, data } = event

    // Process different event types
    switch (eventType) {
      case 'customer.subscription.created': {
        const customer = await this.database.getCustomerById(data.customer)
        if (!customer) throw new Error('Customer not found')

        const price = await this.database.getPriceById(data.price)
        if (!price) throw new Error('Price not found')

        const subscription = await this.database.createSubscription({
          status: data.status,
          customerId: customer.id,
          priceId: price.id,
          quantity: data.quantity,
          trialDays: data.trialDays ? 0 : undefined,
          metadata: data.metadata,
          providerId: data.providerId,
        })

        if (this.events?.onSubscriptionCreated) {
          await this.events.onSubscriptionCreated(subscription)
        }
        break
      }

      case 'customer.subscription.updated': {
        const [subscription] = await this.database.listSubscriptions({
          where: { providerId: data.id },
          limit: 1,
        })

        if (!subscription) {
          console.error(`Subscription with providerId ${data.id} not found for update.`)
          break
        }

        const price = await this.database.getPriceById(data.priceId)
        if (!price) throw new Error('Price not found')

        const updatedSubscription = await this.database.updateSubscription(
          subscription.id,
          {
            priceId: price.id,
            quantity: data.quantity,
            trialDays: data.trialDays ? 0 : undefined,
            metadata: data.metadata,
            providerId: data.providerId,
            status: data.status,
          }
        )

        if (this.events?.onSubscriptionUpdated) {
          await this.events.onSubscriptionUpdated(updatedSubscription)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const [subscription] = await this.database.listSubscriptions({
          where: { providerId: data.id },
          limit: 1,
        })

        if (!subscription) {
          console.error(`Subscription with providerId ${data.id} not found for deletion.`)
          break
        }

        await this.database.cancelSubscription(subscription.id)

        if (this.events?.onSubscriptionCanceled) {
          await this.events.onSubscriptionCanceled(subscription)
        }

        if (this.events?.onSubscriptionDeleted) {
          await this.events.onSubscriptionDeleted(subscription.id)
        }
        break
      }

      case 'invoice.payment_succeeded':
        if (this.events?.onInvoicePaymentSucceeded) {
          await this.events.onInvoicePaymentSucceeded(data)
        }
        break

      case 'invoice.payment_failed':
        if (this.events?.onInvoicePaymentFailed) {
          await this.events.onInvoicePaymentFailed(data)
        }
        break
    }

    // Trigger general webhook event
    if (this.events?.onWebhookReceived) {
      await this.events.onWebhookReceived({
        event: eventType,
        data,
      })
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Webhook processed successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Failed to process webhook:', error)
    throw new Error(`Failed to process webhook: ${(error as Error).message}`)
  }
}
```

## 10. Subscription Guard System

### 10.1 Subscription Validation

```typescript
export interface SubscriptionValidationResult {
  isValid: boolean
  requiresUpgrade: boolean
  redirectPath?: string
  reason?: string
  gracePeriodStatus?: GracePeriodStatus
}

export function validateSubscriptionAccess(
  subscription?: SubscriptionData | null,
): SubscriptionValidationResult {
  // No subscription - requires upgrade
  if (!subscription) {
    return {
      isValid: false,
      requiresUpgrade: true,
      redirectPath: '/app/upgrade',
      reason: 'no_subscription',
    }
  }

  const { status, trialDays, pastDueDate, subscriptionTier } = subscription

  switch (status) {
    case 'active':
      return {
        isValid: true,
        requiresUpgrade: false,
      }

    case 'trialing':
      if (trialDays && trialDays > 0) {
        return {
          isValid: true,
          requiresUpgrade: false,
        }
      }
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'trial_expired',
      }

    case 'past_due':
      const gracePeriodConfig = getGracePeriodConfig(subscriptionTier)
      const inGracePeriod = shouldAllowAccessDuringGracePeriod(
        status,
        pastDueDate || undefined,
        gracePeriodConfig,
      )

      if (inGracePeriod && pastDueDate) {
        const gracePeriodStatus = calculateGracePeriodStatus(
          pastDueDate,
          gracePeriodConfig,
        )
        return {
          isValid: true,
          requiresUpgrade: false,
          reason: 'grace_period',
          gracePeriodStatus,
        }
      }
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'payment_overdue',
        gracePeriodStatus: pastDueDate
          ? calculateGracePeriodStatus(pastDueDate, gracePeriodConfig)
          : undefined,
      }

    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
    case 'canceled':
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: `subscription_${status}`,
      }

    default:
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'unknown_status',
      }
  }
}
```

### 10.2 Grace Period Management

```typescript
export interface GracePeriodConfig {
  gracePeriodDays: number
  showWarnings: boolean
}

export interface GracePeriodStatus {
  isInGracePeriod: boolean
  daysRemaining: number
  isExpired: boolean
  urgency: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

export function calculateGracePeriodStatus(
  pastDueDate: Date,
  config: Partial<GracePeriodConfig> = {},
): GracePeriodStatus {
  const { gracePeriodDays, showWarnings } = {
    ...DEFAULT_GRACE_PERIOD_CONFIG,
    ...config,
  }

  const now = new Date()
  const gracePeriodEndDate = new Date(pastDueDate)
  gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + gracePeriodDays)

  const timeDiff = gracePeriodEndDate.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

  const isInGracePeriod = daysRemaining > 0
  const isExpired = !isInGracePeriod

  let urgency: 'low' | 'medium' | 'high' | 'critical'
  if (isExpired) {
    urgency = 'critical'
  } else if (daysRemaining <= 1) {
    urgency = 'critical'
  } else if (daysRemaining <= 2) {
    urgency = 'high'
  } else if (daysRemaining <= 4) {
    urgency = 'medium'
  } else {
    urgency = 'low'
  }

  let message: string
  if (isExpired) {
    message = 'Your payment is overdue and grace period has expired. Please update your payment method immediately to restore access.'
  } else if (daysRemaining === 1) {
    message = 'Your payment is overdue. You have 1 day remaining before access is restricted. Please update your payment method.'
  } else {
    message = `Your payment is overdue. You have ${daysRemaining} days remaining before access is restricted. Please update your payment method.`
  }

  return {
    isInGracePeriod,
    daysRemaining,
    isExpired,
    urgency,
    message,
  }
}

export function shouldAllowAccessDuringGracePeriod(
  subscriptionStatus: string,
  pastDueDate?: Date,
  config: Partial<GracePeriodConfig> = {},
): boolean {
  if (subscriptionStatus !== 'past_due' || !pastDueDate) {
    return false
  }

  const gracePeriodStatus = calculateGracePeriodStatus(pastDueDate, config)
  return gracePeriodStatus.isInGracePeriod
}
```

## 11. UI Components and User Experience

### 11.1 Upgrade Modal Component

```typescript
export function BillingUpgradeModal({ children }: PropsWithChildren) {
  const plans = api.plan.findMany.useQuery()
  const auth = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isYearlyBilling, setIsYearlyBilling] = useState(false)

  // Auto-select first available plan
  useEffect(() => {
    if (plans.data && !selectedPlan) {
      const availablePlans = plans.data
        .filter((plan) => subscription?.plan.id !== plan.id)
        .sort((a, b) => {
          const aPrice = isYearlyBilling
            ? a.prices.find((p) => p.interval === 'year')?.amount || 0
            : a.prices.find((p) => p.interval === 'month')?.amount || 0
          const bPrice = isYearlyBilling
            ? b.prices.find((p) => p.interval === 'year')?.amount || 0
            : b.prices.find((p) => p.interval === 'month')?.amount || 0
          return aPrice - bPrice
        })

      if (availablePlans[0]) {
        setSelectedPlan(availablePlans[0])
      }
    }
  }, [plans, selectedPlan, subscription?.plan.id])

  const handleCreateCheckoutSession = async () => {
    const response = await api.billing.createCheckoutSession.mutate({
      body: {
        plan: selectedPlan.slug,
        cycle: activePrice.interval as CyclePeriod,
      },
    })

    if (response.data) {
      window.location.href = response.data
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>{children}</div>
      </SheetTrigger>
      <SheetContent className="max-w-full flex flex-col gap-0 p-0 overflow-y-auto">
        {/* Plan selector, billing toggle, plan details, upgrade button */}
      </SheetContent>
    </Sheet>
  )
}
```

### 11.2 Alert System Components

```typescript
// Base alert page component
export function BillingAlertPage({ children }: PropsWithChildren) {
  return (
    <motion.div
      className="h-screen flex flex-col bg-background"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Specific alert for no subscription
export function BillingAlertPageNoSubscription() {
  return (
    <BillingAlertPage>
      <BillingAlertPage.Header />
      <BillingAlertPage.Content>
        <BillingAlertPage.Icon>
          <Ban className="w-6 h-6 text-destructive" />
        </BillingAlertPage.Icon>
        <BillingAlertPage.Title>No Active Subscription</BillingAlertPage.Title>
        <BillingAlertPage.Description>
          You are not currently subscribed to any plan.
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingUpgradeModal>
            <BillingAlertPage.PrimaryAction>
              Subscribe Now
            </BillingAlertPage.PrimaryAction>
          </BillingUpgradeModal>
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
```

## 12. Complete Implementation Examples

### 12.1 Basic Subscription Check

```typescript
// In any component or API route
const auth = useAuth()
const subscription = auth.session.organization?.billing.subscription

// Check subscription status
if (!subscription) {
  // No subscription - show upgrade prompt
  return <BillingAlertPageNoSubscription />
}

// Check specific status
switch (subscription.status) {
  case 'active':
    // Full access
    break
  case 'trialing':
    // Trial access with notifications
    break
  case 'past_due':
    // Grace period or payment required
    break
  case 'canceled':
    // Subscription canceled
    break
}
```

### 12.2 Feature Access Control

```typescript
// Check feature access
const canUseFeature = await payment.canUseFeature(
  organizationId,
  'advanced-integrations'
)

if (!canUseFeature) {
  return <UpgradePrompt feature="advanced-integrations" />
}

// Check quota
const hasQuota = await payment.hasQuota(organizationId, 'leads')
if (!hasQuota) {
  return <QuotaExceeded feature="leads" />
}

// Get detailed quota info
const quotaInfo = await payment.getQuotaInfo(organizationId, 'leads')
console.log(`${quotaInfo.usage}/${quotaInfo.limit} leads used`)
```

### 12.3 Usage Tracking

```typescript
// Automatic usage tracking (handled by the system)
// The system automatically counts records in specified database tables

// Manual usage increment (if needed)
const customer = await payment.getCustomerById(organizationId)
const currentUsage = customer?.subscription?.usage.find(
  (u) => u.slug === 'leads'
)

// Usage is automatically calculated from the database
// No manual increment needed for standard features
```

### 12.4 Webhook Processing

```typescript
// Webhook endpoint in API route
export async function POST(request: Request) {
  try {
    const response = await payment.handle(request)
    return response
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}
```

## 13. Advanced Configuration and Customization

### 13.1 Custom Plan Features

```typescript
// Define custom features for your SaaS
const customPlan = PaymentProvider.plan({
  slug: 'enterprise',
  name: 'Enterprise',
  description: 'Full-featured plan for large organizations',
  metadata: {
    features: [
      {
        slug: 'api-calls',
        name: 'API Calls',
        description: 'Monthly API call limit',
        table: 'ApiCall', // Database table to track
        enabled: true,
        limit: 1000000, // 1M calls
        cycle: 'month',
      },
      {
        slug: 'storage',
        name: 'File Storage',
        description: 'GB of file storage',
        table: 'File',
        enabled: true,
        limit: 1000, // 1000 GB
      },
      {
        slug: 'white-label',
        name: 'White Labeling',
        description: 'Custom branding and domains',
        enabled: true,
        // No limit for boolean features
      },
    ],
  },
  prices: [
    {
      amount: 500000, // R$ 5,000.00
      currency: 'brl',
      interval: 'month',
      intervalCount: 1,
      slug: 'enterprise-monthly',
    },
  ],
})
```

### 13.2 Custom Payment Events

```typescript
// Custom event handlers
const payment = PaymentProvider.initialize({
  // ... other config
  events: {
    onCustomerCreated: async (customer) => {
      // Send welcome email
      await sendWelcomeEmail(customer.email)

      // Create default organization settings
      await createDefaultOrgSettings(customer.organizationId)

      // Log analytics event
      await analytics.track('customer_created', {
        customerId: customer.id,
        plan: 'free',
      })
    },

    onSubscriptionCreated: async (subscription) => {
      // Update user role to premium
      await updateUserRole(subscription.customerId, 'premium')

      // Send upgrade confirmation
      await sendUpgradeEmail(subscription.customerId)

      // Enable premium features
      await enablePremiumFeatures(subscription.customerId)
    },

    onSubscriptionTrialWillEnd: async (subscription) => {
      // Send trial ending reminder
      await sendTrialEndingEmail(subscription.customerId)

      // Show upgrade prompts in UI
      await triggerUpgradePrompts(subscription.customerId)
    },
  },
})
```

## 14. Best Practices and Security

### 14.1 Security Considerations

- **Webhook Verification**: Always verify Stripe webhook signatures
- **Data Validation**: Validate all payment data before processing
- **Error Handling**: Don't expose sensitive payment information in errors
- **Rate Limiting**: Implement rate limiting on billing endpoints
- **Audit Logging**: Log all billing-related actions for compliance

### 14.2 Performance Optimization

- **Caching**: Cache plan and pricing information
- **Database Indexing**: Index frequently queried fields
- **Webhook Processing**: Process webhooks asynchronously
- **Usage Calculation**: Optimize usage queries with proper indexing

### 14.3 Monitoring and Analytics

```typescript
// Monitor subscription metrics
const metrics = {
  totalCustomers: await payment.listCustomers().then(c => c.length),
  activeSubscriptions: await payment.listSubscriptions({
    where: { status: 'active' }
  }).then(s => s.length),
  trialConversions: await payment.listSubscriptions({
    where: { status: 'active', trialDays: { gt: 0 } }
  }).then(s => s.length),
  churnRate: calculateChurnRate(),
  mrr: calculateMonthlyRecurringRevenue(),
}

// Monitor usage patterns
const usageAnalytics = await Promise.all(
  plans.map(async (plan) => {
    const customers = await payment.listCustomers({
      where: { subscription: { plan: { slug: plan.slug } } }
    })

    const avgUsage = await Promise.all(
      plan.metadata.features.map(async (feature) => {
        const usages = await Promise.all(
          customers.map(c => payment.getQuotaInfo(c.id, feature.slug))
        )
        return usages.reduce((sum, u) => sum + u.usage, 0) / usages.length
      })
    )

    return {
      plan: plan.slug,
      customerCount: customers.length,
      averageUsage: avgUsage,
    }
  })
)
```

## 15. Troubleshooting and Common Issues

### 15.1 Subscription Status Issues

**Problem**: Subscription shows wrong status
```typescript
// Solution: Sync with Stripe
await payment.sync()

// Check webhook processing
const customer = await payment.getCustomerById(customerId)
console.log('Subscription status:', customer?.subscription?.status)
```

**Problem**: Trial not ending properly
```typescript
// Check trial end date calculation
const subscription = await payment.getCustomerById(customerId)
const trialEnd = subscription?.subscription?.createdAt
if (trialEnd) {
  trialEnd.setDate(trialEnd.getDate() + (subscription?.subscription?.trialDays || 0))
  console.log('Trial should end:', trialEnd)
}
```

### 15.2 Quota Calculation Issues

**Problem**: Usage counts are wrong
```typescript
// Check database table structure
const feature = plan.metadata.features.find(f => f.slug === 'leads')
if (feature.table) {
  const count = await prisma.lead.count({
    where: { organizationId: customerId }
  })
  console.log(`Actual count: ${count}, Feature table: ${feature.table}`)
}
```

**Problem**: Quota limits not enforced
```typescript
// Verify quota checking
const hasQuota = await payment.hasQuota(customerId, 'leads')
const quotaInfo = await payment.getQuotaInfo(customerId, 'leads')
console.log('Has quota:', hasQuota, 'Info:', quotaInfo)
```

### 15.3 Webhook Processing Issues

**Problem**: Webhooks not processing
```typescript
// Check webhook signature verification
const isValid = verifyStripeSignature(request.headers, body, secret)
if (!isValid) {
  console.error('Invalid webhook signature')
  return new Response('Invalid signature', { status: 400 })
}
```

**Problem**: Duplicate webhook processing
```typescript
// Implement idempotency
const eventId = request.headers.get('stripe-signature')
if (processedEvents.has(eventId)) {
  return new Response('Already processed', { status: 200 })
}
processedEvents.add(eventId)
```

## 16. Migration and Upgrades

### 16.1 Plan Migration Strategy

```typescript
// Migrate customers between plans
async function migrateCustomerToPlan(
  customerId: string,
  newPlanSlug: string,
  prorate: boolean = true
) {
  const customer = await payment.getCustomerById(customerId)
  if (!customer?.subscription) {
    throw new Error('Customer has no active subscription')
  }

  const currentSubscription = customer.subscription
  const newPlan = await payment.listPlans().then(plans =>
    plans.find(p => p.slug === newPlanSlug)
  )

  if (!newPlan) {
    throw new Error('New plan not found')
  }

  // Cancel current subscription
  await payment.cancelSubscription(currentSubscription.id, {
    cancelAt: new Date(),
    prorate: prorate,
  })

  // Create new subscription
  await payment.createSubscription({
    customerId: customer.id,
    plan: newPlanSlug,
    cycle: currentSubscription.plan.price.interval,
  })
}
```

### 16.2 Data Migration for Billing

```typescript
// Migrate existing billing data
async function migrateBillingData() {
  // Migrate customers
  const existingCustomers = await legacyDatabase.getCustomers()
  for (const customer of existingCustomers) {
    await payment.createCustomer({
      referenceId: customer.organizationId,
      name: customer.name,
      email: customer.email,
      metadata: customer.metadata,
    })
  }

  // Migrate subscriptions
  const existingSubscriptions = await legacyDatabase.getSubscriptions()
  for (const subscription of existingSubscriptions) {
    await payment.createSubscription({
      customerId: subscription.customerId,
      plan: subscription.planSlug,
      cycle: subscription.billingCycle,
      trialDays: subscription.trialDays,
    })
  }
}
```

This comprehensive billing system guide provides everything needed to understand, implement, and maintain a production-ready SaaS billing infrastructure with Stripe integration, quota management, trial handling, and comprehensive UI components.