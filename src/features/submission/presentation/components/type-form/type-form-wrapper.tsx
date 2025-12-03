'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { TypeFormQuestion } from './type-form-question'
import { TypeFormProgress } from './type-form-progress'
import { TypeFormSuccess } from './type-form-success'

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select'
  question: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface TypeFormWrapperProps {
  formTitle: string
}

export function TypeFormWrapper({ formTitle }: TypeFormWrapperProps) {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mutation for submitting the form
  const submitForm = api.submission.create.useMutation()

  // Form fields configuration - in a real app, this would be fetched from an API
  const formFields: FormField[] = [
    {
      id: 'name',
      type: 'text',
      question: 'What is your name?',
      placeholder: 'Type your full name',
      required: true,
    },
    {
      id: 'email',
      type: 'email',
      question: 'What is your email address?',
      placeholder: 'example@domain.com',
      required: true,
    },
    {
      id: 'phone',
      type: 'phone',
      question: 'What is your phone number?',
      placeholder: '(00) 00000-0000',
      required: false,
    },
    {
      id: 'message',
      type: 'textarea',
      question: 'Is there anything else you would like to tell us?',
      placeholder: 'Type your message here...',
      required: false,
    },
  ]

  // Scroll to top when currentQuestionIndex changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentQuestionIndex])

  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  // Handle moving to the next question
  const handleNextQuestion = () => {
    const currentField = formFields[currentQuestionIndex]
    const currentValue = formData[currentField.id]

    // Validate required fields
    if (
      currentField.required &&
      (!currentValue || currentValue.trim() === '')
    ) {
      toast.error(`${currentField.question} is required.`)
      return
    }

    if (currentQuestionIndex < formFields.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      await submitForm.mutate({
        body: {
          email: formData.email,
          name: formData.name,
          phone: formData.phone || null,
          metadata: {
            source: 'default-form',
            data: formData,
          },
        },
      })

      setIsCompleted(true)
      toast.success('Form submitted successfully!')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(
        'An error occurred while submitting your form. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNextQuestion()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Form header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{formTitle}</h1>
        <p className="text-muted-foreground">
          Press{' '}
          <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter ↵</kbd> to
          continue
        </p>
      </div>

      {/* Progress bar */}
      <TypeFormProgress
        currentStep={currentQuestionIndex + 1}
        totalSteps={formFields.length}
      />

      {/* Question container */}
      <div className="w-full max-w-xl mx-auto min-h-[60vh] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <TypeFormSuccess />
          ) : (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <TypeFormQuestion
                field={formFields[currentQuestionIndex]}
                value={formData[formFields[currentQuestionIndex].id] || ''}
                onChange={(value) =>
                  handleFieldChange(formFields[currentQuestionIndex].id, value)
                }
                onNext={handleNextQuestion}
                isLast={currentQuestionIndex === formFields.length - 1}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      {!isCompleted && (
        <div className="mt-8 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
