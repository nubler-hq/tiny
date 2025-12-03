import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager/provider'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { z } from 'zod'

export const zapier = PluginManager.plugin({
  slug: 'zapier',
  name: 'Zapier',
  schema: z.object({
    apiKey: z.string().describe('Ex: 1234567890abcdef1234567890abcdef'),
    workspaceId: z.string().describe('Ex: 1234567890abcdef1234567890abcdef'),
    triggerId: z.string().describe('Ex: 1234567890abcdef1234567890abcdef'),
  }),
  metadata: {
    verified: true,
    published: true,
    logo: 'https://dubassets.com/integrations/clzlmz336000fjeqynwhfv8vo_S4yz4ak', // Zapier logo
    description:
      'Automate your workflows with Zapier, connecting your apps and services to create powerful automations without coding.',
    category: 'automations',
    developer: 'Zapier',
    screenshots: [],
    website:
      'https://www.pipelinersales.com/wp-content/uploads/2018/07/zapier.jpg',
    links: {
      install: 'https://zapier.com/',
      guide: 'https://zapier.com/help/',
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
        const { workspaceId, triggerId } = config
        const { event, data } = input

        const result = await tryCatch(
          (async () => {
            // Zapier Webhook URL format
            const webhookUrl = `https://hooks.zapier.com/hooks/catch/${workspaceId}/${triggerId}/`

            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                event,
                data,
                timestamp: new Date().toISOString(),
                source: 'saas-boilerplate',
              }),
            })

            if (!response.ok) {
              throw new Error(
                `Zapier API error: ${response.status} ${response.statusText}`,
              )
            }

            const responseData = await response.json()
            console.log(`[Zapier] Event "${event}" sent successfully`, {
              responseData,
            })
            return responseData
          })(),
        )

        return result
      },
    },
  },
})
