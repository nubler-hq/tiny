import type {
  Customer,
  CustomerDTO,
  Plan,
  PlanDTO,
  Price,
  PriceDTO,
  Subscription,
  SubscriptionDTO,
} from '../types'

export interface DatabaseAdapterQueryParams<T extends Record<string, any>> {
  where?: Partial<T>
  orderBy?: keyof T
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface IPaymentProviderDatabaseAdapter {
  // Customer Management
  createCustomer(params: CustomerDTO): Promise<Customer>
  updateCustomer(
    customerId: string,
    params: Partial<CustomerDTO>,
  ): Promise<Customer>
  deleteCustomer(customerId: string): Promise<void>
  listCustomers(
    search?: DatabaseAdapterQueryParams<Customer>,
  ): Promise<Customer[]>
  getCustomerById(customerId: string): Promise<Customer | null>
  getCustomerUsage(params: {
    customerId: string
    feature: string
  }): Promise<number>

  // Plans Management
  listPlans(search?: DatabaseAdapterQueryParams<Plan>): Promise<Plan[]>
  createPlan(params: PlanDTO): Promise<Plan>
  updatePlan(params: Partial<PlanDTO>): Promise<Plan>
  archivePlan(planId: string): Promise<void>
  getPlanBySlug(slug: string): Promise<Plan | null>
  getPlanById(id: string): Promise<Plan | null>
  getPlanByProviderId(providerId: string): Promise<Plan | null>

  // Prices Management
  getPriceById(priceId: string): Promise<Price | null>
  createPrice(params: PriceDTO): Promise<Price>
  updatePrice(priceId: string, params: Partial<PriceDTO>): Promise<Price>
  deletePrice(priceId: string): Promise<void>

  // Subscriptions
  getSubscriptionById(subscriptionId: string): Promise<Subscription | null>
  createSubscription(params: SubscriptionDTO): Promise<Subscription>
  updateSubscription(
    subscriptionId: string,
    params: Partial<SubscriptionDTO>,
  ): Promise<Subscription>
  cancelSubscription(subscriptionId: string): Promise<void>
  listSubscriptions(
    search?: DatabaseAdapterQueryParams<Subscription>,
  ): Promise<Subscription[]>
}
