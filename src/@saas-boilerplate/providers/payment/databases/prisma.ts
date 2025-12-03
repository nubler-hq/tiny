import type { PrismaClient } from '@prisma/client'
import { PaymentProvider } from '../payment.provider'
import type {
  CustomerDTO,
  PlanDTO,
  CyclePeriod,
  PriceDTO,
  SubscriptionDTO,
  Customer,
  Plan,
  Usage,
  Subscription,
  PlanMetadata,
  Price,
} from '../types'
import type { DatabaseAdapterQueryParams } from './database-adapter.interface'
import { String } from '@/@saas-boilerplate/utils/string'

export const prismaAdapter = PaymentProvider.database<PrismaClient>(
  (prisma) => {
    // Add helper function to map Prisma customer to our Customer type
    function mapCustomer(prismaCustomer: any): Customer {
      return {
        ...prismaCustomer,
        subscription: prismaCustomer.subscription ?? [],
      }
    }

    async function getCustomerUsageByRefId(
      customerId: string,
    ): Promise<Usage[]> {
      try {
        const customer = await prisma.customer.findFirst({
          where: {
            OR: [
              {
                id: customerId,
              },
              {
                organizationId: customerId,
              },
            ],
          },
        })

        if (!customer) {
          console.warn(`Customer ${customerId} not found`)
          return []
        }

        // 1. Get customer's active subscription with plan details
        const subscription = await prisma.subscription.findFirst({
          where: {
            customerId: customer.id,
            status: {
              in: ['active', 'trialing', 'past_due', 'unpaid'],
            },
          },
          include: {
            price: {
              include: {
                plan: true,
              },
            },
          },
        })

        if (!subscription) {
          console.warn(
            `No active subscription found for customer ${customerId}`,
          )
          return []
        }

        // 2. Get plan features from metadata
        const metadata = subscription.price.plan.metadata as PlanMetadata
        if (!metadata?.features || !Array.isArray(metadata.features)) {
          console.warn(
            `No features found in plan metadata for subscription ${subscription.id}`,
          )
          return []
        }

        // 3. Create usage array and process each feature
        const usage: Usage[] = []
        const now = new Date()

        for (const feature of metadata.features) {
          // Skip disabled features
          if (!feature.enabled || !feature.limit) continue

          // Calculate reset dates based on cycle
          let lastReset = new Date()
          let nextReset = new Date()

          switch (feature.cycle) {
            case 'day':
              lastReset.setHours(0, 0, 0, 0)
              nextReset = new Date(lastReset)
              nextReset.setDate(nextReset.getDate() + 1)
              break
            case 'week':
              lastReset.setDate(lastReset.getDate() - lastReset.getDay())
              lastReset.setHours(0, 0, 0, 0)
              nextReset = new Date(lastReset)
              nextReset.setDate(nextReset.getDate() + 7)
              break
            case 'month':
              lastReset.setDate(1)
              lastReset.setHours(0, 0, 0, 0)
              nextReset = new Date(lastReset)
              nextReset.setMonth(nextReset.getMonth() + 1)
              break
            case 'year':
              lastReset = new Date(now.getFullYear(), 0, 1)
              nextReset = new Date(now.getFullYear() + 1, 0, 1)
              break
            default:
              lastReset = new Date(0)
              nextReset = new Date(8640000000000000)
          }

          try {
            // Get actual usage count from database if table is specified
            let usageCount = 0

            if (feature.table) {
              const model = String.toCamelCase(feature.table)

              // Verify if the table exists in the Prisma client
              if (!model || !(prisma as any)[model]) {
                console.warn(`Table ${model} not found in Prisma client`)
                continue
              }

              // Get the count using dynamic table access
              usageCount = await (prisma as any)[model].count({
                where: {
                  organizationId: customer.organizationId,
                },
              })
            }

            usage.push({
              slug: feature.slug,
              name: feature.name,
              description: feature.description,
              limit: feature.limit,
              usage: usageCount,
              cycle: feature.cycle || 'month',
              lastReset,
              nextReset,
            })
          } catch (error) {
            console.error(
              `Error getting usage for feature ${feature.slug}:`,
              error,
            )
            // Add feature with zero usage to not break the UI
            usage.push({
              slug: feature.slug,
              name: feature.name,
              description: feature.description,
              limit: feature.limit,
              usage: 0,
              cycle: feature.cycle || 'month',
              lastReset,
              nextReset,
            })
          }
        }

        return usage
      } catch (error) {
        console.error('Error in getCustomerUsageByRefId:', error)
        throw new Error(
          `Failed to get customer usage: ${(error as Error).message}`,
        )
      }
    }

    return {
      // Customer Management
      async createCustomer(params: CustomerDTO): Promise<Customer> {
        if (!params.referenceId) {
          throw new Error('referenceId é obrigatório')
        }
        const newCustomer = await prisma.customer.create({
          data: {
            providerId: params.providerId as string,
            name: params.name,
            email: params.email,
            metadata: params.metadata,
            organizationId: params.referenceId,
          },
        })
        return mapCustomer(newCustomer)
      },

      async updateCustomer(
        customerId: string,
        params: Partial<CustomerDTO>,
      ): Promise<Customer> {
        const updatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: {
            ...(params.providerId && { providerId: params.providerId }),
            ...(params.name && { name: params.name }),
            ...(params.email && { email: params.email }),
            ...(params.metadata !== undefined
              ? { metadata: params.metadata }
              : {}),
          },
        })
        return mapCustomer(updatedCustomer)
      },

      async deleteCustomer(customerId: string): Promise<void> {
        await prisma.customer.delete({
          where: { id: customerId },
        })
      },

      async listCustomers(
        search: DatabaseAdapterQueryParams<Customer>,
      ): Promise<Customer[]> {
        const where = search?.where ? search.where : {}
        const orderBy = search?.orderBy
          ? { [search.orderBy]: search.orderDirection }
          : {}
        const limit = search?.limit || 10
        const offset = search?.offset || 0

        const result = await prisma.customer.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset,
        })

        return result as Customer[]
      },

      async getPlanById(planId: string): Promise<Plan | null> {
        const plan = await prisma.plan.findUnique({
          where: {
            id: planId,
          },
          include: {
            prices: true,
          },
        })

        return plan as Plan | null
      },

      async getPriceById(priceId: string): Promise<Price | null> {
        const price = await prisma.price.findFirst({
          where: {
            OR: [
              {
                id: priceId,
              },
              {
                providerId: priceId,
              },
            ],
          },
        })

        return price as Price | null
      },

      async getCustomerById(customerRefId: string): Promise<Customer | null> {
        const result = await prisma.customer.findFirst({
          where: {
            OR: [
              {
                id: customerRefId,
              },
              {
                organizationId: customerRefId,
              },
              {
                providerId: customerRefId,
              },
            ],
          },
          include: {
            subscriptions: {
              where: {
                status: {
                  in: ['active', 'trialing', 'past_due', 'unpaid'],
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                price: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        })

        if (!result) return null

        const usage = await getCustomerUsageByRefId(result.id)

        return {
          id: result.id,
          providerId: result.providerId,
          organizationId: result.organizationId,
          name: result.name,
          email: result.email as string,
          metadata: result.metadata as Record<string, any>,
          subscription: result.subscriptions[0] && {
            id: result.subscriptions[0].id,
            status: result.subscriptions[0].status,
            trialDays: result.subscriptions[0].trialDays,
            providerId: result.subscriptions[0].providerId,

            usage,

            plan: {
              id: result.subscriptions[0].price.plan.id,
              providerId: result.subscriptions[0].price.plan.providerId,
              name: result.subscriptions[0].price.plan.name,
              slug: result.subscriptions[0].price.plan.slug,
              description: result.subscriptions[0].price.plan
                .description as string,
              metadata: result.subscriptions[0].price.plan
                .metadata as PlanMetadata,
              price: {
                id: result.subscriptions[0].price.id,
                providerId: result.subscriptions[0].price.providerId,
                amount: result.subscriptions[0].price.amount,
                currency: result.subscriptions[0].price.currency,
                interval: result.subscriptions[0].price.interval as CyclePeriod,
                slug: result.subscriptions[0].price.slug,
              },
            },

            createdAt: result.subscriptions[0].createdAt,
            updatedAt: result.subscriptions[0].updatedAt,
          },
        }
      },

      async createPrice(params: PriceDTO): Promise<Price> {
        const createdPrice = await prisma.price.create({
          data: {
            providerId: params.providerId as string,
            planId: params.planId,
            slug: params.slug,
            amount: params.amount,
            currency: params.currency,
            interval: params.interval,
            intervalCount: params.intervalCount,
            metadata: params.metadata,
          },
        })

        return {
          id: createdPrice.id,
          providerId: createdPrice.providerId,
          planId: createdPrice.planId,
          slug: createdPrice.slug,
          amount: createdPrice.amount,
          currency: createdPrice.currency,
          interval: createdPrice.interval as CyclePeriod,
          intervalCount: createdPrice.intervalCount,
          metadata: createdPrice.metadata as Record<string, any> | undefined,
          active: true,
          createdAt: createdPrice.createdAt,
          updatedAt: createdPrice.updatedAt,
        }
      },

      async getCustomerActiveSubscription(
        customerId: string,
      ): Promise<Subscription | null> {
        const subscription = await prisma.subscription.findFirst({
          where: {
            customer: {
              organizationId: customerId,
            },
            status: 'active',
          },
        })

        return subscription as Subscription | null
      },

      // Plans and Prices
      async createPlan(options: PlanDTO): Promise<Plan> {
        const plan = await prisma.plan.create({
          data: {
            slug: options.slug,
            providerId: options.providerId as string,
            name: options.name,
            description: options.description,
            metadata: options.metadata,
            prices: {
              create: options.prices.map((price) => ({
                slug: price.slug,
                providerId: price.providerId as string,
                amount: price.amount,
                currency: price.currency,
                interval: price.interval,
                intervalCount: price.intervalCount,
                metadata: price.metadata,
              })),
            },
          },
          include: {
            prices: true,
          },
        })

        return plan as Plan
      },

      async updatePlan(params: Partial<PlanDTO>): Promise<Plan> {
        const plan = await prisma.plan.update({
          where: {
            slug: params.slug,
          },
          data: {
            name: params.name,
            description: params.description,
            metadata: params.metadata,
            providerId: params.providerId as string,
          },
        })

        return plan as Plan
      },

      async upsertPlan(options: PlanDTO): Promise<Plan> {
        // Verificar se o plano já existe pelo slug
        const existingPlan = await prisma.plan.findFirst({
          where: {
            slug: options.slug,
          },
        })

        if (existingPlan) {
          // Atualizar o plano existente
          await prisma.plan.update({
            where: { id: existingPlan.id },
            data: {
              name: options.name,
              description: options.description,
              metadata: options.metadata,
              providerId: options.providerId as string,
            },
          })

          // Remover preços existentes
          await prisma.price.deleteMany({
            where: { planId: existingPlan.id },
          })

          // Criar novos preços
          await prisma.price.createMany({
            data: options.prices.map((price) => ({
              slug: price.slug,
              providerId: price.providerId as string,
              planId: existingPlan.id,
              amount: price.amount,
              currency: price.currency,
              interval: price.interval,
              intervalCount: price.intervalCount,
              metadata: price.metadata,
            })),
          })

          // Buscar o plano atualizado com os preços
          const updatedPlan = await prisma.plan.findUnique({
            where: { id: existingPlan.id },
            include: {
              prices: true,
            },
          })

          return updatedPlan as Plan
        } else {
          // Criar um novo plano
          const plan = await prisma.plan.create({
            data: {
              slug: options.slug,
              providerId: options.providerId as string,
              name: options.name,
              description: options.description,
              metadata: options.metadata,
              prices: {
                create: options.prices.map((price) => ({
                  slug: price.slug,
                  providerId: price.providerId as string,
                  amount: price.amount,
                  currency: price.currency,
                  interval: price.interval,
                  intervalCount: price.intervalCount,
                  metadata: price.metadata,
                })),
              },
            },
            include: {
              prices: true,
            },
          })

          return plan as Plan
        }
      },

      async archivePlan(planId: string): Promise<void> {
        await prisma.plan.update({
          where: { id: planId },
          data: { archived: true },
        })
      },

      async listPlans(
        search: DatabaseAdapterQueryParams<Plan>,
      ): Promise<Plan[]> {
        const where = search?.where ? search.where : {}
        const orderBy = search?.orderBy
          ? { [search.orderBy]: search.orderDirection }
          : {}
        const limit = search?.limit || 10
        const offset = search?.offset || 0

        const result = await prisma.plan.findMany({
          where: where as any,
          orderBy,
          take: limit,
          skip: offset,
          include: {
            prices: true,
          },
        })

        return result as Plan[]
      },

      async findPlanBySlug(slug: string): Promise<Plan | null> {
        const plan = await prisma.plan.findFirst({
          where: {
            slug,
          },
          include: {
            prices: true,
          },
        })

        return plan as Plan | null
      },

      async getPlanByProviderId(providerId: string): Promise<Plan | null> {
        const plan = await prisma.plan.findFirst({
          where: { providerId },
          include: { prices: true },
        })
        return plan as Plan | null
      },

      async getPlanBySlug(slug: string): Promise<Plan | null> {
        const plan = await prisma.plan.findFirst({
          where: { slug },
          include: { prices: true },
        })
        return plan as Plan | null
      },

      async updatePrice(
        priceId: string,
        params: Partial<PriceDTO>,
      ): Promise<Price> {
        const updatedPrice = await prisma.price.update({
          where: { id: priceId },
          data: {
            ...(params.currency && { currency: params.currency }),
            ...(params.amount && { amount: params.amount }),
            ...(params.interval && { interval: params.interval }),
            ...(params.intervalCount && {
              intervalCount: params.intervalCount,
            }),
            ...(params.metadata && { metadata: params.metadata }),
          },
        })

        return {
          id: updatedPrice.id,
          providerId: updatedPrice.providerId,
          planId: updatedPrice.planId,
          slug: updatedPrice.slug,
          amount: updatedPrice.amount,
          currency: updatedPrice.currency,
          interval: updatedPrice.interval as CyclePeriod,
          intervalCount: updatedPrice.intervalCount,
          metadata: updatedPrice.metadata as Record<string, any> | undefined,
          active: true, // Default to true since Prisma schema doesn't have this field
          createdAt: updatedPrice.createdAt,
          updatedAt: updatedPrice.updatedAt,
        }
      },

      async deletePrice(priceId: string): Promise<void> {
        await prisma.price.delete({
          where: { id: priceId },
        })
      },

      // Subscriptions
      async createSubscription(params: SubscriptionDTO): Promise<Subscription> {
        const subscription = await prisma.subscription.create({
          data: {
            providerId: params.providerId as string,
            customerId: params.customerId,
            priceId: params.priceId,
            quantity: params.quantity,
            trialDays: params.trialDays,
            status: params.status as any,
            metadata: params.metadata,
            billingCycleAnchor: params.billingCycleAnchor,
            prorationBehavior: params.prorationBehavior,
          },
        })
        return subscription as Subscription
      },

      async getSubscriptionById(
        subscriptionId: string,
      ): Promise<Subscription | null> {
        const subscription = await prisma.subscription.findFirst({
          where: {
            OR: [
              {
                id: subscriptionId,
              },
              {
                providerId: subscriptionId,
              },
            ],
          },
          include: {
            price: {
              include: {
                plan: true,
              },
            },
          },
        })

        return subscription as Subscription | null
      },

      async updateSubscription(
        subscriptionId: string,
        params: Partial<SubscriptionDTO>,
      ): Promise<Subscription> {
        const subscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            quantity: params?.quantity,
            trialDays: params?.trialDays,
            billingCycleAnchor: params?.billingCycleAnchor,
            prorationBehavior: params?.prorationBehavior,
            metadata: params?.metadata,
            priceId: params?.priceId,
            status: params?.status,
          },
        })

        return {
          id: subscription.id,
          customerId: subscription.customerId,
          providerId: subscription.providerId,
          priceId: subscription.priceId,
          quantity: subscription.quantity || undefined,
          trialDays: subscription.trialDays || undefined,
          status: subscription.status as
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'unpaid'
            | 'trialing',
          metadata: subscription.metadata as Record<string, any> | undefined,
          billingCycleAnchor: subscription.billingCycleAnchor || undefined,
          prorationBehavior: subscription.prorationBehavior as
            | 'create_prorations'
            | 'none'
            | undefined,
        }
      },

      async cancelSubscription(subscriptionId: string): Promise<void> {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'canceled',
          },
        })
      },

      async listSubscriptions(
        search: DatabaseAdapterQueryParams<Subscription>,
      ): Promise<Subscription[]> {
        const where = search?.where ? search.where : {}
        const orderBy = search?.orderBy
          ? { [search.orderBy]: search.orderDirection }
          : {}
        const limit = search?.limit || 10
        const offset = search?.offset || 0

        const result = await prisma.subscription.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset,
        })

        return result as Subscription[]
      },

      async getCustomerUsage(params: {
        customerId: string
        feature: string
      }): Promise<number> {
        const usage = await getCustomerUsageByRefId(params.customerId)

        // Find the specific feature usage
        const featureUsage = usage.find((u) => u.slug === params.feature)

        return featureUsage?.usage || 0
      },
    }
  },
)
