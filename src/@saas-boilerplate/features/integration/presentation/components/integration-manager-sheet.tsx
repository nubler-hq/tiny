'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import type { Integration } from '../../integration.interface'
import { IntegrationLogo } from './integration-logo'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2Icon, Loader2, SaveIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { FormSchema } from '@/components/ui/form-schema'
import { z } from 'zod'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/**
 * Props interface for IntegrationManagerSheet component
 */
interface IntegrationManagerSheetProps {
  /** Integration to install */
  integration: Integration
  /** Optional callback after successful installation */
  onSuccess?: () => void
  /** Content to trigger the sheet (optional) */
  children?: React.ReactNode
}

/**
 * Component that provides a "sheet" UI for installing an integration
 * Uses FormSchema to automatically generate form fields from the integration schema
 *
 * @param props Component props
 * @returns Sheet component for integration installation
 */
export function IntegrationManagerSheet({
  integration,
  onSuccess,
  children,
}: IntegrationManagerSheetProps) {
  const router = useRouter()
  const sheetTriggerRef = useRef<HTMLDivElement>(null)

  const [isInstalling, setIsInstalling] = useState(false)

  const isInstalled = integration.state?.id !== undefined

  // Create form with Zod validation
  const form = useFormWithZod({
    schema: z.record(z.string(), z.any()) as any,
    defaultValues: {
      enabled: integration.state?.enabled || false,
      ...(integration.state?.metadata || {}),
    },
    onSubmit: async (values) => {
      setIsInstalling(true)

      try {
        if (integration.state) {
          // If already installed, update the integration
          await api.integration.update.mutate({
            params: { slug: integration.slug },
            body: {
              metadata: values,
              enabled: values.enabled,
            },
          })

          toast.success(`${integration.name} updated successfully!`)
        }

        if (!integration.state) {
          // Try to install the integration
          await api.integration.install.mutate({
            params: { slug: integration.slug },
            body: { metadata: values },
          })

          // Show success message
          toast.success(`${integration.name} integrated successfully!`)
        }

        // Callback if provided
        if (onSuccess) onSuccess()

        // Update data:
        router.refresh()

        // Close the sheet
        sheetTriggerRef.current?.click()

        // Reset form and state
        form.reset()
      } catch (error) {
        toast.error(`Error installing ${integration.name}`, {
          description: 'Please check your information and try again.',
        })
      } finally {
        setIsInstalling(false)
      }
    },
  })

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          form.reset()
        }
      }}
    >
      <SheetTrigger asChild>
        <div ref={sheetTriggerRef}>{children}</div>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto flex flex-col">
        <SheetHeader className="space-y-4">
          <div className="flex flex-col items-start justify-between space-y-4">
            <IntegrationLogo
              className="size-16 rounded-md object-contain p-2 border"
              src={integration.metadata.logo as string}
              alt={integration.name}
            />

            <div className="flex flex-col">
              <SheetTitle>{integration.name}</SheetTitle>
              <SheetDescription className="text-muted-foreground mb-4">
                {integration.metadata.description}
              </SheetDescription>
              <div className="flex flex-wrap gap-2">
                {integration.metadata.verified && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle2Icon className="h-3 w-3 text-green-500" />
                    Verified
                  </Badge>
                )}

                {integration.metadata.category && (
                  <Badge variant="outline">
                    {integration.metadata.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.onSubmit} className="py-6">
            {integration.metadata.help && (
              <Alert>
                <AlertTitle>{integration.metadata.help.title}</AlertTitle>
                <AlertDescription>
                  {integration.metadata.help.description}
                </AlertDescription>
                {integration.metadata.help.url && (
                  <a
                    href={integration.metadata.help.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                  >
                    Learn more
                  </a>
                )}
              </Alert>
            )}

            {isInstalled && (
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between mb-4">
                    <div>
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription>
                        Enable or disable this integration.
                      </FormDescription>
                    </div>
                    <div>
                      <Switch
                        id="enabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormSchema fields={integration.fields} />
          </form>
        </Form>

        <SheetFooter className="pt-4 mt-auto">
          {!isInstalled && (
            <Button
              onClick={form.onSubmit}
              disabled={isInstalling || isInstalled}
              className={cn(
                'w-full sm:w-auto',
                (isInstalling || isInstalled) && 'opacity-80',
              )}
            >
              {isInstalling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Install {integration.name}
                </>
              )}
            </Button>
          )}

          {isInstalled && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={form.onSubmit}
            >
              <SaveIcon />
              Save Changes
            </Button>
          )}

          {integration.metadata.website && !isInstalled && (
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <a
                href={integration.metadata.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
