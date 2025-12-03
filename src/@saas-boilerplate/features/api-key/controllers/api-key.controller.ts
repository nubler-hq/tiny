import { z } from 'zod'
import { igniter } from '@/igniter'
import { ApiKeyFeatureProcedure } from '../procedures/api-key.procedure'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { NotificationProcedure } from '../../notification/procedures/notification.procedure'

/**
 * @controller ApiKeyController
 * @description Controller for managing API keys for programmatic access to organization resources.
 *
 * This controller provides API endpoints for managing API keys that allow programmatic
 * access to organization resources. It handles the complete lifecycle of API key
 * management including creation, listing, updating, and deletion with proper
 * organization isolation and role-based access control.
 *
 * API keys are used for programmatic access to the API without requiring user
 * authentication, making them essential for integrations and automated systems.
 *
 * @example
 * ```typescript
 * // List all API keys for the organization
 * const apiKeys = await api.apiKey.findManyByOrganization.query()
 *
 * // Create a new API key
 * const newKey = await api.apiKey.create.mutate({
 *   description: 'Integration API Key',
 *   neverExpires: true
 * })
 *
 * // Update an existing API key
 * await api.apiKey.update.mutate({
 *   id: 'key_123',
 *   description: 'Updated description',
 *   enabled: false
 * })
 * ```
 */
export const ApiKeyController = igniter.controller({
  name: 'API Keys',
  description: 'API key management',
  path: '/api-key',
  actions: {
    /**
     * @action findManyByOrganization
     * @description Retrieves all API keys belonging to the authenticated user's organization.
     *
     * This endpoint returns a list of all API keys associated with the current
     * organization. Only users with 'owner' or 'admin' roles can access this endpoint.
     * The response includes key metadata but never exposes the actual key values
     * for security reasons.
     *
     * @returns {ApiKey[]} Array of API key objects (without actual key values)
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @example
     * ```typescript
     * const apiKeys = await api.apiKey.findManyByOrganization.query()
     * // Returns: [{ id: 'key_123', description: 'Integration Key', enabled: true, ... }]
     * ```
     */
    findManyByOrganization: igniter.query({
      name: 'listApiKeys',
      description: 'List organization API keys',
      method: 'GET',
      path: '/',
      use: [ApiKeyFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Retrieve all API keys for the organization
        const result = await context.apikey.findManyByOrganization(
          session.organization.id,
        )

        // Response: Return the list of API keys with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action findOne
     * @description Retrieves a specific API key by its ID within the organization context.
     *
     * This endpoint returns detailed information about a specific API key,
     * including its metadata and status. The actual key value is never returned
     * for security reasons. Only users with 'owner' or 'admin' roles can access this endpoint.
     *
     * @param {string} id - The unique identifier of the API key
     * @returns {ApiKey | null} API key object or null if not found
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When API key is not found or doesn't belong to organization
     * @example
     * ```typescript
     * const apiKey = await api.apiKey.findOne.query({ id: 'key_123' })
     * // Returns: { id: 'key_123', description: 'Integration Key', enabled: true, ... }
     * ```
     */
    findOne: igniter.query({
      name: 'getApiKey',
      description: 'Get API key by ID',
      method: 'GET',
      path: '/:id' as const,
      use: [ApiKeyFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Retrieve the specific API key within organization context
        const result = await context.apikey.findOne({
          id: request.params.id,
          organizationId: session.organization.id,
        })

        // Response: Return the API key details with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action create
     * @description Creates a new API key for programmatic access to organization resources.
     *
     * This endpoint generates a new secure API key with the specified configuration.
     * The key is generated using cryptographically secure random bytes and includes
     * a 'sk_' prefix for identification. A notification is sent to inform about
     * the new API key creation.
     *
     * @param {string} description - Human-readable description for the API key
     * @param {boolean} [enabled] - Whether the key is enabled (defaults to true)
     * @param {boolean} [neverExpires] - Whether the key never expires (defaults to true)
     * @param {Date} [expiresAt] - Expiration date (ignored if neverExpires is true)
     * @returns {ApiKey} The newly created API key object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {400} When validation fails
     * @example
     * ```typescript
     * const newKey = await api.apiKey.create.mutate({
     *   description: 'Integration API Key',
     *   neverExpires: true,
     *   enabled: true
     * })
     * // Returns: { id: 'key_123', key: 'sk_abc123...', description: '...', ... }
     * ```
     */
    create: igniter.mutation({
      name: 'createApiKey',
      description: 'Create new API key',
      method: 'POST',
      path: '/',
      use: [
        ApiKeyFeatureProcedure(),
        AuthFeatureProcedure(),
        NotificationProcedure(),
      ],
      body: z.object({
        description: z.string(),
        enabled: z.boolean().optional().nullable(),
        neverExpires: z.boolean().optional().nullable(),
        expiresAt: z.date().optional().nullable(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Observation: Extract API key configuration from request body
        const { description, neverExpires, expiresAt } = request.body

        // Business Logic: Create a new API key with the specified configuration
        const result = await context.apikey.create({
          description,
          neverExpires: neverExpires ?? true,
          expiresAt,
          organizationId: session.organization.id,
        })

        // Business Logic: Send notification about new API key creation
        await context.services.notification.send({
          type: 'API_KEY_CREATED',
          context: {
            organizationId: session.organization.id,
          },
          data: {
            description: result.description,
            keyPreview: result.key.slice(-4), // Show only last 4 characters for security
          },
        })

        // Response: Return the newly created API key with a 201 status
        return response.created(result)
      },
    }),

    /**
     * @action update
     * @description Updates an existing API key's configuration and status.
     *
     * This endpoint allows modification of API key properties such as description
     * and enabled status. The actual key value cannot be changed for security reasons.
     * Only users with 'owner' or 'admin' roles can update API keys.
     *
     * @param {string} id - The unique identifier of the API key to update
     * @param {string} [description] - New description for the API key
     * @param {boolean} [enabled] - New enabled status for the API key
     * @returns {ApiKey} The updated API key object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When API key is not found or doesn't belong to organization
     * @example
     * ```typescript
     * const updatedKey = await api.apiKey.update.mutate({
     *   id: 'key_123',
     *   description: 'Updated Integration Key',
     *   enabled: false
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'updateApiKey',
      description: 'Update existing API key',
      method: 'PUT',
      path: '/:id' as const,
      use: [ApiKeyFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        description: z.string().optional(),
        enabled: z.boolean().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Observation: Extract API key ID and update parameters
        const { id } = request.params
        const { description, enabled } = request.body

        // Business Logic: Update the API key with new configuration
        const result = await context.apikey.update({
          id,
          description,
          enabled,
          organizationId: session.organization.id,
        })

        // Response: Return the updated API key with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Permanently deletes an API key from the organization.
     *
     * This endpoint permanently removes an API key from the system. Once deleted,
     * the API key can no longer be used for authentication and cannot be recovered.
     * Only users with 'owner' or 'admin' roles can delete API keys.
     *
     * @param {string} id - The unique identifier of the API key to delete
     * @returns {{ message: string }} Confirmation of successful deletion
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When API key is not found or doesn't belong to organization
     * @example
     * ```typescript
     * await api.apiKey.delete.mutate({ id: 'key_123' })
     * // Returns: { message: 'Api key deleted' }
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteApiKey',
      description: 'Delete API key',
      method: 'DELETE',
      path: '/:id' as const,
      use: [ApiKeyFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Observation: Extract API key ID from path parameters
        const { id } = request.params

        // Business Logic: Permanently delete the API key
        await context.apikey.delete({
          id,
          organizationId: session.organization.id,
        })

        // Response: Return confirmation of successful deletion
        return response.success({ message: 'Api key deleted' })
      },
    }),

    /**
     * @action getMcpKey
     * @description Gets or creates the MCP-specific API key for the organization.
     *
     * This endpoint retrieves the existing MCP API key or creates a new one if it doesn't exist.
     * The MCP key is specifically named "mcp_key" and is used for MCP Server authentication.
     * This provides better security isolation compared to using organization IDs directly.
     *
     * @returns {ApiKey} The MCP API key object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @example
     * ```typescript
     * const mcpKey = await api.apiKey.getMcpKey.query()
     * // Returns: { id: 'key_mcp_123', key: 'sk_mcp_abc123...', description: 'mcp_key', ... }
     * ```
     */
    getMcpKey: igniter.query({
      name: 'getMcpKey',
      description: 'Get or create MCP API key',
      method: 'GET',
      path: '/mcp-key',
      use: [ApiKeyFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Get or create MCP key for the organization
        const result = await context.apikey.getOrCreateMcpKey(
          session.organization.id,
        )

        // Response: Return the MCP API key
        return response.success(result)
      },
    }),

    /**
     * @action regenerateMcpKey
     * @description Regenerates the MCP-specific API key for the organization.
     *
     * This endpoint creates a new MCP API key, replacing the existing one.
     * The old key is permanently deleted and can no longer be used for authentication.
     * This is useful for security purposes or when the key has been compromised.
     *
     * @returns {ApiKey} The new MCP API key object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @example
     * ```typescript
     * const newMcpKey = await api.apiKey.regenerateMcpKey.mutate()
     * // Returns: { id: 'key_mcp_456', key: 'sk_mcp_def789...', description: 'mcp_key', ... }
     * ```
     */
    regenerateMcpKey: igniter.mutation({
      name: 'regenerateMcpKey',
      description: 'Regenerate MCP API key',
      method: 'POST',
      path: '/mcp-key/regenerate',
      use: [ApiKeyFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Business Logic: Regenerate MCP key for the organization
        const result = await context.apikey.regenerateMcpKey(
          session.organization.id,
        )

        // Response: Return the new MCP API key
        return response.success(result)
      },
    }),
  },
})
