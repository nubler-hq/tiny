'use client'

import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Annotated } from '@/components/ui/annotated'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { Building2Icon, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/igniter.client'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'

export function BillingChangeEmailSection() {
  const auth = useAuth()

  const emailUpdateSchema = z.object({
    metadata: z.object({
      contact: z.object({
        email: z.string().email(),
      }),
    }),
  })

  const form = useFormWithZod({
    schema: emailUpdateSchema,
    defaultValues: {
      metadata: {
        contact: {
          email: auth.session.organization?.metadata.contact?.email || '',
        },
      },
    },
    onSubmit: async (values) => {
      await api.organization.update.mutate({
        body: {
          metadata: values.metadata,
        },
      })

      toast.success('Billing email updated successfully!')
    },
  })

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <Building2Icon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Tax information</Annotated.Title>
        <Annotated.Description>
          This email is used to send important information about your account,
          including invoices and payment notifications.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Form {...form}>
            <form onSubmit={form.onSubmit} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing email</CardTitle>
                  <CardDescription>
                    Keep your email up to date so you don't miss important
                    information about your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="metadata.contact.email"
                    render={({ field }) => (
                      <FormItem variant="unstyled">
                        <FormLabel className="pb-0! mb-1!">
                          Billing email
                        </FormLabel>
                        <FormControl>
                          <Input
                            variant="outline"
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-start space-x-4 border-t pt-6">
                  <Button
                    type="submit"
                    size="sm"
                    onClick={form.onSubmit}
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Updating...' : 'Update'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
