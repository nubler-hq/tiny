/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
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
import { LoaderIcon } from '@/components/ui/loader-icon'
import { ArrowRightIcon } from 'lucide-react'
import { useRef } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import { api } from '@/igniter.client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { InviteMemberSchema } from '../../invitation.interface'

const roles = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Can manage workspace settings and members',
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Can view and edit workspace content',
  },
]

interface InvitationDialogProps {
  children: React.ReactNode
}

export function InvitationDialog({ children }: InvitationDialogProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const form = useFormWithZod({
    schema: InviteMemberSchema,
    onSubmit: async (params) => {
      const result = await api.invitation.create.mutate({
        body: {
          email: params.email,
          role: params.role,
        },
      })

      if (result.error) {
        toast.error('Failed to invite members', {
          description: 'There was an error inviting members. Please try again.',
        })

        return
      }

      toast.success('Members invited', {
        description: `Invitations successfully sent to ${params.email} email(s).`,
      })

      router.refresh()
      dialog.current?.click()
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div ref={dialog}>{children}</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px]">
        <Form {...form}>
          <form onSubmit={form.onSubmit}>
            <DialogHeader className="pb-8">
              <DialogTitle>Invite Team Members</DialogTitle>
              <DialogDescription>
                Invite new members to join your workspace.
              </DialogDescription>
            </DialogHeader>

            <DialogMain className="merge-form-section">
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="member@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Role
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid gap-4"
                      >
                        {roles.map((role) => (
                          <FormItem variant="unstyled" key={role.id}>
                            <FormControl>
                              <RadioGroupItem
                                value={role.id}
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:bg-secondary [&:has([data-state=checked])]:bg-secondary">
                              <div className="text-sm font-semibold">
                                {role.name}
                              </div>
                              <div className="text-xs text-muted-foreground text-center">
                                {role.description}
                              </div>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogMain>

            <DialogFooter className="pt-9">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Sending...'
                  : 'Send Invitations'}
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
