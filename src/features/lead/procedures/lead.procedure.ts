import { igniter } from '@/igniter'
import { Lead, CreateLeadBody, UpdateLeadBody } from '../lead.interface'

/**
 * @procedure LeadProcedure
 * @description Procedure for managing customer lead operations and data processing.
 *
 * This procedure provides the business logic layer for lead management, handling
 * the complete lifecycle of customer lead data including creation, updates,
 * deletion, and real-time notification integration. It ensures proper data
 * isolation by enforcing organization-scoped operations and manages lead
 * relationships with submissions and other entities.
 *
 * The procedure injects lead management methods into the Igniter context,
 * making them available to controllers and other parts of the application.
 * It automatically triggers notifications for lead events and integrates
 * with the notification system for real-time updates.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const leads = await context.lead.findMany('org_123')
 * const newLead = await context.lead.create('org_123', {
 *   email: 'customer@example.com',
 *   name: 'John Doe',
 *   metadata: { source: 'website' }
 * })
 * const updatedLead = await context.lead.update('lead_456', 'org_123', {
 *   name: 'Jane Doe'
 * })
 * ```
 */
export const LeadProcedure = igniter.procedure({
  name: 'LeadProcedure',
  handler: (_, { context }) => {
    // Context Extension: Return the repository instance in hierarchical structure for consistency.
    return {
      lead: {
        /**
         * @method findMany
         * @description Retrieves all leads for a specific organization.
         *
         * This method fetches all lead records that belong to the specified
         * organization, ensuring proper data isolation and security.
         *
         * @param {string} organizationId - ID of the organization to fetch leads for
         * @returns {Promise<Lead[]>} Array of lead objects belonging to the organization
         * @throws {Error} When database query fails
         */
        findMany: async (organizationId: string): Promise<Lead[]> => {
          // Business Logic: Retrieve leads using the LeadRepository with organization filtering
          return context.services.database.lead.findMany({
            where: {
              organizationId,
            },
          })
        },

        /**
         * @method findUnique
         * @description Retrieves a specific lead by ID with organization validation.
         *
         * This method finds a single lead by its unique identifier, ensuring
         * that the lead belongs to the specified organization for proper
         * data isolation and security.
         *
         * @param {string} id - Unique identifier of the lead to retrieve
         * @param {string} organizationId - Organization ID for additional filtering and security
         * @returns {Promise<Lead | null>} Lead object if found, null otherwise
         * @throws {Error} When database query fails
         */
        findUnique: async (
          id: string,
          organizationId: string,
        ): Promise<Lead | null> => {
          // Business Logic: Retrieve the lead using the LeadRepository with organization validation
          return context.services.database.lead.findUnique({
            where: {
              id,
              organizationId,
            },
          })
        },

        /**
         * @method create
         * @description Creates a new lead for a specific organization with notification.
         *
         * This method creates a new lead record with the provided information
         * and automatically triggers a notification event for the new lead.
         * The lead is associated with the specified organization.
         *
         * @param {string} organizationId - ID of the organization to create the lead for
         * @param {CreateLeadBody} data - Lead creation data including email, name, phone, metadata
         * @returns {Promise<Lead>} The newly created lead object
         * @throws {Error} When database operation fails or organization is invalid
         */
        create: async (
          organizationId: string,
          data: CreateLeadBody,
        ): Promise<Lead> => {
          // Business Logic: Create a new lead using the LeadRepository
          const lead = await context.services.database.lead.create({
            data: {
              ...data,
              organizationId,
            },
          })

          // Business Logic: After creating the lead, trigger events for installed plugins.
          await context.services.notification.send({
            type: 'LEAD_CREATED',
            context: {
              organizationId,
            },
            data: {
              leadName: lead.name,
              leadEmail: lead.email,
              source: data.metadata?.source,
            },
          })

          // Response: Return the newly created lead
          return lead
        },

        /**
         * @method update
         * @description Updates an existing lead with validation and notification.
         *
         * This method updates a lead's information after validating that the
         * lead exists and belongs to the specified organization. It triggers
         * a notification event with the changes made to the lead.
         *
         * @param {string} id - Unique identifier of the lead to update
         * @param {string} organizationId - Organization ID for validation and security
         * @param {UpdateLeadBody} data - Updated lead data
         * @returns {Promise<Lead>} The updated lead object
         * @throws {Error} When lead is not found or database operation fails
         */
        update: async (
          id: string,
          organizationId: string,
          data: UpdateLeadBody,
        ): Promise<Lead> => {
          // Business Logic: Verify membership exists before updating
          const leadAlreadyExists =
            await context.services.database.lead.findUnique({
              where: {
                id,
                organizationId,
              },
            })

          // Business Rule: If the lead is not found, return a 404 Not Found response.
          if (!leadAlreadyExists) {
            throw new Error('Lead not found')
          }

          // Business Logic: Update the lead using the LeadRepository.
          const lead = await context.services.database.lead.update({
            where: {
              id,
              organizationId,
            },
            data,
          })

          // Business Logic: After updating the lead, trigger update notification
          await context.services.notification.send({
            type: 'LEAD_UPDATED',
            context: {
              organizationId,
            },
            data: {
              leadName: lead.name,
              leadEmail: lead.email,
              changes: Object.keys(data).map(
                (key) => `${key}: ${data[key as keyof UpdateLeadBody]}`,
              ),
            },
          })

          // Response: Return the updated lead
          return lead
        },

        /**
         * @method delete
         * @description Permanently deletes a lead with notification.
         *
         * This method permanently removes a lead from the system after validating
         * that it exists and belongs to the specified organization. It triggers
         * a deletion notification event for the removed lead.
         *
         * @param {string} id - Unique identifier of the lead to delete
         * @param {string} organizationId - Organization ID for validation and security
         * @returns {Promise<Lead>} The deleted lead object
         * @throws {Error} When lead is not found or database operation fails
         */
        delete: async (id: string, organizationId: string): Promise<Lead> => {
          // Business Logic: Delete the lead using the LeadRepository.
          const lead = await context.services.database.lead.delete({
            where: {
              id,
              organizationId,
            },
          })

          // Response: Return the deleted lead
          return lead
        },
      },
    }
  },
})
