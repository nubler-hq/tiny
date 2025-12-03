import type { z } from 'zod'
import type {
  IPluginManager,
  IPluginInstance,
  PluginAction,
} from './provider.interface'
import { getFieldsFromSchema } from './utils/get-fields-from-schema'
import type { StandardSchemaV1 } from '@igniter-js/core'

export class PluginManager<
  T extends Record<string, IPluginInstance<any, any>>,
> {
  static instance: IPluginManager<any> | null = null
  extensions: T

  constructor(options: { extensions: T }) {
    this.extensions = options.extensions
  }

  static plugin = <
    TConfigSchema extends StandardSchemaV1,
    TActions extends Record<string, PluginAction<TConfigSchema, any, any>>,
  >(
    plugin: IPluginInstance<TConfigSchema, TActions>,
  ) => {
    return plugin
  }

  static initialize<
    TExtensions extends Record<string, IPluginInstance<any, any>>,
  >(options: { plugins: TExtensions }) {
    if (!PluginManager.instance) {
      // @ts-expect-error - Error
      PluginManager.instance = new PluginManager<TExtensions>({
        extensions: options.plugins,
      })
    }

    return PluginManager.instance as unknown as PluginManager<TExtensions> &
      TExtensions & {
        $Infer: {
          Config: {
            [K in keyof TExtensions]?: StandardSchemaV1.InferOutput<
              TExtensions[K]['schema']
            >
          }
        }
      }
  }

  setup<
    TConfig extends {
      [K in keyof T]?: StandardSchemaV1.InferOutput<T[K]['schema']>
    },
  >(config: TConfig) {
    // Atualiza as configurações dos plugins com laço tipado
    for (const key of Object.keys(config) as Array<keyof T>) {
      ;(this.extensions[key] as any).config = config[key]
    }

    const actions: {
      [K in keyof T]: {
        [A in keyof T[K]['actions']]: (
          input: StandardSchemaV1.InferInput<T[K]['actions'][A]['schema']>,
        ) => ReturnType<T[K]['actions'][A]['handler']>
      }
    } = {} as any

    // Constrói o objeto de ações utilizando laços tipados
    for (const key of Object.keys(this.extensions) as Array<keyof T>) {
      actions[key] = {} as any
      const plugin = this.extensions[key]
      for (const actionKey of Object.keys(plugin.actions) as Array<
        keyof typeof plugin.actions
      >) {
        // @ts-expect-error - Error
        actions[key][actionKey] = (
          input: StandardSchemaV1.InferInput<
            (typeof plugin.actions)[typeof actionKey]['schema']
          >,
        ) => {
          return plugin.actions[actionKey].handler({
            config: config[plugin.slug] ?? {},
            input: input ?? {},
          })
        }
      }
    }

    return actions
  }

  list() {
    const extensionsList = (Object.keys(this.extensions) as Array<keyof T>).map(
      (key) => {
        const plugin = this.extensions[key]
        return {
          slug: key,
          schema: plugin.schema,
          name: plugin.name,
          metadata: plugin.metadata,
          fields: getFieldsFromSchema(plugin.schema as z.ZodObject<any>),
        }
      },
    )

    return extensionsList
  }

  get<TSlug extends keyof T>(slug: TSlug) {
    const result = this.extensions[slug]
    if (!result) throw new Error(`Plugin ${slug.toString()} not found`)

    return {
      slug,
      schema: result.schema,
      name: result.name,
      fields: getFieldsFromSchema(result.schema as z.ZodObject<any>),
      metadata: result.metadata,
      initialize: (
        config?: StandardSchemaV1.InferOutput<T[TSlug]['schema']>,
      ) => {
        const actionsAcc = {} as Record<string, (input: any) => Promise<any>>
        const actions = result.actions as any
        for (const actionName of Object.keys(actions)) {
          actionsAcc[actionName] = (
            input: StandardSchemaV1.InferInput<
              (typeof actions)[typeof actionName]['schema']
            >,
          ) => {
            return actions[actionName].handler({
              config,
              input: input ?? {},
            })
          }
        }
        return actionsAcc
      },
    } as unknown as {
      slug: TSlug
      schema: T[TSlug]['schema']
      name: T[TSlug]['name']
      fields: ReturnType<typeof getFieldsFromSchema>
      metadata: T[TSlug]['metadata']
      initialize: (
        config?: StandardSchemaV1.InferOutput<T[TSlug]['schema']>,
      ) => {
        [K in keyof T[TSlug]['actions']]: (
          input: StandardSchemaV1.InferInput<T[TSlug]['actions'][K]['schema']>,
        ) => ReturnType<T[TSlug]['actions'][K]['handler']>
      }
    }
  }
}
