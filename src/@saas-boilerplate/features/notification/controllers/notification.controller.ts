import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { NotificationProcedure } from '../procedures/notification.procedure'
import {
  ListNotificationsQuerySchema,
  UpdateNotificationPreferencesBodySchema,
  type UpdateNotificationPreferencesBody,
} from '../notification.interfaces'
import { updateMetadataSafe } from '@/utils/update-metadata'
import { UserMetadata, UserMetadataSchema } from '../../user/user.interface'
import { parseMetadata } from '@/utils/parse-metadata'

/**
 * @controller NotificationController
 * @description Controller for managing user notifications with real-time streaming capabilities.
 *
 * This controller provides comprehensive notification management including listing,
 * marking as read, bulk operations, and deletion with proper authentication and
 * organization isolation. It supports real-time streaming for automatic updates
 * and ensures proper data security through recipient and organization validation.
 *
 * Notifications are the primary mechanism for keeping users informed about
 * important events, system updates, and user actions within their organization.
 * This controller ensures notifications are properly scoped and secured.
 *
 * @example
 * ```typescript
 * // List notifications with pagination
 * const notifications = await api.notification.list.query({
 *   limit: 10,
 *   page: 1,
 *   unreadOnly: true
 * })
 *
 * // Mark specific notification as read
 * await api.notification.markAsRead.mutate({
 *   id: 'notification_123'
 * })
 *
 * // Get unread count for badge display
 * const count = await api.notification.unreadCount.query()
 * ```
 */
export const NotificationController = igniter.controller({
  name: 'Notification',
  path: '/notification',
  description: 'Manage user notifications',
  actions: {
    /**
     * @action list
     * @description Retrieves notifications for the authenticated user with pagination and filtering.
     *
     * This endpoint provides paginated access to notifications for the authenticated user
     * within their organization. It supports filtering by read status and notification type,
     * with optional real-time streaming for automatic updates when new notifications are created.
     * The endpoint ensures proper organization isolation and recipient validation.
     *
     * @param {number} [limit=10] - Maximum number of notifications to return (1-100)
     * @param {number} [page=1] - Page number for pagination
     * @param {boolean} [unreadOnly=false] - Filter to show only unread notifications
     * @param {string} [type] - Optional notification type filter
     * @returns {Object} Paginated notification list with metadata
     * @returns {Notification[]} returns.notifications - Array of notification objects
     * @returns {Object} returns.pagination - Pagination metadata for UI navigation
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @example
     * ```typescript
     * // Get first page of unread notifications
     * const result = await api.notification.list.query({
     *   limit: 20,
     *   page: 1,
     *   unreadOnly: true
     * })
     *
     * // Get notifications of specific type
     * const leadNotifications = await api.notification.list.query({
     *   type: 'LEAD_CREATED',
     *   limit: 50
     * })
     * ```
     */
    list: igniter.query({
      name: 'List',
      description: 'List user notifications with real-time updates',
      path: '/',
      method: 'GET',
      stream: true, // Enable real-time streaming for automatic updates
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      query: ListNotificationsQuerySchema,
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding with notification listing.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Observation: Extract query parameters for pagination and filtering with sensible defaults.
        const query = {
          limit: request.query.limit || 10,
          page: request.query.page || 1,
          unreadOnly: request.query.unreadOnly || false,
          type: request.query.type,
        } as {
          limit: number
          page: number
          unreadOnly: boolean
          type?: string
        }

        // Business Logic: Retrieve notifications using the repository with proper organizational isolation.
        const result = await context.notification.list({
          recipientId: session.user!.id,
          organizationId: session.organization.id,
          query,
        })

        // Data Transformation: Calculate pagination metadata including total pages for UI navigation components.
        const totalPages = Math.ceil(result.total / query.limit)

        // Response: Return paginated notifications with complete metadata for UI components.
        return response.success({
          notifications: result.notifications,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: result.total,
            totalPages,
          },
        })
      },
    }),

    /**
     * @action markAsRead
     * @description Marks a specific notification as read for the authenticated user.
     *
     * This endpoint updates a notification's read status by setting the readAt
     * timestamp to the current time. It ensures the notification belongs to
     * the authenticated user and their organization before making changes.
     * Triggers real-time updates to connected clients via revalidation.
     *
     * @param {string} id - The unique identifier of the notification to mark as read
     * @returns {Notification} The updated notification object with read timestamp
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @throws {404} When notification is not found or access is denied
     * @example
     * ```typescript
     * // Mark a specific notification as read
     * const updatedNotification = await api.notification.markAsRead.mutate({
     *   id: 'notif_123'
     * })
     *
     * // The notification now has a readAt timestamp
     * console.log(updatedNotification.readAt) // Date object
     * ```
     */
    markAsRead: igniter.mutation({
      name: 'Mark as Read',
      description: 'Mark a notification as read',
      path: '/:id/read' as const,
      method: 'PATCH',
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding with notification update.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Observation: Extract notification ID from path parameters for read status update.
        const notificationId = request.params.id

        // Business Logic: Update notification read status using repository with security validation.
        const notification = await context.notification.markAsRead({
          notificationId,
          recipientId: session.user!.id,
          organizationId: session.organization.id,
        })

        // Business Rule: Validate that notification exists and user has access to it before proceeding.
        if (!notification) {
          return response.notFound('Notification not found or access denied')
        }

        // Response: Return updated notification with new read timestamp and trigger real-time updates for connected clients.
        return response.revalidate(['notification.list']).success(notification)
      },
    }),

    /**
     * @action markAllAsRead
     * @description Marks all unread notifications as read for the authenticated user.
     *
     * This endpoint performs a bulk update operation to mark all unread notifications
     * as read by setting the readAt timestamp to the current time. It filters
     * notifications by the authenticated user and their organization to ensure
     * proper data isolation. Triggers real-time updates to connected clients.
     *
     * @returns {Object} Success response with count of updated notifications
     * @returns {number} returns.updatedCount - Number of notifications marked as read
     * @returns {string} returns.message - Confirmation message with count
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @example
     * ```typescript
     * // Mark all unread notifications as read
     * const result = await api.notification.markAllAsRead.mutate()
     *
     * console.log(result.updatedCount) // 5 (number of notifications marked as read)
     * console.log(result.message) // "5 notifications marked as read"
     * ```
     */
    markAllAsRead: igniter.mutation({
      name: 'Mark All as Read',
      description: 'Mark all notifications as read',
      path: '/read-all',
      method: 'PATCH',
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      handler: async ({ response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding with bulk notification update.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Business Logic: Mark all unread notifications as read using repository with bulk operation.
        const updatedCount = await context.notification.markAllAsRead({
          recipientId: session.user!.id,
          organizationId: session.organization.id,
        })

        // Response: Return count of updated notifications with success message and trigger real-time updates for connected clients.
        return response.revalidate(['notification.list']).success({
          updatedCount,
          message: `${updatedCount} notifications marked as read`,
        })
      },
    }),

    /**
     * @action unreadCount
     * @description Gets the count of unread notifications for the authenticated user.
     *
     * This endpoint retrieves the count of unread notifications for the authenticated
     * user within their organization. It's commonly used for displaying notification
     * badges, indicators, and UI elements that show notification status. The count
     * only includes notifications that belong to the user and their organization.
     *
     * @returns {Object} Response containing the unread notification count
     * @returns {number} returns.count - Number of unread notifications for the user
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @example
     * ```typescript
     * // Get unread notification count for badge display
     * const result = await api.notification.unreadCount.query()
     *
     * // Update UI badge with count
     * updateNotificationBadge(result.count)
     *
     * // Show indicator if there are unread notifications
     * const hasUnread = result.count > 0
     * ```
     */
    unreadCount: igniter.query({
      name: 'Unread Count',
      description: 'Get count of unread notifications',
      path: '/unread-count',
      method: 'GET',
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      handler: async ({ response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding with notification count retrieval.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Business Logic: Get unread notification count using repository for badge display.
        const count = await context.notification.getUnreadCount({
          recipientId: session.user!.id,
          organizationId: session.organization.id,
        })

        // Response: Return unread notification count for badge display and UI indicators.
        return response.success({ count })
      },
    }),

    /**
     * @action delete
     * @description Deletes a specific notification for the authenticated user.
     *
     * This endpoint permanently removes a notification from the system after
     * validating that it belongs to the authenticated user and their organization.
     * This action is irreversible and will permanently delete the notification
     * data. Triggers real-time updates to connected clients via revalidation.
     *
     * @param {string} id - The unique identifier of the notification to delete
     * @returns {Object} Success confirmation message
     * @returns {string} returns.message - Confirmation message for successful deletion
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @throws {404} When notification is not found or access is denied
     * @example
     * ```typescript
     * // Delete a specific notification
     * const result = await api.notification.delete.mutate({
     *   id: 'notif_123'
     * })
     *
     * console.log(result.message) // "Notification deleted successfully"
     *
     * // The notification is now permanently removed from the system
     * ```
     */
    delete: igniter.mutation({
      name: 'Delete',
      description: 'Delete a notification',
      path: '/:id' as const,
      method: 'DELETE',
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding with notification deletion.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Observation: Extract notification ID from path parameters for permanent deletion.
        const notificationId = request.params.id

        // Business Logic: Permanently remove notification using repository with security validation.
        const deleted = await context.notification.delete({
          notificationId,
          recipientId: session.user!.id,
          organizationId: session.organization.id,
        })

        // Business Rule: Validate that notification was successfully deleted before confirming operation.
        if (!deleted) {
          return response.notFound('Notification not found or access denied')
        }

        // Response: Confirm successful deletion and trigger real-time updates for connected clients to refresh notification lists.
        return response.revalidate(['notification.list']).success({
          message: 'Notification deleted successfully',
        })
      },
    }),

    /**
     * @action getUserPreferences
     * @description Gets all available notification types with user's current preferences.
     *
     * This endpoint retrieves all notification types configured in the notification service
     * along with the user's current preferences for each notification type and channel.
     * This provides a complete view of available notifications and current settings in one call.
     *
     * @returns {Object} Response containing notification types with user preferences
     * @returns {NotificationTypeWithPreferences[]} returns.types - Array of notification types with preferences
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @example
     * ```typescript
     * // Get notification types with user preferences
     * const result = await api.notification.getUserPreferences.query()
     *
     * // Access notification types and preferences
     * result.types.forEach(type => {
     *   console.log(type.title) // "User Invited"
     *   console.log(type.preferences.inApp) // true/false
     *   console.log(type.preferences.email) // true/false
     * })
     * ```
     */
    getUserPreferences: igniter.query({
      name: 'Get User Preferences',
      description: 'Get notification types with user preferences',
      path: '/user-preferences',
      method: 'GET',
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      handler: async ({ response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Business Logic: Get notification types from the notification service.
        const types = context.services.notification.listTemplates()

        // Business Logic: Get current user preferences from user metadata.
        const currentUser = await context.services.database.user.findUnique({
          where: { id: session.user!.id },
          select: { metadata: true },
        })

        const metadata = parseMetadata<UserMetadata>(currentUser?.metadata)
        const userPreferences = metadata?.notifications?.preferences || {}

        // Data Transformation: Format types with user preferences for frontend consumption.
        const formattedTypes = types.map((type) => {
          const typeKey = type.type as string
          const userPrefs =
            userPreferences[typeKey as keyof typeof userPreferences] || {}

          return {
            type: typeKey,
            title: typeof type.title === 'string' ? type.title : type.title,
            description:
              typeof type.description === 'string'
                ? type.description
                : type.description,
            help: type.help,
            channels: type.channels,
            preferences: {
              inApp: userPrefs.inApp ?? true,
              email: userPrefs.email ?? true,
            },
          }
        })

        // Response: Return formatted notification types with user preferences.
        return response.success({ types: formattedTypes })
      },
    }),

    /**
     * @action updateNotificationPreferences
     * @description Updates the notification preferences for the authenticated user.
     *
     * This endpoint allows users to customize which notifications they want to receive
     * via email and in-app channels. The preferences are stored in the user's metadata
     * and are used by the notification system to determine delivery channels.
     *
     * @param {NotificationPreferences} preferences - Object containing notification type preferences
     * @returns {Object} Success confirmation with updated preferences
     * @returns {NotificationPreferences} returns.preferences - Updated preferences object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @throws {400} When preferences format is invalid
     * @example
     * ```typescript
     * // Update notification preferences
     * const result = await api.notification.updateNotificationPreferences.mutate({
     *   preferences: {
     *     USER_INVITED: { inApp: true, email: false },
     *     BILLING_SUCCESS: { inApp: true, email: true },
     *   }
     * })
     *
     * console.log(result.preferences) // Updated preferences object
     * ```
     */
    updateNotificationPreferences: igniter.mutation({
      name: 'Update Notification Preferences',
      description: 'Update user notification preferences',
      path: '/preferences',
      method: 'PATCH',
      use: [AuthFeatureProcedure(), NotificationProcedure()],
      body: UpdateNotificationPreferencesBodySchema,
      handler: async ({ request, response, context }) => {
        // 🔍 Authentication validation: Verify user is authenticated and has proper roles for notification management.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: Ensure user is authenticated and has organization access before proceeding.
        if (!session || !session.organization) {
          return response.unauthorized('Authentication required')
        }

        // Observation: Extract preferences from request body with validation.
        const { preferences } =
          request.body as UpdateNotificationPreferencesBody

        // Business Logic: Update user's notification preferences in their metadata.
        await updateMetadataSafe('user', {
          field: 'metadata',
          where: { id: session.user!.id },
          data: { notifications: { preferences } },
          schema: UserMetadataSchema,
        })

        // Response: Return success confirmation with updated preferences.
        return response.success({
          preferences,
          message: 'Notification preferences updated successfully',
        })
      },
    }),
  },
})
