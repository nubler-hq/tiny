import type { DeepPartial } from '@igniter-js/core'
import { z } from 'zod'
import type { Membership } from '../membership/membership.interface'
import type { NotificationPayloads } from '@/services/notification'

/**
 * @schema notificationTypePreferenceSchema
 * @description Zod schema for defining notification preferences for a specific type.
 *
 * This schema specifies whether a notification type should be delivered
 * via in-app messages and/or email.
 *
 * @property {boolean} inApp - Whether to send in-app notifications (defaults to true)
 * @property {boolean} email - Whether to send email notifications (defaults to true)
 *
 * @example
 * ```typescript
 * const prefs = notificationTypePreferenceSchema.parse({ inApp: true, email: false })
 * ```
 */
export const notificationTypePreferenceSchema = z.object({
  inApp: z.boolean().default(true),
  email: z.boolean().default(true),
})

/**
 * @schema notificationPreferencesSchema
 * @description Zod schema for defining comprehensive user notification preferences.
 *
 * This schema aggregates notification preferences for all supported notification
 * types, allowing users to customize how they receive alerts for various events.
 *
 * @example
 * ```typescript
 * const allPrefs = notificationPreferencesSchema.parse({
 *   [NotificationType.USER_INVITED]: { inApp: true, email: true },
 *   [NotificationType.BILLING_SUCCESS]: { inApp: true, email: false }
 * })
 * ```
 */
export const notificationPreferencesSchema = z.record(
  z.string(),
  notificationTypePreferenceSchema,
)

/**
 * @schema UserMetadataSchema
 * @description Zod schema for validating user metadata structure.
 *
 * This schema defines the structure for user-specific metadata, including
 * contact information, notification preferences, and extra fields like
 * referral source. All fields are optional to allow flexible configuration.
 *
 * @example
 * ```typescript
 * const metadata = UserMetadataSchema.parse({
 *   contact: { phone: '+1234567890' },
 *   notifications: { preferences: { [NotificationType.GENERAL]: { inApp: true, email: true } } },
 *   extra: { referral_source: 'Google' }
 * })
 * ```
 */
export const UserMetadataSchema = z
  .object({
    contact: z.object({
      phone: z.string(),
    }),
    notifications: z.object({
      preferences: notificationPreferencesSchema,
    }),
    extra: z.object({
      referral_source: z.string().min(1, 'Selecione como nos conheceu'),
    }),
  })
  .partial()

/**
 * @typedef UserMetadata
 * @description Type definition for user metadata structure.
 *
 * This type represents the metadata associated with a user, including
 * contact information, notification preferences, and other custom fields.
 *
 * @example
 * ```typescript
 * const metadata: UserMetadata = {
 *   contact: { phone: '+1234567890' },
 *   notifications: { preferences: { [NotificationType.USER_INVITED]: { inApp: true, email: true } } }
 * }
 * ```
 */
export type UserMetadata = z.infer<typeof UserMetadataSchema>

/**
 * @interface User
 * @description Represents a user entity in the system.
 *
 * Users are individual accounts with personal information, authentication
 * details, and associated memberships to organizations. This interface
 * defines the core properties of a user profile.
 *
 * @property {string} id - Unique identifier for the user
 * @property {string} name - Display name of the user
 * @property {string} email - Primary email address of the user
 * @property {boolean} emailVerified - Whether the user's email has been verified
 * @property {string | null} image - Optional profile image URL
 * @property {Date} createdAt - Timestamp when the user account was created
 * @property {Date} updatedAt - Timestamp when the user account was last modified
 * @property {string | null} role - Global role of the user (e.g., 'user', 'admin')
 * @property {UserMetadata} metadata - Custom metadata and preferences for the user
 * @property {Membership[]} [members] - Associated organization memberships (optional)
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: 'user_123456789',
 *   name: 'John Doe',
 *   email: 'john.doe@example.com',
 *   emailVerified: true,
 *   image: 'https://example.com/avatar.jpg',
 *   createdAt: new Date('2024-01-15T10:30:00Z'),
 *   updatedAt: new Date('2024-01-15T10:30:00Z'),
 *   role: 'user',
 *   metadata: {
 *     contact: { phone: '+1234567890' },
 *     notifications: { preferences: { [NotificationType.GENERAL]: { inApp: true, email: true } } }
 *   }
 * }
 * ```
 */
export interface User {
  /** Unique identifier for the user in the system */
  id: string
  /** Display name of the user */
  name: string
  /** Primary email address of the user */
  email: string
  /** Whether the user's email has been verified */
  emailVerified: boolean
  /** Optional profile image URL */
  image: string | null
  /** Timestamp when the user account was first created */
  createdAt: Date
  /** Timestamp when the user account was last modified */
  updatedAt: Date
  /** Global role of the user (e.g., 'user', 'admin') */
  role: string | null
  /** Custom metadata and preferences for the user */
  metadata: UserMetadata
  /** Associated organization memberships (populated when including relations) */
  members?: Membership[]
}

/**
 * @interface UpdateUserDTO
 * @description Data transfer object for updating an existing user's profile.
 *
 * This interface defines the parameters that can be modified when updating
 * a user's profile. All fields are optional to allow partial updates
 * while maintaining data integrity.
 *
 * @property {string} id - The unique identifier of the user to update
 * @property {string} [name] - New display name for the user
 * @property {string} [email] - New email address for the user
 * @property {string | null} [image] - New profile image URL
 * @property {DeepPartial<UserMetadata>} [metadata] - Updated user metadata
 *
 * @example
 * ```typescript
 * const updateData: UpdateUserDTO = {
 *   id: 'user_123456789',
 *   name: 'Jane Doe',
 *   image: 'https://example.com/new-avatar.jpg',
 *   metadata: {
 *     contact: { phone: '+1122334455' }
 *   }
 * }
 * ```
 */
export interface UpdateUserDTO {
  /** The unique identifier of the user to update */
  id: string
  /** New display name for the user */
  name?: string
  /** New email address for the user */
  email?: string
  /** New profile image URL */
  image?: string | null
  /** Updated user metadata (partial update) */
  metadata?: DeepPartial<UserMetadata>
}

/**
 * @interface UserQueryParams
 * @description Query parameters for fetching and filtering user entities.
 *
 * This interface defines the parameters that can be used when querying
 * users, providing support for pagination, sorting, and search functionality.
 *
 * @property {number} [page] - Current page number for pagination (1-based)
 * @property {number} [limit] - Number of items to return per page
 * @property {string} [sortBy] - Property name to sort by (e.g., 'createdAt', 'name')
 * @property {'asc' | 'desc'} [sortOrder] - Sort order for the results
 * @property {string} [search] - Search term for filtering by name or email
 *
 * @example
 * ```typescript
 * const queryParams: UserQueryParams = {
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'john'
 * }
 * ```
 */
export interface UserQueryParams {
  /** Current page number for pagination (1-based indexing) */
  page?: number
  /** Number of items to return per page (for pagination) */
  limit?: number
  /** Property name to sort the results by */
  sortBy?: string
  /** Sort order for the results ('asc' for ascending, 'desc' for descending) */
  sortOrder?: 'asc' | 'desc'
  /** Search term for filtering results by name or email */
  search?: string
}
