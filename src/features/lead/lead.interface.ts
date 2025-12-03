import { z } from 'zod'
import type { Organization } from '@/@saas-boilerplate/features/organization/organization.interface'
import type { Submission } from '../submission/submission.interface'

/**
 * @interface Lead
 * @description Represents a Lead entity in the system, including all its properties and relationships.
 */
export interface Lead {
  /**
   * @property id
   * @description The unique identifier of the lead.
   */
  id: string
  /**
   * @property email
   * @description The email address of the lead, which is unique.
   */
  email: string
  /**
   * @property name
   * @description The name of the lead. Can be null.
   */
  name: string | null
  /**
   * @property phone
   * @description The phone number of the lead. Can be null.
   */
  phone: string | null
  /**
   * @property metadata
   * @description Additional metadata associated with the lead, stored as a JSON object.
   */
  metadata: any | null
  /**
   * @property submissions
   * @description An optional array of related Submission entities.
   */
  submissions?: Submission[]
  /**
   * @property createdAt
   * @description The timestamp when the lead was created.
   */
  createdAt: Date
  /**
   * @property updatedAt
   * @description The timestamp when the lead was last updated.
   */
  updatedAt: Date
  /**
   * @property organizationId
   * @description The ID of the organization to which the lead belongs.
   */
  organizationId: string
  /**
   * @property organization
   * @description An optional related Organization entity.
   */
  organization?: Organization
}

/**
 * @schema LeadCreationSchema
 * @description Zod schema for validating the request body when creating a new lead.
 * Ensures required fields like email are present and others are correctly typed.
 */
export const LeadCreationSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  metadata: z.any().optional().nullable(), // Allow any for Prisma.InputJsonValue
})

/**
 * @typedef {import("zod").infer<typeof LeadCreationSchema>} CreateLeadBody
 * @description Type definition for creating a new lead, inferred from LeadCreationSchema.
 */
export type CreateLeadBody = z.infer<typeof LeadCreationSchema>

/**
 * @schema LeadUpdateSchema
 * @description Zod schema for validating the request body when updating an existing lead.
 * Allows partial updates and ensures fields are correctly typed.
 */
export const LeadUpdateSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  metadata: z.any().optional().nullable(), // Allow any for Prisma.InputJsonValue
})

/**
 * @typedef {import("zod").infer<typeof LeadUpdateSchema>} UpdateLeadBody
 * @description Type definition for updating an existing lead, inferred from LeadUpdateSchema.
 */
export type UpdateLeadBody = z.infer<typeof LeadUpdateSchema>

/**
 * @schema LeadQuerySchema
 * @description Zod schema for validating query parameters when fetching lead entities.
 * Supports pagination, sorting, and searching.
 */
export const LeadQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

/**
 * @typedef {import("zod").infer<typeof LeadQuerySchema>} LeadQueryParams
 * @description Type definition for lead query parameters, inferred from LeadQuerySchema.
 */
export type LeadQueryParams = z.infer<typeof LeadQuerySchema>
