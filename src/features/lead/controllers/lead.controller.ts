import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import {
  LeadCreationSchema,
  LeadUpdateSchema,
  LeadQuerySchema,
} from '../lead.interface'
import { LeadProcedure } from '../procedures/lead.procedure'
import { IntegrationFeatureProcedure } from '@/@saas-boilerplate/features/integration/procedures/integration.procedure'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'

/**
 * @controller LeadController
 * @description Central controller for managing customer leads and lead-related operations.
 *
 * This controller provides comprehensive lead management capabilities including:
 * - Lead creation, retrieval, updating, and deletion
 * - Organization-scoped lead operations with proper access control
 * - Integration with third-party services for lead processing
 * - Real-time notifications for lead events
 * - Lead metadata management and tracking
 *
 * All operations are scoped to the authenticated user's organization, ensuring
 * proper data isolation and security. The controller integrates with the
 * notification system to provide real-time updates and with the integration
 * system for third-party service connectivity.
 *
 * @example
 * ```typescript
 * // Create a new lead
 * const lead = await api.lead.create.mutate({
 *   email: 'customer@example.com',
 *   name: 'John Doe',
 *   phone: '+1234567890'
 * })
 *
 * // List all leads for the organization
 * const leads = await api.lead.list.query()
 * ```
 */
export const LeadController = igniter.controller({
  name: 'Lead',
  path: '/leads',
  description: 'Manage customer leads.',
  actions: {
    /**
     * @action list
     * @description Retrieves all leads for the authenticated user's organization.
     *
     * This endpoint returns a paginated list of leads associated with the current
     * organization. The results are automatically filtered by organization ID to
     * ensure proper data isolation and security.
     *
     * @param {LeadQueryParams} [query] - Optional query parameters for filtering and pagination
     * @param {number} [query.page] - Page number for pagination
     * @param {number} [query.limit] - Number of leads per page
     * @param {string} [query.sortBy] - Field to sort by
     * @param {'asc'|'desc'} [query.sortOrder] - Sort order (ascending or descending)
     * @param {string} [query.search] - Search term for filtering leads
     * @returns {Lead[]} Array of lead objects
     * @throws {401} When user is not authenticated or lacks organization access
     * @example
     * ```typescript
     * // Get all leads
     * const leads = await api.lead.list.query()
     *
     * // Get leads with pagination
     * const leads = await api.lead.list.query({
     *   page: 1,
     *   limit: 10,
     *   sortBy: 'createdAt',
     *   sortOrder: 'desc'
     * })
     * ```
     */
    list: igniter.query({
      name: 'List',
      description: 'List all leads for an organization.',
      path: '/',
      use: [AuthFeatureProcedure(), LeadProcedure()],
      handler: async ({ context, response }) => {
        // Authentication: Retrieve the authenticated user's ID and organization ID from the session.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: If no active session or organization, return unauthorized.
        if (!session || !session.organization) {
          return response.unauthorized(
            'Authentication required and active organization needed.',
          )
        }

        // Observation: Extract organization ID from authenticated session.
        const organizationId = session.organization.id

        // Business Logic: Retrieve leads using the LeadRepository.
        const leads = await context.lead.findMany(organizationId)

        // Response: Return the list of leads with a 200 status.
        return response.success(leads)
      },
    }),

    /**
     * @action create
     * @description Creates a new lead for the authenticated user's organization.
     *
     * This endpoint creates a new lead with the provided information and automatically
     * triggers integration events for any installed plugins. The lead is associated
     * with the current organization and includes real-time notification updates.
     *
     * @param {CreateLeadBody} body - Lead creation data
     * @param {string} body.email - Lead's email address (required)
     * @param {string} [body.name] - Lead's name (optional)
     * @param {string} [body.phone] - Lead's phone number (optional)
     * @param {any} [body.metadata] - Additional metadata for the lead (optional)
     * @returns {Lead} The newly created lead object
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {400} When lead data validation fails
     * @example
     * ```typescript
     * const lead = await api.lead.create.mutate({
     *   email: 'customer@example.com',
     *   name: 'John Doe',
     *   phone: '+1234567890',
     *   metadata: { source: 'website', campaign: 'summer2024' }
     * })
     * ```
     */
    create: igniter.mutation({
      name: 'Create',
      description: 'Create a new lead.',
      path: '/',
      method: 'POST',
      use: [
        AuthFeatureProcedure(),
        LeadProcedure(),
        IntegrationFeatureProcedure(),
      ],
      body: LeadCreationSchema,
      handler: async ({ context, request, response }) => {
        // Authentication: Retrieve the authenticated user's ID and organization ID from the session.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: If no active session or organization, return unauthorized.
        if (!session || !session.organization) {
          return response.unauthorized(
            'Authentication required and active organization needed.',
          )
        }

        // Observation: Extract organization ID from authenticated session.
        const organizationId = session.organization.id

        // Observation: Extract lead details from the request body.
        const { email, name, phone, metadata } = request.body

        // Business Logic: Create a new lead using the LeadRepository.
        const lead = await context.lead.create(organizationId, {
          email,
          name,
          phone,
          metadata,
        })

        // Business Logic: After creating the lead, trigger events for installed plugins.
        const plugins =
          await context.integration.setupPluginsForOrganization(organizationId)

        for (const pluginKey in plugins) {
          const plugin = plugins[pluginKey as keyof typeof plugins]

          if (plugin && 'sendEvent' in plugin) {
            const result = await tryCatch(
              plugin.sendEvent({
                event: 'lead.created',
                data: lead,
              }),
            )

            igniter.logger.error(
              result.error ? result.error.message : 'Unknown error',
            )
          }
        }

        // Response: Return the newly created lead with a 201 status and trigger real-time updates.
        return response.revalidate(['notification.list']).created(lead)
      },
    }),

    /**
     * @action retrieve
     * @description Retrieves a single lead by ID for the authenticated user's organization.
     *
     * This endpoint fetches a specific lead by its ID, ensuring that the lead
     * belongs to the current organization for proper data isolation and security.
     *
     * @param {string} id - The unique identifier of the lead to retrieve
     * @returns {Lead} The lead object if found
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {404} When lead is not found or doesn't belong to the organization
     * @example
     * ```typescript
     * const lead = await api.lead.retrieve.query({ id: 'lead_123' })
     * ```
     */
    retrieve: igniter.query({
      name: 'Retrieve',
      description: 'Retrieve a single lead by ID.',
      path: '/:id' as const,
      use: [AuthFeatureProcedure(), LeadProcedure()],
      handler: async ({ context, request, response }) => {
        // Authentication: Retrieve the authenticated user's ID and organization ID from the session.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: If no active session or organization, return unauthorized.
        if (!session || !session.organization) {
          return response.unauthorized(
            'Authentication required and active organization needed.',
          )
        }

        // Observation: Extract lead ID from request parameters.
        const { id } = request.params

        // Observation: Extract organization ID from authenticated session.
        const organizationId = session.organization.id

        // Business Logic: Retrieve the lead using the LeadRepository.
        const lead = await context.lead.findUnique(id, organizationId)

        // Business Rule: If the lead is not found, return a 404 Not Found response.
        if (!lead) {
          return response.notFound('Lead not found.')
        }

        // Response: Return the retrieved lead with a 200 status.
        return response.success(lead)
      },
    }),

    /**
     * @action update
     * @description Updates an existing lead by ID for the authenticated user's organization.
     *
     * This endpoint allows partial updates to a lead's information, ensuring that
     * only leads belonging to the current organization can be modified.
     *
     * @param {string} id - The unique identifier of the lead to update
     * @param {UpdateLeadBody} body - Lead update data
     * @param {string} [body.email] - Updated email address
     * @param {string} [body.name] - Updated name
     * @param {string} [body.phone] - Updated phone number
     * @param {any} [body.metadata] - Updated metadata
     * @returns {Lead} The updated lead object
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {404} When lead is not found or doesn't belong to the organization
     * @throws {400} When lead data validation fails
     * @example
     * ```typescript
     * const updatedLead = await api.lead.update.mutate({
     *   id: 'lead_123',
     *   body: {
     *     name: 'Jane Doe',
     *     phone: '+0987654321'
     *   }
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'Update',
      description: 'Update an existing lead by ID.',
      path: '/:id' as const,
      method: 'PATCH',
      use: [AuthFeatureProcedure(), LeadProcedure()],
      body: LeadUpdateSchema,
      handler: async ({ context, request, response }) => {
        // Authentication: Retrieve the authenticated user's ID and organization ID from the session.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: If no active session or organization, return unauthorized.
        if (!session || !session.organization) {
          return response.unauthorized(
            'Authentication required and active organization needed.',
          )
        }

        // Observation: Extract lead ID from request parameters.
        const { id } = request.params

        // Observation: Extract organization ID from authenticated session.
        const organizationId = session.organization.id

        // Observation: Extract updated lead details from the request body.
        const { email, name, phone, metadata } = request.body

        // Business Logic: Update the lead using the LeadRepository.
        const updatedLead = await context.lead.update(id, organizationId, {
          email,
          name,
          phone,
          metadata,
        })

        // Response: Return the updated lead with a 200 status.
        return response.success(updatedLead)
      },
    }),

    /**
     * @action delete
     * @description Deletes a lead by ID for the authenticated user's organization.
     *
     * This endpoint permanently removes a lead from the system, ensuring that
     * only leads belonging to the current organization can be deleted.
     *
     * @param {string} id - The unique identifier of the lead to delete
     * @returns {void} No content on successful deletion
     * @throws {401} When user is not authenticated or lacks organization access
     * @throws {404} When lead is not found or doesn't belong to the organization
     * @example
     * ```typescript
     * await api.lead.delete.mutate({ id: 'lead_123' })
     * // Returns: 204 No Content
     * ```
     */
    delete: igniter.mutation({
      name: 'Delete',
      description: 'Delete a lead by ID.',
      path: '/:id' as const,
      method: 'DELETE',
      use: [AuthFeatureProcedure(), LeadProcedure()],
      handler: async ({ context, request, response }) => {
        // Authentication: Retrieve the authenticated user's ID and organization ID from the session.
        const session = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'owner', 'member'],
        })

        // Business Rule: If no active session or organization, return unauthorized.
        if (!session || !session.organization) {
          return response.unauthorized(
            'Authentication required and active organization needed.',
          )
        }

        // Observation: Extract lead ID from request parameters.
        const { id } = request.params

        // Observation: Extract organization ID from authenticated session.
        const organizationId = session.organization.id

        // Business Logic: Delete the lead using the LeadRepository.
        await context.lead.delete(id, organizationId)

        // Response: Return a 204 No Content status after successful deletion.
        return response.noContent()
      },
    }),
  },
})
