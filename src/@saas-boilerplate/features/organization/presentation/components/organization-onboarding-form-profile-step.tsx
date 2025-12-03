'use client'

import React from 'react'
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
  VerticalStepPreviousButton,
  VerticalStepSubmitButton,
} from '@/components/ui/form-step'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { UseFormReturn } from 'react-hook-form'

export type OrganizationOnboardingFormProfileStepProps =
  React.HTMLAttributes<HTMLDivElement> & {
    form: UseFormReturn<any>
    step: string
  }

export function OrganizationOnboardingFormProfileStep(
  props: OrganizationOnboardingFormProfileStepProps,
) {
  return (
    <VerticalStep step={props.step}>
      <VerticalStepHeader>
        <VerticalStepHeaderTitle>
          Tell us a bit about yourself
        </VerticalStepHeaderTitle>
        <VerticalStepHeaderDescription>
          We need some basic information to set up your profile.
        </VerticalStepHeaderDescription>
      </VerticalStepHeader>

      <VerticalStepContent>
        <div className="merge-form-section">
          <FormField
            name="owner.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="owner.metadata.contact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Enter your phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="owner.metadata.extra.referral_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did you hear about us?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      {
                        label: 'Google',
                        value: 'google',
                      },
                      {
                        label: 'Facebook',
                        value: 'facebook',
                      },
                      {
                        label: 'LinkedIn',
                        value: 'linkedin',
                      },
                      {
                        label: 'Other',
                        value: 'other',
                      },
                    ].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </VerticalStepContent>

      <VerticalStepFooter>
        <VerticalStepPreviousButton />
        <VerticalStepSubmitButton>Next</VerticalStepSubmitButton>
      </VerticalStepFooter>
    </VerticalStep>
  )
}
