/**
 * @typedef AccountProvider
 * @description Supported OAuth providers for external account linking.
 *
 * This type defines all the OAuth providers that can be used for linking
 * external accounts to user profiles. Each provider represents a different
 * social media platform or service that supports OAuth authentication.
 *
 * @example
 * ```typescript
 * const provider: AccountProvider = 'google' // Valid provider
 * const invalidProvider = 'invalid' // TypeScript error
 * ```
 */
export type AccountProvider =
  | 'github' // GitHub OAuth integration
  | 'apple' // Apple Sign-In integration
  | 'discord' // Discord OAuth integration
  | 'facebook' // Facebook OAuth integration
  | 'microsoft' // Microsoft OAuth integration
  | 'google' // Google OAuth integration
  | 'spotify' // Spotify OAuth integration
  | 'twitch' // Twitch OAuth integration
  | 'twitter' // Twitter OAuth integration
  | 'dropbox' // Dropbox OAuth integration
  | 'linkedin' // LinkedIn OAuth integration
  | 'gitlab' // GitLab OAuth integration
  | 'reddit' // Reddit OAuth integration

/**
 * @interface Account
 * @description Represents an external OAuth account linked to a user's profile.
 *
 * This interface defines the structure of an external account that has been
 * linked to a user's profile through OAuth authentication. It contains
 * essential information about the account including provider details,
 * timestamps, and account identifiers.
 *
 * @property {string} id - Unique identifier for the linked account
 * @property {string} provider - OAuth provider name (e.g., 'google', 'github')
 * @property {Date} createdAt - Timestamp when the account was first linked
 * @property {Date} updatedAt - Timestamp when the account was last modified
 * @property {string} accountId - External account identifier from the provider
 *
 * @example
 * ```typescript
 * const account: Account = {
 *   id: 'acc_123456789',
 *   provider: 'google',
 *   createdAt: new Date('2024-01-15T10:30:00Z'),
 *   updatedAt: new Date('2024-01-15T10:30:00Z'),
 *   accountId: 'google_user_987654321'
 * }
 * ```
 */
export interface Account {
  /** Unique identifier for the linked account in the system */
  id: string
  /** OAuth provider name (e.g., 'google', 'github', 'microsoft') */
  provider: string
  /** Timestamp when the account was first linked to the user's profile */
  createdAt: Date
  /** Timestamp when the account information was last updated */
  updatedAt: Date
  /** External account identifier from the OAuth provider */
  accountId: string
}

/**
 * @interface LinkAccountDTO
 * @description Data transfer object for initiating OAuth account linking.
 *
 * This interface defines the parameters required to start the OAuth linking
 * process for a new external account. It specifies the provider to link
 * and the callback URL for post-authentication redirection.
 *
 * @property {AccountProvider} provider - The OAuth provider to link
 * @property {string} callbackURL - URL to redirect to after successful authentication
 *
 * @example
 * ```typescript
 * const linkData: LinkAccountDTO = {
 *   provider: 'google',
 *   callbackURL: '/dashboard'
 * }
 * ```
 */
export interface LinkAccountDTO {
  /** The OAuth provider to link (e.g., 'google', 'github') */
  provider: AccountProvider
  /** URL to redirect to after successful OAuth authentication */
  callbackURL: string
}

/**
 * @interface LinkAccountResponse
 * @description Response object returned after initiating OAuth account linking.
 *
 * This interface defines the response structure returned when starting
 * the OAuth linking process. It contains the redirect URL and confirmation
 * that the client should use to redirect the user to the provider's
 * authentication page.
 *
 * @property {string} url - OAuth provider's authentication URL
 * @property {boolean} redirect - Confirmation that redirect is required
 *
 * @example
 * ```typescript
 * const response: LinkAccountResponse = {
 *   url: 'https://accounts.google.com/oauth/authorize?...',
 *   redirect: true
 * }
 * ```
 */
export interface LinkAccountResponse {
  /** OAuth provider's authentication URL for user redirection */
  url: string
  /** Confirmation that the client should redirect the user to the URL */
  redirect: boolean
}

/**
 * @interface UnlinkAccountDTO
 * @description Data transfer object for removing OAuth account linking.
 *
 * This interface defines the parameters required to unlink an external
 * OAuth account from the user's profile. It specifies which provider
 * account should be removed.
 *
 * @property {AccountProvider} provider - The OAuth provider to unlink
 *
 * @example
 * ```typescript
 * const unlinkData: UnlinkAccountDTO = {
 *   provider: 'github'
 * }
 * ```
 */
export interface UnlinkAccountDTO {
  /** The OAuth provider to unlink from the user's profile */
  provider: AccountProvider
}
