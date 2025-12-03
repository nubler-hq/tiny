'use client'

import * as React from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Annotated } from '@/components/ui/annotated'
import { UserIcon } from 'lucide-react'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { PhoneInput } from '@/components/ui/phone-input'
import { AvatarUploadInput } from '@/components/ui/avatar-upload-input'
import { useRouter } from 'next/navigation'
import { UserMetadataSchema } from '../../user.interface'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'

const userSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().optional(),
  email: z.string().email('Invalid email'),
  metadata: UserMetadataSchema,
})

export function UserBaseInfoSettingsForm() {
  const auth = useAuth()
  const router = useRouter()

  const form = useFormWithZod({
    schema: userSettingsSchema,
    defaultValues: {
      name: auth.session.user.name || '',
      image: auth.session.user.image || '',
      email: auth.session.user.email,
      metadata: auth.session.user.metadata,
    },
    onSubmit: async (values) => {
      const toastId = toast.loading('Saving...')

      const result = await tryCatch(
        api.user.update.mutate({
          body: {
            name: values.name,
            image: values.image,
            metadata: values.metadata,
          },
        }),
      )

      if (result.error) {
        toast.error('Error saving user information', {
          description: 'Please check your data and try again',
          id: toastId,
        })

        return
      }

      router.refresh()

      toast.success('Information saved successfully!', {
        id: toastId,
      })
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.onSubmit} className="space-y-12">
        <Annotated>
          <Annotated.Sidebar>
            <Annotated.Icon>
              <UserIcon className="w-4 h-4" />
            </Annotated.Icon>
            <Annotated.Title>Personal information</Annotated.Title>
            <Annotated.Description>
              Basic details about your account.
            </Annotated.Description>
          </Annotated.Sidebar>
          <Annotated.Content>
            <Annotated.Section>
              <div className="merge-form-section mb-4">
                <FormField
                  name="image"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile photo</FormLabel>
                      <FormControl>
                        <AvatarUploadInput
                          {...field}
                          id={auth.session.user.id}
                          context="users"
                          onStateChange={async (file) => {
                            const toastId = toast.loading('Uploading...')

                            const result = await tryCatch(
                              api.user.update.mutate({
                                body: {
                                  image: file.url,
                                },
                              }),
                            )

                            if (result.error) {
                              toast.error('Ops! Something went wrong', {
                                description:
                                  'Please try upload your profile photo again',
                                id: toastId,
                              })

                              return
                            }

                            router.refresh()
                            toast.success('Profile photo saved successfully!', {
                              id: toastId,
                            })
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="merge-form-section">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@doe.com"
                          readOnly
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Email cannot be changed. Contact support for more
                        information.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          type="tel"
                          placeholder="(000) 000-0000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Annotated.Footer>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
              </Annotated.Footer>
            </Annotated.Section>
          </Annotated.Content>
        </Annotated>
      </form>
    </Form>
  )
}
