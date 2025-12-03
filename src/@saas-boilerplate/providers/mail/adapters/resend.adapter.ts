import type { MailProviderOptions } from '../interfaces/provider.interface'
import { MailProvider } from '../mail.provider'
import { Resend } from 'resend'

export const resendAdapter = MailProvider.adapter(
  (options: MailProviderOptions) => ({
    send: async ({ to, subject, html, text, scheduledAt }) => {
      const resend = new Resend(options.secret)

      await resend.emails.create({
        to,
        from: options.from,
        subject,
        html,
        text,
        scheduledAt: scheduledAt?.toISOString(),
      })
    },
  }),
)
