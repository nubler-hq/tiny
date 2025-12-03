import { igniter } from '@/igniter'
import {
  type Organization,
  type CreateOrganizationDTO,
  type UpdateOrganizationDTO,
  type OrganizationMetadata,
  OrganizationMetadataSchema,
} from '../organization.interface'
import { updateMetadataSafe } from '@/utils/update-metadata'
import { parseMetadata } from '@/utils/parse-metadata'
import { createDemoDataForOrganization } from '../presentation/utils/create-organization-demo-data'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { isPaymentEnabled } from '../../billing/presentation/utils/is-payment-enabled'

/**
 * @function formatDate
 * @description Helper function to format dates as MM/DD for chart data.
 *
 * This utility function formats JavaScript Date objects into a consistent
 * MM/DD string format used for chart data visualization and analytics.
 *
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in MM/DD format
 * @example
 * ```typescript
 * const formatted = formatDate(new Date('2024-01-15'))
 * // Returns: "01/15"
 * ```
 */
const formatDate = (date: Date) => {
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`
}

/**
 * @procedure OrganizationFeatureProcedure
 * @description Procedure for managing organization operations and comprehensive analytics.
 *
 * This procedure provides the business logic layer for organization management,
 * handling database operations, statistics calculation, and analytics generation.
 * It manages the complete lifecycle of organizations including creation, updates,
 * verification, and deletion with comprehensive statistics and onboarding tracking.
 *
 * The procedure includes sophisticated analytics calculation for leads, submissions,
 * chart data generation, and onboarding progress tracking to provide insights
 * into organization performance and user engagement.
 *
 * @example
 * ```typescript
 * // Used in controllers
 * const org = await context.organization.create({ name: 'Acme Corp', slug: 'acme', userId: 'user_123' })
 * const stats = await context.organization.getStats({ organizationId: 'org_123' })
 * const isAvailable = await context.organization.verify({ slug: 'new-slug' })
 * ```
 */
export const OrganizationFeatureProcedure = igniter.procedure({
  name: 'OrganizationFeatureProcedure',
  handler: async (_, { context, request }) => {
    return {
      organization: {
        /**
         * @method getStats
         * @description Retrieves comprehensive statistics and analytics for an organization.
         *
         * This method calculates detailed analytics including lead and submission counts,
         * comparison metrics between current and previous periods, chart data for
         * visualization, and onboarding progress tracking. It provides insights into
         * organization performance and user engagement over time.
         *
         * @param {object} params - Statistics parameters
         * @param {string} params.organizationId - The unique identifier of the organization
         * @returns {Promise<OrganizationStats>} Comprehensive statistics and analytics data
         * @throws {Error} When organization ID is not provided
         * @example
         * ```typescript
         * const stats = await context.organization.getStats({ organizationId: 'org_123' })
         * // Returns: { totalLeads: 150, totalSubmissions: 45, chartData: {...}, onboarding: {...} }
         * ```
         */
        getStats: async ({ organizationId }: { organizationId: string }) => {
          // Business Rule: Validate organization ID is provided
          const orgId = organizationId
          if (!orgId) throw new Error('Active organization ID not found')

          // Business Logic: Set up date ranges for current and previous periods (30 days each)
          const today = new Date()
          today.setHours(23, 59, 59, 999) // End of today

          const currentPeriodEnd = new Date(today)
          const currentPeriodStart = new Date(today)
          currentPeriodStart.setDate(currentPeriodStart.getDate() - 29) // Go back 29 days (total 30 days including today)
          currentPeriodStart.setHours(0, 0, 0, 0) // Start of that day

          const previousPeriodEnd = new Date(currentPeriodStart)
          previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1) // Day before current period starts
          previousPeriodEnd.setHours(23, 59, 59, 999) // End of that day

          const previousPeriodStart = new Date(previousPeriodEnd)
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 29) // Go back 29 days (total 30 days)
          previousPeriodStart.setHours(0, 0, 0, 0) // Start of that day

          // Business Logic: Fetch all required data for analytics calculation in parallel
          const [
            organization,
            members,
            integrations,
            subscriptions,
            currentLeads,
            previousLeads,
            currentSubs,
            previousSubs,
          ] = await Promise.all([
            // Organization data for logo and basic info
            context.services.database.organization.findUnique({
              where: { id: orgId },
              select: { logo: true, id: true },
            }),
            // Members for onboarding progress tracking
            context.services.database.member.findMany({
              where: { organizationId: orgId },
            }),
            // Active integrations for onboarding progress
            context.services.database.integration.findMany({
              where: { organizationId: orgId, enabled: true },
            }),
            // Active subscriptions for onboarding progress
            context.services.database.subscription.findMany({
              where: { customer: { organizationId: orgId }, status: 'active' },
            }),
            // Current Period Leads for analytics
            context.services.database.lead.findMany({
              where: {
                organizationId: orgId,
                createdAt: { gte: currentPeriodStart, lte: currentPeriodEnd },
              },
              select: { createdAt: true },
            }),
            // Previous Period Leads for comparison
            context.services.database.lead.findMany({
              where: {
                organizationId: orgId,
                createdAt: {
                  gte: previousPeriodStart,
                  lte: previousPeriodEnd,
                },
              },
              select: { createdAt: true },
            }),
            // Current Period Submissions for analytics
            context.services.database.submission.findMany({
              where: {
                organizationId: orgId,
                createdAt: { gte: currentPeriodStart, lte: currentPeriodEnd },
              },
              select: { createdAt: true },
            }),
            // Previous Period Submissions for comparison
            context.services.database.submission.findMany({
              where: {
                organizationId: orgId,
                createdAt: {
                  gte: previousPeriodStart,
                  lte: previousPeriodEnd,
                },
              },
              select: { createdAt: true },
            }),
          ])

          // Business Logic: Calculate totals for current and previous periods
          const totalCurrentLeads = currentLeads.length
          const totalPreviousLeads = previousLeads.length
          const totalCurrentSubs = currentSubs.length
          const totalPreviousSubs = previousSubs.length

          // Business Logic: Calculate percentage comparisons between periods
          const leadsComparison =
            totalPreviousLeads > 0
              ? ((totalCurrentLeads - totalPreviousLeads) /
                  totalPreviousLeads) *
                100
              : totalCurrentLeads > 0
                ? 100 // If previous was 0 and current is > 0, it's a 100% increase
                : 0 // If both are 0, no change
          const submissionsComparison =
            totalPreviousSubs > 0
              ? ((totalCurrentSubs - totalPreviousSubs) / totalPreviousSubs) *
                100
              : totalCurrentSubs > 0
                ? 100 // If previous was 0 and current is > 0, it's a 100% increase
                : 0 // If both are 0, no change

          // Business Logic: Define onboarding steps and calculate progress
          const onboardingSteps = [
            {
              key: 'createBrand',
              finished: !!organization?.logo,
            },
            {
              key: 'inviteMembers',
              finished: (members?.length ?? 0) > 1,
            },
            {
              key: 'configureIntegrations',
              finished: (integrations?.length ?? 0) > 0,
            },
            {
              key: 'upgradePlan',
              finished: (subscriptions?.length ?? 0) > 0,
            },
          ]
          const onboardingCompleted = onboardingSteps.filter(
            (s) => s.finished,
          ).length
          const onboarding = {
            completed: onboardingCompleted,
            total: onboardingSteps.length,
            steps: onboardingSteps,
          }

          // Business Logic: Prepare chart data for visualization
          const leadsChart: Array<{ date: string; totalLeads: number }> = []
          const submissionsChart: Array<{
            date: string
            generatedSubmissions: number
          }> = []

          // Data Transformation: Create daily aggregation maps for efficient lookup
          const dailyLeadsMap = new Map<string, number>()
          currentLeads.forEach((lead) => {
            const dayStr = formatDate(new Date(lead.createdAt))
            dailyLeadsMap.set(dayStr, (dailyLeadsMap.get(dayStr) || 0) + 1)
          })

          const dailySubsMap = new Map<string, number>()
          currentSubs.forEach((sub) => {
            const dayStr = formatDate(new Date(sub.createdAt))
            dailySubsMap.set(dayStr, (dailySubsMap.get(dayStr) || 0) + 1)
          })

          // Business Logic: Populate chart arrays for the last 30 days
          const daysDiff = Math.ceil(
            (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) /
              (1000 * 60 * 60 * 24),
          )
          for (let i = 0; i <= daysDiff; i++) {
            const iterDate = new Date(currentPeriodStart)
            iterDate.setDate(iterDate.getDate() + i)
            const dayStr = formatDate(iterDate)

            leadsChart.push({
              date: dayStr,
              totalLeads: dailyLeadsMap.get(dayStr) || 0,
            })
            submissionsChart.push({
              date: dayStr,
              generatedSubmissions: dailySubsMap.get(dayStr) || 0,
            })
          }

          // Response: Return comprehensive statistics structure
          return {
            totalLeads: totalCurrentLeads,
            totalSubmissions: totalCurrentSubs,
            chartData: {
              leads: leadsChart,
              submissions: submissionsChart,
            },
            comparison: {
              leads: leadsComparison,
              submissions: submissionsComparison,
            },
            onboarding,
          }
        },

        /**
         * @method create
         * @description Creates a new organization with the specified user as the owner.
         *
         * This method creates a new organization in the database, sets up the creating
         * user as the owner, creates a billing customer, and optionally generates
         * demo data for onboarding. It also sets the new organization as the user's
         * active organization.
         *
         * @param {CreateOrganizationDTO} input - Organization creation parameters
         * @param {string} input.name - The display name for the organization
         * @param {string} input.slug - Unique URL-friendly identifier
         * @param {string} [input.logo] - Optional logo URL
         * @param {OrganizationMetadata} input.metadata - Organization metadata and configuration
         * @param {string} input.userId - ID of the user creating the organization
         * @param {boolean} [input.withDemoData] - Whether to create demo data
         * @returns {Promise<Organization>} The newly created organization object
         * @throws {Error} When database operations fail
         * @example
         * ```typescript
         * const org = await context.organization.create({
         *   name: 'Acme Corporation',
         *   slug: 'acme-corp',
         *   userId: 'user_123',
         *   metadata: { contact: { email: 'admin@acme.com' } },
         *   withDemoData: true
         * })
         * ```
         */
        create: async (input: CreateOrganizationDTO): Promise<Organization> => {
          // Business Logic: Set up metadata with demo data flag
          input.metadata.options = {}
          input.metadata.options.has_demo_data = !!input.withDemoData

          // Business Logic: Create organization record in database
          const createdOrganization =
            await context.services.database.organization.create({
              data: {
                name: input.name,
                slug: input.slug,
                logo: input.logo,
                metadata: JSON.stringify(input.metadata),
                createdAt: new Date(),
              },
            })

          // Business Logic: Create owner membership for the creating user
          await context.services.database.member.create({
            data: {
              organizationId: createdOrganization.id,
              userId: input.userId,
              role: 'owner',
            },
          })

          // Business Logic: Set the new organization as user's active organization
          await context.services.auth.api.setActiveOrganization({
            headers: request.headers,
            body: { organizationId: createdOrganization.id },
          })

          // Business Logic: Create billing customer (if payment enabled) and demo data in parallel
          const tasks = []
          
          // Only create payment customer if payment is enabled
          if (isPaymentEnabled()) {
            tasks.push(
              context.services.payment.createCustomer({
                name: createdOrganization.name,
                email: input.metadata?.contact?.email as string,
                referenceId: createdOrganization.id,
              }),
            )
          }
          
          // Create demo data if requested
          if (input.withDemoData) {
            tasks.push(createDemoDataForOrganization(createdOrganization.id, context))
          }
          
          if (tasks.length > 0) {
            await tryCatch(Promise.all(tasks))
          }

          // Response: Return the created organization with parsed metadata
          return {
            id: createdOrganization.id,
            name: createdOrganization.name,
            slug: createdOrganization.slug as string,
            logo: createdOrganization.logo,
            metadata: parseMetadata<OrganizationMetadata>(
              createdOrganization.metadata,
            ),
          }
        },

        /**
         * @method update
         * @description Updates an existing organization's details and metadata.
         *
         * This method updates organization properties including name, slug, logo,
         * and metadata. It handles metadata updates safely using the metadata
         * update utility and ensures data consistency by re-fetching the
         * organization after updates.
         *
         * @param {UpdateOrganizationDTO} params - Update parameters
         * @param {string} params.id - The unique identifier of the organization to update
         * @param {string} [params.name] - New organization name
         * @param {string} [params.slug] - New organization slug
         * @param {string} [params.logo] - New organization logo URL
         * @param {Partial<OrganizationMetadata>} [params.metadata] - Updated metadata
         * @returns {Promise<Organization>} The updated organization object
         * @throws {Error} When organization is not found or database operations fail
         * @example
         * ```typescript
         * const updated = await context.organization.update({
         *   id: 'org_123',
         *   name: 'Updated Company Name',
         *   logo: 'https://example.com/new-logo.png'
         * })
         * ```
         */
        update: async (
          params: UpdateOrganizationDTO,
        ): Promise<Organization> => {
          // Business Logic: Verify organization exists before updating
          const organization =
            await context.services.database.organization.findUnique({
              where: { id: params.id },
            })

          if (!organization) throw new Error('Organization not found')

          // Business Logic: Update metadata safely if provided
          if (params.metadata) {
            await updateMetadataSafe('organization', {
              field: 'metadata',
              where: { id: organization.id },
              data: params.metadata,
              schema: OrganizationMetadataSchema,
            })
          }

          // Business Logic: Update basic organization fields
          await context.services.database.organization.update({
            where: { id: params.id },
            data: {
              name: params.name,
              slug: params.slug,
              logo: params.logo,
            },
          })

          // Business Logic: Re-fetch organization to get final state including updated metadata
          const finalOrganization =
            await context.services.database.organization.findUnique({
              where: { id: params.id },
            })

          if (!finalOrganization)
            throw new Error('Organization disappeared after update') // Should not happen

          // Response: Return updated organization with parsed metadata
          return {
            id: finalOrganization.id,
            name: finalOrganization.name,
            slug: finalOrganization.slug as string,
            logo: finalOrganization.logo,
            metadata: parseMetadata<OrganizationMetadata>(
              finalOrganization.metadata,
            ),
          }
        },

        /**
         * @method verify
         * @description Verifies if an organization slug is available for use.
         *
         * This method checks whether a given slug is already taken by another
         * organization. It's used during organization creation to ensure
         * slug uniqueness.
         *
         * @param {object} params - Verification parameters
         * @param {string} params.slug - The slug to verify for availability
         * @returns {Promise<boolean>} True if slug is available, false if taken
         * @example
         * ```typescript
         * const isAvailable = await context.organization.verify({ slug: 'my-company' })
         * // Returns: true if available, false if taken
         * ```
         */
        verify: async (params: { slug: string }): Promise<boolean> => {
          // Business Logic: Check if organization with this slug exists
          const organization =
            await context.services.database.organization.findUnique({
              where: { slug: params.slug },
            })

          // Response: Return true if no organization found (slug is available)
          return organization === null
        },

        /**
         * @method delete
         * @description Permanently deletes an organization from the database.
         *
         * This method permanently removes an organization and all its associated
         * data from the system. This action is irreversible.
         *
         * @param {object} params - Deletion parameters
         * @param {string} params.id - The unique identifier of the organization to delete
         * @returns {Promise<{ id: string }>} Confirmation object with deleted organization ID
         * @throws {Error} When database operation fails
         * @example
         * ```typescript
         * const result = await context.organization.delete({ id: 'org_123' })
         * // Returns: { id: 'org_123' }
         * ```
         */
        delete: async (params: { id: string }): Promise<{ id: string }> => {
          // Business Logic: Permanently delete the organization
          await context.services.database.organization.delete({
            where: { id: params.id },
          })

          // Response: Return confirmation with deleted organization ID
          return { id: params.id }
        },

        /**
         * @method getBySlug
         * @description Retrieves an organization by its public slug.
         *
         * This method finds an organization using its public slug, typically
         * used for public organization profiles or landing pages.
         *
         * @param {object} params - Query parameters
         * @param {string} params.slug - The organization's public slug
         * @returns {Promise<Organization | null>} Organization object or null if not found
         * @example
         * ```typescript
         * const org = await context.organization.getBySlug({ slug: 'acme-corp' })
         * // Returns: Organization object or null
         * ```
         */
        getBySlug: async (params: {
          slug: string
        }): Promise<Organization | null> => {
          // Business Logic: Find organization by slug
          const organization =
            await context.services.database.organization.findUnique({
              where: { slug: params.slug },
            })

          // Business Rule: Return null if organization not found
          if (!organization) return null

          // Response: Return organization with parsed metadata
          return {
            id: organization.id,
            name: organization.name,
            slug: organization.slug as string,
            logo: organization.logo,
            metadata: parseMetadata<OrganizationMetadata>(
              organization.metadata,
            ),
          }
        },
      },
    }
  },
})
