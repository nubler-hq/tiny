import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { TrialStartedEmailComponent } from './trial-started.component'

/**
 * Schema definition for the trial started email template
 */
const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  organization: z.string(),
  trialEndDate: z.string(), // ISO string (RFC 3339)
})

/**
 * Template configuration for trial started emails
 * Separado do componente React para evitar bundle contamination
 */
export const trialStartedEmailTemplate = MailProvider.template({
  subject: `Your Free Trial Is Activated on ${AppConfig.name}`,
  schema,
  render: TrialStartedEmailComponent,
})
