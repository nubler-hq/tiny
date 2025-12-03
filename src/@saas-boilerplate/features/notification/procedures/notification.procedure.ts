import { igniter } from '@/igniter'
import type { ListNotificationsQuery } from '../notification.interfaces'
import type { NotificationPayloads } from '@/services/notification'

/**
 * @procedure NotificationProcedure
 * @description Procedure for managing user notifications and real-time messaging operations.
 *
 * This procedure provides the comprehensive business logic layer for notification management,
 * handling database operations, real-time messaging, and notification delivery. It manages
 * the complete lifecycle of notifications including creation, listing, marking as read,
 * bulk operations, and sending real-time updates to connected clients.
 *
 * The procedure ensures proper data isolation by enforcing organization-scoped operations
 * and manages notification preferences, delivery channels, and real-time streaming.
 * It provides methods for individual notification operations as well as bulk operations
 * for improved performance.
 *
 * Key features include:
 * - Paginated notification listing with filtering
 * - Real-time streaming for automatic updates
 * - Bulk operations for marking notifications as read
 * - Security validation for recipient access
 * - Organization isolation for multi-tenant data
 * - Template rendering for rich notification content
 *
 * @example
 * ```typescript
 * // List notifications with pagination and filtering
 * const notifications = await context.notification.list({
 *   recipientId: 'user_123',
 *   organizationId: 'org_456',
 *   query: { page: 1, limit: 10, unreadOnly: true }
 * })
 *
 * // Mark specific notification as read
 * await context.notification.markAsRead({
 *   notificationId: 'notif_123',
 *   recipientId: 'user_123',
 *   organizationId: 'org_456'
 * })
 *
 * // Get unread count for badge display
 * const count = await context.notification.getUnreadCount({
 *   recipientId: 'user_123',
 *   organizationId: 'org_456'
 * })
 * ```
 */
export const NotificationProcedure = igniter.procedure({
  name: 'NotificationProcedure', // Adhering to naming convention
  handler: (_, { context }) => {
    // Context Extension: Return both instances in hierarchical structure for consistency.
    return {
      notification: {
        /**
         * @method list
         * @description Lists notifications for a specific recipient and organization.
         *
         * This method retrieves a paginated list of notifications for a given recipient
         * and organization, optionally filtering by read status and notification type.
         *
         * @param {string} recipientId - The ID of the recipient to retrieve notifications for.
         * @param {string} organizationId - The ID of the organization to retrieve notifications for.
         * @param {ListNotificationsQuery} query - The query parameters for the notification list.
         * @returns {Promise<{ notifications: Notification[], total: number }>} A promise that resolves to the notification list and total count.
         * @throws {Error} When the database query fails.
         */
        list: async ({
          recipientId,
          organizationId,
          query,
        }: {
          recipientId: string
          organizationId: string
          query: ListNotificationsQuery
        }) => {
          // Business Rule: Always filter by recipientId and organizationId for multi-tenant isolation.
          const where = {
            recipientId,
            organizationId,
            ...(query.unreadOnly && { readAt: null }),
            ...(query.type && { type: query.type }),
          }

          // Business Logic: Calculate pagination offset for database query.
          const skip = (query.page - 1) * query.limit

          // Business Logic: Execute both queries in parallel for optimal performance.
          const [notifications, total] = await Promise.all([
            context.services.database.notification.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              skip,
              take: query.limit,
              include: {
                recipient: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            }),
            context.services.database.notification.count({ where }),
          ])

          // Business Logic: Render the notifications using notification service templates.
          const renderedNotifications = await Promise.all(
            notifications.map(async (notification) => {
              const template =
                await context.services.notification.renderTemplate(
                  notification.type as keyof NotificationPayloads,
                  notification.data as NotificationPayloads[keyof NotificationPayloads],
                )
              return {
                ...notification,
                ...template,
              }
            }),
          )

          // Response: Return the rendered notifications and total count for pagination.
          return { notifications: renderedNotifications, total }
        },
        /**
         * @method findById
         * @description Retrieves a specific notification by ID with security validation.
         *
         * This method finds a single notification by its unique identifier, ensuring
         * that the notification belongs to the specified recipient and organization
         * for proper data isolation and security.
         *
         * @param {string} notificationId - The unique identifier of the notification
         * @param {string} recipientId - User ID for security validation
         * @param {string} organizationId - Organization ID for additional filtering and security
         * @returns {Promise<Notification | null>} Notification object if found, null otherwise
         * @throws {Error} When database query fails
         */
        findById: ({
          notificationId,
          recipientId,
          organizationId,
        }: {
          notificationId: string
          recipientId: string
          organizationId: string
        }) => {
          // Business Logic: Find notification by ID with security validation for recipient access.
          return context.services.database.notification.findUnique({
            where: {
              id: notificationId,
              recipientId,
              organizationId,
            },
          })
        },
        /**
         * @method markAsRead
         * @description Marks a specific notification as read for the authenticated user.
         *
         * This method updates a notification's read status by setting the readAt
         * timestamp to the current time. It ensures the notification belongs to
         * the specified recipient and organization for security.
         *
         * @param {string} notificationId - The unique identifier of the notification to mark as read
         * @param {string} recipientId - User ID for security validation
         * @param {string} organizationId - Organization ID for additional filtering and security
         * @returns {Promise<Notification>} Updated notification object with read timestamp
         * @throws {Error} When notification is not found or database operation fails
         */
        markAsRead: ({
          notificationId,
          recipientId,
          organizationId,
        }: {
          notificationId: string
          recipientId: string
          organizationId: string
        }) => {
          // Business Logic: Mark notification as read by setting read timestamp with security validation.
          return context.services.database.notification.update({
            where: {
              id: notificationId,
              recipientId,
              organizationId,
            },
            data: { readAt: new Date() },
          })
        },
        /**
         * @method markAllAsRead
         * @description Marks all unread notifications as read for the authenticated user.
         *
         * This method performs a bulk update operation to mark all unread notifications
         * as read by setting the readAt timestamp to the current time. It filters
         * notifications by recipient and organization for security and data isolation.
         *
         * @param {string} recipientId - User ID for security validation
         * @param {string} organizationId - Organization ID for additional filtering and security
         * @returns {Promise<{ count: number }>} Number of notifications marked as read
         * @throws {Error} When database operation fails
         */
        markAllAsRead: ({
          recipientId,
          organizationId,
        }: {
          recipientId: string
          organizationId: string
        }) => {
          // Business Logic: Mark all unread notifications as read in a single bulk database operation.
          return context.services.database.notification.updateMany({
            where: {
              recipientId,
              organizationId,
              readAt: null,
            },
            data: { readAt: new Date() },
          })
        },
        /**
         * @method getUnreadCount
         * @description Retrieves the count of unread notifications for the authenticated user.
         *
         * This method counts all notifications that have not been marked as read
         * (readAt is null) for the specified recipient and organization. It's commonly
         * used for displaying notification badges and indicators in the UI.
         *
         * @param {string} recipientId - User ID for security validation
         * @param {string} organizationId - Organization ID for additional filtering and security
         * @returns {Promise<number>} Number of unread notifications
         * @throws {Error} When database query fails
         */
        getUnreadCount: ({
          recipientId,
          organizationId,
        }: {
          recipientId: string
          organizationId: string
        }) => {
          // Business Logic: Count unread notifications for badge display and UI indicators.
          return context.services.database.notification.count({
            where: {
              recipientId,
              organizationId,
              readAt: null,
            },
          })
        },
        /**
         * @method delete
         * @description Permanently deletes a notification for the authenticated user.
         *
         * This method permanently removes a notification from the database after
         * validating that it belongs to the specified recipient and organization.
         * This operation cannot be undone and should be used with caution.
         *
         * @param {string} notificationId - The unique identifier of the notification to delete
         * @param {string} recipientId - User ID for security validation
         * @param {string} organizationId - Organization ID for additional filtering and security
         * @returns {Promise<Notification>} Deleted notification object
         * @throws {Error} When notification is not found or database operation fails
         */
        delete: ({
          notificationId,
          recipientId,
          organizationId,
        }: {
          notificationId: string
          recipientId: string
          organizationId: string
        }) => {
          // Business Logic: Permanently delete notification from database with security validation.
          return context.services.database.notification.delete({
            where: {
              id: notificationId,
              recipientId,
              organizationId,
            },
          })
        },
      },
    }
  },
})
