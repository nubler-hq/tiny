'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDisclosure } from '@/@saas-boilerplate/hooks/use-disclosure'
import { api } from '@/igniter.client'
import { Lead } from '../../lead.interface'
import { useRouter } from 'next/navigation'
import { PhoneInput } from '@/components/ui/phone-input'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

interface LeadUpsertSheetProps {
  lead?: Lead
  triggerButton?: React.ReactNode
  onSuccess?: () => void
}

export function LeadUpsertSheet({
  lead,
  triggerButton,
  onSuccess,
}: LeadUpsertSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { refresh } = useRouter()

  const isEditMode = !!lead

  const form = useFormWithZod({
    schema: formSchema,
    defaultValues: {
      email: lead?.email || '',
      name: lead?.name || '',
      phone: lead?.phone || '',
      notes:
        lead?.metadata &&
        typeof lead.metadata === 'object' &&
        lead.metadata !== null &&
        'notes' in lead.metadata &&
        typeof lead.metadata.notes === 'string'
          ? lead.metadata.notes
          : '',
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true)

        const metadata = {
          notes: values.notes,
        }

        if (isEditMode) {
          const response = await api.lead.update.mutate({
            body: {
              email: values.email,
              name: values.name,
              phone: values.phone,
              metadata,
            },
            params: {
              id: lead.id,
            },
          })

          if (response.error) {
            toast.error('Failed to update lead')
            return
          }

          toast.success('Lead updated successfully')
        } else {
          const response = await api.lead.create.mutate({
            body: {
              email: values.email,
              name: values.name,
              phone: values.phone,
              metadata,
            },
          })

          if (response.error) {
            toast.error('Failed to save lead')
            return
          }

          toast.success('Lead added successfully')
        }

        form.reset()
        onClose()
        refresh()

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to save lead')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="link" size="sm" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add lead
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Lead' : 'Add New Lead'}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? 'Update lead information in your CRM.'
              : 'Add a new lead to your CRM database.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.onSubmit} className="merge-form-section flex-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="+1 (555) 000-0000"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this lead..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="flex flex-col h-full pb-6 items-end">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update lead'
                    : 'Add lead'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
