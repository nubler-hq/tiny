'use client'

import * as React from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Annotated } from '@/components/ui/annotated'
import {
  BuildingIcon,
  Globe2Icon,
  LinkedinIcon,
  InstagramIcon,
  YoutubeIcon,
  TwitterIcon,
  FacebookIcon,
} from 'lucide-react'
import { AvatarUploadInput } from '@/components/ui/avatar-upload-input'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { useRouter } from 'next/navigation'

import { OrganizationMetadataSchema } from '../../organization.interface'

// Validation schema definition using Zod
const OrganizationSettingsFormSchema = z.object({
  // Basic details
  name: z.string().min(1, 'Organization name is required'),
  slug: z.string().optional(),
  logo: z.string().optional(),
  metadata: OrganizationMetadataSchema,
})

export function OrganizationSettingsForm() {
  const auth = useAuth()
  const router = useRouter()

  const [showAllSocial, setShowAllSocial] = React.useState(false)

  // Implementation using useFormWithZod instead of useForm directly
  const form = useFormWithZod({
    schema: OrganizationSettingsFormSchema,
    defaultValues: {
      name: auth.session.organization?.name || '',
      slug: auth.session.organization?.slug || '',
      logo: auth.session.organization?.logo || '',
      metadata: auth.session.organization?.metadata || {},
    },
    onSubmit: async (values) => {
      const toastId = toast.loading('Saving...')

      // Using try-catch with the tryCatch utility
      const result = await tryCatch(
        api.organization.update.mutate({
          body: {
            name: values.name,
            logo: values.logo,
            slug: values.slug,
            metadata: values.metadata,
          },
        }),
      )

      // Feedback to the user via toast
      if (result.error) {
        toast.error('Error saving organization information', {
          description: 'Please check your data and try again',
          id: toastId,
        })

        return
      }

      toast.success('Information saved successfully!', {
        id: toastId,
      })
      router.refresh()
    },
  })

  // Array of social media fields for dynamic rendering
  const socialFields = [
    {
      name: 'linkedin' as const,
      label: 'LinkedIn',
      icon: LinkedinIcon,
      placeholder: 'https://linkedin.com/company/your-company',
    },
    {
      name: 'instagram' as const,
      label: 'Instagram',
      icon: InstagramIcon,
      placeholder: 'https://instagram.com/your-company',
    },
    {
      name: 'youtube' as const,
      label: 'YouTube',
      icon: YoutubeIcon,
      placeholder: 'https://youtube.com/@your-company',
    },
    {
      name: 'twitter' as const,
      label: 'X (Twitter)',
      icon: TwitterIcon,
      placeholder: 'https://twitter.com/your-company',
    },
    {
      name: 'facebook' as const,
      label: 'Facebook',
      icon: FacebookIcon,
      placeholder: 'https://facebook.com/your-company',
    },
  ]

  const visibleSocialFields = showAllSocial
    ? socialFields
    : socialFields.slice(0, 3)

  return (
    <Form {...form}>
      <form onSubmit={form.onSubmit} className="space-y-12">
        <Annotated>
          <Annotated.Sidebar>
            <Annotated.Icon>
              <BuildingIcon className="w-4 h-4" />
            </Annotated.Icon>
            <Annotated.Title>Organization details</Annotated.Title>
            <Annotated.Description>
              Basic details about your organization.
            </Annotated.Description>
          </Annotated.Sidebar>
          <Annotated.Content>
            <Annotated.Section>
              <div className="merge-form-section mb-4">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <AvatarUploadInput
                          placeholder="Logo"
                          context="organizations"
                          id={auth.session.organization?.id as string}
                          {...field}
                          onStateChange={async (file) => {
                            const toastId = toast.loading('Uploading...')

                            const result = await tryCatch(
                              api.organization.update.mutate({
                                body: {
                                  logo: file.url,
                                },
                              }),
                            )

                            if (result.error) {
                              toast.error(
                                'Error saving organization information',
                                {
                                  description:
                                    'Please check your data and try again',
                                  id: toastId,
                                },
                              )
                              return
                            }

                            router.refresh()
                            toast.success('Information saved successfully!', {
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
                      <FormLabel>Organization name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="slug"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="acme-inc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@acme-inc.com"
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
                  name="metadata.links.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://acme-inc.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Annotated.Footer>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </Annotated.Footer>
            </Annotated.Section>
          </Annotated.Content>
        </Annotated>

        <Annotated>
          <Annotated.Sidebar>
            <Annotated.Icon>
              <Globe2Icon className="w-4 h-4" />
            </Annotated.Icon>
            <Annotated.Title>Social media</Annotated.Title>
            <Annotated.Description>
              Add links to your organization's social media profiles.
            </Annotated.Description>
          </Annotated.Sidebar>
          <Annotated.Content>
            <Annotated.Section>
              <div className="merge-form-section">
                {visibleSocialFields.map((social) => (
                  <FormField
                    control={form.control}
                    key={social.name}
                    name={`metadata.links.${social.name}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <social.icon className="w-4 h-4" />
                          {social.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder={social.placeholder}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="link"
                onClick={() => setShowAllSocial(!showAllSocial)}
                className="mt-4!"
              >
                {showAllSocial ? 'Show less...' : 'Show more...'}
              </Button>

              <Annotated.Footer>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </Annotated.Footer>
            </Annotated.Section>
          </Annotated.Content>
        </Annotated>
      </form>
    </Form>
  )
}
