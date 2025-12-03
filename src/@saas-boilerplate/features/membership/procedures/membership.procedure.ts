import { igniter } from '@/igniter'
import type {
  Membership,
  CreateMembershipDTO,
  UpdateMembershipDTO,
  MembershipQueryParams,
} from '../membership.interface'

/**
 * @procedure MembershipFeatureProcedure
 * @description Procedure for managing organization membership operations and database interactions.
 *
 * This procedure provides the business logic layer for membership management,
 * handling database operations for creating, updating, searching, and deleting
 * organization memberships. It enforces business rules around role management
 * and organization isolation.
 *
 * The procedure manages the relationship between users and organizations,
 * including role assignments and access control. It ensures proper data
 * integrity and enforces business rules such as preventing owner deletion.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const members = await context.membership.search({ organizationId: 'org_123', search: 'admin' })
 * const newMember = await context.membership.create({ organizationId: 'org_123', userId: 'user_456', role: 'member' })
 * await context.membership.delete({ id: 'member_123', organizationId: 'org_123' })
 * ```
 */
export const MembershipFeatureProcedure = igniter.procedure({
  name: 'MembershipFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      membership: {
        /**
         * @method search
         * @description Searches for memberships with filtering, pagination, and sorting.
         *
         * This method provides comprehensive search functionality for organization
         * memberships, supporting text-based filtering across user IDs and roles,
         * pagination for large result sets, and flexible sorting options.
         *
         * @param {MembershipQueryParams} query - Search and pagination parameters
         * @param {string} query.organizationId - Organization ID to filter memberships
         * @param {number} [query.page] - Page number for pagination (1-based)
         * @param {number} [query.limit] - Number of items per page
         * @param {string} [query.sortBy] - Property to sort by
         * @param {'asc' | 'desc'} [query.sortOrder] - Sort order
         * @param {string} [query.search] - Search term for filtering
         * @returns {Promise<Membership[]>} Array of matching membership objects
         * @throws {Error} When database query fails
         * @example
         * ```typescript
         * const members = await context.membership.search({
         *   organizationId: 'org_123',
         *   search: 'admin',
         *   page: 1,
         *   limit: 10
         * })
         * ```
         */
        search: async (query: MembershipQueryParams): Promise<Membership[]> => {
          // Business Logic: Build search query with optional text filtering
          return context.services.database.member.findMany({
            where: query.search
              ? {
                  OR: [
                    { userId: { contains: query.search } },
                    { role: { contains: query.search } },
                  ],
                  organizationId: query.organizationId,
                }
              : { organizationId: query.organizationId },
            skip: query.page
              ? (query.page - 1) * (query.limit || 10)
              : undefined,
            take: query.limit,
            orderBy: query.sortBy
              ? { [query.sortBy]: query.sortOrder || 'asc' }
              : undefined,
          })
        },

        /**
         * @method findOne
         * @description Retrieves a specific membership by ID with optional organization filtering.
         *
         * This method finds a single membership by its ID, with optional organization
         * filtering for additional security. It returns null if the membership
         * is not found or doesn't belong to the specified organization.
         *
         * @param {object} params - Query parameters
         * @param {string} params.id - The unique identifier of the membership
         * @param {string} [params.organizationId] - Optional organization ID for additional filtering
         * @returns {Promise<Membership | null>} Membership object or null if not found
         * @throws {Error} When database query fails
         * @example
         * ```typescript
         * const membership = await context.membership.findOne({
         *   id: 'member_123',
         *   organizationId: 'org_123'
         * })
         * ```
         */
        findOne: async (params: {
          id: string
          organizationId?: string
        }): Promise<Membership | null> => {
          // Business Logic: Find membership by ID with optional organization filter
          return context.services.database.member.findUnique({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })
        },

        /**
         * @method create
         * @description Creates a new membership between a user and an organization.
         *
         * This method creates a new membership record, establishing the relationship
         * between a user and an organization with a specific role. It's typically
         * used when adding new members to an organization.
         *
         * @param {CreateMembershipDTO} input - Membership creation parameters
         * @param {string} input.organizationId - ID of the organization
         * @param {string} input.userId - ID of the user to add as member
         * @param {string} input.role - Role for the new member (e.g., 'admin', 'member')
         * @returns {Promise<Membership>} The newly created membership object
         * @throws {Error} When database operation fails
         * @example
         * ```typescript
         * const membership = await context.membership.create({
         *   organizationId: 'org_123',
         *   userId: 'user_456',
         *   role: 'member'
         * })
         * ```
         */
        create: async (input: CreateMembershipDTO): Promise<Membership> => {
          // Business Logic: Create new membership record in database
          return context.services.database.member.create({
            data: {
              organizationId: input.organizationId,
              userId: input.userId,
              role: input.role,
            },
          })
        },

        /**
         * @method update
         * @description Updates an existing membership's details and role.
         *
         * This method allows modification of membership properties such as
         * user ID and role. It first verifies the membership exists before
         * attempting to update it, ensuring data integrity.
         *
         * @param {object} params - Update parameters
         * @param {string} params.id - The unique identifier of the membership to update
         * @param {string} [params.organizationId] - Organization ID for additional security
         * @param {string} [params.userId] - New user ID for the membership
         * @param {string} [params.role] - New role for the member
         * @returns {Promise<Membership>} The updated membership object
         * @throws {Error} When membership is not found or database operation fails
         * @example
         * ```typescript
         * const updated = await context.membership.update({
         *   id: 'member_123',
         *   organizationId: 'org_123',
         *   role: 'admin'
         * })
         * ```
         */
        update: async (
          params: { id: string; organizationId?: string } & UpdateMembershipDTO,
        ): Promise<Membership> => {
          // Business Logic: Verify membership exists before updating
          const membership = await context.services.database.member.findUnique({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })

          // Business Rule: Throw error if membership is not found
          if (!membership) throw new Error('Membership not found')

          // Business Logic: Update the membership with new details
          return context.services.database.member.update({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
            data: {
              organizationId: params.organizationId,
              userId: params.userId,
              role: params.role,
            },
          })
        },

        /**
         * @method delete
         * @description Permanently deletes a membership from the database.
         *
         * This method permanently removes a membership, effectively removing
         * the user from the organization. It includes business rules to prevent
         * deletion of organization owners and ensures proper authorization.
         *
         * @param {object} params - Deletion parameters
         * @param {string} params.id - The unique identifier of the membership to delete
         * @param {string} [params.organizationId] - Optional organization ID for additional security
         * @returns {Promise<{ id: string }>} Confirmation object with deleted membership ID
         * @throws {Error} When membership is not found, is an owner, or database operation fails
         * @example
         * ```typescript
         * const result = await context.membership.delete({
         *   id: 'member_123',
         *   organizationId: 'org_123'
         * })
         * // Returns: { id: 'member_123' }
         * ```
         */
        delete: async (params: {
          id: string
          organizationId?: string
        }): Promise<{ id: string }> => {
          // Business Logic: Verify membership exists before deletion
          const membership = await context.services.database.member.findUnique({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })

          // Business Rule: Throw error if membership is not found
          if (!membership) throw new Error('Membership not found')

          // Business Rule: Prevent deletion of organization owners
          if (membership.role === 'owner')
            throw new Error('Cannot delete organization owner')

          // Business Logic: Permanently delete the membership
          await context.services.database.member.delete({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })

          // Response: Return confirmation with deleted membership ID
          return { id: params.id }
        },
      },
    }
  },
})
