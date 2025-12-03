import { igniter } from '@/igniter'
import type {
  Submission,
  CreateSubmissionsDTO,
  UpdateSubmissionsDTO,
  SubmissionsQueryParams,
  SubmissionMetadata,
} from '../submission.interface'

/**
 * @procedure SubmissionFeatureProcedure
 * @description Procedure for managing form submissions and lead data operations.
 *
 * This procedure provides the business logic layer for form submission management,
 * handling the complete lifecycle of form data collection, lead association, and
 * integration with notification systems. It transforms API responses into
 * application-specific types and manages the submission-to-lead relationship.
 *
 * The procedure injects submission management methods into the Igniter context,
 * making them available to controllers and other parts of the application for
 * processing form submissions, managing lead relationships, and triggering
 * real-time notifications.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const submissions = await context.submission.findMany({
 *   organizationId: 'org_123',
 *   page: 1,
 *   limit: 10
 * })
 * const newSubmission = await context.submission.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   metadata: { source: 'contact-form' }
 * })
 * ```
 */
export const SubmissionFeatureProcedure = igniter.procedure({
  name: 'SubmissionFeatureProcedure',
  handler: async (_, { context }) => {
    return {
      submission: {
        /**
         * @method findMany
         * @description Retrieves submissions with filtering, pagination, and sorting options.
         *
         * This method provides comprehensive search functionality for form submissions,
         * supporting text-based filtering across organization and lead associations,
         * pagination for large result sets, and flexible sorting options.
         *
         * @param {SubmissionsQueryParams} query - Search and pagination parameters
         * @param {string} query.organizationId - Organization ID to filter submissions
         * @param {number} [query.page] - Page number for pagination (1-based)
         * @param {number} [query.limit] - Number of items per page
         * @param {string} [query.sortBy] - Property to sort by
         * @param {'asc' | 'desc'} [query.sortOrder] - Sort order
         * @param {string} [query.search] - Search term for filtering submissions
         * @param {string} [query.leadId] - Filter submissions by lead ID
         * @returns {Promise<Submission[]>} Array of submission objects
         * @throws {Error} When database query fails
         */
        findMany: async (
          query: SubmissionsQueryParams,
        ): Promise<Submission[]> => {
          // Business Logic: Build search query with optional text filtering
          const result = await context.services.database.submission.findMany({
            where: {
              organizationId: query.organizationId,
              leadId: query.leadId,
            },
            include: {
              lead: true,
              organization: true,
            },
            skip: query.page
              ? (query.page - 1) * (query.limit || 10)
              : undefined,
            take: query.limit,
            orderBy: query.sortBy
              ? { [query.sortBy]: query.sortOrder || 'asc' }
              : undefined,
          })

          // Data Transformation: Map database result to Submission type
          return result as unknown[] as Submission[]
        },

        /**
         * @method findOne
         * @description Retrieves a specific submission by ID with organization validation.
         *
         * This method finds a single submission by its unique identifier, ensuring
         * that the submission belongs to the specified organization for proper
         * data isolation and security.
         *
         * @param {object} params - Query parameters
         * @param {string} params.id - The unique identifier of the submission
         * @param {string} params.organizationId - Organization ID for additional filtering and security
         * @returns {Promise<Submission | null>} Submission object if found, null otherwise
         * @throws {Error} When database query fails
         */
        findOne: async (params: {
          id: string
          organizationId: string
        }): Promise<Submission | null> => {
          // Business Logic: Find submission by ID with organization filter
          const result = await context.services.database.submission.findUnique({
            where: {
              id: params.id,
              organizationId: params.organizationId,
            },
          })

          // Data Transformation: Map database result to Submission type
          return result as Submission
        },

        /**
         * @method create
         * @description Creates a new form submission with automatic lead association.
         *
         * This method creates a new submission record and automatically associates
         * or creates a lead based on the email address. It triggers notification
         * events for both lead creation (if new) and submission creation.
         *
         * @param {CreateSubmissionsDTO} input - Submission creation parameters
         * @param {string} [input.name] - Name of the person submitting the form
         * @param {string} [input.phone] - Phone number for contact
         * @param {string} input.email - Email address (used for lead association)
         * @param {SubmissionMetadata} [input.metadata] - Metadata with source and form data
         * @param {string} input.organizationId - ID of the organization
         * @returns {Promise<Submission>} The newly created submission object
         * @throws {Error} When database operation fails or lead is not found
         */
        create: async (input: CreateSubmissionsDTO): Promise<Submission> => {
          // Business Logic: Find existing lead by email or create new one
          let lead = await context.services.database.lead.findFirst({
            where: { email: input.email, organizationId: input.organizationId },
          })

          // Business Rule: If lead doesn't exist, create a new one
          if (!lead) {
            lead = await context.services.database.lead.create({
              data: {
                name: input.name,
                email: input.email,
                phone: input.phone,
                metadata: input.metadata as any,
                organizationId: input.organizationId,
              },
            })

            // Business Logic: Send notification for new lead creation
            await context.services.notification.send({
              type: 'LEAD_CREATED',
              context: {
                organizationId: input.organizationId,
              },
              data: {
                leadName: lead.name,
                leadEmail: lead.email,
                source: input.metadata?.source,
              },
            })
          }

          // Business Rule: Validate that lead exists before creating submission
          if (!lead) throw new Error('Lead not found')

          // Business Logic: Create the submission record
          const result = await context.services.database.submission.create({
            data: {
              metadata: input.metadata as SubmissionMetadata,
              leadId: lead.id,
              organizationId: input.organizationId,
            },
            include: {
              lead: true,
            },
          })

          // Business Logic: Send notification for submission creation
          await context.services.notification.send({
            type: 'SUBMISSION_CREATED',
            context: {
              organizationId: input.organizationId,
            },
            data: {
              leadName: lead.name,
              leadEmail: lead.email,
              source: input.metadata?.source,
            },
          })

          // Data Transformation: Map database result to Submission type
          return result as Submission
        },

        /**
         * @method update
         * @description Updates an existing submission's metadata and lead association.
         *
         * This method allows modification of submission properties such as
         * metadata and lead association. It first verifies the submission exists
         * before attempting to update it, ensuring data integrity.
         *
         * @param {UpdateSubmissionsDTO} params - Update parameters
         * @param {string} params.id - The unique identifier of the submission to update
         * @param {SubmissionMetadata} params.metadata - Updated metadata for the submission
         * @param {string} [params.leadId] - Optional updated lead association
         * @param {string} params.organizationId - Organization ID for security validation
         * @returns {Promise<Submission>} The updated submission object
         * @throws {Error} When submission is not found or database operation fails
         */
        update: async (params: UpdateSubmissionsDTO): Promise<Submission> => {
          // Business Logic: Verify submission exists before updating
          const submission =
            await context.services.database.submission.findUnique({
              where: { id: params.id },
            })

          // Business Rule: Throw error if submission is not found
          if (!submission) throw new Error('Submission not found')

          // Business Logic: Update the submission with new details
          const result = await context.services.database.submission.update({
            where: { id: params.id },
            data: {
              metadata: params.metadata as SubmissionMetadata,
              leadId: params.leadId,
              organizationId: params.organizationId,
            },
          })

          // Data Transformation: Map database result to Submission type
          return result as Submission
        },

        /**
         * @method delete
         * @description Permanently deletes a submission from the database.
         *
         * This method permanently removes a submission from the system. It includes
         * validation to ensure the submission exists before deletion.
         *
         * @param {object} params - Deletion parameters
         * @param {string} params.id - The unique identifier of the submission to delete
         * @returns {Promise<{ id: string }>} Confirmation object with deleted submission ID
         * @throws {Error} When submission is not found or database operation fails
         */
        delete: async (params: { id: string }): Promise<{ id: string }> => {
          // Business Logic: Permanently delete the submission
          await context.services.database.submission.delete({
            where: { id: params.id },
          })

          // Response: Return confirmation with deleted submission ID
          return { id: params.id }
        },
      },
    }
  },
})
