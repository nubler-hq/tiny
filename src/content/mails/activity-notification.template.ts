import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { ActivityNotificationEmailComponent } from './activity-notification.component'

/**
 * Schema definition for the activity notification email template
 */
const schema = z.object({
  name: z.string().optional(), // Recipient name (optional)
  email: z.string().email(), // Recipient email
  title: z.string(), // Activity title
  content: z.string(), // Activity content
  action: z
    .object({
      label: z.string(), // CTA Button label (optional)
      url: z.string(), // CTA Button URL (optional)
    })
    .optional(),
})

/**
 * Template configuration for activity notification emails
 * Separado do componente React para evitar bundle contamination
 */
export const activityNotificationEmailTemplate = MailProvider.template({
  subject: `Account Activity Alert from ${AppConfig.name}`,
  schema,
  render: ActivityNotificationEmailComponent,
})
