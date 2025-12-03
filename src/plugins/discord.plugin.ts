import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager/provider'
import { z } from 'zod'
import { Url } from '@/@saas-boilerplate/utils/url'

export const discord = PluginManager.plugin({
  slug: 'discord',
  name: 'Discord',
  schema: z.object({
    webhookUrl: z
      .string()
      .describe('Ex: https://discord.com/api/webhooks/1234567890/abcdefg'),
  }),
  metadata: {
    verified: true,
    published: true,
    logo: 'https://logodownload.org/wp-content/uploads/2017/11/discord-logo-8-1.png',
    description:
      'Seamlessly connect your Discord server to receive real-time notifications and updates, keeping your team informed and engaged with automated alerts.',
    category: 'notifications',
    developer: 'Discord',
    screenshots: [],
    website: 'https://discord.com/',
    links: {
      install: 'https://discord.com/',
      guide: 'https://discord.com/developers/docs',
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
        const { webhookUrl } = config
        const { event, data } = input

        if (event === 'lead.created') {
          const leadUrl = Url.get(`/app/leads/${data.id}`)
          const discordPayload = {
            content: `*New Lead Created!* 🚀`,
            embeds: [
              {
                title: data.name || 'New Lead',
                description: `A new lead has been created.`,
                color: 5814783,
                fields: [
                  {
                    name: 'Name',
                    value: data.name || 'N/A',
                    inline: true,
                  },
                  {
                    name: 'Email',
                    value: data.email,
                    inline: true,
                  },
                  {
                    name: 'Link',
                    value: `[View Lead](${leadUrl})`,
                  },
                ],
                footer: {
                  text: `SaaS Boilerplate | Event: ${event}`,
                },
                timestamp: new Date().toISOString(),
              },
            ],
          }
          await sendDiscordMessage(webhookUrl, discordPayload)
        } else if (event === 'submission.created') {
          const leadUrl = Url.get(`/app/leads/${data.lead.id}`)
          const submissionData = data.metadata?.data || {}
          const fields = Object.entries(submissionData).map(([key, value]) => ({
            name: key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            value,
            inline: true,
          }))

          const discordPayload = {
            content: `*New Submission Received!* 📝`,
            embeds: [
              {
                title: `Submission from ${data.lead.name || data.lead.email}`,
                description: `A new form submission has been received from *${data.metadata?.source || 'N/A'}*.`,
                color: 16776960, // Yellow
                fields: [
                  ...fields,
                  {
                    name: 'Link',
                    value: `[View Lead Details](${leadUrl})`,
                    inline: false,
                  },
                ],
                footer: {
                  text: `SaaS Boilerplate | Event: ${event}`,
                },
                timestamp: new Date().toISOString(),
              },
            ],
          }
          await sendDiscordMessage(webhookUrl, discordPayload)
        }

        return { success: true }
      },
    },
  },
})

async function sendDiscordMessage(webhookUrl: string, payload: any) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`)
  }
}
