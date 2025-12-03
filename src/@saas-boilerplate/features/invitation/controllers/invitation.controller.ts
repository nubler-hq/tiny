import { igniter } from '@/igniter'
import { InvitationFeatureProcedure } from '../procedures/invitation.procedure'
import { AuthFeatureProcedure } from '../../auth/procedures/auth.procedure'
import { InvitationError, InviteMemberSchema } from '../invitation.interface'
import { NotificationProcedure } from '../../notification/procedures/notification.procedure'

/**
 * @controller InvitationController
 * @description Controller for managing organization invitations with comprehensive lifecycle management.
 *
 * This controller provides comprehensive organization invitation management including
 * creation, retrieval, acceptance, rejection, and cancellation operations. It ensures
 * proper authentication validation, organization isolation, and notification handling
 * for all invitation-related workflows in the SaaS application.
 *
 * Key features:
 * - Complete invitation lifecycle management
 * - Authentication and authorization validation
 * - Organization-scoped access control
 * - Email notification integration
 * - Comprehensive error handling with custom error types
 * - Role-based invitation assignment
 *
 * Security considerations:
 * - All actions require proper authentication validation
 * - Organization membership verification for access control
 * - Input validation using Zod schemas
 * - Custom error types for standardized error handling
 *
 * @example
 * ```typescript
 * // Get invitation details
 * const invitation = await api.invitation.findOne.query({ params: { id: 'inv_123' } })
 *
 * // Create new invitation
 * const newInvite = await api.invitation.create.mutate({
 *   body: {
 *     email: 'user@example.com',
 *     role: 'member'
 *   }
 * })
 *
 * // Accept invitation
 * await api.invitation.accept.mutate({
 *   params: { id: 'inv_123' }
 * })
 * ```
 */
export const InvitationController = igniter.controller({
  name: 'Invitation',
  description:
    'Organization invitation management including sending, accepting, and canceling invites',
  path: '/invitation',
  actions: {
    /**
     * @action findOne
     * @description Retrieves detailed information about a specific invitation by its ID.
     *
     * This endpoint allows authenticated users to fetch complete invitation details including
     * status, organization information, role assignment, and expiration details. The invitation
     * must exist and be accessible to the requesting user based on organization membership.
     *
     * @param {string} id - The unique identifier of the invitation to retrieve
     * @returns {Promise<Invitation>} Detailed invitation object with all associated metadata
     * @returns {Invitation} returns - Complete invitation information including status, organization, and timestamps
     * @throws {404} When invitation with specified ID is not found
     * @throws {400} When request parameters are invalid or malformed
     * @throws {500} When an unexpected server error occurs during retrieval
     * @example
     * ```typescript
     * // Get specific invitation details
     * const invitation = await api.invitation.findOne.query({
     *   params: { id: 'inv_123456789' }
     * })
     *
     * console.log(invitation.status) // 'pending'
     * console.log(invitation.role) // 'member'
     * console.log(invitation.expiresAt) // Date object
     * ```
     */
    findOne: igniter.query({
      name: 'getInvitation',
      description: 'Get invitation by id',
      method: 'GET',
      path: '/:id' as const,
      use: [InvitationFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        try {
          // Observation: Extract invitation ID from path parameters for retrieval operation
          const invitationId = request.params.id

          // Business Logic: Attempt to find the invitation using the procedure with authorization validation
          const result = await context.invitation.findOne(invitationId)

          // Response: Return the invitation data with success status
          return response.success(result)
        } catch (error: any) {
          // Error Handling: If an InvitationError occurred, return an appropriate error response with custom status
          if (error instanceof InvitationError) {
            return response.badRequest(error.message, error.data)
          }
          // Error Handling: For any other unexpected error, return a generic bad request with error message
          return response.badRequest(
            error.message || 'Failed to find invitation',
          )
        }
      },
    }),

    /**
     * @action create
     * @description Creates a new invitation for a user to join the organization.
     *
     * This endpoint allows organization members with appropriate permissions to invite new users
     * to join their organization. The invitation includes role assignment, expiration handling,
     * and automatic email notification to the invitee with organization details and join link.
     *
     * @param {string} email - The email address of the person being invited (required)
     * @param {OrganizationMembershipRole} role - The role to assign to the invitee ('admin' or 'member')
     * @returns {Promise<Invitation>} The newly created invitation with all details and metadata
     * @returns {Invitation} returns - Complete invitation object including organization info and expiration
     * @throws {400} When email is invalid or role is not allowed
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks permission to invite members
     * @throws {404} When organization is not found
     * @throws {409} When invitation already exists for this email
     * @throws {500} When email service fails or unexpected error occurs
     * @example
     * ```typescript
     * // Create invitation for new team member
     * const invitation = await api.invitation.create.mutate({
     *   body: {
     *     email: 'john.doe@company.com',
     *     role: 'member'
     *   }
     * })
     *
     * console.log(invitation.id) // 'inv_123456789'
     * console.log(invitation.status) // 'pending'
     * console.log(invitation.expiresAt) // Date object (7 days from now)
     *
     * // Email is automatically sent to john.doe@company.com with join link
     * ```
     */
    create: igniter.mutation({
      name: 'createInvitation',
      description: 'Create invitation',
      method: 'POST',
      path: '/',
      use: [
        AuthFeatureProcedure(),
        InvitationFeatureProcedure(),
        NotificationProcedure(),
      ],
      body: InviteMemberSchema,
      handler: async ({ request, response, context }) => {
        try {
          // Business Logic: Create a new invitation using the procedure with email notification
          const result = await context.invitation.create(request.body)

          // Response: Return the newly created invitation with success status
          return response.success(result)
        } catch (error: any) {
          // Error Handling: If an InvitationError occurred, return an appropriate error response with custom status
          if (error instanceof InvitationError) {
            return response.status(error.status).json(error.data)
          }
          // Error Handling: For any other unexpected error, return a generic bad request with error message
          return response.badRequest(
            error.message || 'Failed to create invitation',
          )
        }
      },
    }),

    /**
     * @action accept
     * @description Accepts an invitation to join an organization.
     *
     * This endpoint allows users to accept pending invitations to join organizations.
     * Upon successful acceptance, the user becomes a member of the organization with
     * the assigned role, and notification is sent to existing organization members
     * about the new member joining.
     *
     * @param {string} id - The unique identifier of the invitation to accept
     * @returns {Promise<void>} Success confirmation when invitation is accepted and membership created
     * @throws {401} When user is not authenticated
     * @throws {404} When invitation with specified ID is not found
     * @throws {409} When invitation has already been accepted or expired
     * @throws {400} When invitation is in invalid state for acceptance
     * @throws {500} When membership creation fails or notification service error occurs
     * @example
     * ```typescript
     * // Accept an invitation received via email
     * await api.invitation.accept.mutate({
     *   params: { id: 'inv_123456789' }
     * })
     *
     * // After successful acceptance:
     * // - User becomes a member of the organization
     * // - Organization members receive notification
     * // - User can access organization resources based on assigned role
     * ```
     */
    accept: igniter.mutation({
      name: 'acceptInvitation',
      description: 'Accept invitation by id',
      method: 'POST',
      path: '/:id/accept' as const,
      use: [
        AuthFeatureProcedure(),
        InvitationFeatureProcedure(),
        NotificationProcedure(),
      ],
      handler: async ({ request, response, context }) => {
        try {
          // Business Logic: Accept the invitation using the procedure with membership creation and notifications
          await context.invitation.accept(request.params.id)

          // Response: Return a success response indicating invitation acceptance completed
          return response.success()
        } catch (error: any) {
          // Error Handling: If an InvitationError occurred, return an appropriate error response with custom status
          if (error instanceof InvitationError) {
            return response.status(error.status).json(error.data)
          }
          // Error Handling: For any other unexpected error, return a generic bad request with error message
          return response.badRequest(
            error.message || 'Failed to accept invitation',
          )
        }
      },
    }),

    /**
     * @action reject
     * @description Rejects an invitation to join an organization.
     *
     * This endpoint allows users to decline pending invitations to join organizations.
     * The invitation status is updated to 'rejected' and the invitation is marked as
     * no longer valid. This action is irreversible and the invitation cannot be
     * accepted after rejection.
     *
     * @param {string} id - The unique identifier of the invitation to reject
     * @returns {Promise<void>} Success confirmation when invitation is rejected and status updated
     * @throws {404} When invitation with specified ID is not found
     * @throws {409} When invitation has already been accepted, rejected, or expired
     * @throws {400} When invitation is in invalid state for rejection
     * @throws {500} When database update fails or unexpected error occurs
     * @example
     * ```typescript
     * // Reject an unwanted invitation
     * await api.invitation.reject.mutate({
     *   params: { id: 'inv_123456789' }
     * })
     *
     * // After successful rejection:
     * // - Invitation status changes to 'rejected'
     * // - Invitation is no longer valid for acceptance
     * // - Inviter may be notified of the rejection (implementation dependent)
     * ```
     */
    reject: igniter.mutation({
      name: 'rejectInvitation',
      description: 'Reject invitation by id',
      method: 'POST',
      path: '/:id/reject' as const,
      use: [InvitationFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        try {
          // Business Logic: Reject the invitation using the procedure with status update
          await context.invitation.reject(request.params.id)

          // Response: Return a success response indicating invitation rejection completed
          return response.success()
        } catch (error: any) {
          // Error Handling: If an InvitationError occurred, return an appropriate error response with custom status
          if (error instanceof InvitationError) {
            return response.status(error.status).json(error.data)
          }
          // Error Handling: For any other unexpected error, return a generic bad request with error message
          return response.badRequest(
            error.message || 'Failed to reject invitation',
          )
        }
      },
    }),

    /**
     * @action cancel
     * @description Cancels a pending invitation to join an organization.
     *
     * This endpoint allows organization members with appropriate permissions to cancel
     * pending invitations before they are accepted or rejected. The invitation status
     * is updated to 'canceled' and the invitation becomes invalid. This action is
     * typically used when an invitation was sent in error or when the inviter changes
     * their mind about extending the invitation.
     *
     * @param {string} id - The unique identifier of the invitation to cancel
     * @returns {Promise<{ message: string }>} Success confirmation with cancellation message
     * @returns {{ message: string }} returns - Confirmation message indicating successful cancellation
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks permission to cancel invitations
     * @throws {404} When invitation with specified ID is not found
     * @throws {409} When invitation has already been accepted, rejected, or expired
     * @throws {400} When invitation is in invalid state for cancellation
     * @throws {500} When database update fails or unexpected error occurs
     * @example
     * ```typescript
     * // Cancel an invitation that was sent by mistake
     * const result = await api.invitation.cancel.mutate({
     *   params: { id: 'inv_123456789' }
     * })
     *
     * console.log(result.data.message) // 'Invitation canceled'
     *
     * // After successful cancellation:
     * // - Invitation status changes to 'canceled'
     * // - Invitation is no longer valid for acceptance
     * // - Invitee can no longer use the invitation link
     * ```
     */
    cancel: igniter.mutation({
      name: 'cancelInvitation',
      description: 'Cancel invitation by id',
      method: 'DELETE',
      path: '/:id/cancel' as const,
      use: [InvitationFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        try {
          // Business Logic: Cancel the invitation using the procedure with authorization validation
          await context.invitation.cancel(request.params.id)

          // Response: Return a success message indicating invitation cancellation completed
          return response.success({ message: 'Invitation canceled' })
        } catch (error: any) {
          // Error Handling: If an InvitationError occurred, return an appropriate error response with custom status
          if (error instanceof InvitationError) {
            return response.status(error.status).json(error.data)
          }
          // Error Handling: For any other unexpected error, return a generic bad request with error message
          return response.badRequest(
            error.message || 'Failed to cancel invitation',
          )
        }
      },
    }),
  },
})
