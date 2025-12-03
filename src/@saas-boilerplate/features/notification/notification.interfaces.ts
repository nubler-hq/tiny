// Zod schemas and TypeScript types for the notification feature.
import { type NotificationPayloads } from '@/services/notification'
import { z } from 'zod'

/**
 * @schema CreateNotificationBodySchema
 * @description Zod schema for validating the request body when creating a new notification.
 * Ensures all required fields are present and properly typed.
 */
export const CreateNotificationBodySchema = z.object({
  type: z.string(),
  data: z.record(z.string(), z.any()).optional().default({}),
  action: z.string().optional(),
  recipientId: z.string().uuid(),
  organizationId: z.string().uuid(),
})

/**
 * @schema MarkAsReadParamsSchema
 * @description Zod schema for validating path parameters when marking a notification as read.
 */
export const MarkAsReadParamsSchema = z.object({
  id: z.string().uuid(),
})

/**
 * @schema ListNotificationsQuerySchema
 * @description Zod schema for validating query parameters when listing notifications.
 * Includes pagination and filtering options.
 */
export const ListNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.string().optional(),
})

/**
 * @schema DeleteNotificationParamsSchema
 * @description Zod schema for validating path parameters when deleting a notification.
 */
export const DeleteNotificationParamsSchema = z.object({
  id: z.string().uuid(),
})

/**
 * @typedef {import("zod").infer<typeof CreateNotificationBodySchema>} CreateNotificationBody
 * @description Type definition for the create notification request body, inferred from CreateNotificationBodySchema.
 */
export type CreateNotificationBody = z.infer<
  typeof CreateNotificationBodySchema
>

/**
 * @typedef {import("zod").infer<typeof MarkAsReadParamsSchema>} MarkAsReadParams
 * @description Type definition for the mark as read parameters, inferred from MarkAsReadParamsSchema.
 */
export type MarkAsReadParams = z.infer<typeof MarkAsReadParamsSchema>

/**
 * @typedef {import("zod").infer<typeof ListNotificationsQuerySchema>} ListNotificationsQuery
 * @description Type definition for the list notifications query parameters, inferred from ListNotificationsQuerySchema.
 */
export type ListNotificationsQuery = z.infer<
  typeof ListNotificationsQuerySchema
>

/**
 * @typedef {import("zod").infer<typeof DeleteNotificationParamsSchema>} DeleteNotificationParams
 * @description Type definition for the delete notification parameters, inferred from DeleteNotificationParamsSchema.
 */
export type DeleteNotificationParams = z.infer<
  typeof DeleteNotificationParamsSchema
>

/**
 * @interface NotificationWithPagination
 * @description Interface for paginated notification results with metadata.
 *
 * This interface defines the structure for paginated notification responses,
 * including the list of notifications and pagination metadata for UI components
 * that need to display paginated data with navigation controls.
 *
 * @property {any[]} notifications - Array of notification objects
 * @property {object} pagination - Pagination metadata for UI navigation
 * @property {number} pagination.page - Current page number (1-based)
 * @property {number} pagination.limit - Number of items per page
 * @property {number} pagination.total - Total number of notifications
 * @property {number} pagination.totalPages - Total number of pages available
 *
 * @example
 * ```typescript
 * const result: NotificationWithPagination = {
 *   notifications: [notification1, notification2],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     total: 25,
 *     totalPages: 3
 *   }
 * }
 * ```
 */
export interface NotificationWithPagination {
  /** Array of notification objects returned for the current page */
  notifications: any[]
  /** Pagination metadata for UI navigation and display */
  pagination: {
    /** Current page number (1-based indexing) */
    page: number
    /** Number of items per page */
    limit: number
    /** Total number of notifications matching the query */
    total: number
    /** Total number of pages available */
    totalPages: number
  }
}

/**
 * @interface UnreadCountResponse
 * @description Interface for unread notification count response.
 *
 * This interface defines the structure for API responses that return
 * the count of unread notifications. It's commonly used for notification
 * badges, indicators, and UI elements that show notification status.
 *
 * @property {number} count - Number of unread notifications for the user
 *
 * @example
 * ```typescript
 * const response: UnreadCountResponse = {
 *   count: 5
 * }
 * ```
 */
export interface UnreadCountResponse {
  /** Number of unread notifications for the authenticated user */
  count: number
}

/**
 * @interface Notification
 * @description Interface for notification data with type-safe generic constraints.
 *
 * This interface defines the structure of a notification entity in the system,
 * providing type safety for different notification types and their associated
 * data payloads. It ensures that notification data matches the expected format
 * for each notification type through TypeScript generics.
 *
 * @template TType - The notification type (must extend NotificationType)
 * @template TData - The notification data (must match NotificationData[TType])
 *
 * @property {string} id - Unique identifier for the notification
 * @property {TType} type - The type of notification (e.g., 'USER_INVITED', 'LEAD_CREATED')
 * @property {TData} data - Type-specific notification data payload
 * @property {string} recipientId - ID of the user who should receive the notification
 * @property {string} organizationId - ID of the organization the notification belongs to
 * @property {string} [action] - Optional action associated with the notification
 *
 * @example
 * ```typescript
 * const leadNotification: Notification<'LEAD_CREATED', NotificationPayloads['LEAD_CREATED']> = {
 *   id: 'notif_123',
 *   type: 'LEAD_CREATED',
 *   data: {
 *     leadName: 'John Doe',
 *     leadEmail: 'john@example.com',
 *     source: 'website'
 *   },
 *   recipientId: 'user_456',
 *   organizationId: 'org_789',
 *   action: 'lead.created'
 * }
 * ```
 */
export interface Notification<
  TType extends keyof NotificationPayloads,
  TData extends NotificationPayloads[TType],
> {
  /** Unique identifier for the notification in the system */
  id: string
  /** The type of notification (determines the data structure and behavior) */
  type: TType
  /** Type-specific notification data payload */
  data: TData
  /** ID of the user who should receive the notification */
  recipientId: string
  /** ID of the organization the notification belongs to */
  organizationId: string
  /** Optional action associated with the notification for routing */
  action?: string
}

/**
 * @interface NotificationPreferences
 * @description Interface for user notification preferences.
 *
 * This interface defines the structure for storing user preferences about which
 * notifications they want to receive via different channels (email, in-app).
 * Each notification type can have different preferences for different channels.
 *
 * @property {Record<string, {inApp: boolean, email: boolean}>} preferences - Object mapping notification types to channel preferences
 *
 * @example
 * ```typescript
 * const preferences: NotificationPreferences = {
 *   preferences: {
 *     USER_INVITED: { inApp: true, email: false },
 *     BILLING_SUCCESS: { inApp: true, email: true },
 *     LEAD_CREATED: { inApp: true, email: true },
 *   }
 * }
 * ```
 */
export interface NotificationPreferences {
  /** Object mapping notification types to channel preferences */
  preferences: Record<string, { inApp: boolean; email: boolean }>
}

/**
 * @interface NotificationType
 * @description Interface for notification type metadata.
 *
 * This interface defines the structure for notification type information
 * that is returned by the API to populate forms and settings. It includes
 * the type identifier and metadata about the notification.
 *
 * @property {string} type - The notification type identifier
 * @property {string} title - Human-readable title for the notification type
 * @property {string} description - Description of when this notification is sent
 * @property {string} [help] - Optional help text for the notification type
 * @property {string[]} channels - Array of channels this notification supports
 *
 * @example
 * ```typescript
 * const type: NotificationType = {
 *   type: 'USER_INVITED',
 *   title: 'User Invitation',
 *   description: 'When a user is invited to an organization',
 *   help: 'When a user is invited to an organization',
 *   channels: ['email', 'in-app']
 * }
 * ```
 */
export interface NotificationType {
  /** The notification type identifier */
  type: string
  /** Human-readable title for the notification type */
  title: string
  /** Description of when this notification is sent */
  description: string
  /** Optional help text for the notification type */
  help?: string
  /** Array of channels this notification supports */
  channels: string[]
}

/**
 * @interface NotificationTypeWithPreferences
 * @description Interface for notification type with user preferences.
 *
 * This interface extends NotificationType to include the user's current
 * preferences for each notification type and channel combination.
 *
 * @property {string} type - The notification type identifier
 * @property {string} title - Human-readable title for the notification type
 * @property {string} description - Description of when this notification is sent
 * @property {string} [help] - Optional help text for the notification type
 * @property {string[]} channels - Array of channels this notification supports
 * @property {object} preferences - User's current preferences for this notification
 * @property {boolean} preferences.inApp - Whether user wants in-app notifications
 * @property {boolean} preferences.email - Whether user wants email notifications
 *
 * @example
 * ```typescript
 * const type: NotificationTypeWithPreferences = {
 *   type: 'USER_INVITED',
 *   title: 'User Invitation',
 *   description: 'When a user is invited to an organization',
 *   channels: ['email', 'in-app'],
 *   preferences: {
 *     inApp: true,
 *     email: false
 *   }
 * }
 * ```
 */
export interface NotificationTypeWithPreferences extends NotificationType {
  /** User's current preferences for this notification */
  preferences: {
    /** Whether user wants in-app notifications */
    inApp: boolean
    /** Whether user wants email notifications */
    email: boolean
  }
}

/**
 * @interface NotificationTypesResponse
 * @description Interface for the response containing all notification types.
 *
 * This interface defines the structure for API responses that return
 * all available notification types with their metadata.
 *
 * @property {NotificationType[]} types - Array of notification type objects
 *
 * @example
 * ```typescript
 * const response: NotificationTypesResponse = {
 *   types: [
 *     {
 *       type: 'USER_INVITED',
 *       title: 'User Invitation',
 *       description: 'When a user is invited to an organization',
 *       channels: ['email', 'in-app']
 *     }
 *   ]
 * }
 * ```
 */
export interface NotificationTypesResponse {
  /** Array of notification type objects with their metadata */
  types: NotificationType[]
}

/**
 * @interface UpdateNotificationPreferencesResponse
 * @description Interface for the response after updating notification preferences.
 *
 * This interface defines the structure for API responses after successfully
 * updating a user's notification preferences.
 *
 * @property {NotificationPreferences} preferences - Updated preferences object
 * @property {string} message - Success confirmation message
 *
 * @example
 * ```typescript
 * const response: UpdateNotificationPreferencesResponse = {
 *   preferences: {
 *     USER_INVITED: { inApp: true, email: false },
 *     BILLING_SUCCESS: { inApp: true, email: true },
 *   },
 *   message: 'Notification preferences updated successfully'
 * }
 * ```
 */
export interface UpdateNotificationPreferencesResponse {
  /** Updated preferences object */
  preferences: NotificationPreferences['preferences']
  /** Success confirmation message */
  message: string
}

/**
 * @schema UpdateNotificationPreferencesBodySchema
 * @description Zod schema for validating the request body when updating notification preferences.
 * Only email preferences are configurable, in-app notifications are always enabled.
 */
export const UpdateNotificationPreferencesBodySchema = z.object({
  preferences: z.record(
    z.string(),
    z.object({
      inApp: z.boolean().default(true),
      email: z.boolean(), // Only email preferences are configurable
    }),
  ),
})

/**
 * @typedef {import("zod").infer<typeof UpdateNotificationPreferencesBodySchema>} UpdateNotificationPreferencesBody
 * @description Type definition for the update notification preferences request body, inferred from UpdateNotificationPreferencesBodySchema.
 */
export type UpdateNotificationPreferencesBody = z.infer<
  typeof UpdateNotificationPreferencesBodySchema
>
