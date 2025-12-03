import { z } from 'zod'
import { igniter } from '@/igniter'
import { WebhookFeatureProcedure } from '../procedures/webhook.procedure'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'

/**
 * @controller WebhookController
 * @description Controller for managing webhook configurations and event handling.
 *
 * This controller provides comprehensive webhook management capabilities including
 * webhook creation, configuration, event subscription, and real-time notification
 * delivery. It enables organizations to receive real-time updates about system
 * events through configurable HTTP endpoints.
 *
 * The controller supports webhook security through secret validation, event filtering,
 * and organization-scoped access control. It's designed for building integrations
 * and real-time notification systems.
 *
 * @example
 * ```typescript
 * // Create a new webhook
 * const webhook = await api.webhook.create.mutate({
 *   url: 'https://example.com/webhook',
 *   secret: 'webhook-secret',
 *   events: ['lead.created', 'submission.created']
 * })
 *
 * // List organization webhooks
 * const webhooks = await api.webhook.findMany.query()
 *
 * // Get available events
 * const events = await api.webhook.listEvents.query()
 * ```
 */
export const WebhookController = igniter.controller({
  name: 'Webhook',
  description:
    'Comprehensive webhook management with event subscription and real-time notifications',
  path: '/webhook',
  actions: {
    /**
     * @action findMany
     * @description Lists all webhooks for the authenticated user's organization.
     *
     * This endpoint returns all webhook configurations associated with the current
     * organization, including their URLs, subscribed events, and status information.
     *
     * @returns {Webhook[]} Array of webhook configurations
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @example
     * ```typescript
     * const webhooks = await api.webhook.findMany.query()
     * ```
     */
    findMany: igniter.query({
      name: 'listWebhooks',
      description: 'List all organization webhooks with configuration details',
      method: 'GET',
      path: '/',
      use: [WebhookFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Verify user has admin/owner permissions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Retrieve all webhooks for the organization
        const result = await context.webhook.findManyByOrganizationId(
          session.organization.id,
        )

        // Response: Return webhook list with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action findOne
     * @description Retrieves a specific webhook by ID for the authenticated user's organization.
     *
     * This endpoint fetches a single webhook configuration including its URL,
     * secret, subscribed events, and other configuration details.
     *
     * @param {string} id - The unique identifier of the webhook to retrieve
     * @returns {Webhook} The webhook configuration object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When webhook is not found
     * @example
     * ```typescript
     * const webhook = await api.webhook.findOne.query({ id: 'webhook_123' })
     * ```
     */
    findOne: igniter.query({
      name: 'getWebhook',
      description: 'Get specific webhook configuration by ID',
      method: 'GET',
      path: '/:id' as const,
      use: [WebhookFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has admin/owner permissions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Retrieve the specific webhook for the organization
        const result = await context.webhook.findOne({
          id: request.params.id,
          organizationId: session.organization.id,
        })

        // Response: Return webhook configuration with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action create
     * @description Creates a new webhook configuration for the authenticated user's organization.
     *
     * This endpoint creates a new webhook with the specified URL, secret, and
     * event subscriptions. The webhook will receive real-time notifications
     * for the subscribed events.
     *
     * @param {string} url - The webhook endpoint URL to receive notifications
     * @param {string} secret - Secret key for webhook signature validation
     * @param {string[]} events - Array of event types to subscribe to
     * @returns {Webhook} The newly created webhook configuration
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {400} When webhook data validation fails
     * @example
     * ```typescript
     * const webhook = await api.webhook.create.mutate({
     *   url: 'https://example.com/webhook',
     *   secret: 'webhook-secret-key',
     *   events: ['lead.created', 'submission.created']
     * })
     * ```
     */
    create: igniter.mutation({
      name: 'createWebhook',
      description: 'Create new webhook configuration with event subscriptions',
      method: 'POST',
      path: '/',
      use: [WebhookFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        url: z.string(),
        secret: z.string(),
        events: z.array(z.string()),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has admin/owner permissions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Create the webhook configuration in the database
        const result = await context.webhook.create({
          ...request.body,
          organizationId: session.organization.id,
        })

        // Response: Return the created webhook with a 201 status
        return response.created(result)
      },
    }),

    /**
     * @action update
     * @description Updates an existing webhook configuration for the authenticated user's organization.
     *
     * This endpoint allows modification of webhook properties including URL,
     * secret, and event subscriptions. All fields are optional for partial updates.
     *
     * @param {string} id - The unique identifier of the webhook to update
     * @param {string} [url] - New webhook endpoint URL
     * @param {string} [secret] - New secret key for signature validation
     * @param {string[]} [events] - New array of subscribed event types
     * @returns {Webhook} The updated webhook configuration
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When webhook is not found
     * @example
     * ```typescript
     * const updated = await api.webhook.update.mutate({
     *   id: 'webhook_123',
     *   url: 'https://new-endpoint.com/webhook',
     *   events: ['lead.updated', 'submission.updated']
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'updateWebhook',
      description:
        'Update existing webhook configuration and event subscriptions',
      method: 'PUT',
      path: '/:id' as const,
      use: [WebhookFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        url: z.string().optional(),
        secret: z.string().optional(),
        events: z.array(z.string()).optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has admin/owner permissions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Update the webhook configuration in the database
        const result = await context.webhook.update({
          ...request.params,
          ...request.body,
          organizationId: session.organization.id,
        })

        // Response: Return the updated webhook with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Deletes a webhook configuration for the authenticated user's organization.
     *
     * This endpoint permanently removes a webhook configuration, stopping all
     * event notifications to that endpoint.
     *
     * @param {string} id - The unique identifier of the webhook to delete
     * @returns {{ message: string }} Confirmation of successful deletion
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When webhook is not found
     * @example
     * ```typescript
     * await api.webhook.delete.mutate({ id: 'webhook_123' })
     * // Returns: { message: 'Webhook deleted successfully' }
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteWebhook',
      description: 'Delete webhook configuration and stop event notifications',
      method: 'DELETE',
      path: '/:id' as const,
      use: [WebhookFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has admin/owner permissions
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Delete the webhook configuration from the database
        await context.webhook.delete({
          ...request.params,
          organizationId: session.organization.id,
        })

        // Response: Return confirmation message with a 200 status
        return response.success({ message: 'Webhook deleted successfully' })
      },
    }),

    /**
     * @action listEvents
     * @description Lists all available webhook events that can be subscribed to.
     *
     * This endpoint returns a comprehensive list of system events that can be
     * used for webhook subscriptions, helping users understand what events
     * are available for real-time notifications.
     *
     * @returns {string[]} Array of available event names
     * @throws {401} When user is not authenticated
     * @example
     * ```typescript
     * const events = await api.webhook.listEvents.query()
     * // Returns: ['lead.created', 'lead.updated', 'submission.created', ...]
     * ```
     */
    listEvents: igniter.query({
      name: 'listEvents',
      description: 'List all available webhook events for subscription',
      method: 'GET',
      path: '/events',
      use: [WebhookFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Business Logic: Retrieve all available webhook events
        const result = await context.webhook.listEvents()

        // Response: Return events list with a 200 status
        return response.success(result)
      },
    }),
  },
})
