import { PrismaClient } from '@prisma/client'
import type { StandardSchemaV1 } from '@igniter-js/core'
import { prisma } from '@/services/prisma'
import { DeepMerge } from '@/@saas-boilerplate/utils/deep-merge'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'

/**
 * Parameters for updating metadata in a Prisma model
 */
type UpdateParams<TField extends string, TSchema extends StandardSchemaV1> = {
  /**
   * The metadata field to update (usually 'metadata')
   */
  field: TField
  /**
   * The where clause to find the record to update
   */
  where: Record<string, any>
  /**
   * The Zod schema that defines the metadata structure
   */
  schema: TSchema
  /**
   * The data to merge into the existing metadata
   */
  data: StandardSchemaV1.InferInput<TSchema>
  /**
   * Optional fields to include in the response
   * @default {}
   */
  select?: Record<string, boolean>
  /**
   * Options for controlling the update behavior
   */
  options?: {
    /**
     * Whether to validate the existing metadata against the schema
     * @default false
     */
    validateExisting?: boolean
    /**
     * Whether to create a record if it doesn't exist (uses create instead of update)
     * @default false
     */
    createIfNotExists?: boolean
  }
}

/**
 * Return type for safe metadata operations
 */
type SafeUpdateResult<T> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    data?: any
  }
}

/**
 * Return type for Prisma's update operation
 */
type UpdateResult<
  TModel extends keyof PrismaClient,
  TField extends keyof any,
  TSchema extends StandardSchemaV1,
> = TModel extends keyof PrismaClient
  ? Omit<any, TField> & {
      [key in TField]: StandardSchemaV1.InferInput<TSchema>
    }
  : never

/**
 * Updates metadata for any Prisma model by merging new data with existing metadata
 *
 * @param model The prisma model to update (e.g., 'user', 'organization')
 * @param params Parameters including field name, where clause, schema, and data to merge
 * @returns The updated record from the database
 *
 * @example
 * ```typescript
 * // Define your metadata schema
 * const metadataSchema = z.object({
 *   preferences: z.object({
 *     theme: z.enum(['light', 'dark']).optional(),
 *     notifications: z.boolean().optional()
 *   })
 * });
 *
 * // Update user metadata
 * const updatedUser = await updateMetadata(
 *   'user',
 *   {
 *     field: 'metadata',
 *     where: { id: 'user-id' },
 *     schema: metadataSchema,
 *     data: { preferences: { theme: 'dark' } },
 *     select: { id: true, email: true, metadata: true }
 *   }
 * );
 * ```
 */
export async function updateMetadata<
  TModel extends keyof PrismaClient,
  TField extends string,
  TSchema extends StandardSchemaV1,
>(
  model: TModel,
  params: UpdateParams<TField, TSchema>,
): Promise<UpdateResult<TModel, TField, TSchema>> {
  const { data } = params

  const { field, where, schema, select = {}, options = {} } = params
  const { validateExisting = false, createIfNotExists = false } = options

  // Validate the input data against the schema
  // @ts-expect-error - This is a hack to make TypeScript happy
  const parsedData = await tryCatch(schema.parse(data))

  if (parsedData.error) {
    throw new Error(`Invalid metadata: ${parsedData.error.message}`)
  }

  // Ensure the field is included in the select
  const finalSelect = {
    ...select,
    [field]: true,
  }

  // Get current record with the specified field
  const record = await (prisma as any)[model].findUnique({
    where,
    select: finalSelect,
  })

  // Check if record exists
  if (!record) {
    if (createIfNotExists) {
      // Create a new record with the metadata
      return (prisma as any)[model].create({
        data: {
          ...where,
          [field]: data,
        },
        select: finalSelect,
      }) as Promise<UpdateResult<TModel, TField, TSchema>>
    }

    throw new Error(
      `Record not found in ${String(model)} with criteria: ${JSON.stringify(where)}`,
    )
  }

  // Get current metadata value
  const currentMetadata = record[field]

  // Validate current metadata exists or initialize it
  const baseMetadata = currentMetadata || {}

  // Validate existing metadata if requested
  if (validateExisting && currentMetadata) {
    try {
      // @ts-expect-error - This is a hack to make TypeScript happy
      schema.parse(currentMetadata)
    } catch (error) {
      throw new Error(
        `Existing metadata is invalid: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  // Merge current metadata with new data
  let updatedMetadata = DeepMerge.merge(
    baseMetadata,
    data as Record<string, any>,
  )

  if (typeof record[field] === 'string') {
    updatedMetadata = JSON.stringify(updatedMetadata)
  }

  // Create the update data with the field to be updated
  const updateData = {
    [field]: updatedMetadata,
  }

  // Perform the update
  return (prisma as any)[model].update({
    where,
    data: updateData,
    select: finalSelect,
  }) as Promise<UpdateResult<TModel, TField, TSchema>>
}

/**
 * Safe version of updateMetadata that doesn't throw exceptions
 *
 * @param model The prisma model to update
 * @param params Parameters including field name, where clause, schema, and data to merge
 * @returns An object with success status, data or error information
 *
 * @example
 * ```typescript
 * const result = await updateMetadataSafe(
 *   'user',
 *   {
 *     field: 'metadata',
 *     where: { id: 'user-id' },
 *     schema: metadataSchema,
 *     data: { preferences: { theme: 'dark' } }
 *   }
 * );
 *
 * if (result.success) {
 *   console.log('Updated user:', result.data);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export async function updateMetadataSafe<
  TModel extends keyof PrismaClient,
  TField extends string,
  TSchema extends StandardSchemaV1,
>(
  model: TModel,
  params: UpdateParams<TField, TSchema>,
): Promise<SafeUpdateResult<UpdateResult<TModel, TField, TSchema>>> {
  try {
    const result = await updateMetadata(model, params)
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'UNKNOWN_ERROR',
        data: error,
      },
    }
  }
}
