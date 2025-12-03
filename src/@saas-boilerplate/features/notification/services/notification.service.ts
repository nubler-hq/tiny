import { z } from 'zod'

/**
 * @interface NotificationTemplate
 * @description Defines the structure for a notification template, including its schema, title, description, and supported channels.
 * @template TSchema The Zod schema for validating the notification data.
 * @template TChannels An array of channel names where this notification can be sent.
 */
type NotificationTemplate<
  TSchema extends z.ZodSchema,
  TChannels extends string[],
> = {
  type?: string
  schema: TSchema
  title: ((data: z.infer<TSchema>) => string | Promise<string>) | string
  description: ((data: z.infer<TSchema>) => string | Promise<string>) | string
  action:
    | ((
        data: z.infer<TSchema>,
      ) =>
        | { label: string; url: string }
        | Promise<{ label: string; url: string }>)
    | { label: string; url: string }
  help?: string
  channels: TChannels
}

/**
 * @interface InferNotificationTypes
 * @description Infers the notification type names from a templates record.
 * @template TTemplates A record of notification templates.
 */
type InferNotificationTypes<TTemplates extends Record<string, any>> = {
  [K in keyof TTemplates]: K
}

/**
 * @interface InferNotificationData
 * @description Infers the notification data types from a templates record.
 * @template TTemplates A record of notification templates.
 */
type InferNotificationData<TTemplates extends Record<string, any>> = {
  [K in keyof TTemplates]: z.infer<TTemplates[K]['schema']>
}

/**
 * @interface NotificationTypesHelper
 * @description Helper type that provides both the enum-like types and data types for notifications.
 * @template TTemplates A record of notification templates.
 */
type NotificationTypesHelper<TTemplates extends Record<string, any>> = {
  readonly events: InferNotificationTypes<TTemplates>
  readonly payloads: InferNotificationData<TTemplates>
}

/**
 * @interface NotificationChannel
 * @description Defines the structure for a notification channel, including its name and a method to send notifications.
 * @template TName The name of the channel (e.g., "email", "inApp").
 * @template TContext The context object available during the send operation.
 */
type NotificationChannel<
  TName extends string,
  TContext extends Record<string, any>,
> = {
  name: TName
  send: ({
    data,
    template,
    context,
  }: {
    data: z.infer<any>
    template: Required<NotificationTemplate<any, any>>
    context?: TContext
  }) => Promise<void | { success: boolean; message?: string; id?: string }>
}

/**
 * @class NotificationService
 * @description A service for managing and sending notifications using predefined templates and channels.
 * This class provides methods to register templates and channels, send notifications based on a template, and list available templates and channels.
 * @template TContext The global context type available to notification channels.
 * @template TTemplates A record of notification templates, where keys are template types and values are `NotificationTemplate` instances.
 * @template TChannels A record of notification channels, where keys are channel names and values are `NotificationChannel` instances.
 *
 * @example
 * // Define a Zod schema for a welcome email notification
 * const WelcomeEmailSchema = z.object({
 *   userName: z.string(),
 *   loginUrl: z.string().url(),
 * });
 *
 * // Define a notification template
 * const templates = {
 *   WELCOME_EMAIL: {
 *     schema: WelcomeEmailSchema,
 *     title: (data) => `Welcome, ${data.userName}!`,
 *     description: "Thank you for signing up to our service.",
 *     action: (data) => ({ label: "Login now", url: data.loginUrl }),
 *     channels: ["email"],
 *   } as NotificationTemplate<typeof WelcomeEmailSchema, ["email"]>,
 * };
 *
 * // Define a notification channel (e.g., email sender)
 * const channels = {
 *   email: {
 *     name: "email",
 *     send: async ({ data, template, context }) => {
 *       console.log(`Sending email to ${data.userName} with title: ${await template.title(data)}`);
 *       // Logic to send email via an email provider
 *     },
 *   } as NotificationChannel<"email", any>,
 * };
 *
 * // Create an instance of NotificationService
 * const notificationService = new NotificationService({
 *   templates,
 *   channels,
 *   context: { logger: console },
 * });
 *
 * // Send a notification
 * await notificationService.send({
 *   type: "WELCOME_EMAIL",
 *   data: { userName: "John Doe", loginUrl: "http://example.com/login" },
 * });
 */
export class NotificationService<
  TContext extends Record<string, any>,
  TTemplates extends Record<string, any>,
  TChannels extends Record<string, NotificationChannel<string, TContext>>,
> {
  private templates: TTemplates
  private channels: TChannels
  private context?: TContext
  public $Infer: NotificationTypesHelper<TTemplates> =
    {} as NotificationTypesHelper<TTemplates>

  /**
   * @static
   * @method $inferTypes
   * @description Infers notification types and data types from templates.
   * This method provides automatic type inference based on the templates configuration.
   * @template TTemplates A record of notification templates.
   * @returns {NotificationTypesHelper<TTemplates>} Helper object with inferred types.
   *
   * @example
   * ```typescript
   * const types = NotificationService.$inferTypes<typeof templates>()
   * type NotificationType = keyof typeof types.types
   * type NotificationData = typeof types.data
   * ```
   */
  static $inferTypes<
    TTemplates extends Record<string, any>,
  >(): NotificationTypesHelper<TTemplates> {
    return null as any // This will be inferred by TypeScript
  }

  /**
   * @static
   * @method $inferType
   * @description Infers a specific notification type from templates.
   * @template TTemplates A record of notification templates.
   * @template TType The specific notification type to infer.
   * @returns {TType} The inferred notification type.
   */
  static $inferType<
    TTemplates extends Record<string, any>,
    TType extends keyof TTemplates,
  >(): TType {
    return null as any // This will be inferred by TypeScript
  }

  /**
   * @static
   * @method $inferData
   * @description Infers the data type for a specific notification type.
   * @template TTemplates A record of notification templates.
   * @template TType The specific notification type to infer data for.
   * @returns {z.infer<TTemplates[TType]['schema']>} The inferred data type.
   */
  static $inferData<
    TTemplates extends Record<string, any>,
    TType extends keyof TTemplates,
  >(): z.infer<TTemplates[TType]['schema']> {
    return null as any // This will be inferred by TypeScript
  }

  /**
   * @static
   * @method createTemplate
   * @description Creates a notification template with proper type inference for title, description, and action functions.
   * @template TSchema The Zod schema for validating the notification data.
   * @template TChannels An array of channel names where this notification can be sent.
   * @param {object} template - The template configuration.
   * @returns {object} The template with preserved types.
   *
   * @example
   * ```typescript
   * const template = NotificationService.createTemplate({
   *   schema: z.object({ userName: z.string() }),
   *   title: (data) => `Welcome, ${data.userName}!`, // data is properly typed
   *   description: "Thank you for signing up!",
   *   action: { label: "Get Started", url: "/dashboard" },
   *   channels: ["email"]
   * });
   * ```
   */
  static createTemplate<
    TSchema extends z.ZodSchema,
    TChannels extends string[],
  >(template: {
    schema: TSchema
    title: ((data: z.infer<TSchema>) => string | Promise<string>) | string
    description: ((data: z.infer<TSchema>) => string | Promise<string>) | string
    action:
      | ((
          data: z.infer<TSchema>,
        ) =>
          | { label: string; url: string }
          | Promise<{ label: string; url: string }>)
      | { label: string; url: string }
    help?: string
    channels: TChannels
  }) {
    return template
  }

  /**
   * @constructor
   * @description Initializes the NotificationService with a set of notification templates, channels, and an optional global context.
   * @param {object} params - The parameters for the constructor.
   * @param {TTemplates} params.templates - A record of notification templates.
   * @param {TChannels} params.channels - A record of notification channels.
   * @param {TContext} [params.context] - An optional global context object to be passed to channels.
   */
  constructor({
    templates,
    channels,
    context,
  }: {
    templates: TTemplates
    channels: TChannels
    context?: TContext
  }) {
    // Observation: Assign the provided templates to the private property.
    this.templates = templates
    // Observation: Assign the provided channels to the private property.
    this.channels = channels
    // Observation: Assign the provided context to the private property.
    this.context = context
  }

  /**
   * @method send
   * @description Sends a notification using a specified template and data. It resolves dynamic title, description, and action from the template and dispatches the notification to all specified channels.
   * @template TType The type of the notification template to use.
   * @param {object} params - The parameters for sending the notification.
   * @param {TType} params.type - The type of the notification template.
   * @param {z.infer<TTemplates[TType]['schema']>} params.data - The data conforming to the template's Zod schema.
   * @param {TContext} [params.context] - An optional context object specific to this send operation, overriding the global context if provided.
   * @returns {Promise<void>} A promise that resolves when the notification has been dispatched to all channels.
   *
   * @example
   * await notificationService.send({
   *   type: "WELCOME_EMAIL",
   *   data: { userName: "Jane Doe", loginUrl: "http://example.com/dashboard" },
   * });
   */
  async send<TType extends keyof TTemplates>({
    type,
    data,
    context,
  }: {
    type: TType
    data: z.infer<TTemplates[TType]['schema']>
    context?: TContext
  }) {
    // Observation: Retrieve the notification template based on the provided type.
    const template = this.templates[type]
    // Business Logic: Resolve the notification title, which can be a static string or a function.
    const title =
      typeof template.title === 'string'
        ? template.title
        : await template.title(data)
    // Business Logic: Resolve the notification description, which can be a static string or a function.
    const description =
      typeof template.description === 'string'
        ? template.description
        : await template.description(data)
    // Business Logic: Resolve the notification action, which can be a static object or a function.
    const action =
      typeof template.action === 'function'
        ? await template.action(data)
        : template.action
    // Observation: Get the list of channels configured for this template.
    const channels = template.channels

    // Business Logic: Iterate over each channel and send the notification.
    for (const channel of channels) {
      // Observation: Retrieve the channel instance from the registered channels.
      const channelInstance = this.channels[channel]

      // Business Logic: Dispatch the notification to the current channel.
      await channelInstance.send({
        data,
        context: context || this.context,
        template: {
          type: type as string,
          action,
          title,
          description,
          help: template.help as string,
          channels: template.channels,
          schema: template.schema,
        },
      })
    }
  }

  /**
   * @method listTemplates
   * @description Returns a list of all registered notification templates, including their type, static title, description, help text, and supported channels.
   * Dynamic titles and descriptions are returned as `undefined` in this list.
   * @returns {Array<object>} An array of objects, each representing a notification template summary.
   *
   * @example
   * const allTemplates = notificationService.listTemplates();
   * console.log(allTemplates);
   * // Sample Output:
   * // [
   * //   { type: "WELCOME_EMAIL", title: "Welcome, new user!", description: "Thank you for signing up.", help: "...", channels: ["email"] },
   * //   { type: "PASSWORD_RESET", title: "Password Reset Request", description: undefined, help: "...", channels: ["email", "sms"] }
   * // ]
   */
  listTemplates() {
    // Data Transformation: Map over the registered templates to create a summary list.
    return Object.entries(this.templates).map(([type, template]) => ({
      type,
      title: typeof template.title === 'string' ? template.title : undefined,
      description:
        typeof template.description === 'string'
          ? template.description
          : undefined,
      help: template.help,
      channels: template.channels,
    }))
  }

  /**
   * @method getTemplate
   * @description Retrieves a specific notification template by its type.
   * @template TType The type of the notification template to retrieve.
   * @param {TType} type - The type of the notification template.
   * @returns {TTemplates[TType]} The notification template object.
   *
   * @example
   * const welcomeTemplate = notificationService.getTemplate("WELCOME_EMAIL");
   * console.log(welcomeTemplate.schema.spa()); // Accessing the Zod schema for the template
   */
  getTemplate<TType extends keyof TTemplates>(type: TType) {
    // Observation: Return the template associated with the given type.
    return this.templates[type]
  }

  /**
   * @method listChannels
   * @description Returns a list of all registered notification channels, including their names.
   * @returns {Array<object>} An array of objects, each representing a notification channel summary.
   *
   * @example
   * const allChannels = notificationService.listChannels();
   * console.log(allChannels);
   * // Sample Output:
   * // [
   * //   { name: "email" },
   * //   { name: "inApp" }
   * // ]
   */
  listChannels() {
    // Data Transformation: Map over the registered channels to create a summary list.
    return Object.entries(this.channels).map(([name]) => ({
      name,
    }))
  }

  /**
   * @method getChannel
   * @description Retrieves a specific notification channel by its name.
   * @template TName The name of the notification channel to retrieve.
   * @param {TName} name - The name of the notification channel.
   * @returns {TChannels[TName]} The notification channel object.
   *
   * @example
   * const emailChannel = notificationService.getChannel("email");
   * console.log(emailChannel.name);
   */
  getChannel<TName extends keyof TChannels>(name: TName) {
    // Observation: Return the channel associated with the given name.
    return this.channels[name]
  }

  /**
   * @method renderTemplate
   * @description Renders a notification template with the given type and data.
   * @template TType The type of the notification template to render.
   * @param {TType} type - The type of the notification template.
   * @param {z.infer<TTemplates[TType]['schema']>} data - The data conforming to the template's Zod schema.
   * @returns {Promise<object>} The rendered notification template.
   */
  async renderTemplate<TType extends keyof TTemplates>(
    type: TType,
    data: z.infer<TTemplates[TType]['schema']>,
  ) {
    // Observation: Retrieve the template associated with the given type.
    const template = this.templates[type]

    if (!template) {
      throw new Error(`Template ${String(type)} not found`)
    }

    return {
      type,
      title:
        typeof template.title === 'function'
          ? await template.title(data)
          : template.title,
      description:
        typeof template.description === 'function'
          ? await template.description(data)
          : template.description,
      help: template.help,
      channels: template.channels,
      action:
        typeof template.action === 'function'
          ? await template.action(data)
          : template.action,
      schema: template.schema,
    }
  }
}
