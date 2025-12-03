import { isServer } from '@igniter-js/core'
import { cache } from 'react'

const getServices = cache(async () => {
  const { prisma } = await import('./services/prisma')
  const { plugins } = await import('./services/plugin-manager')
  const { mail } = await import('./services/mail')
  const { payment } = await import('./services/payment')
  const { auth } = await import('./services/auth')
  const { logger } = await import('./services/logger')
  const { notification } = await import('./services/notification')

  return {
    auth,
    database: prisma,
    mail,
    payment,
    plugins,
    logger,
    notification,
  }
})

type Services = Awaited<ReturnType<typeof getServices>>

export const createIgniterAppContext = cache(async () => {
  return {
    services: isServer ? await getServices() : ({} as Services),
  }
})

/**
 * @description The context of the application
 * @see https://igniter.felipebarcelospro.github.io/docs/getting-started/installation
 */
export type IgniterAppContext = Awaited<
  ReturnType<typeof createIgniterAppContext>
>
