import { prismaAdapter } from '@/@saas-boilerplate/providers/payment/databases/prisma'
import { stripeAdapter } from '@/@saas-boilerplate/providers/payment/providers/stripe.adapter'
import { prisma } from './prisma'
import { PaymentProvider } from '@/@saas-boilerplate/providers/payment'
import { AppConfig } from '@/config/boilerplate.config.server'

const { keys, paths, subscription } = AppConfig.providers.billing

export const payment = PaymentProvider.initialize({
  database: prismaAdapter(prisma),
  adapter: stripeAdapter(keys),
  paths: {
    checkoutCancelUrl: paths.checkoutCancelUrl,
    checkoutSuccessUrl: paths.checkoutSuccessUrl,
    portalReturnUrl: paths.portalReturnUrl,
    endSubscriptionUrl: paths.endSubscriptionUrl,
  },
  subscriptions: {
    enabled: subscription.enabled,
    trial: {
      enabled: subscription.trial.enabled,
      duration: subscription.trial.duration,
    },
    plans: {
      default: subscription.plans.default,
      options: [...subscription.plans.options] as any,
    },
  },
  events: {},
})
