import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager/provider'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { delay } from '@/@saas-boilerplate/utils/delay'
import { z } from 'zod'

export const make = PluginManager.plugin({
  slug: 'make',
  name: 'Make',
  schema: z.object({
    apiKey: z.string().describe('Ex: 1234567890abcdef1234567890abcdef'),
    workflowId: z.string().describe('Ex: 1234567890abcdef1234567890abcdef'),
    environment: z
      .enum(['production', 'staging', 'development'])
      .describe('Ex: production'),
  }),
  metadata: {
    verified: true,
    published: true,
    logo: 'https://www.make.com/en/favicon.ico', // Example logo
    description:
      'Integrate your SaaS application with Make to streamline processes.',
    category: 'automations',
    developer: 'Make',
    screenshots: [],
    website: 'https://www.make.com/',
    links: {
      install: 'https://www.make.com/',
      guide: 'https://www.make.com/en/help',
    },
  },
  actions: {
    send: {
      name: 'Send',
      schema: z.object({
        message: z.string(),
      }),
      handler: async ({ input }) => {
        const result = await tryCatch(delay(2000))

        // Here you would implement the logic to send a message via Make
        console.log(`[Make] Sending message: ${input.message}`)
        return result
      },
    },

    sendEvent: {
      name: 'Send Event',
      schema: z.object({
        event: z.string(),
        data: z.any(),
      }),
      handler: async ({ config, input }) => {
        const { apiKey, workflowId, environment } = config
        const { event, data } = input

        // Make webhook URL format (simplified)
        // In production, you would use the actual Make API
        const makeUrl = `https://hook.eu1.make.com/${workflowId}`

        const payload = {
          event,
          data,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'saas-boilerplate',
            environment,
            apiKey: apiKey.substring(0, 8) + '...', // Partial key for logging
          },
        }

        const response = await fetch(makeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'User-Agent': 'SaaS-Boilerplate/1.0',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Make API error: ${response.status} ${response.statusText} - ${errorText}`,
          )
        }

        const responseData = await response.json()
        console.log(
          `[Make] Event "${event}" sent successfully to workflow ${workflowId}`,
          {
            environment,
            responseData,
          },
        )
        return responseData
      },
    },
  },
})
