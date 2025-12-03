import { igniter } from '@/igniter'
import type {
  Webhook,
  CreateWebhookDTO,
  UpdateWebhookDTO,
} from '../webhook.interface'
import { IgniterEvent } from '../../../../@saas-boilerplate/utils/igniter-events'
import { AppRouterSchema } from '@/igniter.schema'

/**
 * @procedure WebhookFeatureProcedure
 * @description Procedure for managing webhook endpoints and event delivery.
 *
 * This procedure provides the business logic layer for webhook management,
 * handling the complete lifecycle of webhook endpoints including creation,
 * updates, deletion, and event delivery. It ensures proper data isolation
 * by enforcing organization-scoped operations and manages webhook authentication
 * with secure secret handling.
 *
 * The procedure injects webhook management methods into the Igniter context,
 * making them available to controllers and other parts of the application.
 * It integrates with the Igniter.js event system to provide real-time
 * webhook delivery for application events.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const webhooks = await context.webhook.findManyByOrganizationId('org_123')
 * const newWebhook = await context.webhook.create({
 *   url: 'https://example.com/webhook',
 *   events: ['lead.created', 'submission.created'],
 *   secret: 'webhook-secret',
 *   organizationId: 'org_123'
 * })
 * await context.webhook.delete('webhook_456', 'org_123')
 * ```
 */
export const WebhookFeatureProcedure = igniter.procedure({
  name: 'WebhookFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      webhook: {
        findManyByOrganizationId: async (
          organizationId: string,
        ): Promise<Webhook[]> => {
          return context.services.database.webhook.findMany({
            where: {
              organizationId,
            },
          })
        },

        findOne: async (params: {
          id: string
          organizationId?: string
        }): Promise<Webhook | null> => {
          return context.services.database.webhook.findUnique({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })
        },

        create: async (input: CreateWebhookDTO): Promise<Webhook> => {
          return context.services.database.webhook.create({
            data: {
              url: input.url,
              secret: input.secret,
              events: input.events,
              organizationId: input.organizationId,
            },
          })
        },

        update: async (params: UpdateWebhookDTO): Promise<Webhook> => {
          const webhook = await context.services.database.webhook.findUnique({
            where: { id: params.id },
          })

          if (!webhook) throw new Error('Webhook not found')

          return context.services.database.webhook.update({
            where: { id: params.id },
            data: {
              url: params.url,
              secret: params.secret,
              events: params.events,
            },
          })
        },

        delete: async (params: {
          id: string
          organizationId?: string
        }): Promise<{ id: string }> => {
          await context.services.database.webhook.delete({
            where: { id: params.id, organizationId: params.organizationId },
          })

          return { id: params.id }
        },

        /**
         * @method listEvents
         * @description Lists all available Igniter.js API events for webhook subscription.
         * This method leverages the `listIgniterEvents` utility to provide a type-safe
         * and human-readable list of all `controller.action` combinations available
         * in the application's API schema.
         * @returns {IgniterEvent[]} An array of `IgniterEvent` objects, each representing an available API endpoint.
         */
        listEvents: async (): Promise<IgniterEvent[]> => {
          const events: IgniterEvent[] = []

          for (const controllerName in AppRouterSchema.controllers) {
            // @ts-expect-error
            const controller = AppRouterSchema.controllers[controllerName]

            if (
              controller &&
              'actions' in controller &&
              typeof controller.actions === 'object'
            ) {
              for (const actionName in controller.actions) {
                const action = controller.actions[actionName]

                if (
                  action &&
                  'name' in action &&
                  typeof action.name === 'string'
                ) {
                  const value = `${controllerName}.${actionName}`
                  const label = `${controller.name} - ${action.name}`
                  events.push({ value, label })
                }
              }
            }
          }

          return events
        },

        dispatch: async (params: {
          event: string
          organizationId: string
          payload: any
        }) => {
          const webhooks = await context.services.database.webhook.findMany({
            where: {
              organizationId: params.organizationId,
            },
          })

          for (const webhook of webhooks) {
            if (webhook.events.includes(params.event)) {
              await igniter.jobs.webhook.schedule({
                task: 'dispatch',
                input: {
                  webhook: {
                    id: webhook.id,
                    url: webhook.url,
                    secret: webhook.secret,
                    events: webhook.events,
                  },
                  payload: params.payload,
                  eventName: params.event,
                },
              })
            }
          }
        },
      },
    }
  },
})
