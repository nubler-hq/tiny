import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { BillingPlanQuotaExceedEmailComponent } from './billing-plan-quota-exceed.component'

/**
 * Schema definition for the quota exceeded email template
 */
const schema = z.object({
  email: z.string().email(),
  organizationName: z.string(),
  organizationPlan: z.string(),
})

/**
 * Template configuration for quota exceeded emails
 * Separado do componente React para evitar bundle contamination
 */
export const quotaExceededEmailTemplate = MailProvider.template({
  subject: `Your Team Has Reached Its Usage Limit on ${AppConfig.name}`,
  schema,
  render: BillingPlanQuotaExceedEmailComponent,
})
