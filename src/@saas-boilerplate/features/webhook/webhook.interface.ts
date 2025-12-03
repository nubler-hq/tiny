import type { Organization } from '../organization/organization.interface'

/**
 * @interface Webhook
 * @description Represents a webhook endpoint for receiving real-time event notifications.
 *
 * This interface defines the structure of a webhook configuration that allows
 * external services to receive real-time notifications when specific events
 * occur in the system. Webhooks are essential for integrations and provide
 * immediate notification delivery for events like lead creation, submissions,
 * and other business events.
 *
 * @property {string} id - Unique identifier for the webhook
 * @property {string} url - The HTTP endpoint URL where events will be delivered
 * @property {string} secret - Secret token used for webhook signature verification
 * @property {string[]} events - Array of event types this webhook should receive
 * @property {string} organizationId - ID of the organization that owns this webhook
 * @property {Organization} [organization] - Optional related organization entity
 * @property {Date} createdAt - Timestamp when the webhook was created
 * @property {Date} updatedAt - Timestamp when the webhook was last modified
 *
 * @example
 * ```typescript
 * const webhook: Webhook = {
 *   id: 'webhook_123456789',
 *   url: 'https://example.com/api/webhook',
 *   secret: 'whsec_abc123def456...',
 *   events: ['lead.created', 'submission.created'],
 *   organizationId: 'org_987654321',
 *   createdAt: new Date('2024-01-15T10:30:00Z'),
 *   updatedAt: new Date('2024-01-15T10:30:00Z')
 * }
 * ```
 */
export interface Webhook {
  /** Unique identifier for the webhook in the system */
  id: string
  /** The HTTP endpoint URL where webhook events will be delivered */
  url: string
  /** Secret token used for webhook signature verification and security */
  secret: string
  /** Array of event types this webhook should receive notifications for */
  events: string[]
  /** ID of the organization that owns this webhook */
  organizationId: string
  /** Optional related organization entity for populated queries */
  organization?: Organization
  /** Timestamp when the webhook was created */
  createdAt: Date
  /** Timestamp when the webhook was last modified */
  updatedAt: Date
}

/**
 * @interface CreateWebhookDTO
 * @description Data transfer object for creating a new webhook endpoint.
 *
 * This interface defines the parameters required to create a new webhook
 * configuration. It includes the endpoint URL, authentication secret,
 * and the list of events the webhook should receive.
 *
 * @property {string} url - The HTTP endpoint URL where events will be delivered
 * @property {string} secret - Secret token for webhook signature verification
 * @property {string[]} events - Array of event types to receive notifications for
 * @property {string} organizationId - ID of the organization that owns this webhook
 *
 * @example
 * ```typescript
 * const createData: CreateWebhookDTO = {
 *   url: 'https://example.com/api/webhook',
 *   secret: 'whsec_abc123def456...',
 *   events: ['lead.created', 'submission.created'],
 *   organizationId: 'org_987654321'
 * }
 * ```
 */
export interface CreateWebhookDTO {
  /** The HTTP endpoint URL where webhook events will be delivered */
  url: string
  /** Secret token for webhook signature verification and security */
  secret: string
  /** Array of event types to receive notifications for */
  events: string[]
  /** ID of the organization that owns this webhook */
  organizationId: string
}

/**
 * @interface UpdateWebhookDTO
 * @description Data transfer object for updating an existing webhook configuration.
 *
 * This interface defines the parameters that can be modified when updating
 * an existing webhook. All fields are optional to allow partial updates
 * while maintaining data integrity.
 *
 * @property {string} id - Required ID of the webhook to update
 * @property {string} [organizationId] - Optional organization ID for security validation
 * @property {string} [url] - Optional updated HTTP endpoint URL
 * @property {string} [secret] - Optional updated secret token
 *
 * @example
 * ```typescript
 * const updateData: UpdateWebhookDTO = {
 *   id: 'webhook_123456789',
 *   organizationId: 'org_987654321',
 *   url: 'https://new-example.com/api/webhook',
 *   secret: 'whsec_new_secret...'
 * }
 * ```
 */
export interface UpdateWebhookDTO {
  /** Required ID of the webhook to update */
  id: string
  /** Optional organization ID for security validation */
  organizationId?: string
  /** Optional updated HTTP endpoint URL */
  url?: string
  /** Optional updated secret token for webhook signature verification */
  secret?: string
  /** Array of events */
  events?: string[]
}
