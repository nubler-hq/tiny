'use client'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Loader2Icon,
  XIcon,
} from 'lucide-react'
import { Button } from './button'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { z } from 'zod'
import * as React from 'react'
import type { Path } from '@igniter-js/core'
import type { UseFormReturn } from 'react-hook-form'

/**
 * Represents a step in a multi-step form
 */
type Step<TSchema extends z.ZodObject> = {
  id: string
  fields: Array<Path<z.TypeOf<TSchema>>>
  validate?: (values: z.TypeOf<TSchema>) => Promise<boolean> | boolean
}

interface VerticalStepState<TSchema extends z.ZodObject> {
  id: string
  status: 'valid' | 'invalid' | 'pending' | 'validating'
  fields: Array<Path<z.TypeOf<TSchema>>>
  errors: string[]
}

interface FormStepsContextValue<
  TForm extends UseFormReturn<any>,
  TSchema extends z.ZodObject,
  TSteps extends Record<string, Step<TSchema>>,
> {
  // @ts-expect-error Expose form state
  state: Record<keyof TSteps, VerticalStepState<TForm>>
  // @ts-expect-error Expose form state
  currentStep: VerticalStepState<TForm>
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean

  goToNextStep: () => Promise<void>
  goToPrevStep: () => void
  goToStep: (step: keyof TSteps) => void

  form: TForm
}

const FormStepsContext = React.createContext<
  FormStepsContextValue<any, any, any> | undefined
>(undefined)

function useFormSteps<
  TForm extends UseFormReturn<any>,
  TSchema extends z.ZodObject,
  TSteps extends Record<string, Step<TSchema>>,
>() {
  const context = React.useContext(FormStepsContext)
  if (!context) {
    throw new Error('useFormSteps must be used within a VerticalStepForm')
  }
  return context as FormStepsContextValue<TForm, TSchema, TSteps>
}

interface VerticalStepFormProps<
  TForm extends UseFormReturn<any>,
  TSchema extends z.ZodObject,
  TSteps extends Record<string, Step<TSchema>>,
> extends React.HTMLAttributes<HTMLDivElement> {
  form: TForm
  schema: TSchema
  initialStep?: keyof TSteps
  steps: TSteps
}

/**
 * A form component that displays steps vertically with validation and navigation
 */
const VerticalStepForm = <
  TForm extends UseFormReturn<any>,
  TSchema extends z.ZodObject,
  TSteps extends Record<string, Step<TSchema>>,
>({
  children,
  form,
  initialStep,
  steps,
}: VerticalStepFormProps<TForm, TSchema, TSteps>) => {
  const initialStepKey = initialStep || (Object.keys(steps)[0] as keyof TSteps)

  const [state, setState] = React.useState<
    Record<keyof TSteps, VerticalStepState<TSchema>>
  >(() => {
    const state = {} as Record<keyof TSteps, VerticalStepState<TSchema>>

    Object.keys(steps).forEach((stepKey) => {
      state[stepKey as keyof TSteps] = {
        id: stepKey,
        fields: steps[stepKey as string].fields,
        status: 'pending',
        errors: [],
      }
    })

    return state
  })

  const [currentStep, setCurrentStep] = React.useState(state[initialStepKey])

  const totalSteps = Object.keys(steps).length
  const currentStepIndex = Object.keys(steps).indexOf(currentStep.id)

  // Business Rule: Validate step fields and update state
  async function handleValidateStep(stepKey: keyof TSteps): Promise<boolean> {
    const step = steps[stepKey]
    const stepState = state[stepKey]

    // Business Rule: Update step status to validating
    handleUpdateStepState(stepKey, { status: 'validating' })

    try {
      const errors: string[] = []

      // Business Rule: Validate each field in the step
      for (const field of stepState.fields) {
        // Business Rule: Mark field as touched
        const fieldState = form.getFieldState(field)

        if (fieldState.invalid && fieldState.error?.message) {
          errors.push(...fieldState.error.message)
        }
      }

      // Business Rule: Run custom step validation if provided
      if (step.validate) {
        const isValid = await step.validate(form.getValues())
        if (!isValid) {
          errors.push('Custom validation failed')
        }
      }

      // Business Rule: Update step state based on validation results
      handleUpdateStepState(stepKey, {
        status: errors.length === 0 ? 'valid' : 'invalid',
        errors,
      })

      return errors.length === 0
    } catch (error) {
      // Business Rule: Handle validation errors
      handleUpdateStepState(stepKey, {
        status: 'invalid',
        errors: [error instanceof Error ? error.message : 'Validation failed'],
      })
      return false
    }
  }

  function handleGetStepByIndex(index: number) {
    const stepKey = Object.keys(state)[index] as keyof TSteps
    return state[stepKey]
  }

  function handleUpdateStepState(
    stepKey: keyof TSteps,
    update: Partial<VerticalStepState<TSchema>>,
  ) {
    setState((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], ...update },
    }))

    if (stepKey === currentStep.id) {
      setCurrentStep((prev) => ({ ...prev, ...update }))
    }
  }

  // Business Rule: Navigate to next step after validation
  const goToNextStep = React.useCallback(async () => {
    if (state[currentStep.id].status === 'validating') return

    const isValid = await handleValidateStep(currentStep.id)
    if (!isValid) return

    if (currentStepIndex < totalSteps - 1) {
      const nextStep = Object.keys(steps)[currentStepIndex + 1] as keyof TSteps
      goToStep(nextStep)
    }
  }, [currentStep.id, currentStepIndex, totalSteps, steps])

  const goToPrevStep = React.useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = Object.keys(steps)[currentStepIndex - 1] as keyof TSteps
      goToStep(prevStep)
    }
  }, [currentStepIndex])

  const goToStep = React.useCallback(
    (stepKey: keyof TSteps) => {
      setCurrentStep(state[stepKey])
    },
    [state],
  )

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextStep()
      if (e.key === 'ArrowLeft') goToPrevStep()
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [goToNextStep, goToPrevStep])

  return (
    <FormStepsContext.Provider
      value={{
        currentStep,
        totalSteps,
        goToNextStep,
        goToPrevStep,
        // @ts-expect-error Expose goToStep
        goToStep,
        state,
        isFirstStep: currentStepIndex === 0,
        isLastStep: currentStepIndex === totalSteps - 1,
        form,
      }}
    >
      <div className="h-full w-full px-1 -mx-1">
        <AnimatePresence mode="wait">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {React.Children.map(children, (child, index) => (
              <div key={index} className="flex items-start">
                <div
                  className={cn(
                    'mr-4 flex lg:size-10 size-8 items-center justify-center rounded-full border relative z-10',
                    'transition-colors duration-200 bg-background',
                    index === currentStepIndex && 'border-primary/40',
                    index < currentStepIndex && 'border-primary/20',
                    index > currentStepIndex && 'border-muted',
                    handleGetStepByIndex(index).status === 'invalid' &&
                      'border-destructive text-destructive',
                    handleGetStepByIndex(index).status === 'pending' &&
                      'border-muted',
                  )}
                >
                  {index < currentStepIndex &&
                    handleGetStepByIndex(index).status === 'valid' && (
                      <Check className="lg:size-4 size-3" />
                    )}
                  {handleGetStepByIndex(index).status === 'invalid' && (
                    <XIcon className="lg:size-4 size-3" />
                  )}
                  {handleGetStepByIndex(index).status === 'validating' && (
                    <Circle className="lg:size-4 size-3 animate-spin" />
                  )}
                  {(index >= currentStepIndex ||
                    handleGetStepByIndex(index).status === 'pending') && (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <motion.div
                  className="flex-1"
                  initial={false}
                  transition={{ duration: 0.15 }}
                  animate={{
                    opacity: index === currentStepIndex ? 1 : 0.5,
                    scale: index === currentStepIndex ? 1 : 0.98,
                  }}
                >
                  {child}
                </motion.div>
                {index < React.Children.count(children) - 1 && (
                  <motion.div
                    className="absolute lg:left-5 left-4 w-[2px] bg-border dark:bg-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: index * 0.1 }}
                    style={{
                      top: `${index * 80 + 40}px`,
                      height: 'calc(100% - 20px)',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <motion.div
                      className="absolute top-0 left-0 w-full bg-primary dark:bg-primary/20"
                      initial={{ height: '0%', opacity: 0 }}
                      animate={{
                        height: `${Math.min((currentStepIndex - index) * 100, 100)}%`,
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0,
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 w-full h-full bg-primary/20"
                        animate={{
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </FormStepsContext.Provider>
  )
}

VerticalStepForm.displayName = 'VerticalStepForm'

interface VerticalStepProps<TActionFormSteps extends Record<string, Step<any>>>
  extends React.HTMLAttributes<HTMLDivElement> {
  step: keyof TActionFormSteps
}
const VerticalStep = React.forwardRef<
  HTMLDivElement,
  VerticalStepProps<Record<string, Step<any>>>
>(({ className, children, step, ...props }, ref) => {
  const { currentStep } = useFormSteps()

  const isActive = step === currentStep.id

  return (
    <div ref={ref} className={cn('h-full', className)} {...props}>
      {React.Children.toArray(children).filter(
        (child) =>
          !React.isValidElement(child) ||
          (child.type !== VerticalStepContent &&
            child.type !== VerticalStepFooter),
      )}
      {isActive && (
        <>
          <div className="mt-4">
            {React.Children.toArray(children).find(
              (child) =>
                React.isValidElement(child) &&
                child.type === VerticalStepContent,
            )}
          </div>
          <div className="mt-8">
            {React.Children.toArray(children).find(
              (child) =>
                React.isValidElement(child) &&
                child.type === VerticalStepFooter,
            )}
          </div>
        </>
      )}
    </div>
  )
})
VerticalStep.displayName = 'VerticalStep'

const VerticalStepHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mb-4', className)} {...props} />
))
VerticalStepHeader.displayName = 'VerticalStepHeader'

const VerticalStepHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-sm font-semibold text-foreground dark:text-foreground',
      className,
    )}
    {...props}
  />
))
VerticalStepHeaderTitle.displayName = 'VerticalStepHeaderTitle'

const VerticalStepHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-muted-foreground dark:text-muted-foreground',
      className,
    )}
    {...props}
  />
))
VerticalStepHeaderDescription.displayName = 'VerticalStepHeaderDescription'

const VerticalStepContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4', className)} {...props} />
))
VerticalStepContent.displayName = 'VerticalStepContent'

const VerticalStepFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex space-x-4', className)} {...props} />
))
VerticalStepFooter.displayName = 'VerticalStepFooter'

interface VerticalStepButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onCustomClick?: () => void
}

const VerticalStepPreviousButton = React.forwardRef<
  HTMLButtonElement,
  VerticalStepButtonProps
>(({ className, onCustomClick, ...props }, ref) => {
  const { goToPrevStep, isFirstStep } = useFormSteps()

  return (
    <Button
      ref={ref}
      variant="outline"
      onClick={() => {
        goToPrevStep()
        onCustomClick?.()
      }}
      disabled={isFirstStep}
      className={cn('', className)}
      {...props}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Previous
    </Button>
  )
})
VerticalStepPreviousButton.displayName = 'VerticalStepPreviousButton'
const VerticalStepSubmitButton = React.forwardRef<
  HTMLButtonElement,
  VerticalStepButtonProps
>(({ className, onCustomClick, children, ...props }, ref) => {
  const { goToNextStep, isLastStep, currentStep, form } = useFormSteps()

  // Business Rule: Handle form submission on last step or navigate to next step
  const handleClick = async () => {
    await goToNextStep()
    onCustomClick?.()
  }

  return (
    <Button
      ref={ref}
      type={isLastStep ? 'submit' : 'button'}
      onClick={isLastStep ? undefined : handleClick}
      disabled={
        form.formState.isSubmitting || currentStep.status === 'validating'
      }
      className={cn('', className)}
      {...props}
    >
      {currentStep.status === 'validating' && (
        <span className="flex items-center gap-2">
          <Circle className="size-4 animate-spin" />
          Validating...
        </span>
      )}

      {form.formState.isSubmitting && currentStep.status !== 'validating' && (
        <span className="flex items-center gap-2">
          <Loader2Icon className="size-4 animate-spin" />
          Loading...
        </span>
      )}

      {currentStep.status !== 'validating' && !form.formState.isSubmitting && (
        <>
          {isLastStep ? (
            children || 'Finish'
          ) : (
            <span className="flex items-center gap-2">
              Next
              <ChevronRight className="size-4" />
            </span>
          )}
        </>
      )}
    </Button>
  )
})
VerticalStepSubmitButton.displayName = 'VerticalStepSubmitButton'

export {
  useFormSteps,
  VerticalStep,
  VerticalStepContent,
  VerticalStepFooter,
  VerticalStepForm,
  VerticalStepHeader,
  VerticalStepHeaderDescription,
  VerticalStepHeaderTitle,
  VerticalStepPreviousButton,
  VerticalStepSubmitButton,
}
