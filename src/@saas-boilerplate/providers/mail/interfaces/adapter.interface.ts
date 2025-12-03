/**
 * Represents the parameters required to send an email.
 * @property {string} to - The email address of the recipient.
 * @property {string} subject - The subject of the email.
 * @property {string} html - The HTML content of the email.
 * @property {string} text - The text content of the email.
 */
export interface MailAdapterSendParams {
  to: string
  subject: string
  html: string
  text: string
  scheduledAt?: Date
}

/**
 * Represents the parameters required to send an email.
 * @property {string} to - The email address of the recipient.
 * @property {string} subject - The subject of the email.
 * @property {string} body - The body of the email.
 * @property {string} html - The email address of the sender.
 */
export interface MailAdapter {
  send: (params: MailAdapterSendParams) => Promise<void>
}
