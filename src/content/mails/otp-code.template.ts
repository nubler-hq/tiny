import { z } from 'zod'
import { AppConfig } from '@/config/boilerplate.config.client'
import { MailProvider } from '@/@saas-boilerplate/providers/mail'
import { OtpCodeEmailComponent } from './otp-code.component'

/**
 * Schema definition for the OTP code email template
 */
const schema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email(),
  otpCode: z.string(),
  expiresInMinutes: z.number().default(10),
})

/**
 * Template configuration for OTP code emails
 * Separado do componente React para evitar bundle contamination
 */
export const otpCodeEmailTemplate = MailProvider.template({
  subject: `Your Verification Code for ${AppConfig.name}`,
  schema,
  render: OtpCodeEmailComponent,
})
