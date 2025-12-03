import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { TrialEndedEmailComponent } from './trial-ended.component'

/**
 * Schema definition for the trial ended email template
 */
const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  organization: z.string(),
})

/**
 * Template configuration for trial ended emails
 * Separado do componente React para evitar bundle contamination
 */
export const trialEndedEmailTemplate = MailProvider.template({
  subject: `Your Free Trial on ${AppConfig.name} Has Ended`,
  schema,
  render: TrialEndedEmailComponent,
})
