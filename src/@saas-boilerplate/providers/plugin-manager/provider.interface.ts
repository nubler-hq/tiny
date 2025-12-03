import type { StandardSchemaV1 } from '@igniter-js/core'

export type PluginAction<
  TPluginConfigSchema extends StandardSchemaV1,
  TPluginActionSchema extends StandardSchemaV1,
  TPluginActionResponse,
> = {
  name: string
  schema: TPluginActionSchema
  handler: (params: {
    config: StandardSchemaV1.InferOutput<TPluginConfigSchema>
    input: StandardSchemaV1.InferInput<TPluginActionSchema>
  }) => TPluginActionResponse
}

/**
 * Interface representing a plugin instance within the application.
 *
 * @interface IPluginInstance
 *
 * @property {string} slug - Unique identifier for the plugin.
 * @property {string} name - Display name of the plugin.
 * @property {StandardSchemaV1} schema - Schema definition following the StandardSchemaV1 format.
 * @property {Object} metadata - Meta information about the plugin.
 * @property {boolean} metadata.verified - Whether the plugin is verified.
 * @property {boolean} metadata.published - Whether the plugin is published.
 * @property {string} metadata.description - Brief description of the plugin.
 * @property {string} metadata.category - Category the plugin belongs to.
 * @property {string} metadata.developer - Name of the plugin developer.
 * @property {string} metadata.website - Website URL of the plugin.
 * @property {string} [metadata.logo] - Optional URL to the plugin's logo.
 * @property {string[]} [metadata.screenshots] - Optional array of URLs to plugin screenshots.
 * @property {Object.<string, string>} metadata.links - Dictionary of related links.
 * @property {Object.<string, Function>} actions - Dictionary of plugin actions where each key maps to a function.
 * @property {Function} [onInstall] - Optional callback triggered when the plugin is installed.
 * @property {Function} [onUninstall] - Optional callback triggered when the plugin is uninstalled.
 * @property {Function} [onEnable] - Optional callback triggered when the plugin is enabled.
 * @property {Function} [onDisable] - Optional callback triggered when the plugin is disabled.
 */
export interface IPluginInstance<
  TPluginConfigSchema extends StandardSchemaV1,
  TPluginActions extends Record<string, PluginAction<any, any, any>>,
> {
  slug: string
  name: string
  schema: TPluginConfigSchema
  actions: TPluginActions
  metadata: {
    verified: boolean
    published: boolean
    description: string
    category: string
    developer: string
    website: string
    logo?: string
    screenshots?: string[]
    links: {
      [key: string]: string
    }
  }
}

/**
 * Interface representing a plugin field within the application.
 *
 * @interface PluginField
 *
 * @property {string} name - Name of the field.
 * @property {string} type - Type of the field (e.g., string, number, boolean).
 * @property {string} [placeholder] - Optional placeholder text for the field.
 * @property {boolean} required - Indicates if the field is required.
 * @property {any} [default] - Optional default value for the field.
 *
 **/
export interface PluginField {
  name: string
  type: string
  placeholder?: string
  required: boolean
  default?: any
}

/**
 * Represents a plugin integration entity.
 *
 * @interface Integration
 *
 * @property {string} slug - Unique identifier for the integration.
 * @property {string} name - Display name of the integration.
 * @property {StandardSchemaV1} schema - Schema definition following the StandardSchemaV1 format.
 * @property {PluginField[]} fields - Array of fields associated with the integration.
 * @property {Object} metadata - Meta information about the integration.
 */
export type Integration<
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TActions extends Record<string, PluginAction<any, any, any>> = Record<
    string,
    PluginAction<any, any, any>
  >,
> = {
  slug: string
  name: string
  schema: TSchema
  fields: PluginField[]
  metadata: IPluginInstance<TSchema, TActions>['metadata']
}
export interface IPluginManager<
  TPlugins extends Record<string, IPluginInstance<any, any>>,
> {
  extensions: TPlugins
  setup: <TConfig extends { [K in keyof TPlugins]: TPlugins[K]['schema'] }>(
    config: TConfig extends StandardSchemaV1
      ? StandardSchemaV1.InferOutput<TConfig>
      : never,
  ) => {
    [K in keyof TPlugins]: (
      config?: StandardSchemaV1.InferOutput<TPlugins[K]['schema']>,
    ) => Promise<
      Record<string, (input: StandardSchemaV1.InferInput<any>) => Promise<any>>
    >
  }
  list: () => Integration[]
  get: <TSlug extends keyof TPlugins>(
    slug: TSlug,
  ) => {
    slug: TSlug
    schema: TPlugins[TSlug]['schema']
    name: string
    fields: PluginField[]
    metadata: IPluginInstance<any, any>['metadata']
  } | null
}
