import { z } from 'zod'
import type { PluginField } from '../provider.interface'

function unwrapSchema(zodType: z.ZodTypeAny): z.ZodTypeAny {
  while (
    zodType instanceof z.ZodOptional ||
    zodType instanceof z.ZodNullable ||
    zodType instanceof z.ZodDefault
  ) {
    zodType = (zodType as any)._def.innerType
  }
  return zodType
}

export function getTypeFromZod(zodType: z.ZodTypeAny) {
  const unwrapped = unwrapSchema(zodType)
  if (unwrapped instanceof z.ZodString) {
    if (
      unwrapped._def.checks?.some((check: any) => check.def?.format === 'email')
    ) {
      return 'email'
    }

    if (
      unwrapped._def.checks?.some((check: any) => check.def?.format === 'url')
    ) {
      return 'url'
    }

    return 'string'
  }
  if (unwrapped instanceof z.ZodNumber) {
    return 'number'
  }
  if (unwrapped instanceof z.ZodBoolean) {
    return 'boolean'
  }
  if (unwrapped instanceof z.ZodArray) {
    return 'array'
  }
  if (unwrapped instanceof z.ZodObject) {
    return 'object'
  }
  if (unwrapped instanceof z.ZodEnum) {
    return 'enum'
  }
  if (unwrapped instanceof z.ZodDate) {
    return 'date'
  }
}

export function getFieldOptionsFromZodEnum(zodEnum: z.ZodEnum<any>) {
  return Object.values(zodEnum._def.entries)
}

export function getFieldsFromSchema(schema: z.ZodObject<any>) {
  return Object.keys(schema.shape).map((key) => {
    const fieldSchema = schema.shape[key]
    const unwrapped = unwrapSchema(fieldSchema)
    return {
      name: key,
      type: getTypeFromZod(fieldSchema),
      placeholder:
        fieldSchema.meta?.()?.description || unwrapped.meta?.()?.description,
      required:
        !(fieldSchema instanceof z.ZodOptional) &&
        !(fieldSchema instanceof z.ZodNullable),
      default:
        fieldSchema instanceof z.ZodDefault
          ? fieldSchema._def.defaultValue
          : undefined,
      options:
        unwrapped instanceof z.ZodEnum
          ? getFieldOptionsFromZodEnum(unwrapped)
          : undefined,
    }
  }) as PluginField[]
}
