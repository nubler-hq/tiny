import { igniter } from '@/igniter'

/**
 * @procedure SessionFeatureProcedure
 * @description Procedure for managing user session operations and security.
 *
 * This procedure provides the business logic layer for session management,
 * handling operations related to user authentication sessions. It allows
 * users to view their active sessions and revoke specific sessions for
 * enhanced account security.
 *
 * The procedure integrates with the authentication service to manage
 * session lifecycle, providing essential functionality for user account
 * security and session control.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const sessions = await context.session.findMany()
 * await context.session.revoke('session_token_123')
 * ```
 */
export const SessionFeatureProcedure = igniter.procedure({
  name: 'SessionFeatureProcedure',
  handler: async (_, { context, request }) => {
    return {
      session: {
        /**
         * @method findMany
         * @description Retrieves all active sessions for the current user.
         *
         * This method queries the authentication service to get a list of all
         * active sessions associated with the current user, including session
         * details like creation time, last activity, and device information.
         *
         * @returns {Promise<Session[]>} Array of active user sessions
         * @throws {Error} When authentication service query fails
         */
        findMany: async () => {
          // Business Logic: Query authentication service for all user sessions
          return context.services.auth.api.listSessions({
            headers: request.headers,
          })
        },

        /**
         * @method revoke
         * @description Revokes a specific user session by token.
         *
         * This method terminates a specific user session by invalidating the
         * provided session token. This is useful for security purposes when
         * a user wants to log out from a specific device or location.
         *
         * @param {string} token - The session token to revoke
         * @returns {Promise<void>} Promise that resolves when session is revoked
         * @throws {Error} When session revocation fails
         */
        revoke: async (token: string) => {
          // Business Logic: Revoke the specified session through authentication service
          return context.services.auth.api.revokeSession({
            headers: request.headers,
            body: {
              token,
            },
          })
        },
      },
    }
  },
})
