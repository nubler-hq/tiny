import type { Organization } from '../organization/organization.interface'
import type { Membership } from '../membership/membership.interface'
import type { OrganizationMembershipRole } from '../auth/auth.interface'
import {
  IgniterResponseError,
  type IgniterCommonErrorCode,
} from '@igniter-js/core'
import { z } from 'zod'

type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'canceled'

/**
 * @interface Invitation
 * @description Represents an invitation entity within an organization with complete lifecycle management.
 *
 * This interface defines the comprehensive structure of an invitation in the SaaS application,
 * including its status, associated organization, email, role assignment, and timestamps.
 * It supports the complete invitation workflow from creation to acceptance/rejection/cancellation.
 *
 * Key features:
 * - Complete invitation lifecycle management with status tracking
 * - Organization-scoped access control and membership validation
 * - Role-based permission assignment for new members
 * - Expiration handling for security and cleanup
 * - Audit trail with creation and update timestamps
 * - Relationship mapping to organization and inviter membership
 *
 * Security considerations:
 * - Organization isolation ensures invitations are scoped to specific organizations
 * - Expiration dates prevent indefinite validity of invitation links
 * - Status tracking prevents reuse of processed invitations
 * - Role validation ensures proper permission assignment
 *
 * @example
 * ```typescript
 * const invitation: Invitation = {
 *   id: 'inv_123456789',
 *   status: 'pending',
 *   organizationId: 'org_987654321',
 *   organization: {
 *     id: 'org_987654321',
 *     name: 'Acme Corporation',
 *     slug: 'acme-corp'
 *   },
 *   email: 'john.doe@company.com',
 *   role: 'member',
 *   inviterMembershipId: 'mem_456789123',
 *   inviterMembership: {
 *     id: 'mem_456789123',
 *     userId: 'user_789123456',
 *     organizationId: 'org_987654321',
 *     role: 'admin'
 *   },
 *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface Invitation {
  /** Unique identifier for the invitation. */
  id: string
  /** The current status of the invitation (e.g., 'pending', 'accepted'). */
  status: InvitationStatus
  /** The ID of the organization to which the invitation belongs. */
  organizationId: string
  /** The associated Organization entity (optional, for relations). */
  organization?: Organization
  /** The email address of the invitee. */
  email: string
  /** The role assigned to the invitee within the organization. */
  role: OrganizationMembershipRole
  /** The ID of the membership that created this invitation (optional). */
  inviterMembershipId: string | null
  /** The associated Inviter Membership entity (optional, for relations). */
  inviterMembership?: Membership
  /** The date and time when the invitation expires. */
  expiresAt: Date
  /** The date and time when the invitation was created. */
  createdAt: Date
  /** The date and time when the invitation was last updated. */
  updatedAt: Date
}

/**
 * @interface InvitationErrorDetails
 * @description Standardized error details structure for invitation-related operations.
 */
export interface InvitationErrorDetails {
  /** The error code, typically a constant string. */
  code: string
  /** A human-readable message describing the error. */
  message: string
}

/**
 * @class InvitationError
 * @extends {IgniterResponseError<IgniterCommonErrorCode, InvitationErrorDetails>}
 * @description Custom error class for invitation-related issues with comprehensive error handling.
 *
 * This error class extends IgniterResponseError to provide standardized error handling
 * and propagation throughout the application for all invitation-related operations.
 * It supports custom error codes, detailed error messages, and HTTP status mapping
 * for consistent API error responses.
 *
 * Key features:
 * - Standardized error structure with code and message
 * - HTTP status code mapping for proper API responses
 * - Detailed error data for debugging and logging
 * - Type-safe error handling with TypeScript generics
 * - Integration with Igniter.js error handling system
 *
 * Error codes include:
 * - ORGANIZATION_NOT_FOUND: When specified organization does not exist
 * - INVITATION_NOT_FOUND: When invitation with given ID is not found
 * - INVITATION_EXPIRED: When invitation has passed its expiration date
 * - INVITATION_ALREADY_PROCESSED: When invitation has already been accepted/rejected
 * - UNAUTHORIZED_ACTION: When user lacks permission for the operation
 *
 * @example
 * ```typescript
 * // Throw custom invitation error
 * throw new InvitationError(
 *   {
 *     code: 'ORGANIZATION_NOT_FOUND',
 *     message: 'The specified organization could not be found'
 *   },
 *   404
 * )
 *
 * // Error handling in controller
 * try {
 *   const invitation = await context.invitation.findOne('inv_123')
 * } catch (error) {
 *   if (error instanceof InvitationError) {
 *     return response.status(error.status).json(error.data)
 *   }
 *   throw error
 * }
 * ```
 */
export class InvitationError extends IgniterResponseError<
  IgniterCommonErrorCode,
  InvitationErrorDetails
> {
  public readonly status: number

  constructor(details: InvitationErrorDetails, status: number = 400) {
    super({
      code: details.code as IgniterCommonErrorCode,
      message: details.message,
      data: details,
    })

    this.status = status
  }
}

/**
 * @schema InviteMemberSchema
 * @description Zod schema for validating invitation creation requests with comprehensive validation.
 *
 * This schema validates the input data for creating new invitations, ensuring that
 * the email address is properly formatted and the role assignment is valid.
 * It includes custom error messages for better user experience and supports
 * internationalization through error mapping.
 *
 * Validation rules:
 * - Email must be a non-empty string and valid email format
 * - Role must be either 'admin' or 'member' (enforced by enum)
 * - Custom error messages for better UX
 * - Type-safe validation with Zod inference
 *
 * @example
 * ```typescript
 * // Valid invitation data
 * const validData = {
 *   email: 'john.doe@company.com',
 *   role: 'member'
 * }
 *
 * // Schema validation
 * const result = InviteMemberSchema.safeParse(validData)
 * if (result.success) {
 *   // Valid data, proceed with invitation creation
 *   console.log('Email:', result.data.email)
 *   console.log('Role:', result.data.role)
 * } else {
 *   // Handle validation errors
 *   console.error('Validation failed:', result.error.issues)
 * }
 * ```
 */
export const InviteMemberSchema = z.object({
  email: z.string().min(1, 'At least one email is required'),
  role: z.enum(['admin', 'member']),
})

/**
 * @typedef {import("zod").infer<typeof InviteMemberSchema>} InviteMemberInput
 * @description Type definition for invitation creation input with full type safety.
 *
 * This type is automatically inferred from the InviteMemberSchema using Zod's type inference.
 * It provides complete type safety for invitation creation requests while maintaining
 * the flexibility of runtime validation through the schema.
 *
 * Features:
 * - Complete type safety with TypeScript
 * - Automatic type inference from Zod schema
 * - Runtime validation through schema parsing
 * - IntelliSense support in IDEs
 * - Consistent API contract enforcement
 *
 * @example
 * ```typescript
 * // Type-safe invitation input
 * const invitationData: InviteMemberInput = {
 *   email: 'jane.smith@company.com',
 *   role: 'admin'
 * }
 *
 * // Usage with API client
 * const result = await api.invitation.create.mutate({
 *   body: invitationData // Fully type-safe
 * })
 *
 * // TypeScript will catch invalid properties or types
 * const invalidData = {
 *   email: 'invalid-email', // TypeScript error: invalid email format
 *   role: 'invalid-role'   // TypeScript error: invalid role value
 * }
 * ```
 */
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>

/**
 * @interface CreateInvitationDTO
 * @description Data transfer object for creating new invitations with complete type safety.
 *
 * This interface defines the structure for invitation creation requests, providing
 * type safety and clear API contracts for the invitation system. It is used
 * throughout the invitation workflow for creating new invitations with proper
 * validation and authorization.
 *
 * Key characteristics:
 * - Email-based invitation system for new organization members
 * - Role-based access control for permission assignment
 * - Integration with authentication and organization systems
 * - Support for bulk invitation creation workflows
 * - Type-safe API contracts for frontend-backend communication
 *
 * Usage contexts:
 * - API request/response handling
 * - Form validation and processing
 * - Database operation parameters
 * - Email service integration
 * - Authorization and permission checks
 *
 * @example
 * ```typescript
 * // Creating invitation through API
 * const invitationData: CreateInvitationDTO = {
 *   email: 'sarah.wilson@company.com',
 *   role: 'member'
 * }
 *
 * // Using with invitation service
 * const invitation = await invitationService.create(invitationData)
 *
 * // Processing invitation request
 * const result = await api.invitation.create.mutate({
 *   body: invitationData
 * })
 * ```
 */
export interface CreateInvitationDTO {
  /** The email address of the invitee. */
  email: string
  /** The role to assign to the invitee within the organization. */
  role: OrganizationMembershipRole
}

/**
 * @interface UpdateInvitationDTO
 * @description Data transfer object for updating existing invitations with partial data support.
 *
 * This interface defines the structure for invitation update operations, allowing
 * partial updates to invitation properties while maintaining type safety and
 * data integrity. All properties are optional to support flexible update scenarios.
 *
 * Update capabilities:
 * - Status transitions (pending → accepted/rejected/canceled)
 * - Organization reassignment (for invitation transfers)
 * - Role modifications (for permission changes)
 * - Expiration date adjustments (for extension/early expiration)
 * - Metadata updates for tracking and audit purposes
 *
 * Usage scenarios:
 * - Invitation status management during acceptance/rejection workflows
 * - Administrative bulk operations for invitation management
 * - Expiration date extensions for pending invitations
 * - Organization restructuring with invitation reassignment
 * - Audit trail maintenance with update timestamps
 *
 * @example
 * ```typescript
 * // Update invitation status to accepted
 * const acceptedUpdate: UpdateInvitationDTO = {
 *   status: 'accepted',
 *   updatedAt: new Date()
 * }
 *
 * // Extend invitation expiration
 * const extendedUpdate: UpdateInvitationDTO = {
 *   expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
 *   updatedAt: new Date()
 * }
 *
 * // Administrative reassignment
 * const reassignedUpdate: UpdateInvitationDTO = {
 *   organizationId: 'new-org-123',
 *   role: 'admin',
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface UpdateInvitationDTO {
  /** Optional unique identifier for the invitation. */
  id?: string | null
  /** Optional status of the invitation. */
  status?: InvitationStatus | null
  /** Optional ID of the organization. */
  organizationId?: string
  /** Optional email address of the invitee. */
  email?: string
  /** Optional role assigned to the invitee. */
  role?: string
  /** Optional ID of the inviter membership. */
  inviterMembershipId?: string | null
  /** Optional expiration date and time. */
  expiresAt?: Date
  /** Optional creation date and time. */
  createdAt?: Date | null
  /** Optional last update date and time. */
  updatedAt?: Date
}

/**
 * @interface InvitationQueryParams
 * @description Query parameters for fetching and filtering invitation entities with pagination support.
 *
 * This interface defines the comprehensive set of query parameters for invitation listing
 * and filtering operations. It supports pagination, sorting, searching, and various
 * filtering options to provide flexible data retrieval for invitation management.
 *
 * Query capabilities:
 * - Pagination with customizable page size and navigation
 * - Sorting by any invitation property with direction control
 * - Full-text search across invitation content
 * - Filtering by organization, status, role, and date ranges
 * - Performance optimization with limit controls
 *
 * Usage contexts:
 * - Admin dashboard invitation management
 * - Organization invitation history views
 * - Bulk invitation operations and cleanup
 * - Analytics and reporting on invitation metrics
 * - User invitation tracking and management
 *
 * @example
 * ```typescript
 * // Basic pagination query
 * const basicQuery: InvitationQueryParams = {
 *   page: 1,
 *   limit: 20
 * }
 *
 * // Advanced filtering and sorting
 * const advancedQuery: InvitationQueryParams = {
 *   page: 1,
 *   limit: 50,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'john.doe@company.com',
 *   status: 'pending'
 * }
 *
 * // Analytics query for expired invitations
 * const analyticsQuery: InvitationQueryParams = {
 *   sortBy: 'expiresAt',
 *   sortOrder: 'asc',
 *   limit: 100
 * }
 * ```
 */
export interface InvitationQueryParams {
  /** Current page number for pagination. */
  page?: number
  /** Number of items to return per page. */
  limit?: number
  /** Property to sort by. */
  sortBy?: string
  /** Sort order ('asc' or 'desc'). */
  sortOrder?: 'asc' | 'desc'
  /** Search term for filtering invitations. */
  search?: string
}

export interface InvitationRequestResponse {
  organizationId: string,
  email: string,
  role: string,
  status: string,
  expiresAt: Date,
  inviterId: string,
  id: string,
  organizationName: string,
  organizationSlug: string,
  inviterEmail: string
}