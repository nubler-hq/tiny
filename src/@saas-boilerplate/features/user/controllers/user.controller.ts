import { z } from 'zod'
import { igniter } from '@/igniter'
import { UserFeatureProcedure } from '../procedures/user.procedure'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { UserMetadataSchema } from '../user.interface'

/**
 * @controller UserController
 * @description Controller for managing user profiles and account operations.
 *
 * This controller provides API endpoints for user profile management including
 * updating personal information, managing memberships, and account deletion.
 * It handles the complete lifecycle of user account operations with proper
 * authentication and authorization controls.
 *
 * Users are the core entities in the system, representing individual accounts
 * that can belong to multiple organizations through memberships. This controller
 * ensures proper user data management and privacy protection.
 *
 * @example
 * ```typescript
 * // List user's organization memberships
 * const memberships = await api.user.listMemberships.query()
 *
 * // Update user profile
 * await api.user.update.mutate({
 *   name: 'John Doe',
 *   image: 'https://example.com/avatar.jpg'
 * })
 *
 * // Delete user account
 * await api.user.delete.mutate({ id: 'user_123' })
 * ```
 */
export const UserController = igniter.controller({
  name: 'User',
  description:
    'User profile management with membership tracking and account operations',
  path: '/user',
  actions: {
    /**
     * @action listMemberships
     * @description Retrieves all organization memberships for the authenticated user.
     *
     * This endpoint returns a list of all organizations that the current user
     * is a member of, along with their roles and membership details. It's
     * typically used to display the user's organization dashboard or
     * organization switcher interface.
     *
     * @returns {Organization[]} Array of organizations the user belongs to
     * @throws {401} When user is not authenticated
     * @example
     * ```typescript
     * const memberships = await api.user.listMemberships.query()
     * // Returns: [{ id: 'org_123', name: 'Acme Corp', role: 'admin', ... }]
     * ```
     */
    listMemberships: igniter.query({
      name: 'listUserMemberships',
      description: 'List all organization memberships for the current user',
      method: 'GET',
      path: '/memberships',
      use: [UserFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Verify user is authenticated
        await context.auth.getSession({ requirements: 'authenticated' })

        // Business Logic: Retrieve all organization memberships for the user
        const result = await context.user.listMemberships()

        // Response: Return the memberships list with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action update
     * @description Updates the authenticated user's profile information.
     *
     * This endpoint allows users to modify their personal information including
     * name, profile image, and metadata. It supports partial updates, allowing
     * users to modify only the fields they want to change.
     *
     * @param {string} [name] - New display name for the user
     * @param {string} [image] - New profile image URL
     * @param {UserMetadata} [metadata] - Updated user metadata and preferences
     * @returns {User} The updated user object
     * @throws {401} When user is not authenticated
     * @throws {404} When user is not found
     * @example
     * ```typescript
     * const updated = await api.user.update.mutate({
     *   name: 'John Doe',
     *   image: 'https://example.com/avatar.jpg',
     *   metadata: {
     *     contact: { phone: '+1234567890' },
     *     notifications: { preferences: { ... } }
     *   }
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'updateUser',
      description: 'Update user profile information and metadata',
      method: 'PUT',
      path: '/' as const,
      use: [UserFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        name: z.string().optional(),
        image: z.string().optional(),
        metadata: UserMetadataSchema.optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session
        const session = await context.auth.getSession({
          requirements: 'authenticated',
        })

        // Observation: Extract update parameters from request body
        const { name, image, metadata } = request.body

        // Business Logic: Update the user profile with new information
        const result = await context.user.update({
          id: session.user.id,
          name,
          image,
          metadata,
        })

        // Response: Return the updated user with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Permanently deletes a user account and all associated data.
     *
     * This endpoint permanently removes a user account from the system,
     * including all associated data, memberships, and personal information.
     * This action is irreversible and should be used with caution.
     *
     * @param {string} id - The unique identifier of the user to delete
     * @returns {null} Confirmation of successful deletion
     * @throws {404} When user is not found
     * @example
     * ```typescript
     * await api.user.delete.mutate({ id: 'user_123' })
     * // User account permanently deleted
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteUser',
      description: 'Permanently delete user account and all associated data',
      method: 'DELETE',
      path: '/:id' as const,
      use: [UserFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Observation: Extract user ID from path parameters
        const { id } = request.params

        // Business Logic: Permanently delete the user account
        await context.user.delete({ id })

        // Response: Return confirmation of successful deletion
        return response.success(null)
      },
    }),
  },
})
