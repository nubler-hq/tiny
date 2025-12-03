import type { StandardSchemaV1 } from '@igniter-js/core'
import type { Webhook } from '../webhook/webhook.interface'
import type { PluginField } from '@/@saas-boilerplate/providers/plugin-manager/provider.interface'

/**
 * Represents the metadata of an Integration.
 * This metadata is used to provide information about the integration
 * such as its name, description, category, developer, website, and more.
 **/
export type IntegrationMetadata = {
  verified: boolean
  published: boolean
  logo?: string
  screenshots?: string[]
  description: string
  category: string
  developer: string
  website: string
  links: {
    [key: string]: string
  }
  help?: {
    title: string
    description: string
    url?: string
  }
}

/**
 * Represents a Integration entity.
 */
export type IntegrationState<TSchema extends StandardSchemaV1> = {
  id: string
  enabled: boolean
  metadata: StandardSchemaV1.InferInput<TSchema>
  webhook?: Webhook | null
  updatedAt: Date
}

/**
 * Represents a Integration entity.
 */
export type Integration<TSchema extends StandardSchemaV1 = StandardSchemaV1> = {
  slug: string
  name: string
  schema: TSchema
  fields: PluginField[]
  metadata: IntegrationMetadata
  state?: IntegrationState<TSchema>
}

/**
 * Data transfer object for creating a new Integration.
 */
export interface CreateIntegrationDTO {
  /** Id's id property  */
  organizationId: string
  /** IntegrationSlug's integrationId property  */
  integrationSlug: string
  /** Slug's slug property  */
  metadata: Record<string, any>
}

/**
 * Data transfer object for updating an existing Integration.
 */
export interface UpdateIntegrationDTO {
  /** Id's id property  */
  organizationId: string
  /** IntegrationSlug's integrationId property  */
  integrationSlug: string
  /** Slug's slug property  */
  enabled?: boolean
  /** Slug's slug property  */
  metadata?: Record<string, any>
}
