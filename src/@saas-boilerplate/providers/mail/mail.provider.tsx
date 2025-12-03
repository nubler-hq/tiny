import type { StandardSchemaV1 } from '@igniter-js/core'
import type { MailAdapter } from './interfaces/adapter.interface'
import type {
  IMailProvider,
  MailProviderEmailTemplate,
  MailProviderOptions,
  MailProviderSendParams,
} from './interfaces/provider.interface'
import { render } from '@react-email/components'

export class MailProvider<
  TEmailTemplates extends Record<string, MailProviderEmailTemplate<any>>,
> implements IMailProvider<TEmailTemplates>
{
  private static instance: IMailProvider<any>

  private readonly adapter: MailAdapter
  private readonly templates: TEmailTemplates
  private readonly options: Omit<
    MailProviderOptions<TEmailTemplates>,
    'adapter' | 'templates'
  >

  constructor(options: MailProviderOptions<TEmailTemplates>) {
    const { adapter, templates, ...rest } = options

    if (!adapter) {
      throw new Error('Adapter is required')
    }

    if (!options.secret) {
      throw new Error('Secret is required')
    }

    if (!templates) {
      throw new Error('Templates are required')
    }

    this.adapter = adapter(options)
    this.templates = templates
    this.options = rest
  }

  async send<TSelectedTemplate extends keyof TEmailTemplates>(
    params: MailProviderSendParams<TEmailTemplates, TSelectedTemplate>,
  ): Promise<void> {
    try {
      await this.onSendStarted(params)

      const template = this.templates[params.template]

      if (!template) {
        throw new Error(`Template ${String(params.template)} not found`)
      }

      const MailTemplate = template.render

      const html = await render(<MailTemplate {...params.data} />)
      const text = await render(<MailTemplate {...params.data} />, {
        plainText: true,
      })

      await this.adapter.send({
        to: params.to,
        subject: params.subject || template.subject,
        html,
        text,
      })

      await this.onSendSuccess(params)
    } catch (error) {
      await this.onSendError(params, error as Error)
      throw error
    }
  }

  async schedule<TSelectedTemplate extends keyof TEmailTemplates>(
    params: MailProviderSendParams<TEmailTemplates, TSelectedTemplate>,
    date: Date,
  ): Promise<void> {
    if (date.getTime() <= Date.now()) {
      throw new Error('Schedule date must be in the future')
    }

    const timeout = date.getTime() - Date.now()
    setTimeout(() => {
      this.send(params).catch((error) => {
        console.error('Failed to send scheduled email:', error)
      })
    }, timeout)
  }

  private async onSendStarted(
    params: MailProviderSendParams<TEmailTemplates, any>,
  ): Promise<void> {
    this.options.onSendStarted?.(params)
  }

  private async onSendError(
    params: MailProviderSendParams<TEmailTemplates, any>,
    error: Error,
  ): Promise<void> {
    this.options.onSendError?.(params, error)
  }

  private async onSendSuccess(
    params: MailProviderSendParams<TEmailTemplates, any>,
  ): Promise<void> {
    this.options.onSendSuccess?.(params)
  }

  static adapter = (adapter: (options: MailProviderOptions) => MailAdapter) =>
    adapter

  static template = <TSchema extends StandardSchemaV1>(
    template: MailProviderEmailTemplate<TSchema>,
  ) => template

  static initialize = <
    TEmailTemplates extends Record<string, MailProviderEmailTemplate<any>>,
  >(
    options: MailProviderOptions<TEmailTemplates>,
  ) => {
    if (MailProvider.instance) {
      return MailProvider.instance as MailProvider<TEmailTemplates>
    }

    // @ts-expect-error - TODO: Fix this interface error
    MailProvider.instance = new MailProvider<TEmailTemplates>(options)
    return MailProvider.instance as MailProvider<TEmailTemplates>
  }
}
