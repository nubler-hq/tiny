import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { FeedbackEmailComponent } from './feedback.email.component'

/**
 * Schema definition for the feedback email template
 */
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.enum(['bug', 'feature', 'improvement', 'other']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  userAgent: z.string().optional(),
  url: z.string().optional(),
})

/**
 * Template configuration for feedback emails
 * Separado do componente React para evitar bundle contamination
 */
export const feedbackEmailTemplate = MailProvider.template({
  subject: `New Feedback: ${'{subject}'} - ${AppConfig.name}`,
  schema,
  render: FeedbackEmailComponent,
})
