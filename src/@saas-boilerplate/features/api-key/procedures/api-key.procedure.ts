import { igniter } from '@/igniter'
import type {
  ApiKey,
  CreateApiKeyDTO,
  UpdateApiKeyDTO,
} from '../api-key.interface'
import crypto from 'node:crypto'

/**
 * @procedure ApiKeyFeatureProcedure
 * @description Procedure for managing API key operations and database interactions.
 *
 * This procedure provides the business logic layer for API key management,
 * handling database operations and secure key generation. It manages the
 * complete lifecycle of API keys including creation, retrieval, updating,
 * and deletion with proper organization isolation and security measures.
 *
 * The procedure generates cryptographically secure API keys using Node.js
 * crypto module and ensures proper organization context for all operations.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const apiKeys = await context.apikey.findManyByOrganization(orgId)
 * const newKey = await context.apikey.create({ description: 'Test Key', organizationId: orgId })
 * await context.apikey.delete({ id: 'key_123', organizationId: orgId })
 * ```
 */
export const ApiKeyFeatureProcedure = igniter.procedure({
  name: 'ApiKeyFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      apikey: {
        /**
         * @method findManyByOrganization
         * @description Retrieves all API keys belonging to a specific organization.
         *
         * This method queries the database to find all API keys associated with
         * the specified organization ID. It ensures proper organization isolation
         * by filtering results based on the organization context.
         *
         * @param {string} organizationId - The unique identifier of the organization
         * @returns {Promise<ApiKey[]>} Array of API key objects for the organization
         * @throws {Error} When database query fails
         */
        findManyByOrganization: async (
          organizationId: string,
        ): Promise<ApiKey[]> => {
          // Business Logic: Query database for all API keys belonging to the organization
          return context.services.database.apiKey.findMany({
            where: {
              organizationId,
            },
          })
        },

        /**
         * @method findOne
         * @description Retrieves a specific API key by ID with optional organization context.
         *
         * This method finds a single API key by its ID, with optional organization
         * filtering for additional security. It returns null if the key is not found
         * or doesn't belong to the specified organization.
         *
         * @param {object} params - Query parameters
         * @param {string} params.id - The unique identifier of the API key
         * @param {string} [params.organizationId] - Optional organization ID for additional filtering
         * @returns {Promise<ApiKey | null>} API key object or null if not found
         * @throws {Error} When database query fails
         */
        findOne: async (params: {
          id: string
          organizationId?: string
        }): Promise<ApiKey | null> => {
          // Business Logic: Query database for specific API key with optional organization filter
          return context.services.database.apiKey.findUnique({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })
        },

        /**
         * @method create
         * @description Creates a new API key with secure generation and database storage.
         *
         * This method generates a cryptographically secure API key using Node.js
         * crypto module and stores it in the database. The key is prefixed with
         * 'sk_' for identification and uses 32 random bytes (64 hex characters)
         * for maximum security.
         *
         * @param {CreateApiKeyDTO} input - API key creation parameters
         * @param {string} input.description - Human-readable description for the key
         * @param {boolean} [input.neverExpires] - Whether the key never expires (defaults to true)
         * @param {Date} [input.expiresAt] - Expiration date (ignored if neverExpires is true)
         * @param {string} input.organizationId - Organization ID to associate the key with
         * @returns {Promise<ApiKey>} The newly created API key object
         * @throws {Error} When database operation fails
         */
        create: async (input: CreateApiKeyDTO): Promise<ApiKey> => {
          // Security Rule: Generate a cryptographically secure API key with prefix
          const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`

          // Business Logic: Create API key record in database with secure key
          return context.services.database.apiKey.create({
            data: {
              description: input.description,
              key: apiKey,
              enabled: true, // New keys are enabled by default
              neverExpires: input.neverExpires ?? true,
              expiresAt: input.expiresAt,
              organizationId: input.organizationId,
            },
          })
        },

        /**
         * @method update
         * @description Updates an existing API key's configuration and properties.
         *
         * This method allows modification of API key properties such as description
         * and enabled status. It first verifies the key exists before attempting
         * to update it. The actual key value cannot be changed for security reasons.
         *
         * @param {UpdateApiKeyDTO} params - Update parameters
         * @param {string} params.id - The unique identifier of the API key to update
         * @param {string} [params.description] - New description for the API key
         * @param {boolean} [params.enabled] - New enabled status for the API key
         * @returns {Promise<ApiKey>} The updated API key object
         * @throws {Error} When API key is not found or database operation fails
         */
        update: async (params: UpdateApiKeyDTO): Promise<ApiKey> => {
          // Business Logic: Verify the API key exists before updating
          const apikey = await context.services.database.apiKey.findUnique({
            where: { id: params.id },
          })

          // Business Rule: Throw error if API key is not found
          if (!apikey) throw new Error('ApiKey not found')

          // Business Logic: Update the API key with new configuration
          return context.services.database.apiKey.update({
            where: { id: params.id },
            data: {
              description: params.description,
              enabled: params.enabled,
            },
          })
        },

        /**
         * @method delete
         * @description Permanently deletes an API key from the database.
         *
         * This method permanently removes an API key from the system. Once deleted,
         * the API key can no longer be used for authentication and cannot be recovered.
         * The method includes optional organization filtering for additional security.
         *
         * @param {object} params - Deletion parameters
         * @param {string} params.id - The unique identifier of the API key to delete
         * @param {string} [params.organizationId] - Optional organization ID for additional security
         * @returns {Promise<void>} Confirmation of successful deletion
         * @throws {Error} When database operation fails
         */
        delete: async (params: {
          id: string
          organizationId?: string
        }): Promise<void> => {
          // Business Logic: Permanently delete the API key from database
          await context.services.database.apiKey.delete({
            where: { id: params.id, organizationId: params.organizationId },
          })
        },

        /**
         * @method getOrCreateMcpKey
         * @description Gets the existing MCP API key or creates a new one if it doesn't exist.
         *
         * This method first attempts to find an existing API key with the description "mcp_key"
         * for the specified organization. If no such key exists, it creates a new one with
         * the standard MCP key configuration. This ensures there's always an MCP key available
         * for the organization while avoiding duplicate creation.
         *
         * @param {string} organizationId - The organization ID to get/create the MCP key for
         * @returns {Promise<ApiKey>} The existing or newly created MCP API key
         * @throws {Error} When database operation fails
         */
        getOrCreateMcpKey: async (organizationId: string): Promise<ApiKey> => {
          // Business Logic: Try to find existing MCP key first
          const existingKey = await context.services.database.apiKey.findFirst({
            where: {
              organizationId,
              description: 'mcp_key',
            },
          })

          // Business Rule: Return existing key if found
          if (existingKey) {
            return existingKey
          }

          // Business Logic: Create new MCP key if none exists
          return context.services.database.apiKey.create({
            data: {
              description: 'mcp_key',
              key: `sk_${crypto.randomBytes(32).toString('hex')}`,
              enabled: true,
              neverExpires: true,
              expiresAt: null,
              organizationId,
            },
          })
        },

        /**
         * @method regenerateMcpKey
         * @description Regenerates the MCP API key for the organization.
         *
         * This method creates a new MCP API key and deletes the existing one in a transaction.
         * This ensures atomicity - either both operations succeed or both fail. The old key
         * is permanently deleted and cannot be recovered, while the new key maintains the
         * same description and configuration for consistency.
         *
         * @param {string} organizationId - The organization ID to regenerate the MCP key for
         * @returns {Promise<ApiKey>} The newly created MCP API key
         * @throws {Error} When database operation fails or no existing MCP key is found
         */
        regenerateMcpKey: async (organizationId: string): Promise<ApiKey> => {
          // Business Logic: Execute regeneration in a transaction for atomicity
          return await context.services.database.$transaction(async (tx) => {
            // Business Rule: Find existing MCP key first
            const existingKey = await tx.apiKey.findFirst({
              where: {
                organizationId,
                description: 'mcp_key',
              },
            })

            // Business Rule: Throw error if no existing MCP key is found
            if (!existingKey) {
              throw new Error('No existing MCP key found to regenerate')
            }

            // Business Logic: Delete the existing MCP key
            await tx.apiKey.delete({
              where: { id: existingKey.id },
            })

            // Business Logic: Create new MCP key with same configuration
            return tx.apiKey.create({
              data: {
                description: 'mcp_key',
                key: `sk_${crypto.randomBytes(32).toString('hex')}`,
                enabled: true,
                neverExpires: true,
                expiresAt: null,
                organizationId,
              },
            })
          })
        },
      },
    }
  },
})
