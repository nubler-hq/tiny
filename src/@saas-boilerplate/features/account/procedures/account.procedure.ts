import { igniter } from '@/igniter'
import type {
  Account,
  LinkAccountDTO,
  LinkAccountResponse,
  UnlinkAccountDTO,
} from '../account.interface'

/**
 * @procedure AccountFeatureProcedure
 * @description Procedure for managing external OAuth account operations.
 *
 * This procedure provides the business logic layer for external account management,
 * handling the integration with the underlying authentication service API. It
 * transforms API responses into application-specific types and manages the
 * complete lifecycle of OAuth account linking and unlinking operations.
 *
 * The procedure injects account management methods into the Igniter context,
 * making them available to controllers and other parts of the application.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const accounts = await context.account.findManyByCurrentUser()
 * const linkResult = await context.account.link({ provider: 'google', callbackURL: '/' })
 * await context.account.unlink({ provider: 'github' })
 * ```
 */
export const AccountFeatureProcedure = igniter.procedure({
  name: 'AccountFeatureProcedure',
  handler: async (_, { context, request }) => {
    return {
      account: {
        /**
         * @method findManyByCurrentUser
         * @description Retrieves all external accounts linked to the current user.
         *
         * This method calls the authentication service API to get all linked
         * external accounts for the current user and transforms the response
         * into the application's Account type format.
         *
         * @returns {Promise<Account[]>} Array of linked external accounts
         * @throws {Error} When authentication service API call fails
         */
        findManyByCurrentUser: async (): Promise<Account[]> => {
          // Business Logic: Call authentication service API to get user accounts
          const accounts = await context.services.auth.api.listUserAccounts({
            headers: request.headers,
          })

          // Data Transformation: Map API response to application Account type
          return accounts.map((account) => ({
            id: account.id,
            provider: account.providerId || 'unknown',
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
            accountId: account.accountId,
          }))
        },

        /**
         * @method link
         * @description Initiates the OAuth linking process for an external account.
         *
         * This method calls the authentication service API to start the OAuth
         * flow for linking a new external account. It returns redirect information
         * that the client should use to redirect the user to the provider's
         * authentication page.
         *
         * @param {LinkAccountDTO} input - Account linking parameters
         * @param {AccountProvider} input.provider - OAuth provider to link
         * @param {string} input.callbackURL - URL to redirect after authentication
         * @returns {Promise<LinkAccountResponse>} Redirect information for OAuth flow
         * @throws {Error} When authentication service API call fails
         */
        link: async (input: LinkAccountDTO): Promise<LinkAccountResponse> => {
          // Business Logic: Call authentication service API to initiate OAuth linking
          const account = await context.services.auth.api.linkSocialAccount({
            headers: request.headers,
            body: {
              provider: input.provider,
              callbackURL: input.callbackURL,
            },
          })

          // Response: Return the OAuth redirect information
          return account
        },

        /**
         * @method unlink
         * @description Removes an external OAuth account from the user's profile.
         *
         * This method calls the authentication service API to permanently
         * unlink the specified external account from the user's profile.
         * The account will no longer be available for authentication.
         *
         * @param {UnlinkAccountDTO} input - Account unlinking parameters
         * @param {AccountProvider} input.provider - OAuth provider to unlink
         * @returns {Promise<void>} Confirmation of successful unlinking
         * @throws {Error} When authentication service API call fails
         */
        unlink: async (input: UnlinkAccountDTO): Promise<void> => {
          // Business Logic: Call authentication service API to unlink account
          await context.services.auth.api.unlinkAccount({
            headers: request.headers,
            body: {
              providerId: input.provider,
            },
          })
        },
      },
    }
  },
})
