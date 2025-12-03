'use client'

import React, { useEffect } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  VerticalStep,
  VerticalStepContent,
  VerticalStepFooter,
  VerticalStepHeader,
  VerticalStepHeaderDescription,
  VerticalStepHeaderTitle,
  VerticalStepSubmitButton,
} from '@/components/ui/form-step'
import { Input } from '@/components/ui/input'
import {
  SlugInputError,
  SlugInputField,
  SlugInputProvider,
  SlugInputRoot,
} from '@/components/ui/slug-input'
import { type UseFormReturn } from 'react-hook-form'
import { api } from '@/igniter.client'
import { toast } from 'sonner'
import { String } from '@/@saas-boilerplate/utils/string'
import { Url } from '@/@saas-boilerplate/utils/url'

export type OrganizationOnboardingFormCreateTeamStepProps =
  React.HTMLAttributes<HTMLDivElement> & {
    form: UseFormReturn<any, any>
    step: string
    onVerifySlug: (slug: string) => Promise<boolean>
  }

export function OrganizationOnboardingFormCreateTeamStep({
  step,
  form,
  onVerifySlug,
}: OrganizationOnboardingFormCreateTeamStepProps) {
  

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name && value.name.trim()) {
        const slug = String.toSlug(value.name)
        if (slug && slug.trim()) {
          form.setValue('slug', slug, { shouldTouch: true, shouldDirty: true  })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  return (
    <VerticalStep step={step}>
      <VerticalStepHeader>
        <VerticalStepHeaderTitle>
          Configure your workspace
        </VerticalStepHeaderTitle>
        <VerticalStepHeaderDescription>
          Set the name and custom URL for your workspace.
        </VerticalStepHeaderDescription>
      </VerticalStepHeader>

      <VerticalStepContent>
        <div className="merge-form-section">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace name</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: My Awesome Workspace" {...field} />
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
                <FormLabel>URL for your workspace</FormLabel>
                <FormControl>
                  <SlugInputProvider
                    {...field}
                    isTouched={form.formState.touchedFields['slug']}
                    checkSlugExists={onVerifySlug}
                  >
                    <SlugInputRoot>
                      <SlugInputField
                        name="slug"
                        baseURL={Url.get('/pages/')}
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
      </VerticalStepContent>

      <VerticalStepFooter>
        <VerticalStepSubmitButton>Next</VerticalStepSubmitButton>
      </VerticalStepFooter>
    </VerticalStep>
  )
}
