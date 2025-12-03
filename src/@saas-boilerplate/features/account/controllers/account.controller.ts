import { z } from 'zod'
import { igniter } from '@/igniter'
import { AccountFeatureProcedure } from '../procedures/account.procedure'
import { AccountProvider } from '../account.interface'

/**
 * @controller AccountController
 * @description Controller for managing user external account linking and unlinking.
 *
 * This controller provides API endpoints for managing OAuth account connections,
 * allowing users to link and unlink their social media accounts (Google, GitHub, etc.)
 * with their application profile. It handles the complete lifecycle of external
 * account management including listing, linking, and unlinking operations.
 *
 * @example
 * ```typescript
 * // List user's linked accounts
 * const accounts = await api.account.findManyByCurrentUser.query()
 *
 * // Link a new Google account
 * const linkResult = await api.account.link.mutate({
 *   provider: 'google',
 *   callbackURL: '/dashboard'
 * })
 *
 * // Unlink an existing account
 * await api.account.unlink.mutate({ provider: 'github' })
 * ```
 */
export const AccountController = igniter.controller({
  name: 'Accounts',
  description: 'External account linking and management for OAuth providers',
  path: '/account',
  actions: {
    /**
     * @action findManyByCurrentUser
     * @description Retrieves all external accounts linked to the current user.
     *
     * This endpoint returns a list of all OAuth accounts (Google, GitHub, etc.)
     * that have been linked to the current user's profile. Each account includes
     * provider information, creation dates, and account identifiers.
     *
     * @returns {Account[]} Array of linked external accounts
     * @throws {401} When user is not authenticated
     * @example
     * ```typescript
     * const accounts = await api.account.findManyByCurrentUser.query()
     * // Returns: [{ id: 'acc_123', provider: 'google', createdAt: '...', ... }]
     * ```
     */
    findManyByCurrentUser: igniter.query({
      name: 'listUserAccounts',
      description: 'List all external accounts linked to current user',
      method: 'GET',
      path: '/',
      use: [AccountFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Business Logic: Retrieve all linked accounts for the current user
        const result = await context.account.findManyByCurrentUser()

        // Response: Return the list of linked accounts with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action link
     * @description Initiates the process to link an external OAuth account to the user's profile.
     *
     * This endpoint starts the OAuth flow for linking a new external account.
     * It returns redirect information that the client should use to redirect
     * the user to the provider's authentication page.
     *
     * @param {string} provider - The OAuth provider to link (e.g., 'google', 'github')
     * @param {string} callbackURL - URL to redirect to after successful authentication
     * @returns {LinkAccountResponse} Object containing redirect URL and confirmation
     * @throws {400} When provider or callbackURL is invalid
     * @throws {401} When user is not authenticated
     * @example
     * ```typescript
     * const result = await api.account.link.mutate({
     *   provider: 'google',
     *   callbackURL: '/dashboard'
     * })
     * // Returns: { url: 'https://accounts.google.com/oauth/...', redirect: true }
     * ```
     */
    link: igniter.mutation({
      name: 'linkAccount',
      description: 'Link a new external OAuth account to user profile',
      method: 'POST',
      path: '/',
      use: [AccountFeatureProcedure()],
      body: z.object({
        provider: z.string(),
        callbackURL: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract provider and callback URL from request body
        const { provider, callbackURL } = request.body

        // Business Logic: Initiate OAuth linking process with the specified provider
        const result = await context.account.link({
          provider: provider as AccountProvider,
          callbackURL,
        })

        // Response: Return redirect information for client-side navigation
        return response.success(result)
      },
    }),

    /**
     * @action unlink
     * @description Removes an external OAuth account from the user's profile.
     *
     * This endpoint permanently unlinks the specified external account from
     * the user's profile. The account will no longer be available for
     * authentication or data access.
     *
     * @param {AccountProvider} provider - The OAuth provider to unlink
     * @returns {void} Confirmation of successful unlinking
     * @throws {400} When provider is invalid or not linked
     * @throws {401} When user is not authenticated
     * @throws {404} When the specified account is not found
     * @example
     * ```typescript
     * await api.account.unlink.mutate({ provider: 'github' })
     * // Account successfully unlinked
     * ```
     */
    unlink: igniter.mutation({
      name: 'unlinkAccount',
      description: 'Remove an external OAuth account from user profile',
      method: 'DELETE',
      path: '/' as const,
      use: [AccountFeatureProcedure()],
      body: z.object({
        provider: z.custom<AccountProvider>(),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract provider from request body
        const { provider } = request.body

        // Business Logic: Unlink the specified external account
        await context.account.unlink({ provider })

        // Response: Return success confirmation
        return response.success()
      },
    }),
  },
})
