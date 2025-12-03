import { igniter } from '@/igniter'
import type {
  Integration,
  CreateIntegrationDTO,
  UpdateIntegrationDTO,
} from '../integration.interface'

export const IntegrationFeatureProcedure = igniter.procedure({
  name: 'IntegrationFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      integration: {
        findMany: async ({
          organizationId,
        }: {
          organizationId: string
        }): Promise<Integration[]> => {
          const integrations = context.services.plugins.list() as Integration[]

          if (organizationId) {
            for (const integration of integrations) {
              const integrationOnDb =
                await context.services.database.integration.findFirst({
                  where: {
                    provider: integration.slug,
                    organizationId,
                  },
                  include: {
                    webhook: true,
                  },
                })

              if (integrationOnDb) {
                integration.state = {
                  id: integrationOnDb.id,
                  enabled: integrationOnDb.enabled,
                  metadata: integrationOnDb.metadata,
                  webhook: integrationOnDb.webhook,
                  updatedAt: integrationOnDb.updatedAt,
                }
              }
            }
          }

          return integrations
        },

        findOne: async (
          slug: string,
          organizationId: string,
        ): Promise<Integration | null> => {
          let integration: Integration | null = null

          // @ts-expect-error - slug is a string
          const result = context.services.plugins.get(slug)

          if (!result) return null

          integration = result

          const integrationOnDb =
            await context.services.database.integration.findFirst({
              where: {
                provider: slug,
                organizationId,
              },
              include: {
                webhook: true,
              },
            })

          if (!integrationOnDb) {
            return result
          }

          integration.state = {
            id: integrationOnDb.id,
            enabled: integrationOnDb.enabled,
            metadata: integrationOnDb.metadata,
            webhook: integrationOnDb.webhook,
            updatedAt: integrationOnDb.updatedAt,
          }

          return result as Integration | null
        },

        install: async (input: CreateIntegrationDTO): Promise<Integration> => {
          // @ts-expect-error - slug is a string
          const result = context.services.plugins.get(input.integrationSlug)

          if (!result) throw new Error('Integration not found')

          const integration =
            await context.services.database.integration.create({
              data: {
                provider: input.integrationSlug,
                organizationId: input.organizationId,
                enabled: true,
                metadata: input.metadata,
              },
            })

          return {
            ...result,
            state: {
              id: integration.id,
              enabled: integration.enabled,
              metadata: integration.metadata,
              updatedAt: integration.updatedAt,
            },
          }
        },

        update: async (params: UpdateIntegrationDTO): Promise<Integration> => {
          const integration = context.services.plugins.get(
            // @ts-expect-error - slug is a string
            params.integrationSlug,
          )

          if (!integration) throw new Error('Integration not found')

          const integrationOnDb =
            await context.services.database.integration.findUnique({
              where: {
                provider_organizationId: {
                  provider: params.integrationSlug,
                  organizationId: params.organizationId,
                },
              },
            })

          if (!integrationOnDb) throw new Error('Integration not found')
          if (integrationOnDb.provider !== params.integrationSlug)
            throw new Error('Integration not found')
          if (integrationOnDb.organizationId !== params.organizationId)
            throw new Error('Integration not found')

          if (integrationOnDb.enabled !== params.enabled) {
            await context.services.database.integration.update({
              where: { id: integrationOnDb.id },
              data: {
                enabled: params.enabled,
                metadata: params.metadata,
              },
            })
          }

          const updatedIntegration =
            await context.services.database.integration.update({
              where: { id: integrationOnDb.id },
              data: {
                enabled: params.enabled,
                metadata: params.metadata,
              },
              include: {
                webhook: true,
              },
            })

          return {
            name: integration.name,
            slug: integration.slug,
            schema: integration.schema,
            metadata: integration.metadata,
            fields: integration.fields,
            state: {
              id: updatedIntegration.id,
              enabled: updatedIntegration.enabled,
              metadata: updatedIntegration.metadata as Record<string, any>,
              webhook: updatedIntegration.webhook,
              updatedAt: updatedIntegration.updatedAt,
            },
          }
        },

        uninstall: async (
          slug: string,
          organizationId: string,
        ): Promise<{ id: string }> => {
          await context.services.database.integration.delete({
            where: {
              provider_organizationId: {
                provider: slug,
                organizationId,
              },
            },
          })

          return { id: organizationId }
        },

        setupPluginsForOrganization: async (organizationId: string) => {
          // Business Logic: Retrieve all enabled integrations for the given organization.
          const integrationsOnDb =
            await context.services.database.integration.findMany({
              where: {
                organizationId,
                enabled: true,
              },
            })

          // Data Transformation: Reduce the integrations into a configuration object for the PluginManager.
          const pluginConfigs = integrationsOnDb.reduce(
            (acc, integration) => {
              acc[integration.provider] = integration.metadata
              return acc
            },
            {} as Record<string, any>,
          )

          // Business Logic: Setup the plugins with the retrieved configurations.
          return context.services.plugins.setup(pluginConfigs)
        },
      },
    }
  },
})
