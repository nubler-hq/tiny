import type { Organization } from '../organization/organization.interface'
import type { User } from '../user/user.interface'
import type { Invitation } from '../invitation/invitation.interface'

/**
 * @interface Membership
 * @description Represents a membership entity that defines the relationship between a user and an organization.
 *
 * Memberships establish the connection between users and organizations, including
 * their roles and permissions within the organization. Each membership has a
 * specific role that determines what actions the user can perform within
 * the organization context.
 *
 * @property {string} id - Unique identifier for the membership
 * @property {string} organizationId - ID of the organization the user belongs to
 * @property {Organization} [organization] - Related organization entity (optional)
 * @property {string} userId - ID of the user who is a member
 * @property {User} [user] - Related user entity (optional)
 * @property {string} role - Role of the user within the organization (e.g., 'owner', 'admin', 'member')
 * @property {Invitation[]} [invitations] - Related invitation entities (optional)
 * @property {Date} createdAt - Timestamp when the membership was created
 * @property {Date} updatedAt - Timestamp when the membership was last modified
 *
 * @example
 * ```typescript
 * const membership: Membership = {
 *   id: 'member_123456789',
 *   organizationId: 'org_987654321',
 *   userId: 'user_456789123',
 *   role: 'admin',
 *   createdAt: new Date('2024-01-15T10:30:00Z'),
 *   updatedAt: new Date('2024-01-15T10:30:00Z')
 * }
 * ```
 */
export interface Membership {
  /** Unique identifier for the membership in the system */
  id: string
  /** ID of the organization the user belongs to */
  organizationId: string
  /** Related organization entity (populated when including relations) */
  organization?: Organization
  /** ID of the user who is a member */
  userId: string
  /** Related user entity (populated when including relations) */
  user?: User
  /** Role of the user within the organization (e.g., 'owner', 'admin', 'member') */
  role: string
  /** Related invitation entities (populated when including relations) */
  invitations?: Invitation[]
  /** Timestamp when the membership was first created */
  createdAt: Date
  /** Timestamp when the membership was last modified */
  updatedAt: Date
}

/**
 * @interface CreateMembershipDTO
 * @description Data transfer object for creating a new membership.
 *
 * This interface defines the parameters required to create a new membership
 * between a user and an organization. It includes the essential properties
 * needed to establish the relationship with a specific role.
 *
 * @property {string} [id] - Optional custom ID for the membership
 * @property {string} organizationId - ID of the organization to add the user to
 * @property {string} userId - ID of the user to add as a member
 * @property {string} role - Role for the new member (e.g., 'admin', 'member')
 * @property {Date} [createdAt] - Optional creation timestamp
 *
 * @example
 * ```typescript
 * const createData: CreateMembershipDTO = {
 *   organizationId: 'org_987654321',
 *   userId: 'user_456789123',
 *   role: 'member'
 * }
 * ```
 */
export interface CreateMembershipDTO {
  /** Optional custom ID for the membership */
  id?: string | null
  /** ID of the organization to add the user to */
  organizationId: string
  /** ID of the user to add as a member */
  userId: string
  /** Role for the new member (e.g., 'admin', 'member') */
  role: string
  /** Optional creation timestamp */
  createdAt?: Date | null
}

/**
 * @interface UpdateMembershipDTO
 * @description Data transfer object for updating an existing membership.
 *
 * This interface defines the parameters that can be modified when updating
 * an existing membership. All fields are optional to allow partial updates
 * while maintaining data integrity.
 *
 * @property {string} [id] - Optional membership ID
 * @property {string} [organizationId] - New organization ID (rarely changed)
 * @property {string} [userId] - New user ID for the membership
 * @property {string} [role] - New role for the member
 *
 * @example
 * ```typescript
 * const updateData: UpdateMembershipDTO = {
 *   id: 'member_123456789',
 *   role: 'admin'
 * }
 * ```
 */
export interface UpdateMembershipDTO {
  /** Optional membership ID */
  id?: string | null
  /** New organization ID (rarely changed) */
  organizationId?: string
  /** New user ID for the membership */
  userId?: string
  /** New role for the member */
  role?: string
}

/**
 * @interface MembershipQueryParams
 * @description Query parameters for fetching and filtering membership entities.
 *
 * This interface defines the parameters that can be used when querying
 * memberships, providing support for pagination, sorting, and search functionality.
 * It's designed to be flexible and support various query patterns.
 *
 * @property {number} [page] - Current page number for pagination (1-based)
 * @property {number} [limit] - Number of items to return per page
 * @property {string} [sortBy] - Property name to sort by (e.g., 'createdAt', 'role')
 * @property {'asc' | 'desc'} [sortOrder] - Sort order for the results
 * @property {string} [search] - Search term for filtering by user ID or role
 * @property {string} [organizationId] - Organization ID to filter memberships
 *
 * @example
 * ```typescript
 * const queryParams: MembershipQueryParams = {
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'admin',
 *   organizationId: 'org_123'
 * }
 * ```
 */
export interface MembershipQueryParams {
  /** Current page number for pagination (1-based indexing) */
  page?: number
  /** Number of items to return per page (for pagination) */
  limit?: number
  /** Property name to sort the results by */
  sortBy?: string
  /** Sort order for the results ('asc' for ascending, 'desc' for descending) */
  sortOrder?: 'asc' | 'desc'
  /** Search term for filtering results by user ID or role */
  search?: string
  /** Organization ID to filter memberships by */
  organizationId?: string
}
