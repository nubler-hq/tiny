'use client'

import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'
import { LoaderIcon } from '@/components/ui/loader-icon'
import { Switch } from '@/components/ui/switch'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import { api } from '@/igniter.client'
import { toast } from 'sonner'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const createApiKeySchema = z.object({
  description: z.string().min(1, 'Description is required'),
  neverExpires: z.boolean().default(false),
  expiresAt: z.date().optional().nullable(),
})

interface CreateApiKeyModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function CreateApiKeyModal({
  open,
  onOpenChange,
  children,
}: CreateApiKeyModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen
  const router = useRouter()

  const form = useFormWithZod({
    schema: createApiKeySchema,
    defaultValues: {
      description: '',
      neverExpires: false,
      expiresAt: null,
    },
    onSubmit: async (values) => {
      // Implementing error handling with tryCatch
      const result = await tryCatch(
        api.apiKey.create.mutate({
          body: {
            description: values.description,
            expiresAt: values.neverExpires ? null : values.expiresAt,
          },
        }),
      )

      // Adding user feedback with toast
      if (result.error) {
        toast.error('Error creating API key', {
          description: 'Please check your data and try again.',
        })
        return
      }

      toast.success('API key created successfully!')
      router.refresh()
      if (handleOpenChange) {
        handleOpenChange(false)
      }
    },
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (handleOpenChange) {
          handleOpenChange(open)
        }
        if (!open) {
          form.reset()
        }
      }}
    >
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.onSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate an API key to authenticate with external services.
              </DialogDescription>
            </DialogHeader>

            <div className="merge-form-section">
              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g: Production API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="neverExpires"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <FormLabel>Never expires</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch('neverExpires') && (
                <FormField
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires on</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                          value={
                            field.value
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create API Key'}
                <LoaderIcon
                  icon={ArrowRightIcon}
                  isLoading={form.formState.isSubmitting}
                  className="w-4 h-4 ml-2"
                />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
