import { z } from 'zod'
import { igniter } from '@/igniter'
import { OrganizationFeatureProcedure } from '../procedures/organization.procedure'
import { AuthFeatureProcedure } from '@/@saas-boilerplate/features/auth/procedures/auth.procedure'
import { NotificationProcedure } from '../../notification/procedures/notification.procedure'
import { OrganizationMetadataSchema } from '../organization.interface'

/**
 * @controller OrganizationController
 * @description Controller for managing organizations and their complete lifecycle.
 *
 * This controller provides API endpoints for organization management including
 * creation, updates, verification, statistics, and deletion. It handles the
 * complete organization lifecycle from initial creation through ongoing management
 * and provides comprehensive statistics and onboarding tracking.
 *
 * Organizations are the core tenant entities in the system, containing users,
 * resources, and business data. This controller ensures proper organization
 * isolation and role-based access control for all operations.
 *
 * @example
 * ```typescript
 * // Create a new organization
 * const org = await api.organization.create.mutate({
 *   name: 'My Company',
 *   slug: 'my-company',
 *   withDemoData: true
 * })
 *
 * // Get organization statistics
 * const stats = await api.organization.stats.query()
 *
 * // Update organization details
 * await api.organization.update.mutate({
 *   name: 'Updated Company Name',
 *   logo: 'https://example.com/logo.png'
 * })
 * ```
 */
export const OrganizationController = igniter.controller({
  name: 'Organization',
  description:
    'Organization management including creation, updates, verification, and statistics',
  path: '/organization',
  actions: {
    /**
     * @action create
     * @description Creates a new organization with the authenticated user as the owner.
     *
     * This endpoint creates a new organization and automatically sets up the
     * creating user as the owner. It includes slug availability verification,
     * automatic billing customer creation, and optional demo data generation.
     * The organization is immediately set as the user's active organization.
     *
     * @param {string} name - The display name for the organization
     * @param {string} slug - Unique URL-friendly identifier for the organization
     * @param {string} [logo] - Optional logo URL for the organization
     * @param {OrganizationMetadata} [metadata] - Optional metadata and configuration
     * @param {boolean} [withDemoData] - Whether to create demo data for onboarding
     * @returns {Organization} The newly created organization object
     * @throws {400} When slug is not available or validation fails
     * @throws {401} When user is not authenticated
     * @example
     * ```typescript
     * const org = await api.organization.create.mutate({
     *   name: 'Acme Corporation',
     *   slug: 'acme-corp',
     *   logo: 'https://example.com/logo.png',
     *   withDemoData: true
     * })
     * ```
     */
    create: igniter.mutation({
      name: 'createOrganization',
      description: 'Create new organization',
      method: 'POST',
      path: '/',
      use: [
        OrganizationFeatureProcedure(),
        AuthFeatureProcedure(),
        NotificationProcedure(),
      ],
      body: z.object({
        name: z.string(),
        slug: z.string(),
        logo: z.string().optional(),
        metadata: OrganizationMetadataSchema.optional(),
        withDemoData: z.boolean().optional().default(false),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract organization details from request body
        const { name, slug, logo, metadata, withDemoData } = request.body

        // Business Logic: Verify slug availability before creating organization
        const disponibility = await context.organization.verify({
          slug,
        })

        // Business Rule: If slug is not available, return error
        if (!disponibility) {
          return response.badRequest('Slug is not available')
        }

        // Authentication: Retrieve the authenticated user's session
        const session = await context.auth.getSession({
          requirements: 'authenticated',
        })

        // Business Logic: Create organization with user as owner and contact email
        const result = await context.organization.create({
          name,
          slug,
          logo,
          userId: session.user.id,
          withDemoData: withDemoData || false,
          metadata: {
            contact: {
              email: session.user.email,
            },
            ...metadata,
          },
        })

        // Response: Return the newly created organization with a 201 status
        return response.created(result)
      },
    }),

    /**
     * @action stats
     * @description Retrieves comprehensive statistics and analytics for the organization.
     *
     * This endpoint provides detailed analytics including lead and submission counts,
     * comparison metrics, chart data for visualization, and onboarding progress
     * tracking. It requires the user to have an active organization and appropriate
     * role permissions.
     *
     * @returns {OrganizationStats} Comprehensive statistics and analytics data
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @example
     * ```typescript
     * const stats = await api.organization.stats.query()
     * // Returns: { totalLeads: 150, totalSubmissions: 45, chartData: {...}, onboarding: {...} }
     * ```
     */
    stats: igniter.query({
      name: 'getOrganizationStats',
      description: 'Get organization stats',
      method: 'GET',
      path: '/stats',
      use: [OrganizationFeatureProcedure(), AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Authentication: Get session without requiring roles first to check organization
        const session = await context.auth.getSession({
          requirements: 'authenticated',
        })

        // Business Rule: Check if user has an organization before requiring roles
        if (!session.organization) {
          return response.forbidden(
            'Organization access required. Please complete onboarding first.',
          )
        }

        // Authentication: Now verify roles since we confirmed organization exists
        const sessionWithRoles = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        // Business Logic: Retrieve comprehensive organization statistics
        const stats = await context.organization.getStats({
          organizationId: sessionWithRoles.organization.id,
        })

        // Response: Return the statistics data with a 200 status
        return response.success(stats)
      },
    }),

    /**
     * @action verify
     * @description Verifies if an organization slug is available for use.
     *
     * This endpoint checks whether a given slug is available for creating
     * a new organization. It's typically used during organization creation
     * to provide real-time feedback on slug availability.
     *
     * @param {string} slug - The slug to verify for availability
     * @returns {{ available: boolean }} Object indicating slug availability
     * @example
     * ```typescript
     * const result = await api.organization.verify.mutate({ slug: 'my-company' })
     * // Returns: { available: true } or { available: false }
     * ```
     */
    verify: igniter.mutation({
      name: 'verifyOrganization',
      description: 'Verify organization',
      method: 'POST',
      path: '/verify' as const,
      use: [OrganizationFeatureProcedure()],
      body: z.object({
        slug: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract slug from request body
        const { slug } = request.body

        // Business Logic: Check if the slug is available
        const result = await context.organization.verify({
          slug,
        })

        // Response: Return availability status
        return response.success({ available: result })
      },
    }),

    /**
     * @action update
     * @description Updates an existing organization's details and configuration.
     *
     * This endpoint allows modification of organization properties including
     * name, slug, logo, and metadata. It requires the user to have an active
     * organization and appropriate role permissions. The update preserves
     * existing metadata while allowing partial updates.
     *
     * @param {string} [name] - New organization name
     * @param {string} [slug] - New organization slug
     * @param {string} [logo] - New organization logo URL
     * @param {any} [metadata] - Updated organization metadata
     * @returns {Organization} The updated organization object
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks organization access or required roles
     * @throws {404} When organization is not found
     * @example
     * ```typescript
     * const updated = await api.organization.update.mutate({
     *   name: 'Updated Company Name',
     *   logo: 'https://example.com/new-logo.png'
     * })
     * ```
     */
    update: igniter.mutation({
      name: 'updateOrganization',
      description: 'Update organization',
      method: 'PUT',
      path: '/' as const,
      use: [OrganizationFeatureProcedure(), AuthFeatureProcedure()],
      body: z.object({
        name: z.string().optional(),
        slug: z.string().optional(),
        logo: z.string().optional().nullable(),
        metadata: z.any().optional().nullable(),
      }),
      handler: async ({ request, response, context }) => {
        // Authentication: Get session without requiring roles first to check organization
        const session = await context.auth.getSession({
          requirements: 'authenticated',
        })

        // Business Rule: Check if user has an organization before requiring roles
        if (!session.organization) {
          return response.forbidden(
            'Organization access required. Please complete onboarding first.',
          )
        }

        // Authentication: Now verify roles since we confirmed organization exists
        const sessionWithRoles = await context.auth.getSession({
          requirements: 'authenticated',
          roles: ['admin', 'member', 'owner'],
        })

        // Observation: Extract update parameters from request body
        const { name, slug, logo, metadata } = request.body

        // Business Logic: Update the organization with new details
        const result = await context.organization.update({
          id: sessionWithRoles.organization.id,
          name,
          slug,
          logo,
          metadata,
        })

        // Response: Return the updated organization with a 200 status
        return response.success(result)
      },
    }),

    /**
     * @action delete
     * @description Permanently deletes an organization and all associated data.
     *
     * This endpoint permanently removes an organization from the system.
     * This action is irreversible and will delete all associated data
     * including members, resources, and business data.
     *
     * @param {string} id - The unique identifier of the organization to delete
     * @returns {null} Confirmation of successful deletion
     * @throws {404} When organization is not found
     * @example
     * ```typescript
     * await api.organization.delete.mutate({ id: 'org_123' })
     * // Organization permanently deleted
     * ```
     */
    delete: igniter.mutation({
      name: 'deleteOrganization',
      description: 'Delete organization',
      method: 'DELETE',
      path: '/:id' as const,
      use: [OrganizationFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Observation: Extract organization ID from path parameters
        const { id } = request.params

        // Business Logic: Permanently delete the organization
        await context.organization.delete({ id })

        // Response: Return confirmation of successful deletion
        return response.success(null)
      },
    }),

    /**
     * @action getBySlug
     * @description Retrieves a public organization profile by its slug.
     *
     * This endpoint provides public access to organization information
     * using the organization's slug. It's typically used for public
     * organization profiles or landing pages.
     *
     * @param {string} slug - The organization's public slug
     * @returns {Organization | null} Organization object or null if not found
     * @throws {404} When organization is not found
     * @example
     * ```typescript
     * const org = await api.organization.getBySlug.query({ slug: 'acme-corp' })
     * // Returns: { id: 'org_123', name: 'Acme Corp', slug: 'acme-corp', ... }
     * ```
     */
    getBySlug: igniter.query({
      name: 'getOrganizationBySlug',
      description: 'Get organization by slug',
      method: 'GET',
      path: '/public/:slug' as const,
      use: [OrganizationFeatureProcedure()],
      handler: async ({ request, response, context }) => {
        // Observation: Extract slug from path parameters
        const { slug } = request.params

        // Business Logic: Retrieve organization by slug
        const organization = await context.organization.getBySlug({
          slug,
        })

        // Business Rule: If organization not found, return 404
        if (!organization) {
          return response.notFound('Organization not found')
        }

        // Response: Return the organization data with a 200 status
        return response.success(organization)
      },
    }),
  },
})
