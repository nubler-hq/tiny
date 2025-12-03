import type { Organization } from '../organization/organization.interface'

/**
 * @interface ApiKey
 * @description Represents an API key entity for programmatic access to organization resources.
 *
 * This interface defines the structure of an API key that allows programmatic
 * access to organization resources without requiring user authentication. API keys
 * are essential for integrations, automated systems, and third-party applications
 * that need to interact with the API.
 *
 * @property {string} id - Unique identifier for the API key
 * @property {string} description - Human-readable description for the API key
 * @property {string} key - The actual API key value (prefixed with 'sk_')
 * @property {boolean} enabled - Whether the API key is currently active
 * @property {boolean} neverExpires - Whether the API key has no expiration date
 * @property {Date | null} expiresAt - Expiration date (null if neverExpires is true)
 * @property {string} organizationId - ID of the organization that owns this API key
 * @property {Organization} [organization] - Related organization entity (optional)
 * @property {Date} createdAt - Timestamp when the API key was created
 * @property {Date} updatedAt - Timestamp when the API key was last modified
 *
 * @example
 * ```typescript
 * const apiKey: ApiKey = {
 *   id: 'key_123456789',
 *   description: 'Integration API Key',
 *   key: 'sk_abc123def456...',
 *   enabled: true,
 *   neverExpires: true,
 *   expiresAt: null,
 *   organizationId: 'org_987654321',
 *   createdAt: new Date('2024-01-15T10:30:00Z'),
 *   updatedAt: new Date('2024-01-15T10:30:00Z')
 * }
 * ```
 */
export interface ApiKey {
  /** Unique identifier for the API key in the system */
  id: string
  /** Human-readable description for identifying the API key's purpose */
  description: string
  /** The actual API key value (cryptographically secure, prefixed with 'sk_') */
  key: string
  /** Whether the API key is currently active and can be used for authentication */
  enabled: boolean
  /** Whether the API key has no expiration date and remains valid indefinitely */
  neverExpires: boolean
  /** Expiration date for the API key (null if neverExpires is true) */
  expiresAt: Date | null
  /** ID of the organization that owns this API key */
  organizationId: string
  /** Related organization entity (populated when including relations) */
  organization?: Organization
  /** Timestamp when the API key was first created */
  createdAt: Date
  /** Timestamp when the API key was last modified */
  updatedAt: Date
}

/**
 * @interface CreateApiKeyDTO
 * @description Data transfer object for creating a new API key.
 *
 * This interface defines the parameters required to create a new API key.
 * It includes the essential configuration options for the key's behavior
 * and association with an organization.
 *
 * @property {string} description - Human-readable description for the API key
 * @property {boolean} [neverExpires] - Whether the key should never expire (defaults to true)
 * @property {Date} [expiresAt] - Expiration date (ignored if neverExpires is true)
 * @property {string} organizationId - ID of the organization to associate the key with
 *
 * @example
 * ```typescript
 * const createData: CreateApiKeyDTO = {
 *   description: 'Integration API Key for Webhook Service',
 *   neverExpires: true,
 *   organizationId: 'org_987654321'
 * }
 * ```
 */
export interface CreateApiKeyDTO {
  /** Human-readable description for identifying the API key's purpose */
  description: string
  /** Whether the API key should never expire (defaults to true) */
  neverExpires?: boolean | null
  /** Expiration date for the API key (ignored if neverExpires is true) */
  expiresAt?: Date | null
  /** ID of the organization to associate the API key with */
  organizationId: string
}

/**
 * @interface UpdateApiKeyDTO
 * @description Data transfer object for updating an existing API key.
 *
 * This interface defines the parameters that can be modified when updating
 * an existing API key. It includes all possible fields that can be updated,
 * with most being optional to allow partial updates.
 *
 * @property {string} id - The unique identifier of the API key to update
 * @property {string} [description] - New description for the API key
 * @property {boolean} [enabled] - New enabled status for the API key
 * @property {boolean} [neverExpires] - Whether the key should never expire
 * @property {Date} [expiresAt] - New expiration date for the API key
 * @property {string} [organizationId] - New organization ID (rarely changed)
 * @property {Date} [createdAt] - Creation timestamp (rarely modified)
 * @property {Date} [updatedAt] - Last update timestamp (auto-managed)
 *
 * @example
 * ```typescript
 * const updateData: UpdateApiKeyDTO = {
 *   id: 'key_123456789',
 *   description: 'Updated Integration API Key',
 *   enabled: false
 * }
 * ```
 */
export interface UpdateApiKeyDTO {
  /** The unique identifier of the API key to update */
  id: string
  /** New human-readable description for the API key */
  description?: string
  /** New enabled status for the API key */
  enabled?: boolean
  /** Whether the API key should never expire */
  neverExpires?: boolean | null
  /** New expiration date for the API key */
  expiresAt?: Date | null
  /** New organization ID (rarely changed) */
  organizationId?: string
  /** Creation timestamp (rarely modified) */
  createdAt?: Date | null
  /** Last update timestamp (auto-managed by the system) */
  updatedAt?: Date
}

/**
 * @interface ApiKeyQueryParams
 * @description Query parameters for fetching and filtering API key entities.
 *
 * This interface defines the parameters that can be used when querying
 * API keys, providing support for pagination, sorting, and search functionality.
 * It's designed to be flexible and support various query patterns.
 *
 * @property {number} [page] - Current page number for pagination (1-based)
 * @property {number} [limit] - Number of items to return per page
 * @property {string} [sortBy] - Property name to sort by (e.g., 'createdAt', 'description')
 * @property {'asc' | 'desc'} [sortOrder] - Sort order for the results
 * @property {string} [search] - Search term for filtering by description or other fields
 *
 * @example
 * ```typescript
 * const queryParams: ApiKeyQueryParams = {
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'integration'
 * }
 * ```
 */
export interface ApiKeyQueryParams {
  /** Current page number for pagination (1-based indexing) */
  page?: number
  /** Number of items to return per page (for pagination) */
  limit?: number
  /** Property name to sort the results by */
  sortBy?: string
  /** Sort order for the results ('asc' for ascending, 'desc' for descending) */
  sortOrder?: 'asc' | 'desc'
  /** Search term for filtering results by description or other searchable fields */
  search?: string
}
