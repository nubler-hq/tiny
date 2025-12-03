import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { WelcomeEmailComponent } from './welcome.email.component'

/**
 * Schema definition for the welcome email template
 */
const schema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email(),
})

/**
 * Template configuration for welcome emails
 * Separado do componente React para evitar bundle contamination
 */
export const welcomeEmailTemplate = MailProvider.template({
  subject: `Welcome to ${AppConfig.name} – Your Account Is Ready!`,
  schema,
  render: WelcomeEmailComponent,
})
