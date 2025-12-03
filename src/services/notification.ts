import { NotificationService } from '@/@saas-boilerplate/features/notification/services/notification.service'
import { prisma } from './prisma'
import { mail } from './mail'
import { z } from 'zod'
import type { InputJsonValue } from '@prisma/client/runtime/library'

/**
 * Context for the notification service.
 *
 * @property {string} [recipientId] - The ID of the user to receive the notification. If provided, only this user will be notified.
 * @property {string} [organizationId] - The ID of the organization. If provided (and recipientId is not), all members of this organization will be notified.
 */
type NotificationContext = {
  recipientId?: string
  organizationId?: string
}

/**
 * Notification service instance.
 *
 * Provides methods to send notifications via different channels (email, in-app) using predefined templates.
 */
export const notification = new NotificationService({
  context: {} as NotificationContext,
  channels: {
    /**
     * Email notification channel.
     * Sends notifications via email to the appropriate recipients based on the context.
     */
    email: {
      name: 'email',
      /**
       * Send an email notification.
       *
       * @param {object} params
       * @param {any} params.data - The payload data for the notification template.
       * @param {any} params.template - The notification template object.
       * @param {NotificationContext} params.context - The notification context (recipient/organization).
       * @returns {Promise<{success: boolean, message?: string}>}
       */
      send: async ({ data, template, context: notificationContext }) => {
        console.log('Sending email', data, template)

        if (!notificationContext) {
          throw new Error('Context is required')
        }

        const { recipientId, organizationId } = notificationContext

        let recipients: { id: string; email: string; name: string | null }[] =
          []

        if (recipientId) {
          // Fetch a single recipient if recipientId is provided.
          const recipient = await prisma.user.findUnique({
            where: {
              id: recipientId,
            },
            select: { id: true, email: true, name: true },
          })
          if (recipient) {
            recipients.push(recipient)
          }
        } else if (organizationId) {
          // Fetch all members of the organization if organizationId is provided.
          const members = await prisma.member.findMany({
            where: {
              organizationId,
            },
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          })
          recipients = members.map((member) => member.user)
        } else {
          // Fetch all users if neither recipientId nor organizationId is provided.
          recipients = await prisma.user.findMany({
            select: { id: true, email: true, name: true },
          })
        }

        if (recipients.length === 0) {
          // If no recipients are found, stop the email sending process.
          console.warn('No recipients found for email notification.')
          return { success: false, message: 'No recipients found' }
        }

        // Send an email to each recipient.
        await Promise.all(
          recipients.map(async (recipient) => {
            // Ensure recipient email is available.
            if (!recipient.email) {
              console.warn(
                `Recipient ${recipient.id} does not have an email address.`,
              )
              return // Skip this recipient
            }

            await mail.send({
              template: 'notification',
              to: recipient.email,
              subject:
                typeof template.title === 'string'
                  ? template.title
                  : await template.title(data),
              data: {
                email: recipient.email,
                name: recipient?.name || recipient.email.split('@')[0],
                content:
                  typeof template.description === 'string'
                    ? template.description
                    : await template.description(data),
                title:
                  typeof template.title === 'string'
                    ? template.title
                    : await template.title(data),
                action:
                  typeof template.action === 'function'
                    ? await template.action(data)
                    : template.action,
              },
            })
          }),
        )

        return {
          success: true,
        }
      },
    },
    /**
     * In-app notification channel.
     * Creates notifications in the application's database for users to view in the UI.
     */
    'in-app': {
      name: 'in-app',
      /**
       * Send an in-app notification.
       *
       * @param {object} params
       * @param {any} params.data - The payload data for the notification template.
       * @param {any} params.template - The notification template object.
       * @param {NotificationContext} params.context - The notification context (recipient/organization).
       * @returns {Promise<{success: boolean, id?: string, ids?: string[]}>}
       */
      send: async ({ data, template, context: notificationContext }) => {
        console.log('Sending in-app', data, template)

        if (!notificationContext) {
          throw new Error('Notification context is required')
        }

        const { recipientId, organizationId } = notificationContext

        if (recipientId) {
          // Create a notification for a single recipient.
          const notification = await prisma.notification.create({
            data: {
              type: template.type,
              data,
              recipientId,
              organizationId,
              action: template.action as InputJsonValue,
            },
            include: {
              organization: {
                select: {
                  name: true,
                },
              },
            },
          })

          return {
            success: true,
            id: notification.id,
          }
        } else if (organizationId) {
          // Find all members of the organization.
          const members = await prisma.member.findMany({
            where: {
              organizationId,
            },
            select: {
              userId: true,
            },
          })

          // Create notifications for all members of the organization.
          const notifications = await Promise.all(
            members.map((member) =>
              prisma.notification.create({
                data: {
                  type: template.type,
                  data,
                  recipientId: member.userId,
                  organizationId,
                  action: template.action as InputJsonValue,
                },
                include: {
                  organization: {
                    select: {
                      name: true,
                    },
                  },
                },
              }),
            ),
          )

          return {
            success: true,
            ids: notifications.map((n) => n.id),
          }
        } else {
          // Find all users.
          const users = await prisma.user.findMany({
            select: {
              id: true,
            },
          })

          // Create notifications for all users.
          const notifications = await Promise.all(
            users.map((user) =>
              prisma.notification.create({
                data: {
                  type: template.type,
                  data,
                  recipientId: user.id,
                  organizationId: undefined, // No organizationId for global notifications
                  action: template.action as InputJsonValue,
                },
              }),
            ),
          )

          return {
            success: true,
            ids: notifications.map((n) => n.id),
          }
        }
      },
    },
  },
  /**
   * Notification templates.
   *
   * Each template defines the channels, title, description, help text, action, and schema for a specific notification event.
   */
  templates: {
    /**
     * User invited to organization.
     * Triggered when a user is invited to join an organization.
     */
    USER_INVITED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: 'User Invited',
      description: 'You have been invited to join an organization',
      help: 'When a user is invited to an organization',
      action: {
        label: 'Accept',
        url: '/app/invites',
      },
      schema: z.object({
        organizationName: z.string(),
        inviterName: z.string(),
        role: z.string(),
      }),
    }),
    /**
     * Billing payment successful.
     * Triggered when a billing payment is successful.
     */
    BILLING_SUCCESS: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Billing Successful for ${data.planName || 'your plan'}`,
      description: (data) =>
        `Your payment of ${data.amount} ${data.currency} for ${data.planName || 'your plan'} was successful.`,
      help: 'When a billing payment is successful',
      action: {
        label: 'View Invoice',
        url: '/app/billing',
      },
      schema: z.object({
        amount: z.number(),
        currency: z.string(),
        planName: z.string().optional(),
      }),
    }),
    /**
     * Billing payment failed.
     * Triggered when a billing payment fails.
     */
    BILLING_FAILED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Billing Failed for ${data.planName || 'your plan'}`,
      description: (data) =>
        `Your payment of ${data.amount} ${data.currency} for ${data.planName || 'your plan'} failed. Reason: ${data.reason || 'unknown'}.`,
      help: 'When a billing payment fails',
      action: {
        label: 'Update Payment',
        url: '/app/billing/settings',
      },
      schema: z.object({
        amount: z.number(),
        currency: z.string(),
        reason: z.string().optional(),
        planName: z.string().optional(),
      }),
    }),
    /**
     * Member joined organization.
     * Triggered when a new member joins the organization.
     */
    MEMBER_JOINED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `${data.memberName} Joined Your Organization`,
      description: (data) =>
        `${data.memberName} (${data.memberEmail}) has joined your organization as a ${data.role}.`,
      help: 'When a new member joins the organization',
      action: {
        label: 'View Members',
        url: '/app/settings/members',
      },
      schema: z.object({
        memberName: z.string(),
        memberEmail: z.string(),
        role: z.string(),
      }),
    }),
    /**
     * Member left organization.
     * Triggered when a member leaves the organization.
     */
    MEMBER_LEFT: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `${data.memberName} Left Your Organization`,
      description: (data) =>
        `${data.memberName} (${data.memberEmail}) has left your organization.`,
      help: 'When a member leaves the organization',
      action: {
        label: 'View Members',
        url: '/app/settings/members',
      },
      schema: z.object({
        memberName: z.string(),
        memberEmail: z.string(),
      }),
    }),
    /**
     * New lead created.
     * Triggered when a new lead is created.
     */
    LEAD_CREATED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `New Lead Created: ${data.leadName || data.leadEmail}`,
      description: (data) =>
        `A new lead ${data.leadName || data.leadEmail} has been created from ${data.source || 'an unknown source'}.`,
      help: 'When a new lead is created',
      action: (data) => ({
        label: 'View Lead',
        url: `/app/leads?search=${data.leadEmail}`,
      }),
      schema: z.object({
        leadName: z.string().optional().nullable(),
        leadEmail: z.string(),
        source: z.string().optional().nullable(),
      }),
    }),
    /**
     * Lead updated.
     * Triggered when a lead is updated.
     */
    LEAD_UPDATED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Lead Updated: ${data.leadName || data.leadEmail}`,
      description: (data) =>
        `The lead ${data.leadName || data.leadEmail} has been updated. Changes: ${data.changes.join(', ')}.`,
      help: 'When a lead is updated',
      action: (data) => ({
        label: 'View Lead',
        url: `/app/leads?search=${data.leadEmail}`,
      }),
      schema: z.object({
        leadName: z.string().optional().nullable(),
        leadEmail: z.string(),
        changes: z.array(z.string()),
      }),
    }),
    /**
     * New submission created.
     * Triggered when a new submission is created.
     */
    SUBMISSION_CREATED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Submission Created: ${data.leadName || data.leadEmail}`,
      description: (data) =>
        `A new submission ${data.leadName || data.leadEmail} has been created from ${data.source || 'an unknown source'}.`,
      help: 'When a new submission is created',
      action: (data) => ({
        label: 'View Submission',
        url: `/app/submissions?search=${data.leadEmail}`,
      }),
      schema: z.object({
        leadName: z.string().optional().nullable(),
        leadEmail: z.string(),
        source: z.string().optional().nullable(),
      }),
    }),
    /**
     * Subscription created.
     * Triggered when a new subscription is created.
     */
    SUBSCRIPTION_CREATED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Subscription Created: ${data.planName}`,
      description: (data) =>
        `Your new subscription for ${data.planName} has been successfully created with a payment of ${data.amount} ${data.currency}.`,
      help: 'When a new subscription is created',
      action: {
        label: 'View Subscription',
        url: '/app/billing',
      },
      schema: z.object({
        planName: z.string(),
        amount: z.number(),
        currency: z.string(),
      }),
    }),
    /**
     * Subscription updated.
     * Triggered when a subscription is updated.
     */
    SUBSCRIPTION_UPDATED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Subscription Updated: ${data.planName}`,
      description: (data) =>
        `Your subscription for ${data.planName} has been updated. Changes: ${data.changes.join(', ')}.`,
      help: 'When a subscription is updated',
      action: {
        label: 'View Subscription',
        url: '/app/billing',
      },
      schema: z.object({
        planName: z.string(),
        changes: z.array(z.string()),
      }),
    }),
    /**
     * Subscription canceled.
     * Triggered when a subscription is canceled.
     */
    SUBSCRIPTION_CANCELED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Subscription Canceled: ${data.planName}`,
      description: (data) =>
        `Your subscription for ${data.planName} has been canceled. Reason: ${data.reason || 'not specified'}.`,
      help: 'When a subscription is canceled',
      action: {
        label: 'View Billing',
        url: '/app/billing',
      },
      schema: z.object({
        planName: z.string(),
        reason: z.string().optional(),
      }),
    }),
    /**
     * Integration connected.
     * Triggered when a new integration is connected.
     */
    INTEGRATION_CONNECTED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Integration Connected: ${data.name || data.provider}`,
      description: (data) =>
        `The ${data.name || data.provider} integration has been successfully connected.`,
      help: 'When a new integration is connected',
      action: {
        label: 'View Integrations',
        url: '/app/settings/integrations',
      },
      schema: z.object({
        provider: z.string(),
        name: z.string().optional(),
      }),
    }),
    /**
     * Integration disconnected.
     * Triggered when an integration is disconnected.
     */
    INTEGRATION_DISCONNECTED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) =>
        `Integration Disconnected: ${data.name || data.provider}`,
      description: (data) =>
        `The ${data.name || data.provider} integration has been disconnected.`,
      help: 'When an integration is disconnected',
      action: {
        label: 'View Integrations',
        url: '/app/settings/integrations',
      },
      schema: z.object({
        provider: z.string(),
        name: z.string().optional(),
      }),
    }),
    /**
     * Webhook delivery failed.
     * Triggered when a webhook delivery fails.
     */
    WEBHOOK_FAILED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Webhook Failed for ${data.url}`,
      description: (data) =>
        `A webhook to ${data.url} failed with error: "${data.error}" after ${data.attempts} attempts.`,
      help: 'When a webhook delivery fails',
      action: {
        label: 'View Webhooks',
        url: '/app/settings/webhooks',
      },
      schema: z.object({
        url: z.string(),
        error: z.string(),
        attempts: z.number(),
      }),
    }),
    /**
     * API key created.
     * Triggered when a new API key is created.
     */
    API_KEY_CREATED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `New API Key Created: ${data.description}`,
      description: (data) =>
        `A new API key "${data.keyPreview}..." has been created for: ${data.description}.`,
      help: 'When a new API key is created',
      action: {
        label: 'View API Keys',
        url: '/app/settings/api-keys',
      },
      schema: z.object({
        description: z.string(),
        keyPreview: z.string(),
      }),
    }),
    /**
     * API key expired.
     * Triggered when an API key expires.
     */
    API_KEY_EXPIRED: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `API Key Expired: ${data.description}`,
      description: (data) =>
        `Your API key "${data.keyPreview}..." for: ${data.description} has expired.`,
      help: 'When an API key expires',
      action: {
        label: 'Manage API Keys',
        url: '/app/settings/api-keys',
      },
      schema: z.object({
        description: z.string(),
        keyPreview: z.string(),
      }),
    }),
    /**
     * System maintenance notification.
     * Triggered for system-wide maintenance events. Typically only in-app.
     */
    SYSTEM_MAINTENANCE: NotificationService.createTemplate({
      channels: ['in-app'], // Typically only in-app for system wide
      title: (data) => `System Maintenance: ${data.title}`,
      description: (data) =>
        `${data.description} (Scheduled at: ${data.scheduledAt || 'N/A'})`,
      help: 'System wide maintenance notifications',
      action: {
        label: 'View Status',
        url: '/status',
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        scheduledAt: z.string().optional(),
      }),
    }),
    /**
     * General purpose notification.
     * Can be used for any generic notification event.
     */
    GENERAL: NotificationService.createTemplate({
      channels: ['email', 'in-app'],
      title: (data) => `Notification: ${data.title}`,
      description: (data) => data.description,
      help: 'General purpose notification',
      action: {
        label: 'View Details',
        url: '/app/notifications',
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
  },
})

/**
 * Type representing all possible notification events.
 */
export type NotificationEvents = typeof notification.$Infer.events

/**
 * Type representing the payloads for all notification templates.
 */
export type NotificationPayloads = typeof notification.$Infer.payloads