import { Igniter } from '@igniter-js/core'
import { createIgniterAppContext } from './igniter.context'
import { store } from './services/store'
import { registeredJobs } from './services/jobs'
import { logger } from './services/logger'
import { AppConfig } from './config/boilerplate.config.client'

/**
 * @description Initialize the Igniter Router
 * @see https://igniter.felipebarcelospro.github.io/docs/getting-started/installation
 */
export const igniter = Igniter.context(createIgniterAppContext)
  .store(store)
  .jobs(registeredJobs)
  .logger(logger)
  .config({
    baseURL: process.env.NEXT_PUBLIC_IGNITER_API_URL || 'http://localhost:3000',
    basePATH: process.env.NEXT_PUBLIC_IGNITER_API_BASE_PATH || '/api/v1',
  })
  .docs({
    openapi: require('./docs/openapi.json'),
    info: {
      title: AppConfig.name,
      version: '1.0.0',
      description: `API documentation for the ${AppConfig.name}.`,
      termsOfService: AppConfig.links.terms,
      contact: {
        name: `${AppConfig.name} Team`,
        email: AppConfig.links.mail,
        url: AppConfig.links.support,
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/license/mit/',
      },
    },
    playground: {
      enabled: true,
      security: async () => {
        return true
      },
    },
    securitySchemes: {
      token: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your token',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
      },
    },
  })
  .create()
