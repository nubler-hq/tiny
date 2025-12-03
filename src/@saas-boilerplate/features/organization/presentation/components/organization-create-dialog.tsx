'use client'

import { useRef, useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { String } from '@/@saas-boilerplate/utils/string'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  SlugInputField,
  SlugInputProvider,
  SlugInputRoot,
  SlugInputError,
} from '@/components/ui/slug-input'
import { ArrowRight } from 'lucide-react'
import { Url } from '@/@saas-boilerplate/utils/url'
import { Switch } from '@/components/ui/switch'

/**
 * Zod schema for organization creation form
 */
const createOrganizationSchema = z.object({
  name: z.string().min(3, 'The bot name must have at least 3 characters'),
  slug: z.string().min(3, 'The link must have at least 3 characters'),
  withDemoData: z.boolean().optional().default(false),
})

/**
 * Props interface for CreateOrganizationDialog component
 */
interface CreateOrganizationDialogProps {
  /** Content to trigger the dialog */
  children: React.ReactNode
  /** Optional callback after successful organization creation */
  onSuccess?: () => void
  /** Controlled open state */
  open?: boolean
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void
}

/**
 * Dialog component for creating a new organization
 *
 * @param props Component props
 * @returns Dialog component for creating organizations
 */
export function CreateOrganizationDialog({
  children,
  onSuccess,
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Mutation for creating a new organization
  const createOrganizationMutation = api.organization.create.useMutation()

  // Form with Zod validation
  const form = useFormWithZod({
    schema: createOrganizationSchema,
    defaultValues: {
      name: '',
      slug: '',
      withDemoData: false,
    },
    onSubmit: async (values) => {
      // Try to create the organization
      const result = await tryCatch(
        createOrganizationMutation.mutate({
          body: {
            name: values.name,
            slug: values.slug,
            withDemoData: values.withDemoData,
          },
        }),
      )

      // Handle result
      if (result.error) {
        toast.error('Error creating workspace', {
          description: 'Please check your data and try again.',
        })
        return
      }

      // Success handling
      toast.success('Workspace created successfully!')

      // Close the dialog
      onOpenChange?.(false)

      // Reset form state
      form.reset()

      // Callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page
      window.location.reload()
    },
  })

  /**
   * Setup effect to auto-generate slug when name changes
   */
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name') {
        const slug = String.toSlug(value.name || '')
        form.setValue('slug', slug, { shouldValidate: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  /**
   * Handler to verify slug availability
   *
   * @param slug - Slug to verify
   * @returns Promise resolving to boolean indicating availability
   */
  const handleVerifySlug = async (slug: string) => {
    try {
      const disponibility = await api.organization.verify.mutate({
        body: { slug },
      })

      if (disponibility.error) {
        console.error('Error checking slug availability')
        return false
      }

      return disponibility.data?.available || false
    } catch (error) {
      console.error('Error checking slug:', error)
      return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div ref={dialogRef}>{children}</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Configure a new organization to manage your operations effectively.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.onSubmit} className="space-y-4">
            <div className="merge-form-section">
              {/* Bot name field */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input placeholder={`Ex: Acme Inc.`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bot URL field */}
              <FormField
                name="slug"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL for your Workspace</FormLabel>
                    <FormControl>
                      <SlugInputProvider
                        {...field}
                        isTouched={form.formState.touchedFields.slug!!}
                        checkSlugExists={handleVerifySlug}
                      >
                        <SlugInputRoot>
                          <SlugInputField
                            name="slug"
                            baseURL={Url.get('/forms/')}
                          />
                          <SlugInputError />
                        </SlugInputRoot>
                      </SlugInputProvider>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Demo data switch field */}
            <FormField
              name="withDemoData"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Create with demo data</FormLabel>
                    <DialogDescription>
                      We will add example data to help you get started.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            onClick={form.onSubmit}
            disabled={form.formState.isSubmitting}
            className="w-full sm:w-auto"
          >
            {form.formState.isSubmitting ? 'Creating...' : 'Create Workspace'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
