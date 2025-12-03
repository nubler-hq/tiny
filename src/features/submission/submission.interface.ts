import type { Organization } from '@/@saas-boilerplate/features/organization/organization.interface'
import type { Lead } from '../lead/lead.interface'

/**
 * @typedef SubmissionMetadata
 * @description Metadata structure for form submissions containing source information and form data.
 *
 * This type defines the structure of metadata associated with form submissions,
 * including the source of the submission (e.g., contact form, landing page) and
 * any additional form data collected during submission.
 *
 * @property {string} [source] - Optional source identifier indicating where the submission originated
 * @property {Record<string, any>} data - Additional form data collected during submission
 *
 * @example
 * ```typescript
 * const metadata: SubmissionMetadata = {
 *   source: 'contact-form',
 *   data: {
 *     message: 'I need help with...',
 *     subject: 'Support Request',
 *     priority: 'high'
 *   }
 * }
 * ```
 */
export type SubmissionMetadata = {
  source?: string
  data: Record<string, any>
}

/**
 * @interface Submission
 * @description Represents a form submission entity in the system with all its properties and relationships.
 *
 * This interface defines the complete structure of a form submission, including
 * metadata, lead associations, and organizational context. Submissions are
 * the core data collection mechanism for lead generation and form handling.
 *
 * @property {string} id - Unique identifier for the submission
 * @property {SubmissionMetadata} metadata - Metadata containing source and form data
 * @property {string} leadId - ID of the associated lead record
 * @property {Lead} [lead] - Optional related Lead entity for detailed lead information
 * @property {string} organizationId - ID of the organization this submission belongs to
 * @property {Organization} [organization] - Optional related Organization entity
 * @property {Date} createdAt - Timestamp when the submission was created
 * @property {Date} updatedAt - Timestamp when the submission was last modified
 *
 * @example
 * ```typescript
 * const submission: Submission = {
 *   id: 'sub_123456789',
 *   metadata: { source: 'contact-form', data: { message: 'Hello!' } },
 *   leadId: 'lead_987654321',
 *   organizationId: 'org_456789123',
 *   createdAt: new Date('2024-01-15T10:30:00Z'),
 *   updatedAt: new Date('2024-01-15T10:30:00Z')
 * }
 * ```
 */
export interface Submission {
  /** Unique identifier for the submission in the system */
  id: string
  /** Metadata containing source information and additional form data */
  metadata: SubmissionMetadata
  /** ID of the associated lead record */
  leadId: string
  /** Optional related Lead entity providing detailed lead information */
  lead?: Lead
  /** ID of the organization this submission belongs to */
  organizationId: string
  /** Optional related Organization entity */
  organization?: Organization
  /** Timestamp when the submission was created */
  createdAt: Date
  /** Timestamp when the submission was last updated */
  updatedAt: Date
}

/**
 * @interface CreateSubmissionsDTO
 * @description Data transfer object for creating a new form submission.
 *
 * This interface defines the parameters required to create a new submission,
 * including contact information and metadata. The system will automatically
 * create or associate a lead record based on the email address.
 *
 * @property {string} [name] - Optional name of the person submitting the form
 * @property {string} [phone] - Optional phone number for contact
 * @property {string} email - Required email address (used for lead association)
 * @property {SubmissionMetadata} [metadata] - Optional metadata with source and form data
 * @property {string} organizationId - Required ID of the organization
 *
 * @example
 * ```typescript
 * const createData: CreateSubmissionsDTO = {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890',
 *   metadata: {
 *     source: 'contact-form',
 *     data: { message: 'I need help with...', subject: 'Support' }
 *   },
 *   organizationId: 'org_123456789'
 * }
 * ```
 */
export interface CreateSubmissionsDTO {
  /** Optional name of the person submitting the form */
  name?: string
  /** Optional phone number for contact */
  phone?: string
  /** Required email address used for lead association */
  email: string
  /** Optional metadata containing source and form data */
  metadata?: SubmissionMetadata
  /** Required ID of the organization this submission belongs to */
  organizationId: string
}

/**
 * @interface UpdateSubmissionsDTO
 * @description Data transfer object for updating an existing form submission.
 *
 * This interface defines the parameters required to update a submission's
 * metadata and lead association. Organization ID is required for security
 * validation and data isolation.
 *
 * @property {string} id - Required ID of the submission to update
 * @property {SubmissionMetadata} metadata - Updated metadata with source and form data
 * @property {string} [leadId] - Optional updated lead association
 * @property {string} organizationId - Required ID of the organization for security
 *
 * @example
 * ```typescript
 * const updateData: UpdateSubmissionsDTO = {
 *   id: 'sub_123456789',
 *   metadata: {
 *     source: 'updated-contact-form',
 *     data: { status: 'processed', notes: 'Follow up required' }
 *   },
 *   leadId: 'lead_987654321',
 *   organizationId: 'org_123456789'
 * }
 * ```
 */
export interface UpdateSubmissionsDTO {
  /** Required ID of the submission to update */
  id: string
  /** Updated metadata containing source and form data */
  metadata: SubmissionMetadata
  /** Optional updated lead association */
  leadId?: string
  /** Required ID of the organization for security validation */
  organizationId: string
}

/**
 * @interface SubmissionsQueryParams
 * @description Query parameters for fetching form submissions with filtering and pagination.
 *
 * This interface defines all available query parameters for retrieving submissions,
 * including pagination controls, sorting options, search functionality, and
 * filtering capabilities for organization-scoped data access.
 *
 * @property {number} [page] - Optional page number for pagination (1-based)
 * @property {number} [limit] - Optional number of items per page
 * @property {string} [sortBy] - Optional field name to sort by
 * @property {'asc'|'desc'} [sortOrder] - Optional sort direction
 * @property {string} [search] - Optional search term for filtering submissions
 * @property {string} [organizationId] - Optional organization ID for filtering
 * @property {string} [leadId] - Optional lead ID to filter submissions
 *
 * @example
 * ```typescript
 * const queryParams: SubmissionsQueryParams = {
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'john@example.com',
 *   leadId: 'lead_123456789'
 * }
 * ```
 */
export interface SubmissionsQueryParams {
  /** Optional page number for pagination (1-based) */
  page?: number
  /** Optional number of items to return per page */
  limit?: number
  /** Optional field name to sort by */
  sortBy?: string
  /** Optional sort direction (ascending or descending) */
  sortOrder?: 'asc' | 'desc'
  /** Optional search term for filtering submissions */
  search?: string
  /** Optional organization ID for filtering */
  organizationId?: string
  /** Optional lead ID to filter submissions by associated lead */
  leadId?: string
}
