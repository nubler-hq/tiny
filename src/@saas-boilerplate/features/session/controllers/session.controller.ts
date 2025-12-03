import { z } from 'zod'
import { igniter } from '@/igniter'
import { SessionFeatureProcedure } from '../procedures/session.procedure'

/**
 * @controller SessionController
 * @description Controller for managing user sessions and authentication tokens.
 *
 * This controller provides session management capabilities including active session
 * tracking, session listing, and token revocation. It's designed for user account
 * security and session management features.
 *
 * The controller handles session lifecycle management, allowing users to view
 * their active sessions and revoke specific sessions for security purposes.
 *
 * @example
 * ```typescript
 * // List user's active sessions
 * const sessions = await api.session.findManyByCurrentUser.query()
 *
 * // Revoke a specific session
 * await api.session.revoke.mutate({ token: 'session_token_123' })
 * ```
 */
export const SessionController = igniter.controller({
  name: 'Session',
  description:
    'User session management with active session tracking and token revocation',
  path: '/session',
  actions: {
    /**
     * @action findManyByCurrentUser
     * @description Lists all active sessions for the current user.
     *
     * This endpoint returns a list of all active sessions associated with the
     * current user, including session details like creation time, last activity,
     * and device information.
     *
     * @returns {Session[]} Array of active user sessions
     * @example
     * ```typescript
     * const sessions = await api.session.findManyByCurrentUser.query()
     * // Returns: [{ id: 'session_1', createdAt: '...', device: 'Chrome', ... }]
     * ```
     */
    findManyByCurrentUser: igniter.query({
      name: 'listUserSessions',
      description: 'List user sessions',
      method: 'GET',
      path: '/',
      use: [SessionFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Business Logic: Retrieve all active sessions for the current user
        const result = await context.session.findMany()

        // Response: Return sessions list with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action revoke
     * @description Revokes a specific user session by token.
     *
     * This endpoint allows users to revoke a specific session by providing
     * the session token. This is useful for security purposes when a user
     * wants to log out from a specific device or session.
     *
     * @param {string} token - The session token to revoke
     * @returns {{ success: boolean }} Confirmation of session revocation
     * @example
     * ```typescript
     * await api.session.revoke.mutate({ token: 'session_token_123' })
     * // Returns: { success: true }
     * ```
     */
    revoke: igniter.mutation({
      name: 'revokeSession',
      description: 'Revoke user session',
      method: 'DELETE',
      path: '/revoke' as const,
      use: [SessionFeatureProcedure()],
      body: z.object({
        token: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        // Business Logic: Revoke the specified session token
        const result = await context.session.revoke(request.body.token)

        // Response: Return revocation confirmation with a 200 status
        return response.success(result)
      },
    }),
  },
})
