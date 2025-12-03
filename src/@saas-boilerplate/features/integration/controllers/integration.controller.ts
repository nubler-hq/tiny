import { z } from 'zod'
import { igniter } from '@/igniter'
import { IntegrationFeatureProcedure } from '../procedures/integration.procedure'
import { AuthFeatureProcedure } from '../../auth/procedures/auth.procedure'

/**
 * @controller IntegrationController
 * @description Controller for managing third-party integrations and plugins.
 *
 * This controller provides comprehensive integration management capabilities including
 * installation, configuration, updates, and removal of third-party services and plugins.
 * It enables organizations to extend functionality through external integrations.
 *
 * The controller supports integration lifecycle management, configuration updates,
 * and organization-scoped access control for secure integration management.
 *
 * @example
 * ```typescript
 * // List available integrations
 * const integrations = await api.integration.findMany.query()
 *
 * // Install an integration
 * await api.integration.install.mutate({
 *   slug: 'stripe',
 *   metadata: { apiKey: 'sk_test_...' }
 * })
 * ```
 */
export const IntegrationController = igniter.controller({
  name: 'Integration',
  description:
    'Third-party integration management with installation, configuration, and lifecycle control',
  path: '/integrations',
  actions: {
    /**
     * @action findMany
     * @description Lists all available integrations for the organization.
     *
     * This endpoint returns all integrations available to the organization,
     * including their installation status and configuration details.
     *
     * @returns {Integration[]} Array of integration objects
     * @throws {401} When user is not authenticated
     * @example
     * ```typescript
     * const integrations = await api.integration.findMany.query()
     * ```
     */
    findMany: igniter.query({
      name: 'listIntegrations',
      description: 'List available integrations',
      method: 'GET',
      path: '/',
      use: [IntegrationFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Verify user has access to organization integrations
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin', 'member'],
        })

        // Business Logic: Retrieve all integrations for the organization
        const result = await context.integration.findMany({
          organizationId: session?.organization.id,
        })

        // Response: Return integrations list with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action findOne
     * @description Retrieves a specific integration by slug for the organization.
     *
     * This endpoint fetches detailed information about a specific integration
     * including its configuration and installation status.
     *
     * @param {string} slug - The integration slug identifier
     * @returns {Integration} The integration object
     * @throws {401} When user is not authenticated
     * @throws {404} When integration is not found
     * @example
     * ```typescript
     * const integration = await api.integration.findOne.query({ slug: 'stripe' })
     * ```
     */
    findOne: igniter.query({
      name: 'getIntegration',
      description: 'Get integration by ID',
      method: 'GET',
      path: '/:slug' as const,
      use: [IntegrationFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has access to organization integrations
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin', 'member'],
        })

        // Business Logic: Retrieve the specific integration for the organization
        const result = await context.integration.findOne(
          request.params.slug,
          session.organization.id,
        )

        // Response: Return integration details with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action install
     * @description Installs a new integration for the organization.
     *
     * This endpoint installs a specific integration with the provided
     * configuration metadata for the organization.
     *
     * @param {string} slug - The integration slug to install
     * @param {Record<string, any>} metadata - Integration configuration data
     * @returns {Integration} The installed integration object
     * @throws {401} When user is not authenticated
     * @throws {400} When installation fails or metadata is invalid
     * @example
     * ```typescript
     * const integration = await api.integration.install.mutate({
     *   slug: 'stripe',
     *   metadata: { apiKey: 'sk_test_...', webhookSecret: 'whsec_...' }
     * })
     * ```
     */
    install: igniter.mutation({
      name: 'installIntegration',
      description: 'Install integration',
      method: 'POST',
      path: '/:slug/install' as const,
      use: [IntegrationFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        metadata: z.any(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has access to install integrations
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin', 'member'],
        })

        // Business Logic: Install the integration with provided metadata
        const result = await context.integration.install({
          organizationId: session.organization.id,
          integrationSlug: request.params.slug,
          metadata: request.body.metadata,
        })

        // Response: Return the installed integration with a 201 status
        return response.created(result)
      },
    }),

    /**
     * @action update
     * @description Updates an existing integration's configuration.
     *
     * This endpoint allows modification of integration metadata and enables/disables
     * the integration for the organization.
     *
     * @param {string} slug - The integration slug to update
     * @param {Record<string, any>} [metadata] - Updated configuration metadata
     * @param {boolean} [enabled] - Whether to enable or disable the integration
     * @returns {Integration} The updated integration object
     * @throws {401} When user is not authenticated
     * @throws {404} When integration is not found
     * @example
     * ```typescript
     * const updated = await api.integration.update.mutate({
     *   slug: 'stripe',
     *   metadata: { apiKey: 'sk_live_...' },
     *   enabled: true
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'updateIntegration',
      description: 'Update integration config',
      method: 'PUT',
      path: '/:slug' as const,
      use: [IntegrationFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        metadata: z.any(),
        enabled: z.boolean().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has access to update integrations
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin', 'member'],
        })

        // Business Logic: Update the integration configuration
        const result = await context.integration.update({
          integrationSlug: request.params.slug,
          organizationId: session.organization.id,
          metadata: request.body.metadata,
          enabled: request.body.enabled,
        })

        // Response: Return the updated integration with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Uninstalls an integration from the organization.
     *
     * This endpoint removes an integration from the organization, cleaning up
     * all associated configuration and data.
     *
     * @param {string} slug - The integration slug to uninstall
     * @returns {null} No content on successful uninstallation
     * @throws {401} When user is not authenticated
     * @throws {404} When integration is not found
     * @example
     * ```typescript
     * await api.integration.delete.mutate({ slug: 'stripe' })
     * // Returns: null
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteIntegration',
      description: 'Remove integration',
      method: 'DELETE',
      path: '/:slug/uninstall' as const,
      use: [IntegrationFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Verify user has access to uninstall integrations
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin', 'member'],
        })

        // Business Logic: Uninstall the integration from the organization
        await context.integration.uninstall(
          session.organization.id,
          request.params.slug,
        )

        // Response: Return success with null content
        return response.success(null)
      },
    }),
  },
})
