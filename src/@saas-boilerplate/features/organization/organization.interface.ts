import { z } from 'zod'

/**
 * @schema OrganizationMetadataSchema
 * @description Zod schema for validating organization metadata structure.
 *
 * This schema defines the structure for organization metadata including
 * configuration options, contact information, and social media links.
 * All fields are optional to allow partial updates and flexible configuration.
 *
 * @example
 * ```typescript
 * const metadata = OrganizationMetadataSchema.parse({
 *   options: { has_demo_data: true },
 *   contact: { email: 'admin@company.com' },
 *   links: { website: 'https://company.com' }
 * })
 * ```
 */
export const OrganizationMetadataSchema = z
  .object({
    options: z.object({
      has_demo_data: z.boolean().default(false).optional(),
    }).optional(),
    contact: z.object({
      email: z.string().nullish().optional(),
    }).optional(),
    links: z.object({
      website: z.string().nullish().optional(),
      linkedin: z.string().nullish().optional(),
      instagram: z.string().nullish().optional(),
      youtube: z.string().nullish().optional(),
      twitter: z.string().nullish().optional(),
      tiktok: z.string().nullish().optional(),
      facebook: z.string().nullish().optional(),
    }).optional(),
  })
  .partial()

/**
 * @typedef OrganizationMetadata
 * @description Type definition for organization metadata structure.
 *
 * This type represents the metadata associated with an organization,
 * including configuration options, contact information, and social
 * media links. All fields are optional to allow flexible configuration.
 *
 * @example
 * ```typescript
 * const metadata: OrganizationMetadata = {
 *   options: { has_demo_data: true },
 *   contact: { email: 'admin@company.com' },
 *   links: { website: 'https://company.com', linkedin: 'https://linkedin.com/company' }
 * }
 * ```
 */
export type OrganizationMetadata = z.infer<typeof OrganizationMetadataSchema>

/**
 * @interface Organization
 * @description Represents an organization entity in the system.
 *
 * Organizations are the core tenant entities that contain users, resources,
 * and business data. Each organization has a unique identifier, display name,
 * URL-friendly slug, optional logo, metadata configuration, and plugin integrations.
 *
 * @property {string} id - Unique identifier for the organization
 * @property {string} name - Display name for the organization
 * @property {string} slug - URL-friendly identifier for public access
 * @property {string | null | undefined} logo - Optional logo URL for the organization
 * @property {OrganizationMetadata} metadata - Configuration and contact information
 * @property {Partial<PluginRegistry>} [integrations] - Optional plugin integrations
 *
 * @example
 * ```typescript
 * const org: Organization = {
 *   id: 'org_123456789',
 *   name: 'Acme Corporation',
 *   slug: 'acme-corp',
 *   logo: 'https://example.com/logo.png',
 *   metadata: {
 *     options: { has_demo_data: false },
 *     contact: { email: 'admin@acme.com' },
 *     links: { website: 'https://acme.com' }
 *   },
 *   integrations: { analytics: { enabled: true } }
 * }
 * ```
 */
export interface Organization {
  /** Unique identifier for the organization in the system */
  id: string
  /** Display name for the organization */
  name: string
  /** URL-friendly identifier for public access and routing */
  slug: string
  /** Optional logo URL for the organization */
  logo: string | null | undefined
  /** Configuration and contact information metadata */
  metadata: OrganizationMetadata
  /** Optional plugin integrations and configurations */
  integrations?: Partial<{
     [key: string]: {
      id: string
      name: string
      description?: string
      version: string
      enabled: boolean
      settings?: Record<string, any>
      metadata?: Record<string, any>
    }
  }>
}

/**
 * @interface CreateOrganizationDTO
 * @description Data transfer object for creating a new organization.
 *
 * This interface defines the parameters required to create a new organization
 * in the system. It includes all essential organization properties along with
 * the user ID of the creating user who will become the owner.
 *
 * @property {boolean} [withDemoData] - Whether to create demo data for onboarding
 * @property {string} [id] - Optional custom ID for the organization
 * @property {string} userId - ID of the user creating the organization (becomes owner)
 * @property {string} name - Display name for the organization
 * @property {string} slug - URL-friendly identifier for the organization
 * @property {string} [logo] - Optional logo URL for the organization
 * @property {OrganizationMetadata} metadata - Configuration and contact information
 *
 * @example
 * ```typescript
 * const createData: CreateOrganizationDTO = {
 *   name: 'Acme Corporation',
 *   slug: 'acme-corp',
 *   userId: 'user_123',
 *   metadata: {
 *     options: { has_demo_data: true },
 *     contact: { email: 'admin@acme.com' }
 *   },
 *   withDemoData: true
 * }
 * ```
 */
export interface CreateOrganizationDTO {
  /** Whether to create demo data for onboarding purposes */
  withDemoData?: boolean
  /** Optional custom ID for the organization */
  id?: string | null
  /** ID of the user creating the organization (becomes the owner) */
  userId: string
  /** Display name for the organization */
  name: string
  /** URL-friendly identifier for the organization */
  slug: string
  /** Optional logo URL for the organization */
  logo?: string
  /** Configuration and contact information metadata */
  metadata: OrganizationMetadata
}

/**
 * @interface UpdateOrganizationDTO
 * @description Data transfer object for updating an existing organization.
 *
 * This interface defines the parameters that can be modified when updating
 * an existing organization. All fields are optional to allow partial updates
 * while maintaining data integrity.
 *
 * @property {string} id - The unique identifier of the organization to update
 * @property {string} [name] - New display name for the organization
 * @property {string} [slug] - New URL-friendly identifier for the organization
 * @property {string} [logo] - New logo URL for the organization
 * @property {Partial<OrganizationMetadata>} [metadata] - Updated metadata configuration
 *
 * @example
 * ```typescript
 * const updateData: UpdateOrganizationDTO = {
 *   id: 'org_123456789',
 *   name: 'Updated Company Name',
 *   logo: 'https://example.com/new-logo.png',
 *   metadata: {
 *     contact: { email: 'new-admin@company.com' }
 *   }
 * }
 * ```
 */
export interface UpdateOrganizationDTO {
  /** The unique identifier of the organization to update */
  id: string
  /** New display name for the organization */
  name?: string
  /** New URL-friendly identifier for the organization */
  slug?: string
  /** New logo URL for the organization */
  logo?: string | null
  /** Updated metadata configuration (partial update) */
  metadata?: Partial<OrganizationMetadata> | null
}
