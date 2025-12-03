import { z } from 'zod'
import { igniter } from '@/igniter'
import { MembershipFeatureProcedure } from '../procedures/membership.procedure'
import { AuthFeatureProcedure } from '../../auth/procedures/auth.procedure'

/**
 * @controller MembershipController
 * @description Controller for managing organization memberships and user roles.
 *
 * This controller provides API endpoints for membership management within organizations,
 * including searching members, updating member roles, and removing members. It handles
 * the complete lifecycle of organization membership with proper role-based access control.
 *
 * Memberships define the relationship between users and organizations, including
 * their roles and permissions. This controller ensures proper organization isolation
 * and enforces business rules around role management and member removal.
 *
 * @example
 * ```typescript
 * // Search organization members
 * const members = await api.membership.search.query({
 *   page: 1,
 *   limit: 10,
 *   search: 'john'
 * })
 *
 * // Update member role
 * await api.membership.update.mutate({
 *   id: 'member_123',
 *   role: 'admin'
 * })
 *
 * // Remove member from organization
 * await api.membership.delete.mutate({ id: 'member_123' })
 * ```
 */
export const MembershipController = igniter.controller({
  name: 'Membership',
  description:
    'Organization membership management with role-based access control',
  path: '/membership',
  actions: {
    /**
     * @action search
     * @description Searches and retrieves organization members with filtering and pagination.
     *
     * This endpoint provides comprehensive member search functionality with support for
     * pagination, sorting, and text-based filtering. It searches across user IDs and
     * roles to help administrators find specific members within their organization.
     *
     * @param {number} [page] - Page number for pagination (1-based)
     * @param {number} [limit] - Number of items per page
     * @param {string} [sortBy] - Property to sort by (e.g., 'createdAt', 'role')
     * @param {'asc' | 'desc'} [sortOrder] - Sort order for results
     * @param {string} [search] - Search term for filtering by user ID or role
     * @returns {Membership[]} Array of membership objects with user and organization data
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin/member)
     * @example
     * ```typescript
     * const members = await api.membership.search.query({
     *   page: 1,
     *   limit: 20,
     *   search: 'admin',
     *   sortBy: 'createdAt',
     *   sortOrder: 'desc'
     * })
     * // Returns: [{ id: 'member_123', userId: 'user_456', role: 'admin', ... }]
     * ```
     */
    search: igniter.query({
      name: 'searchMemberships',
      description: 'Search organization members',
      method: 'GET',
      path: '/',
      use: [MembershipFeatureProcedure(), AuthFeatureProcedure()],
      query: z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        search: z.string().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with member roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin', 'member'],
        })

        // Business Logic: Search members within the organization with query parameters
        const result = await context.membership.search({
          ...request.query,
          organizationId: session.organization.id,
        })

        // Response: Return the search results with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action update
     * @description Updates a member's role within the organization.
     *
     * This endpoint allows administrators and owners to modify member roles
     * within their organization. It enforces proper authorization and ensures
     * that only users with appropriate permissions can modify memberships.
     *
     * @param {string} id - The unique identifier of the membership to update
     * @param {string} [userId] - New user ID for the membership
     * @param {string} [role] - New role for the member (e.g., 'admin', 'member')
     * @returns {Membership} The updated membership object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When membership is not found
     * @example
     * ```typescript
     * const updated = await api.membership.update.mutate({
     *   id: 'member_123',
     *   role: 'admin'
     * })
     * // Returns: { id: 'member_123', userId: 'user_456', role: 'admin', ... }
     * ```
     */
    update: igniter.mutation({
      name: 'updateMembership',
      description: 'Update member role',
      method: 'PUT',
      path: '/:id' as const,
      use: [MembershipFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        userId: z.string().optional(),
        role: z.string().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Observation: Extract membership ID and update parameters
        const { id } = request.params
        const { userId, role } = request.body

        // Business Logic: Update the membership with new details
        const result = await context.membership.update({
          id,
          userId,
          role,
          organizationId: session.organization.id,
        })

        // Response: Return the updated membership with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Removes a member from the organization.
     *
     * This endpoint permanently removes a member from the organization,
     * revoking their access and permissions. It includes business rules
     * to prevent deletion of organization owners and ensures proper
     * authorization for the operation.
     *
     * @param {string} id - The unique identifier of the membership to delete
     * @returns {null} Confirmation of successful removal
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required roles (owner/admin)
     * @throws {404} When membership is not found
     * @throws {400} When attempting to delete organization owner
     * @example
     * ```typescript
     * await api.membership.delete.mutate({ id: 'member_123' })
     * // Member successfully removed from organization
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteMembership',
      description: 'Remove member',
      method: 'DELETE',
      path: '/:id' as const,
      use: [MembershipFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session with admin/owner roles
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['owner', 'admin'],
        })

        // Observation: Extract membership ID from path parameters
        const { id } = request.params

        // Business Logic: Remove the member from the organization
        await context.membership.delete({
          id,
          organizationId: session.organization.id,
        })

        // Response: Return confirmation of successful removal
        return response.success(null)
      },
    }),
  },
})
