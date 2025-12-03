'use client'

import * as React from 'react'
import { z } from 'zod'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Annotated } from '@/components/ui/annotated'
import { Switch } from '@/components/ui/switch'
import { BellIcon } from 'lucide-react'
import { useNotifications } from '@/@saas-boilerplate/features/notification/presentation/hooks/use-notifications'

export function UserNotificationSettingsForm() {
  const {
    userPreferences,
    isLoadingUserPreferences,
    updateNotificationPreferences,
    isUpdatingPreferences,
  } = useNotifications()

  const form = useFormWithZod({
    mode: 'onChange',
    schema: z.object({
      preferences: z.record(
        z.string(),
        z.object({
          inApp: z.boolean(),
          email: z.boolean(),
        }),
      ),
    }),
    defaultValues: {
      preferences: userPreferences.reduce(
        (acc, type) => {
          acc[type.type] = type.preferences
          return acc
        },
        {} as Record<string, { inApp: boolean; email: boolean }>,
      ),
    },
    onSubmit: async (values) => {
      try {
        await updateNotificationPreferences(values.preferences)
      } catch (error) {
        // Error handling is already done in the hook
      }
    },
  })

  const renderNotifications = () => {
    if (isLoadingUserPreferences) {
      return (
        <div className="py-4">
          <div className="animate-pulse space-y-4">
            <div className="space-y-3">
              {[1, 2, 3, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (userPreferences.length === 0) return null

    return (
      <div className="space-y-4">
        {userPreferences.map((preference) => (
          <div
            key={preference.type}
            className="flex flex-col space-y-4 rounded-lg text-sm border p-4 mb-4 last:mb-0"
          >
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium">{preference.help}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`preferences.${preference.type}.inApp`}
                render={() => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg text-sm border p-2 space-y-0">
                    <FormLabel className="text-xs">In-App</FormLabel>
                    <FormControl>
                      <Switch
                        checked={true} // Always enabled
                        disabled={true} // Read-only
                        className="opacity-60"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`preferences.${preference.type}.email`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg text-sm border p-2 space-y-0">
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.onSubmit} className="space-y-12 relative">
        <Annotated>
          <Annotated.Sidebar>
            <Annotated.Icon>
              <BellIcon className="w-4 h-4" />
            </Annotated.Icon>
            <Annotated.Title>Notification Preferences</Annotated.Title>
            <Annotated.Description>
              Manage how you receive email notifications. In-app notifications
              are always enabled.
            </Annotated.Description>
          </Annotated.Sidebar>
          <Annotated.Content>{renderNotifications()}</Annotated.Content>
          <Annotated.Footer>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPreferences}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {isUpdatingPreferences ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </Annotated.Footer>
        </Annotated>
      </form>
    </Form>
  )
}
