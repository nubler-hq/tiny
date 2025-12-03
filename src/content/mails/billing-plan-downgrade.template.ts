import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { BillingPlanDowngradeEmailComponent } from './billing-plan-downgrade.component'

/**
 * Schema definition for the plan downgrade email template
 */
const schema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  previousPlan: z.string(),
  newPlan: z.string(),
  organization: z.string(),
})

/**
 * Template configuration for plan downgrade emails
 * Separado do componente React para evitar bundle contamination
 */
export const downgradeEmailTemplate = MailProvider.template({
  subject: `Your Subscription Plan Was Changed on ${AppConfig.name}`,
  schema,
  render: BillingPlanDowngradeEmailComponent,
})
