import nodemailer from 'nodemailer'

import { MailProvider } from '../mail.provider'
import { type MailProviderOptions } from '../interfaces/provider.interface'

export const smtpAdapter = MailProvider.adapter(
  (options: MailProviderOptions) => {
    // Create a fresh transporter for each request to avoid connection issues

    const createTransporter = () => {
      // Use the SMTP URL directly - nodemailer supports this natively
      const smtpUrl = options.secret

      return nodemailer.createTransport(smtpUrl, {
        // Disable certificate validation for local development
        tls: {
          rejectUnauthorized: false,
        },
        // Connection settings for MailHog
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      })
    }

    return {
      send: async ({ to, subject, html, text }) => {
        const transport = createTransporter()

        // Set up email data
        const mailOptions = {
          from: options.from,
          to,
          subject,
          html,
          text,
        }

        try {
          const info = await transport.sendMail(mailOptions)
          console.log('✅ [DEBUG] Email sent successfully:', info.messageId)
          // Close the connection after sending
          transport.close()
        } catch (error) {
          console.error('❌ [DEBUG] Error sending email:', error)
          // Close the connection on error too
          transport.close()
          throw error
        }
      },
    }
  },
)
