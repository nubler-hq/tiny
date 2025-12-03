'use client'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TrashIcon } from 'lucide-react'
import { useInvitationContext } from '../contexts/invitation-input-context'
import { useValidateInviteEntry } from '../hooks/invitation-input-use-validate-invite-entry'

/**
 * @component InviteRow
 * @description Renders a single row for inviting a team member, including email input, role selection, and a remove button.
 * Displays validation errors via a tooltip.
 * @param {object} props - Component props.
 * @param {number} props.index - The index of the invitation row in the form array.
 */
export const InviteRow = ({ index }: { index: number }) => {
  const { invites } = useInvitationContext()
  const { error, validate } = useValidateInviteEntry(index)

  return (
    <div className="grid grid-cols-[1fr_200px_auto] gap-4 p-4 border-b border-border last:border-b-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <FormField
              name={`invites.${index}.email`}
              render={({ field }) => (
                <FormItem variant="unstyled">
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter team member email"
                      {...field}
                      onBlur={() => validate()}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </TooltipTrigger>
        {error && (
          <TooltipContent>
            <p>{error}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <FormField
        name={`invites.${index}.role`}
        render={({ field }) => (
          <FormItem variant="unstyled">
            <Select
              onValueChange={(value) => {
                field.onChange(value)
                validate()
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger variant="outline" className="rounded-full h-9">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <Button
        size="icon"
        variant="outline"
        onClick={() => invites.remove(index)}
      >
        <TrashIcon />
      </Button>
    </div>
  )
}
