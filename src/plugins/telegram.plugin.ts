import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager/provider'
import { z } from 'zod'
import { Url } from '@/@saas-boilerplate/utils/url'

export const telegram = PluginManager.plugin({
  name: 'Telegram',
  slug: 'telegram',
  schema: z.object({
    chatId: z.string().describe('Telegram chat ID'),
    token: z.string().describe('Telegram bot token'),
  }),
  metadata: {
    verified: true,
    published: true,
    logo: 'https://telegram.org/img/t_logo.png',
    description:
      'Effortlessly link your Telegram account to send and receive instant notifications.',
    category: 'notifications',
    developer: 'Telegram',
    screenshots: [],
    website: 'https://telegram.org/',
    links: {
      install: 'https://telegram.org/',
      guide: 'https://telegram.org/faq',
    },
  },
  actions: {
    sendEvent: {
      name: 'Send Event',
      schema: z.object({
        event: z.string(),
        data: z.any(),
      }),
      handler: async ({ config, input }) => {
        const { chatId, token } = config
        const { event, data } = input
        let message: string

        if (event === 'lead.created') {
          const leadUrl = Url.get(`/app/leads/${data.id}`)
          message = `🚀 *New Lead Received*\n\n*Name:* ${data.name || 'N/A'}\n*Email:* ${data.email}\n*Phone:* ${data.phone || 'N/A'}\n\n[View Lead Details](${leadUrl})`
        } else if (event === 'submission.created') {
          const leadUrl = Url.get(`/app/leads/${data.lead.id}`)

          // Dynamically create fields from submission metadata
          const submissionData = data.metadata?.data || {}
          const fields = Object.entries(submissionData)
            .map(
              ([key, value]) =>
                `*${key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:* ${value}`,
            )
            .join('\n')

          message = `📝 *New Submission Received!*\n\n*From:* ${data.lead.name || data.lead.email}\n*Source:* ${data.metadata?.source || 'N/A'}\n\n*Details:*\n${fields}\n\n[View Lead Details](${leadUrl})`
        } else {
          // Fallback for other events
          message = `📢 *Event:* ${event}\n\n\`\`\`json\n${JSON.stringify(
            data,
            null,
            2,
          )}\n\`\`\`\n\n_Timestamp: ${new Date().toISOString()}_\n_Source: SaaS Boilerplate_`
        }

        // Telegram Bot API URL
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`

        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            `Telegram API error: ${response.status} - ${errorData.description || response.statusText}`,
          )
        }

        const responseData = await response.json()
        console.log(`[Telegram] Event "${event}" sent successfully`, {
          messageId: responseData.result?.message_id,
        })
        return responseData
      },
    },
  },
})
