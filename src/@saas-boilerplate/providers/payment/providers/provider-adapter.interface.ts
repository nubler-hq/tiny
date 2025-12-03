import type {
  Customer,
  CustomerDTO,
  Plan,
  PlanDTO,
  Price,
  PriceDTO,
  SubscriptionDTO,
} from '../types'

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

/**
 * Interface that all payment providers must implement.
 */
export interface IPaymentProviderAdapter {
  // Customer Management
  createCustomer(params: Omit<CustomerDTO, 'providerId'>): Promise<Customer>
  updateCustomer(
    customerId: string,
    params: Partial<CustomerDTO>,
  ): Promise<Customer>
  deleteCustomer(customerId: string): Promise<void>
  findCustomerByReferenceId(referenceId: string): Promise<Customer | null>

  // Plans Management
  createPlan(params: Omit<PlanDTO, 'providerId'>): Promise<{ planId: string }>
  updatePlan(planId: string, params: Partial<PlanDTO>): Promise<void>
  archivePlan(planId: string): Promise<void>
  findPlanBySlug(slug: string): Promise<Plan | null>

  // Prices Management
  createPrice(params: PriceDTO): Promise<string>
  updatePrice(priceId: string, params: PriceDTO): Promise<void>
  archivePrice(priceId: string): Promise<void>
  findPricesByPlanId(planId: string): Promise<Price[]>

  // Subscriptions
  createSubscription(
    params: Omit<SubscriptionDTO, 'providerId'>,
  ): Promise<string>
  updateSubscription(
    subscriptionId: string,
    params: Partial<SubscriptionDTO>,
  ): Promise<void>
  cancelSubscription(
    subscriptionId: string,
    params?: { cancelAt?: Date; invoiceNow?: boolean; prorate?: boolean },
  ): Promise<void>

  // Portal and Checkout
  createBillingPortal(customerId: string, returnUrl: string): Promise<string>
  createCheckoutSession(params: {
    customerId: string
    priceId: string
    successUrl: string
    cancelUrl: string
    subscriptionId: string
  }): Promise<string>

  // Webhooks
  handle(
    request: Request,
  ): Promise<{ event: PaymentProviderAdapterEvent; data: any } | null>
}
