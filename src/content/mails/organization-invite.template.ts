import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { OrganizationInviteEmailComponent } from './organization-invite.component'

/**
 * Schema definition for the organization invite email template
 */
const schema = z.object({
  email: z.string().email(),
  organization: z.string(),
  url: z.string().url(),
})

/**
 * Template configuration for organization invite emails
 * Separado do componente React para evitar bundle contamination
 */
export const organizationInviteTemplate = MailProvider.template({
  subject: `You've Been Invited to Join on Team on ${AppConfig.name}`,
  schema,
  render: OrganizationInviteEmailComponent,
})
