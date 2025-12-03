import { useState } from 'react'
import type { Path, UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

/**
 * Represents a step in a multi-step form
 */
type Step<TFieldValues> = {
  id: string
  fields: Array<Path<TFieldValues>>
}
/**
 * Custom hook to manage multi-step form validation
 * @param form - React Hook Form instance
 * @param schema - Zod schema for form validation
 * @param steps - Array of form steps with fields to validate
 */
export function useSteps<
  TSchema extends z.ZodObject<any, any>,
  TFieldValues extends z.infer<TSchema>,
>({
  form,
  schema,
  steps,
}: {
  form: UseFormReturn<any>
  schema: TSchema
  steps: Step<TFieldValues>[]
}) {
  const [currentStep, setCurrentStep] = useState(0)

  // Business Rule: Validate only the fields defined for the current step
  function validateStep(step: number) {
    // Business Rule: Get the fields for the current step
    const stepFields = steps[step].fields

    // Business Rule: Initialize an array to store invalid fields
    const invalidFields: string[] = []

    // Business Rule: Get the form data
    const formData = form.getValues()

    // Business Rule: Validate the form data against the step schema
    for (const field of stepFields) {
      // Business Rule: Split the field path to handle nested objects
      const fieldPath = field.split('.')

      let fieldValue = formData
      let currentSchema = schema

      // Business Rule: Navigate through nested objects to get the value
      for (const key of fieldPath) {
        fieldValue = fieldValue?.[key]
      }

      // Business Rule: Navigate through schema to get correct validation
      for (let i = 0; i < fieldPath.length; i++) {
        const key = fieldPath[i]

        // Business Rule: Handle optional/nullable wrappers
        let shape = currentSchema?.shape?.[key]
        while (
          shape?._def?.typeName === 'ZodOptional' ||
          shape?._def?.typeName === 'ZodNullable'
        ) {
          shape = shape._def.innerType
        }

        // Business Rule: Get inner schema for objects
        if (shape?._def?.typeName === 'ZodObject') {
          currentSchema = shape
        } else {
          // Business Rule: Found the leaf schema, use it for validation
          const result = shape?.safeParse(fieldValue)

          if (!result?.success) {
            form.setError(field, {
              message: result?.error?.errors?.[0]?.message || 'Invalid field',
            })
            invalidFields.push(field)
          } else {
            form.clearErrors(field)
          }
          break
        }
      }
    }

    // Business Rule: Return true if all fields are valid
    return invalidFields.length === 0
  }

  return { currentStep, setCurrentStep, validateStep }
}
