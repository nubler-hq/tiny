import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { BillingPlanUpgradeEmailComponent } from './billing-plan-upgrade.component'

/**
 * Schema definition for the plan upgrade email template
 */
const schema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email(),
  plan: z.string(),
  organization: z.string(),
})

/**
 * Template configuration for plan upgrade emails
 * Separado do componente React para evitar bundle contamination
 */
export const planUpgradeEmailTemplate = MailProvider.template({
  subject: `Thank You for Upgrading Your Plan on ${AppConfig.name}!`,
  schema,
  render: BillingPlanUpgradeEmailComponent,
})
