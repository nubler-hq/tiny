import type { StandardSchemaV1 } from '@igniter-js/core'
import type { MailAdapter } from './adapter.interface'

/**
 * Represents the parameters required to send an email.
 * @property {string} to - The email address of the recipient.
 * @property {string} subject - The subject of the email.
 * @property {string} body - The body of the email.
 * @property {string} html - The email address of the sender.
 */
export interface MailProviderEmailTemplate<TSchema extends StandardSchemaV1> {
  subject: string
  schema: TSchema
  render: (data: StandardSchemaV1.InferInput<TSchema>) => React.ReactElement
}

/**
 * Represents the parameters required to send an email.
 * @property {string} to - The email address of the recipient.
 * @property {string} subject - The subject of the email.
 * @property {keyof TEmailTemplates} template - The template of the email.
 * @property {Record<string, any>} data - The data to be used in the email template.
 */
export interface MailProviderSendParams<
  TEmailTemplates extends Record<string, MailProviderEmailTemplate<any>>,
  TSelectedEmailTemplate extends keyof TEmailTemplates,
> {
  to: string
  subject?: string
  template: TSelectedEmailTemplate
  data: StandardSchemaV1.InferInput<
    TEmailTemplates[TSelectedEmailTemplate]['schema']
  >
}

export interface MailProviderOptions<
  TTemplates extends Record<string, MailProviderEmailTemplate<any>> = Record<
    string,
    MailProviderEmailTemplate<any>
  >,
> {
  secret: string
  from: string

  adapter: (options: MailProviderOptions<any>) => MailAdapter
  templates: TTemplates

  onSendStarted?: (
    params: MailProviderSendParams<TTemplates, any>,
  ) => Promise<void>
  onSendError?: (
    params: MailProviderSendParams<TTemplates, any>,
    error: Error,
  ) => Promise<void>
  onSendSuccess?: (
    params: MailProviderSendParams<TTemplates, any>,
  ) => Promise<void>
}

/**
 * Defines the interface for a mail provider.
 * @property {(params: MailProviderSendParams<TEmailTemplates>) => Promise<void>} send - A method to send an email.
 * @property {EmailType[]} emailTypes - An array of email types supported by the provider.
 * @property {(params: MailProviderSendParams<TEmailTemplates>, date: Date) => Promise<void>} schedule - A method to schedule an email to be sent at a later date.
 * @property {(params: MailProviderSendParams<TEmailTemplates>) => Promise<void>} onSendStarted - A method to handle when an email is being sent.
 * @property {(params: MailProviderSendParams<TEmailTemplates>, error: Error) => Promise<void>} onSendError - A method to handle when an email fails to send.
 * @property {(params: MailProviderSendParams<TEmailTemplates>) => Promise<void>} onSendSuccess - A method to handle when an email is successfully sent.
 */
export interface IMailProvider<
  TEmailTemplates extends Record<string, MailProviderEmailTemplate<any>>,
> {
  send: <TSelectedEmailTemplate extends keyof TEmailTemplates>(
    params: MailProviderSendParams<TEmailTemplates, TSelectedEmailTemplate>,
  ) => Promise<void>
  schedule: <TSelectedEmailTemplate extends keyof TEmailTemplates>(
    params: MailProviderSendParams<TEmailTemplates, TSelectedEmailTemplate>,
    date: Date,
  ) => Promise<void>
}
