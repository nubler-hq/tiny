import type { NotificationPayloads } from '@/services/notification'

/**
 * Returns the notification content (title and description) for a given notification type and payload.
 *
 * @template TType - The type of the notification, must be a key of NotificationPayloads.
 * @template TData - The payload data for the notification type.
 * @param type - The notification type.
 * @param data - The payload data for the notification.
 * @returns An object containing the title and description for the notification.
 */
export function getNotificationContent<
  TType extends keyof NotificationPayloads,
>(
  type: TType,
  data: NotificationPayloads[TType],
): { title: string; description: string } {
  switch (type) {
    case 'USER_INVITED':
      return {
        title: 'Invitation to organization',
        description: `${(data as NotificationPayloads['USER_INVITED']).inviterName} invited you to ${(data as NotificationPayloads['USER_INVITED']).organizationName}`,
      }
    case 'BILLING_SUCCESS':
      return {
        title: 'Payment successful',
        description: `${(data as NotificationPayloads['BILLING_SUCCESS']).currency} ${(data as NotificationPayloads['BILLING_SUCCESS']).amount} payment processed successfully`,
      }
    case 'BILLING_FAILED':
      return {
        title: 'Payment failed',
        description: `${(data as NotificationPayloads['BILLING_FAILED']).currency} ${(data as NotificationPayloads['BILLING_FAILED']).amount} payment failed: ${(data as NotificationPayloads['BILLING_FAILED']).reason || 'Unknown error'}`,
      }
    case 'MEMBER_JOINED':
      return {
        title: 'New member',
        description: `${(data as NotificationPayloads['MEMBER_JOINED']).memberName} (${(data as NotificationPayloads['MEMBER_JOINED']).memberEmail}) joined the organization as ${(data as NotificationPayloads['MEMBER_JOINED']).role}`,
      }
    case 'LEAD_CREATED':
      return {
        title: 'New lead',
        description: `Lead ${(data as NotificationPayloads['LEAD_CREATED']).leadName || (data as NotificationPayloads['LEAD_CREATED']).leadEmail} created${(data as NotificationPayloads['LEAD_CREATED']).source ? ` via ${(data as NotificationPayloads['LEAD_CREATED']).source}` : ''}`,
      }
    case 'SUBSCRIPTION_CREATED':
      return {
        title: 'Subscription activated',
        description: `Plan ${(data as NotificationPayloads['SUBSCRIPTION_CREATED']).planName} activated (${(data as NotificationPayloads['SUBSCRIPTION_CREATED']).currency} ${(data as NotificationPayloads['SUBSCRIPTION_CREATED']).amount})`,
      }
    case 'INTEGRATION_CONNECTED':
      return {
        title: 'Integration connected',
        description: `Integration ${(data as NotificationPayloads['INTEGRATION_CONNECTED']).provider}${(data as NotificationPayloads['INTEGRATION_CONNECTED']).name ? ` (${(data as NotificationPayloads['INTEGRATION_CONNECTED']).name})` : ''} connected`,
      }
    case 'API_KEY_CREATED':
      return {
        title: 'API Key created',
        description: `New API Key "${(data as NotificationPayloads['API_KEY_CREATED']).description}" created (${(data as NotificationPayloads['API_KEY_CREATED']).keyPreview})`,
      }
    case 'SYSTEM_MAINTENANCE':
      return {
        title:
          (data as NotificationPayloads['SYSTEM_MAINTENANCE']).title ||
          'System maintenance',
        description: (data as NotificationPayloads['SYSTEM_MAINTENANCE'])
          .description,
      }
    case 'GENERAL':
      return {
        title: (data as NotificationPayloads['GENERAL']).title,
        description: (data as NotificationPayloads['GENERAL']).description,
      }
    default:
      return {
        title: 'Notification',
        description: 'You have a new notification',
      }
  }
}
