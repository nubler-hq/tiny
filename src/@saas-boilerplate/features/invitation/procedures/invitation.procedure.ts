import { igniter } from '@/igniter'
import type { Invitation, CreateInvitationDTO, InvitationRequestResponse } from '../invitation.interface'
import { InvitationError } from '../invitation.interface'
import { Url } from '@/@saas-boilerplate/utils/url'

/**
 * @typedef {object} InvitationContext
 * @property {object} invitation - The invitation feature context.
 * @property {object} invitation.create - Function to create a new invitation.
 * @property {object} invitation.cancel - Function to cancel an existing invitation.
 * @property {object} invitation.findOne - Function to find a single invitation by ID.
 * @property {object} invitation.accept - Function to accept an invitation.
 * @property {object} invitation.reject - Function to reject an invitation.
 */
export type InvitationContext = {
  invitation: {
    create: (input: CreateInvitationDTO) => Promise<Invitation>
    cancel: (invitationId: string) => Promise<void>
    findOne: (invitationId: string) => Promise<Invitation>
    accept: (invitationId: string) => Promise<void>
    reject: (invitationId: string) => Promise<void>
  }
}

/**
 * @procedure InvitationFeatureProcedure
 * @description Procedure for managing organization invitation operations and business logic.
 *
 * This procedure provides the comprehensive business logic layer for invitation management,
 * handling database operations, authentication validation, email notifications, and
 * organization membership workflows. It ensures proper data isolation, security validation,
 * and notification delivery for all invitation-related operations in the SaaS application.
 *
 * Key features:
 * - Complete invitation lifecycle management with status transitions
 * - Authentication and authorization validation for all operations
 * - Organization-scoped data access and membership validation
 * - Automated email notification delivery with organization branding
 * - Comprehensive error handling with custom error types
 * - Integration with membership and notification systems
 *
 * Security considerations:
 * - All operations require proper authentication validation
 * - Organization membership verification for access control
 * - Input validation and sanitization for all user data
 * - Database transaction integrity for state changes
 * - Email service integration with proper error handling
 *
 * @returns {InvitationContext} An object containing the invitation management functions with full type safety
 * @example
 * ```typescript
 * // Usage in controllers with authentication context
 * const invitation = await context.invitation.create({
 *   email: 'user@example.com',
 *   role: 'member'
 * })
 *
 * // Accept invitation with membership creation
 * await context.invitation.accept('inv_123456789')
 *
 * // Cancel invitation with proper authorization
 * await context.invitation.cancel('inv_123456789')
 * ```
 */
export const InvitationFeatureProcedure = igniter.procedure({
  name: 'InvitationFeatureProcedure',
  handler: async (_, { context, request }) => {
    const { auth } = context.services
    return {
      invitation: {
        /**
         * @method create
         * @description Creates a new invitation and sends an email notification to the invitee.
         *
         * This method handles the complete invitation creation workflow including validation,
         * database persistence, organization verification, and email notification delivery.
         * It ensures proper authentication validation, organization membership verification,
         * and email service integration for a seamless invitation experience.
         *
         * @param {CreateInvitationDTO} input - The invitation data containing email and role assignment
         * @param {string} input.email - Email address of the person being invited (must be valid format)
         * @param {OrganizationMembershipRole} input.role - Role to assign to the invitee ('admin' or 'member')
         * @returns {Promise<Invitation>} Complete invitation object with all metadata and organization details
         * @returns {Invitation} returns - Newly created invitation with status, expiration, and organization info
         * @throws {InvitationError} When organization is not found or invitation creation fails
         * @throws {Error} When email service fails or unexpected error occurs during notification
         * @example
         * ```typescript
         * // Create invitation with email notification
         * const invitation = await context.invitation.create({
         *   email: 'john.doe@company.com',
         *   role: 'member'
         * })
         *
         * console.log(invitation.id) // 'inv_123456789'
         * console.log(invitation.status) // 'pending'
         * console.log(invitation.expiresAt) // Date object (7 days from now)
         * // Email is automatically sent to john.doe@company.com
         * ```
         */
        create: async (input: CreateInvitationDTO): Promise<Invitation> => {
          try {
            // Business Logic: Create an invitation via the authentication API with proper authorization
            const createdInvite = await auth.api.createInvitation({
              headers: request.headers,
              body: {
                email: input.email,
                role: input.role,
              },
            })

            // Observation: Find the organization associated with the created invitation for email context
            const organization =
              await context.services.database.organization.findUnique({
                where: {
                  id: createdInvite.organizationId,
                },
              })

            // Business Rule: If the organization is not found, throw an error to prevent orphaned invitations
            if (!organization) {
              throw new InvitationError(
                {
                  code: 'ORGANIZATION_NOT_FOUND',
                  message: 'Organization not found',
                },
                404,
              )
            }

            // Business Logic: Send an organization invitation email with personalized content
            await context.services.mail.send({
              to: input.email,
              subject: 'You are invited to join an organization',
              template: 'organization-invite',
              data: {
                email: input.email,
                organization: organization.name,
                url: Url.get(`/app/invites/${createdInvite.id}`),
              },
            })

            // Response: Return the created invitation with all metadata
            // @ts-expect-error - expected
            return createdInvite
          } catch (error: any) {
            // Error Handling: Standardize error as InvitationError with proper error code and status mapping
            throw new InvitationError(
              {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to create invitation',
              },
              error.status || 500,
            )
          }
        },

        /**
         * @method cancel
         * @description Cancels a pending invitation and updates its status.
         *
         * This method handles the cancellation of pending invitations, ensuring proper
         * authorization validation and status transition. The invitation is marked as
         * 'canceled' and becomes invalid for future acceptance. This operation is
         * typically performed by organization members when an invitation was sent
         * in error or when circumstances change.
         *
         * @param {string} invitationId - The unique identifier of the invitation to cancel
         * @returns {Promise<void>} Success confirmation when invitation status is updated to canceled
         * @throws {InvitationError} When invitation is not found or cannot be canceled
         * @throws {Error} When database update fails or unexpected error occurs
         * @example
         * ```typescript
         * // Cancel an invitation that was sent by mistake
         * await context.invitation.cancel('inv_123456789')
         *
         * // After successful cancellation:
         * // - Invitation status changes to 'canceled'
         * // - Invitation is no longer valid for acceptance
         * // - Invitee can no longer use the invitation link
         * ```
         */
        cancel: async (invitationId: string): Promise<void> => {
          try {
            // Business Logic: Cancel the invitation via the authentication API with authorization validation
            await auth.api.cancelInvitation({
              headers: request.headers,
              body: {
                invitationId,
              },
            })
          } catch (error: any) {
            // Error Handling: Standardize error as InvitationError with proper error code and status mapping
            throw new InvitationError(
              {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to cancel invitation',
              },
              error.status || 500,
            )
          }
        },

        /**
         * @method findOne
         * @description Retrieves detailed information about a specific invitation by its ID.
         *
         * This method fetches complete invitation details including status, organization
         * information, role assignment, expiration details, and associated metadata.
         * It provides access to invitation data for both inviters and invitees with
         * appropriate authorization validation.
         *
         * @param {string} invitationId - The unique identifier of the invitation to retrieve
         * @returns {Promise<Invitation>} Complete invitation object with all associated metadata
         * @returns {Invitation} returns - Detailed invitation information including organization and status
         * @throws {InvitationError} When invitation is not found or access is denied
         * @throws {Error} When database query fails or unexpected error occurs
         * @example
         * ```typescript
         * // Get specific invitation details
         * const invitation = await context.invitation.findOne('inv_123456789')
         *
         * console.log(invitation.email) // 'john.doe@company.com'
         * console.log(invitation.status) // 'pending'
         * console.log(invitation.role) // 'member'
         * console.log(invitation.organization.name) // 'Acme Corp'
         * console.log(invitation.expiresAt) // Date object
         * ```
         */
        findOne: async (invitationId: string) => {
          try {
            // Business Logic: Attempt to retrieve the invitation via the authentication API with access control
            const invite = await auth.api.getInvitation({
              headers: request.headers,
              query: {
                id: invitationId,
              },
            })

            return invite as InvitationRequestResponse
          } catch (error: any) {
            // Error Handling: Handle specific 404 errors for not found invitations
            if (error.status === 404) {
              throw new InvitationError(
                {
                  code: 'INVITATION_NOT_FOUND',
                  message: 'Invitation not found',
                },
                404,
              )
            }
            // Error Handling: Standardize other errors as InvitationError with proper error code and status mapping
            throw new InvitationError(
              {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to find invitation',
              },
              error.status || 500,
            )
          }
        },

        /**
         * @method accept
         * @description Accepts an invitation and creates organization membership.
         *
         * This method handles the complete invitation acceptance workflow including
         * invitation validation, membership creation, role assignment, and notification
         * delivery to existing organization members. It ensures proper authorization
         * and creates the necessary database relationships for the new member.
         *
         * @param {string} invitationId - The unique identifier of the invitation to accept
         * @returns {Promise<void>} Success confirmation when invitation is accepted and membership created
         * @throws {InvitationError} When invitation is not found, expired, or already processed
         * @throws {Error} When membership creation fails or notification service error occurs
         * @example
         * ```typescript
         * // Accept invitation and join organization
         * await context.invitation.accept('inv_123456789')
         *
         * // After successful acceptance:
         * // - User becomes a member of the organization
         * // - Role is assigned based on invitation ('admin' or 'member')
         * // - Organization members receive 'MEMBER_JOINED' notification
         * // - User gains access to organization resources based on role
         * ```
         */
        accept: async (invitationId: string): Promise<void> => {
          try {
            // Business Logic: Accept the invitation via the authentication API with membership creation
            const acceptedInvitation = await auth.api.acceptInvitation({
              headers: request.headers,
              body: {
                invitationId,
              },
            })

            // Business Logic: Send notification to organization members about new member joining
            if (acceptedInvitation?.invitation.organizationId) {
              await context.services.notification.send({
                type: 'MEMBER_JOINED',
                context: {
                  organizationId: acceptedInvitation.invitation.organizationId,
                },
                data: {
                  memberName: acceptedInvitation.invitation.email,
                  memberEmail: acceptedInvitation.invitation.email,
                  role: acceptedInvitation.invitation.role,
                },
              })
            }
          } catch (error: any) {
            // Error Handling: Standardize error as InvitationError with proper error code and status mapping
            throw new InvitationError(
              {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to accept invitation',
              },
              error.status || 500,
            )
          }
        },

        /**
         * @method reject
         * @description Rejects an invitation and updates its status to rejected.
         *
         * This method handles the rejection of pending invitations, ensuring proper
         * authorization validation and status transition. The invitation is marked as
         * 'rejected' and becomes permanently invalid for acceptance. This operation
         * is irreversible and the invitation cannot be accepted after rejection.
         *
         * @param {string} invitationId - The unique identifier of the invitation to reject
         * @returns {Promise<void>} Success confirmation when invitation status is updated to rejected
         * @throws {InvitationError} When invitation is not found or cannot be rejected
         * @throws {Error} When database update fails or unexpected error occurs
         * @example
         * ```typescript
         * // Reject an unwanted invitation
         * await context.invitation.reject('inv_123456789')
         *
         * // After successful rejection:
         * // - Invitation status changes to 'rejected'
         * // - Invitation is permanently invalid for acceptance
         * // - Inviter may be notified of the rejection (implementation dependent)
         * // - User cannot join the organization through this invitation
         * ```
         */
        reject: async (invitationId: string): Promise<void> => {
          try {
            // Business Logic: Reject the invitation via the authentication API with status update
            await auth.api.rejectInvitation({
              headers: request.headers,
              body: {
                invitationId,
              },
            })
          } catch (error: any) {
            // Error Handling: Standardize error as InvitationError with proper error code and status mapping
            throw new InvitationError(
              {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to reject invitation',
              },
              error.status || 500,
            )
          }
        },
      },
    }
  },
})
