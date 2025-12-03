'use client'

import { useFormContext } from 'react-hook-form'
import { format } from 'date-fns'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'
import { Input } from './input'
import { Textarea } from './textarea'
import { Checkbox } from './checkbox'
import { Switch } from './switch'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Button } from './button'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { PluginField } from '@/@saas-boilerplate/providers/plugin-manager/provider.interface'

/**
 * Type representing field metadata for form fields
 */
type FormFieldMeta = {
  label?: string
  description?: string
  placeholder?: string
  component?:
    | 'input'
    | 'textarea'
    | 'checkbox'
    | 'switch'
    | 'select'
    | 'radio'
    | 'date'
    | string
  options?: { label: string; value: string }[]
  className?: string
  rows?: number
  required?: boolean
}

type ComponentType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'textarea'
  | 'email'
  | 'url'
  | 'enum'
  | 'enum[]'

const componentMap: Record<ComponentType, string> = {
  string: 'input',
  number: 'input',
  boolean: 'checkbox',
  date: 'date',
  textarea: 'textarea',
  email: 'input',
  url: 'input',
  enum: 'radio',
  'enum[]': 'select',
}

/**
 * Function to determine the appropriate form field component based on PluginField type
 */
function determineFieldComponent(
  field: PluginField,
  override?: Partial<FormFieldMeta>,
): string {
  if (override?.component) {
    return override.component
  }

  return componentMap[field.type as ComponentType] || 'input'
}

/**
 * Check if a schema is optional
 */
function isOptionalSchema(field: PluginField): boolean {
  return !field.required
}

/**
 * Props for the FormSchemaField component
 */
interface FormSchemaFieldProps {
  name: string
  field: PluginField
  overrides?: FormFieldMeta
}

function FormSchemaField({
  name,
  field,
  overrides = {},
}: FormSchemaFieldProps) {
  const component = determineFieldComponent(field, overrides)
  const { control } = useFormContext()

  const options = overrides.options

  // Determine if field is optional
  const isOptional = isOptionalSchema(field)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: formField }) => {
        return (
          <FormItem className={overrides.className}>
            {(overrides.label || field.name) && (
              <FormLabel>
                {overrides.label || field.name}
                {!isOptional && overrides.required !== false && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FormLabel>
            )}

            {component === 'input' && (
              <FormControl>
                <Input
                  placeholder={overrides.placeholder || field.placeholder}
                  type={
                    field.type === 'number'
                      ? 'number'
                      : field.type === 'email'
                        ? 'email'
                        : field.type === 'url'
                          ? 'url'
                          : 'text'
                  }
                  {...formField}
                  value={formField.value ?? ''}
                  onChange={(e) => {
                    const value =
                      field.type === 'number'
                        ? e.target.valueAsNumber
                        : e.target.value
                    formField.onChange(value)
                  }}
                />
              </FormControl>
            )}

            {component === 'textarea' && (
              <FormControl>
                <Textarea
                  placeholder={overrides.placeholder}
                  rows={overrides.rows || 4}
                  {...formField}
                  value={formField.value ?? ''}
                />
              </FormControl>
            )}

            {component === 'checkbox' && (
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={!!formField.value}
                    onCheckedChange={formField.onChange}
                  />
                  {overrides.placeholder && (
                    <span className="text-sm text-muted-foreground">
                      {overrides.placeholder}
                    </span>
                  )}
                </div>
              </FormControl>
            )}

            {component === 'switch' && (
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!!formField.value}
                    onCheckedChange={formField.onChange}
                  />
                  {overrides.placeholder && (
                    <span className="text-sm text-muted-foreground">
                      {overrides.placeholder}
                    </span>
                  )}
                </div>
              </FormControl>
            )}

            {component === 'radio' && options && (
              <FormControl>
                <RadioGroup
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  className="flex flex-col space-y-1"
                >
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`${name}-${option.value}`}
                      />
                      <label
                        htmlFor={`${name}-${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {component === 'select' && options && (
              <FormControl>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={overrides.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            )}

            {component === 'date' && (
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !formField.value && 'text-muted-foreground',
                      )}
                    >
                      {formField.value ? (
                        format(new Date(formField.value), 'PPP')
                      ) : (
                        <span>{overrides.placeholder || 'Pick a date'}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formField.value ? new Date(formField.value) : undefined
                      }
                      onSelect={formField.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            )}

            {overrides.description && (
              <FormDescription>{overrides.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

interface FormSchemaProps {
  fields: Array<PluginField>
  fieldOverrides?: Record<string, FormFieldMeta>
  excludeFields?: string[]
  className?: string
  children?: React.ReactNode
}

export function FormSchema({
  fields,
  fieldOverrides = {},
  excludeFields = [],
  className,
  children,
}: FormSchemaProps) {
  const filteredFields = fields.filter(
    (field) => !excludeFields.includes(field.name),
  )

  return (
    <div className={cn('merge-form-section', className)}>
      {filteredFields.map((field) => (
        <FormSchemaField
          key={field.name}
          name={field.name}
          field={field} // Pass the entire field object
          overrides={fieldOverrides[field.name]}
        />
      ))}
      {children}
    </div>
  )
}

export { FormSchemaField }
