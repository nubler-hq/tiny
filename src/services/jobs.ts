import { createBullMQAdapter } from '@igniter-js/adapter-bullmq'
import { store } from './store'
import { z } from 'zod'
import { igniter } from '@/igniter'
import { AppConfig } from '@/config/boilerplate.config.client'

/**
 * Job queue adapter for background processing
 * @description Handles asynchronous job processing with BullMQ
 */
export const jobs = createBullMQAdapter({
  store,
  autoStartWorker: {
    concurrency: 1,
    debug: true,
  },
})

export const registeredJobs = jobs.merge({
  webhook: jobs.router({
    namespace: 'webhook',
    jobs: {
      dispatch: jobs.register({
        name: 'dispatch',
        input: z.object({
          webhook: z.object({
            id: z.string(),
            url: z.string().url(),
            secret: z.string(),
            events: z.array(z.string()),
          }),
          payload: z.record(z.string(), z.any()), // Dynamic payload for the webhook
          eventName: z.string(), // The specific event that triggered the webhook
          retries: z.number().default(0), // Number of retry attempts
        }),
        handler: async ({ input }) => {
          // Business Logic: Attempt to dispatch the webhook
          try {
            igniter.logger.info(
              `Dispatching webhook ${input.webhook.id} for event ${input.eventName} to ${input.webhook.url}`,
            )

            const response = await fetch(input.webhook.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-App-Name': AppConfig.name,
                'X-Webhook-Secret': input.webhook.secret,
                'X-Event-Name': input.eventName,
              },
              body: JSON.stringify(input.payload),
            })

            if (!response.ok) {
              // Observation: Webhook dispatch failed, throw an error to trigger retry
              const errorText = await response.text()
              throw new Error(
                `Webhook dispatch failed with status ${response.status}: ${errorText}`,
              )
            }

            igniter.logger.info(
              `Webhook ${input.webhook.id} dispatched successfully for event ${input.eventName}`,
            )
          } catch (error: any) {
            igniter.logger.error(
              `Failed to dispatch webhook ${input.webhook.id} for event ${input.eventName}: ${error.message}`,
            )

            throw error
          }
        },
      }),
    },
  }),
})
