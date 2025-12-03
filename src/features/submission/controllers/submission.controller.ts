import { z } from 'zod'
import { igniter } from '@/igniter'
import { SubmissionFeatureProcedure } from '../procedures/submission.procedure'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { IntegrationFeatureProcedure } from '@/@saas-boilerplate/features/integration/procedures/integration.procedure'
import { NotificationProcedure } from '@/@saas-boilerplate/features/notification/procedures/notification.procedure'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'

/**
 * @controller SubmissionController
 * @description Central controller for managing form submissions and lead data processing.
 *
 * This controller provides comprehensive submission management capabilities including:
 * - Form submission creation, retrieval, updating, and deletion
 * - Organization-scoped submission operations with proper access control
 * - Integration with third-party services for submission processing
 * - Real-time notifications for submission events
 * - Lead association and metadata management
 *
 * All operations are scoped to the authenticated user's organization, ensuring
 * proper data isolation and security. The controller integrates with the
 * notification system to provide real-time updates and with the integration
 * system for third-party service connectivity.
 *
 * @example
 * ```typescript
 * // Create a new submission
 * const submission = await api.submission.create.mutate({
 *   name: 'John Doe',
 *   email: 'customer@example.com',
 *   phone: '+1234567890',
 *   metadata: { source: 'contact-form', data: {...} }
 * })
 *
 * // List all submissions for the organization
 * const submissions = await api.submission.findMany.query()
 * ```
 */
export const SubmissionController = igniter.controller({
  name: 'Submission',
  description: 'Manage form submissions and lead data',
  path: '/submissions',
  actions: {
    /**
     * @action findMany
     * @description Retrieves all submissions for the authenticated user's organization with optional filtering.
     *
     * This endpoint returns a paginated list of submissions associated with the current
     * organization. The results can be filtered by lead ID, search terms, and sorted
     * by various fields.
     *
     * @param {object} [query] - Optional query parameters for filtering and pagination
     * @param {number} [query.page] - Page number for pagination
     * @param {number} [query.limit] - Number of submissions per page
     * @param {string} [query.sortBy] - Field to sort by
     * @param {'asc'|'desc'} [query.sortOrder] - Sort order (ascending or descending)
     * @param {string} [query.search] - Search term for filtering submissions
     * @param {string} [query.leadId] - Filter submissions by lead ID
     * @returns {Submission[]} Array of submission objects
     * @throws {401} When user is not authenticated or lacks organization access
     * @example
     * ```typescript
     * // Get all submissions
     * const submissions = await api.submission.findMany.query()
     *
     * // Get submissions with filters
     * const submissions = await api.submission.findMany.query({
     *   page: 1,
     *   limit: 10,
     *   leadId: 'lead_123',
     *   search: 'john@example.com'
     * })
     * ```
     */
    findMany: igniter.query({
      name: 'listSubmissions',
      description: 'List submissions with filters',
      method: 'GET',
      path: '/',
      use: [SubmissionFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, request, context }) => {
        // Authentication: Retrieve the authenticated user's session and organization ID
        const auth = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Logic: Retrieve submissions with organization-scoped filtering
        const result = await context.submission.findMany({
          organizationId: auth.organization.id,
        })

        // Response: Return the list of submissions with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action findOne
     * @description Retrieves a single submission by ID for the authenticated user's organization.
     *
     * This endpoint fetches a specific submission by its ID, ensuring that the submission
     * belongs to the current organization for proper data isolation and security.
     *
     * @param {string} id - The unique identifier of the submission to retrieve
     * @returns {Submission} The submission object if found
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {404} When submission is not found or doesn't belong to the organization
     * @example
     * ```typescript
     * const submission = await api.submission.findOne.query({ id: 'submission_123' })
     * ```
     */
    findOne: igniter.query({
      name: 'getSubmission',
      description: 'Get submission by ID',
      method: 'GET',
      path: '/:id' as const,
      use: [SubmissionFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session and organization ID
        const auth = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Logic: Retrieve the submission with organization-scoped filtering
        const result = await context.submission.findOne({
          ...request.params,
          organizationId: auth.organization.id,
        })

        // Response: Return the submission with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action create
     * @description Creates a new form submission for the authenticated user's organization.
     *
     * This endpoint creates a new submission with the provided information and automatically
     * triggers integration events for any installed plugins. The submission is associated
     * with the current organization and includes real-time notification updates.
     *
     * @param {object} body - Submission creation data
     * @param {string} body.name - Submitter's name (required)
     * @param {string} body.email - Submitter's email address (required)
     * @param {string} body.phone - Submitter's phone number (required)
     * @param {object} body.metadata - Submission metadata
     * @param {string} body.metadata.source - Source of the submission (e.g., 'contact-form')
     * @param {Record<string, any>} body.metadata.data - Additional form data
     * @returns {Submission} The newly created submission object
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {400} When submission data validation fails
     * @example
     * ```typescript
     * const submission = await api.submission.create.mutate({
     *   name: 'John Doe',
     *   email: 'customer@example.com',
     *   phone: '+1234567890',
     *   metadata: {
     *     source: 'contact-form',
     *     data: { message: 'Hello, I need help with...' }
     *   }
     * })
     * ```
     */
    create: igniter.mutation({
      name: 'createSubmission',
      description: 'Create new submission',
      method: 'POST',
      path: '/',
      use: [
        SubmissionFeatureProcedure(),
        AuthFeatureProcedure(),
        IntegrationFeatureProcedure(),
        NotificationProcedure(),
      ],
      body: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(), // added phone field to the body
        metadata: z.object({
          source: z.string(),
          data: z.record(z.string(), z.any()),
        }),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session and organization ID
        const auth = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Logic: Create a new submission using the SubmissionRepository
        const result = await context.submission.create({
          name: request.body.name,
          email: request.body.email,
          phone: request.body.phone,
          organizationId: auth.organization.id,
          metadata: request.body.metadata,
        })

        // Business Logic: After creating the submission, trigger events for installed plugins
        const plugins = await context.integration.setupPluginsForOrganization(
          auth.organization.id,
        )

        for (const pluginKey in plugins) {
          const plugin = plugins[pluginKey as keyof typeof plugins]

          if (plugin && 'sendEvent' in plugin) {
            const pluginResult = await tryCatch(
              plugin.sendEvent({
                event: 'submission.created',
                data: result,
              }),
            )

            if (pluginResult.error) {
              igniter.logger.error(
                `Plugin ${pluginKey} failed to send submission.created event: ${pluginResult.error.message}`,
              )
            }
          }
        }

        // Response: Return the newly created submission and trigger real-time updates
        return response.revalidate(['notification.list']).success(result)
      },
    }),

    /**
     * @action update
     * @description Updates an existing submission by ID for the authenticated user's organization.
     *
     * This endpoint allows updating submission metadata and lead associations, ensuring that
     * only submissions belonging to the current organization can be modified.
     *
     * @param {string} id - The unique identifier of the submission to update
     * @param {object} body - Submission update data
     * @param {any} [body.metadata] - Updated metadata for the submission
     * @param {string} [body.leadId] - Lead ID to associate with the submission
     * @returns {Submission} The updated submission object
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {404} When submission is not found or doesn't belong to the organization
     * @example
     * ```typescript
     * const updatedSubmission = await api.submission.update.mutate({
     *   id: 'submission_123',
     *   body: {
     *     metadata: { status: 'processed', notes: 'Follow up required' },
     *     leadId: 'lead_456'
     *   }
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'updateSubmission',
      description: 'Update submission data',
      method: 'PUT',
      path: '/:id' as const,
      use: [SubmissionFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        metadata: z.any().optional().nullable(),
        leadId: z.string().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Retrieve the authenticated user's session and organization ID
        const auth = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Logic: Update the submission using the SubmissionRepository
        const result = await context.submission.update({
          id: request.params.id,
          metadata: request.body.metadata,
          organizationId: auth.organization.id,
        })

        // Response: Return the updated submission with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Deletes a submission by ID.
     *
     * This endpoint permanently removes a submission from the system. Note that this
     * action does not require authentication procedures, making it suitable for
     * public form submissions or automated cleanup processes.
     *
     * @param {string} id - The unique identifier of the submission to delete
     * @returns {null} No content on successful deletion
     * @example
     * ```typescript
     * await api.submission.delete.mutate({ id: 'submission_123' })
     * // Returns: null
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteSubmission',
      description: 'Delete submission by ID',
      method: 'DELETE',
      path: '/:id' as const,
      use: [SubmissionFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Business Logic: Delete the submission using the SubmissionRepository
        await context.submission.delete(request.params)

        // Response: Return success with null content
        return response.success(null)
      },
    }),
  },
})
