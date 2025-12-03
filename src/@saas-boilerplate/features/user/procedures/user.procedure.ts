import { igniter } from '@/igniter'
import {
  type User,
  type UpdateUserDTO,
  UserMetadataSchema,
  type UserMetadata,
} from '../user.interface'
import { updateMetadataSafe } from '@/utils/update-metadata'

/**
 * @procedure UserFeatureProcedure
 * @description Procedure for managing user operations and profile management.
 *
 * This procedure provides the business logic layer for user management,
 * handling database operations for user profile updates, membership
 * retrieval, and account deletion. It manages the complete lifecycle
 * of user account operations with proper data validation and metadata handling.
 *
 * The procedure includes sophisticated metadata management for user
 * preferences, notification settings, and contact information, ensuring
 * data integrity and proper validation.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const memberships = await context.user.listMemberships()
 * const updated = await context.user.update({ id: 'user_123', name: 'John Doe' })
 * await context.user.delete({ id: 'user_123' })
 * ```
 */
export const UserFeatureProcedure = igniter.procedure({
  name: 'UserFeatureProcedure',
  handler: async (_, { context, request }) => {
    return {
      user: {
        /**
         * @method listMemberships
         * @description Retrieves all organization memberships for the current user.
         *
         * This method calls the authentication service API to get all organizations
         * that the current user is a member of, along with their roles and
         * membership details.
         *
         * @returns {Promise<Organization[]>} Array of organizations the user belongs to
         * @throws {Error} When authentication service API call fails
         * @example
         * ```typescript
         * const memberships = await context.user.listMemberships()
         * // Returns: [{ id: 'org_123', name: 'Acme Corp', role: 'admin', ... }]
         * ```
         */
        listMemberships: async () => {
          // Business Logic: Call authentication service API to get user organizations
          return context.services.auth.api.listOrganizations({
            headers: request.headers,
          })
        },

        /**
         * @method update
         * @description Updates a user's profile information and metadata.
         *
         * This method updates user profile data including name, image, and metadata.
         * It handles metadata updates safely using the metadata update utility
         * and ensures proper validation of user data.
         *
         * @param {UpdateUserDTO} params - Update parameters
         * @param {string} params.id - The unique identifier of the user to update
         * @param {string} [params.name] - New display name for the user
         * @param {string} [params.image] - New profile image URL
         * @param {DeepPartial<UserMetadata>} [params.metadata] - Updated user metadata
         * @returns {Promise<User>} The updated user object
         * @throws {Error} When user is not found or database operations fail
         * @example
         * ```typescript
         * const updated = await context.user.update({
         *   id: 'user_123',
         *   name: 'John Doe',
         *   image: 'https://example.com/avatar.jpg'
         * })
         * ```
         */
        update: async (params: UpdateUserDTO): Promise<User> => {
          // Business Logic: Verify user exists before updating
          const user = await context.services.database.user.findUnique({
            where: { id: params.id },
          })

          // Business Rule: Throw error if user is not found
          if (!user) throw new Error('User not found')

          // Business Logic: Update metadata safely if provided
          if (params.metadata) {
            const res = await updateMetadataSafe('user', {
              field: 'metadata',
              where: { id: user.id },
              data: params.metadata as UserMetadata,
              schema: UserMetadataSchema,
            })

            // Business Rule: Handle metadata update errors
            if (!res.success) {
              console.error(res.error)
              throw new Error(res.error?.message)
            }
          }

          // Business Logic: Update basic user profile fields
          // @ts-expect-error - metadata is not required for basic update
          return context.services.database.user.update({
            where: { id: params.id },
            data: {
              name: params.name,
              image: params.image,
            },
          })
        },

        /**
         * @method delete
         * @description Permanently deletes a user account from the database.
         *
         * This method permanently removes a user account and all associated
         * data from the system. This action is irreversible and should be
         * used with caution.
         *
         * @param {object} params - Deletion parameters
         * @param {string} params.id - The unique identifier of the user to delete
         * @returns {Promise<{ id: string }>} Confirmation object with deleted user ID
         * @throws {Error} When database operation fails
         * @example
         * ```typescript
         * const result = await context.user.delete({ id: 'user_123' })
         * // Returns: { id: 'user_123' }
         * ```
         */
        delete: async (params: { id: string }): Promise<{ id: string }> => {
          // Business Logic: Permanently delete the user account
          await context.services.database.user.delete({
            where: { id: params.id },
          })

          // Response: Return confirmation with deleted user ID
          return { id: params.id }
        },
      },
    }
  },
})
