'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from './type-form-wrapper'

interface TypeFormQuestionProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  onNext: () => void
  isLast: boolean
  isSubmitting: boolean
}

export function TypeFormQuestion({
  field,
  value,
  onChange,
  onNext,
  isLast,
  isSubmitting,
}: TypeFormQuestionProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  // Auto-focus on the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [field.id])

  // Render the appropriate input based on field type
  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={field.type}
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg py-6 px-4 bg-background/50 border-primary/20 focus-visible:ring-primary"
            autoComplete={field.type === 'email' ? 'email' : 'name'}
          />
        )

      case 'phone':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="tel"
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg py-6 px-4 bg-background/50 border-primary/20 focus-visible:ring-primary"
            autoComplete="tel"
          />
        )

      case 'textarea':
        return (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg py-4 px-4 min-h-[150px] bg-background/50 border-primary/20 focus-visible:ring-primary"
            rows={5}
          />
        )

      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="text-lg py-6 px-4 bg-background/50 border-primary/20 focus:ring-primary">
              <SelectValue
                placeholder={field.placeholder || 'Select an option'}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-medium mb-4">{field.question}</h2>
      {renderInput()}

      <div className="flex justify-end mt-6">
        <Button
          onClick={onNext}
          size="lg"
          disabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLast ? 'Submitting...' : 'Processing...'}
            </>
          ) : (
            <>
              {isLast ? 'Submit' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
