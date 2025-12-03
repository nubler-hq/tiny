import type {
  DatabaseAdapterQueryParams,
  IPaymentProviderDatabaseAdapter,
} from './databases/database-adapter.interface'
import type { IPaymentProviderAdapter } from './providers/provider-adapter.interface'
import type {
  IPaymentProvider,
  PaymentEvents,
  PaymentOptions,
  SubscriptionDTO,
  Subscription,
  Customer,
  CyclePeriod,
  Plan,
  Price,
  PlanDTO,
  CustomerDTO,
  CreateSubscriptionParams,
  ExtractFeatureSlugs,
} from './types'

export class PaymentProvider<TPlans extends Omit<PlanDTO, 'providerId'>[]>
  implements IPaymentProvider<TPlans>
{
  static instance: IPaymentProvider<any>

  private readonly adapter: IPaymentProviderAdapter
  private readonly database: IPaymentProviderDatabaseAdapter
  private readonly events?: PaymentEvents
  private readonly options: PaymentOptions<TPlans>

  constructor(options: PaymentOptions<TPlans>) {
    this.adapter = options.adapter
    this.database = options.database
    this.events = options.events
    this.options = options
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.adapter.deleteCustomer(customerId)
      await this.database.deleteCustomer(customerId)

      if (this.events?.onCustomerDeleted) {
        await this.events.onCustomerDeleted(customerId)
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      throw new Error(`Failed to delete customer: ${(error as Error).message}`)
    }
  }

  async listCustomers(
    search?: DatabaseAdapterQueryParams<Customer>,
  ): Promise<Customer[]> {
    try {
      return await this.database.listCustomers(search)
    } catch (error) {
      console.error(`Failed to list customers:`, error)
      throw new Error(`Failed to list customers: ${(error as Error).message}`)
    }
  }

  async createSubscription(
    params: CreateSubscriptionParams<TPlans>,
  ): Promise<Subscription> {
    try {
      // 1. Verificar se o cliente existe
      const customer = await this.database.getCustomerById(params.customerId)
      if (!customer) throw new Error('CUSTOMER_NOT_FOUND: Customer not found')

      // 2. Buscar o plano pelo slug
      const plan = await this.database.getPlanBySlug(params.plan)
      if (!plan) throw new Error('PLAN_NOT_FOUND: Plan not found')

      // 3. Encontrar o preço baseado no ciclo
      const price = plan.prices?.find((p) => p.interval === params.cycle)
      if (!price)
        throw new Error(
          `PRICE_NOT_FOUND: No price found for cycle ${params.cycle}`,
        )
      if (!price.providerId)
        throw new Error(
          'PRICE_PROVIDER_ID_MISSING: Price does not have a provider ID',
        )

      // 4. Criar a subscription no provider
      const subscriptionProviderId = await this.adapter.createSubscription({
        status: params.trialDays ? 'trialing' : 'active',
        customerId: customer.providerId,
        priceId: price.providerId,
        quantity: params.quantity,
        trialDays: params.trialDays,
        metadata: params.metadata,
        billingCycleAnchor: params.billingCycleAnchor,
        prorationBehavior: params.prorationBehavior,
      })

      // 5. Criar a subscription no banco de dados
      const subscription = await this.database.createSubscription({
        status: params.trialDays ? 'trialing' : 'active',
        customerId: customer.id,
        priceId: price.id,
        quantity: params.quantity,
        trialDays: params.trialDays,
        metadata: params.metadata,
        billingCycleAnchor: params.billingCycleAnchor,
        prorationBehavior: params.prorationBehavior,
        providerId: subscriptionProviderId,
      })

      if (subscription && this.events?.onSubscriptionCreated) {
        await this.events.onSubscriptionCreated(subscription)
      }

      return subscription
    } catch (error) {
      console.error(`Failed to create subscription:`, error)
      throw new Error(
        `Failed to create subscription: ${(error as Error).message}`,
      )
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: Partial<SubscriptionDTO>,
  ): Promise<Subscription> {
    try {
      await this.adapter.updateSubscription(subscriptionId, params)
      const subscription = await this.database.updateSubscription(
        subscriptionId,
        params,
      )

      if (this.events?.onSubscriptionUpdated) {
        await this.events.onSubscriptionUpdated(subscription)
      }

      return subscription
    } catch (error) {
      console.error('Failed to update subscription:', error)
      throw new Error(
        `Failed to update subscription: ${(error as Error).message}`,
      )
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    params?: { cancelAt?: Date; invoiceNow?: boolean; prorate?: boolean },
  ): Promise<void> {
    try {
      await this.adapter.cancelSubscription(subscriptionId, params)
      await this.database.cancelSubscription(subscriptionId)

      const subscriptions = await this.database.listSubscriptions({
        where: { id: subscriptionId },
      })
      const subscription = subscriptions[0]

      if (subscription && this.events?.onSubscriptionCanceled) {
        await this.events.onSubscriptionCanceled(subscription)
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw new Error(
        `Failed to cancel subscription: ${(error as Error).message}`,
      )
    }
  }

  async listSubscriptions(
    search?: DatabaseAdapterQueryParams<Subscription>,
  ): Promise<Subscription[]> {
    try {
      return await this.database.listSubscriptions(search)
    } catch (error) {
      console.error('Failed to list subscriptions:', error)
      throw new Error(
        `Failed to list subscriptions: ${(error as Error).message}`,
      )
    }
  }

  async createBillingPortal(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    try {
      return await this.adapter.createBillingPortal(customerId, returnUrl)
    } catch (error) {
      console.error('Failed to create billing manager session:', error)
      throw new Error(
        `Failed to create billing manager session: ${(error as Error).message}`,
      )
    }
  }

  async createCheckoutSession(params: {
    customerId: string
    plan: string
    cycle: CyclePeriod
    successUrl?: string
    cancelUrl?: string
  }): Promise<string> {
    try {
      const customer = await this.database.getCustomerById(params.customerId)
      if (!customer) throw new Error('Customer not found')

      const subscriptions = await this.database.listSubscriptions({
        where: {
          customerId: customer.id,
          status: 'active',
        },
      })

      const plan = await this.database.getPlanBySlug(params.plan)
      if (!plan) throw new Error('Plan not found')

      const price = plan.prices?.find((p) => p.interval === params.cycle)
      if (!price) throw new Error('Price not found')

      const successUrl =
        params.successUrl ??
        this.options.paths?.checkoutSuccessUrl ??
        process.env.CHECKOUT_SUCCESS_URL
      const cancelUrl =
        params.cancelUrl ??
        this.options.paths?.checkoutCancelUrl ??
        process.env.CHECKOUT_CANCEL_URL

      return this.adapter.createCheckoutSession({
        customerId: customer.providerId,
        subscriptionId: subscriptions[0]?.providerId,
        priceId: price.providerId,
        successUrl: successUrl as string,
        cancelUrl: cancelUrl as string,
      })
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      throw new Error(
        `Failed to create checkout session: ${(error as Error).message}`,
      )
    }
  }

  async createCustomer(params: CustomerDTO): Promise<Customer> {
    try {
      console.log('Starting createCustomer with params:', params)

      const providerCustomer = await this.adapter.createCustomer({
        ...params,
      })
      console.log('Provider customer created:', providerCustomer)

      const customer = await this.database.createCustomer({
        ...params,
        providerId: providerCustomer.providerId,
      })
      console.log('Customer created in database:', customer)

      const defaultPlan = this.options.subscriptions?.plans.default
      console.log('Default plan:', defaultPlan)

      const hasSubscriptionEnabled =
        this.options.subscriptions?.enabled ?? false
      const hasDefaultPlan = defaultPlan ?? false
      console.log(
        'Subscription enabled:',
        hasSubscriptionEnabled,
        'Default plan exists:',
        hasDefaultPlan,
      )

      if (!hasSubscriptionEnabled || !hasDefaultPlan) {
        console.log(
          'Subscriptions are not enabled or no default plan is defined. Returning customer.',
        )
        return customer
      }

      const trial = this.options.subscriptions?.trial
      const trialDuration = trial?.duration ?? 0
      console.log('Trial configuration:', trial)

      const hasTrialEnabled = trial?.enabled ?? false

      console.log(
        'Trial enabled:',
        hasTrialEnabled,
        'Trial duration:',
        trialDuration,
      )

      const plan = await this.database.getPlanBySlug(defaultPlan as string)
      console.log('Fetched plan by slug:', plan)

      if (!plan) {
        throw new Error('Plan not found')
      }

      if (hasTrialEnabled && trialDuration > 0) {
        console.log('Creating subscription with trial...')
        await this.createSubscription({
          customerId: customer.id,
          plan: plan.slug,
          trialDays: hasTrialEnabled ? trialDuration : undefined,
          cycle: 'month',
        })

        console.log('Subscription with trial created successfully.')
      }

      const defautPlanMonthlyPrice = plan.prices?.find(
        (p) => p.interval === 'month',
      )
      console.log('Default plan monthly price:', defautPlanMonthlyPrice)

      if (!defautPlanMonthlyPrice) {
        throw new Error('Default plan monthly price not found')
      }

      if (!hasTrialEnabled && defautPlanMonthlyPrice.amount > 0) {
        throw new Error(
          'If trial is not enabled, the default plan must be free',
        )
      }

      if (this.events?.onCustomerCreated) {
        console.log('Triggering onCustomerCreated event...')
        await this.events.onCustomerCreated(customer)
        console.log('onCustomerCreated event triggered successfully.')
      }

      console.log('Customer creation process completed successfully.')
      return customer
    } catch (error) {
      console.error('Failed to create customer:', error)
      throw new Error(`Failed to create customer: ${(error as Error).message}`)
    }
  }

  async updateCustomer(
    customerId: string,
    params: Partial<CustomerDTO>,
  ): Promise<Customer> {
    try {
      await this.adapter.updateCustomer(customerId, params)
      const customer = await this.database.updateCustomer(customerId, params)

      if (this.events?.onCustomerUpdated) {
        await this.events.onCustomerUpdated(customer)
      }

      return customer
    } catch (error) {
      console.error('Failed to update customer:', error)
      throw new Error(`Failed to update customer: ${(error as Error).message}`)
    }
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      return await this.database.getCustomerById(customerId)
    } catch (error) {
      console.error('Failed to get customer:', error)
      throw new Error(`Failed to get customer: ${(error as Error).message}`)
    }
  }

  /**
   * Verifica se um cliente tem quota disponível para uma feature específica.
   * Este método é type-safe e garante que apenas features válidas sejam verificadas.
   *
   * @param customerId - ID do cliente
   * @param feature - Slug da feature a ser verificada (type-safe baseado nos planos configurados)
   * @returns Promise<boolean> - true se há quota disponível, false caso contrário
   * @throws Error se o cliente não for encontrado ou não tiver assinatura ativa
   */
  async hasQuota(
    customerId: string,
    feature: ExtractFeatureSlugs<TPlans>,
  ): Promise<boolean> {
    try {
      const customer = await this.database.getCustomerById(customerId)
      if (!customer) {
        throw new Error(`Customer with ID '${customerId}' not found`)
      }

      const subscription = customer.subscription
      if (!subscription) {
        throw new Error(`Customer '${customerId}' has no active subscription`)
      }

      const plan = subscription.plan
      if (!plan || !plan.metadata?.features) {
        throw new Error(
          `No plan or features found for customer '${customerId}'`,
        )
      }

      const planFeature = plan.metadata.features.find((f) => f.slug === feature)

      // Se a feature não existe no plano, não há quota
      if (!planFeature) {
        return false
      }

      // Se a feature está desabilitada, não há quota
      if (!planFeature.enabled) {
        return false
      }

      // Se não há limite definido, assume quota ilimitada
      if (planFeature.limit === undefined || planFeature.limit === null) {
        return true
      }

      const usage = await this.database.getCustomerUsage({
        customerId,
        feature,
      })

      return usage < planFeature.limit
    } catch (error) {
      console.error(`Failed to check quota for feature '${feature}':`, error)
      throw new Error(
        `Failed to check quota for feature '${feature}': ${(error as Error).message}`,
      )
    }
  }

  /**
   * Obtém informações detalhadas sobre o uso de uma feature específica.
   *
   * @param customerId - ID do cliente
   * @param feature - Slug da feature (type-safe)
   * @returns Promise com informações detalhadas da quota
   */
  async getQuotaInfo(
    customerId: string,
    feature: ExtractFeatureSlugs<TPlans>,
  ): Promise<{
    feature: string
    enabled: boolean
    limit: number | null
    usage: number
    remaining: number | null
    unlimited: boolean
  }> {
    try {
      const customer = await this.database.getCustomerById(customerId)
      if (!customer) {
        throw new Error(`Customer with ID '${customerId}' not found`)
      }

      const subscription = customer.subscription
      if (!subscription) {
        throw new Error(`Customer '${customerId}' has no active subscription`)
      }

      const plan = subscription.plan
      if (!plan || !plan.metadata?.features) {
        throw new Error(
          `No plan or features found for customer '${customerId}'`,
        )
      }

      const planFeature = plan.metadata.features.find((f) => f.slug === feature)

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
    } catch (error) {
      console.error(`Failed to get quota info for feature '${feature}':`, error)
      throw new Error(
        `Failed to get quota info for feature '${feature}': ${(error as Error).message}`,
      )
    }
  }

  /**
   * Verifica se um cliente pode usar uma feature específica.
   * Diferente de hasQuota, este método verifica apenas se a feature está habilitada,
   * independentemente de limites de uso.
   *
   * @param customerId - ID do cliente
   * @param feature - Slug da feature (type-safe)
   * @returns Promise<boolean> - true se a feature está habilitada no plano
   */
  async canUseFeature(
    customerId: string,
    feature: ExtractFeatureSlugs<TPlans>,
  ): Promise<boolean> {
    try {
      const customer = await this.database.getCustomerById(customerId)
      if (!customer?.subscription?.plan?.metadata?.features) {
        return false
      }

      const planFeature = customer.subscription.plan.metadata.features.find(
        (f) => f.slug === feature,
      )

      return planFeature?.enabled ?? false
    } catch (error) {
      console.error(`Failed to check feature access for '${feature}':`, error)
      return false
    }
  }

  /**
   * Processa eventos de webhook e atualiza o banco de dados de acordo com o tipo do evento
   */
  async handle(request: Request): Promise<Response> {
    try {
      // Processa o evento através do adaptador e obtém o tipo de evento e dados formatados
      const event = await this.adapter.handle(request)

      if (!event) {
        return new Response(
          JSON.stringify({
            status: 'processed',
            message: 'Event not processed, because event is type not handled.',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
      }

      const { event: eventType, data } = event

      // Atualiza o banco de dados de acordo com o tipo de evento
      switch (eventType) {
        case 'error':
          console.error('Webhook error:', data)
          break

        // Eventos de Assinatura
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
            billingCycleAnchor: data.billingCycleAnchor,
            prorationBehavior: data.prorationBehavior,
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
            console.error(
              `Subscription with providerId ${data.id} not found for update.`,
            )
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
              billingCycleAnchor: data.billingCycleAnchor,
              prorationBehavior: data.prorationBehavior,
              providerId: data.providerId,
              status: data.status,
            },
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
            console.error(
              `Subscription with providerId ${data.id} not found for deletion.`,
            )
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

        case 'customer.subscription.trial_will_end':
          if (this.events?.onSubscriptionTrialWillEnd) {
            await this.events.onSubscriptionTrialWillEnd(data)
          }

          break

        // Eventos de Fatura
        case 'invoice.payment_succeeded':
          // Notificar evento de pagamento de fatura bem-sucedido
          if (this.events?.onInvoicePaymentSucceeded) {
            await this.events.onInvoicePaymentSucceeded(data)
          } else {
            console.log(`Pagamento da fatura ${data.id} realizado com sucesso`)
          }

          break

        case 'invoice.payment_failed':
          // Notificar evento de falha no pagamento de fatura
          if (this.events?.onInvoicePaymentFailed) {
            await this.events.onInvoicePaymentFailed(data)
          } else {
            console.log(`Falha no pagamento da fatura ${data.id}`)
          }

          break

        // Eventos de Cliente
        case 'customer.created':
          await this.database.updateCustomer(data.id, data)

          if (this.events?.onCustomerCreated) {
            await this.events.onCustomerCreated(data)
          }

          break

        case 'customer.updated':
          await this.database.updateCustomer(data.id, data)

          if (this.events?.onCustomerUpdated) {
            await this.events.onCustomerUpdated(data)
          }

          break
      }

      // Notifica que um webhook foi recebido
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
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    } catch (error) {
      console.error('Falha ao processar webhook:', error)
      throw new Error(`Falha ao processar webhook: ${(error as Error).message}`)
    }
  }

  async sync(): Promise<void> {
    try {
      // Check if subscriptions are enabled and plans are defined
      if (
        !this.options?.subscriptions?.enabled ||
        !Array.isArray(this.options?.subscriptions?.plans.options)
      ) {
        console.log('Subscriptions not enabled or no plans defined for sync')
        return
      }

      const plans = this.options.subscriptions.plans

      // Process each plan
      for (const planData of plans.options) {
        // 1. Check if plan exists in database by slug
        const existingPlan = await this.database.getPlanBySlug(planData.slug)

        if (existingPlan) {
          // 2. Update plan in the provider (Stripe)
          await this.adapter.updatePlan(existingPlan.providerId, {
            name: planData.name,
            description: planData.description,
            metadata: planData.metadata,
          })

          // 3. Update plan in the database
          const updatedPlan = await this.database.updatePlan({
            slug: planData.slug,
            name: planData.name,
            description: planData.description,
            metadata: planData.metadata,
          })

          // 4. Trigger plan updated event
          if (this.events?.onPlanUpdated) {
            await this.events.onPlanUpdated(updatedPlan)
          }

          // 5. Handle prices for the plan
          await this.syncPlanPrices(existingPlan, planData.prices)
        } else {
          // 5. Create plan in the provider (Stripe)
          const { planId } = await this.adapter.createPlan({
            slug: planData.slug,
            name: planData.name,
            description: planData.description,
            metadata: planData.metadata,
            prices: planData.prices.map((p) => ({
              slug: p.slug,
              interval: p.interval,
              amount: p.amount,
              currency: p.currency,
              intervalCount: p.intervalCount,
              metadata: p.metadata,
            })),
          })

          // 6. Create plan in the database
          const newPlan = await this.database.createPlan({
            providerId: planId,
            slug: planData.slug,
            name: planData.name,
            description: planData.description,
            metadata: planData.metadata,
            prices: [], // We'll add prices separately
          })

          // 7. Trigger plan created event
          if (this.events?.onPlanCreated) {
            await this.events.onPlanCreated(newPlan)
          }

          // 8. Handle prices for the new plan
          await this.syncPlanPrices(newPlan, planData.prices)
        }
      }
    } catch (error) {
      throw new Error(`Failed to sync plans: ${(error as Error).message}`)
    }
  }

  /**
   * Lists all plans in the database
   */
  listPlans(): Promise<Plan[]> {
    return this.database.listPlans()
  }

  /**
   * Helper method to sync prices for a plan
   */
  private async syncPlanPrices(
    plan: Plan,
    pricesToSync: Array<{
      slug: string
      interval: CyclePeriod
      amount: number
      currency: string
      intervalCount: number
      metadata?: Record<string, any>
    }>,
  ): Promise<void> {
    try {
      // Process each price to sync
      for (const priceData of pricesToSync) {
        // Create a slug if not provided
        const priceSlug =
          priceData.slug || `${priceData.interval}-${priceData.intervalCount}`

        // Check if price already exists in the database by slug
        const existingPrice = await this.findPriceInPlan(plan, priceData)

        if (existingPrice) {
          // Update price in database
          const updatedPrice = await this.database.updatePrice(
            existingPrice.id,
            {
              amount: priceData.amount,
              currency: priceData.currency,
              interval: priceData.interval,
              intervalCount: priceData.intervalCount,
              metadata: priceData.metadata,
            },
          )

          // Trigger price updated event
          if (this.events?.onPriceUpdated) {
            await this.events.onPriceUpdated(updatedPrice)
          }
        } else {
          // Create new price in the provider
          const providerPriceId = await this.adapter.createPrice({
            planId: plan.providerId,
            slug: priceData.slug,
            interval: priceData.interval,
            amount: priceData.amount,
            currency: priceData.currency,
            intervalCount: priceData.intervalCount,
            metadata: priceData.metadata,
          })

          // Then create in database
          const newPrice = await this.database.createPrice({
            providerId: providerPriceId,
            planId: plan.id,
            slug: priceSlug,
            amount: priceData.amount,
            currency: priceData.currency,
            interval: priceData.interval,
            intervalCount: priceData.intervalCount,
            metadata: priceData.metadata,
          })

          // Trigger price created event
          if (this.events?.onPriceCreated) {
            await this.events.onPriceCreated(newPrice)
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync plan prices:', error)
      throw new Error(`Failed to sync plan prices: ${(error as Error).message}`)
    }
  }

  /**
   * Helper method to find a matching price in a plan
   */
  private findPriceInPlan(
    plan: Plan,
    priceData: {
      amount: number
      currency: string
      interval: CyclePeriod
      intervalCount: number
    },
  ): Price | undefined {
    if (!plan.prices || !Array.isArray(plan.prices)) {
      return undefined
    }

    return plan.prices.find(
      (price) =>
        price.amount === priceData.amount &&
        price.currency === priceData.currency &&
        price.interval === priceData.interval &&
        price.intervalCount === priceData.intervalCount,
    )
  }

  static plan<TPlan extends Omit<PlanDTO, 'providerId'>>(plan: TPlan): TPlan {
    return plan
  }

  static provider<TClient>(
    adapter: (client: TClient) => IPaymentProviderAdapter,
  ): (client: TClient) => IPaymentProviderAdapter {
    return adapter
  }

  static database<TDatabase>(
    adapter: (database: TDatabase) => IPaymentProviderDatabaseAdapter,
  ): (database: TDatabase) => IPaymentProviderDatabaseAdapter {
    return adapter
  }

  static initialize<TPlans extends Omit<PlanDTO, 'providerId'>[]>(
    params: PaymentOptions<TPlans>,
  ): IPaymentProvider<TPlans> {
    if (typeof window !== 'undefined') {
      return {} as IPaymentProvider<TPlans>
    }

    if (!PaymentProvider.instance) {
      PaymentProvider.instance = new PaymentProvider(params)
    }

    return PaymentProvider.instance
  }
}
