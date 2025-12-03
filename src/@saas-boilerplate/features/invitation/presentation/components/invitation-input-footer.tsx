'use client'

import { Button } from '@/components/ui/button'
import { PlusSquareIcon } from 'lucide-react'
import { useInvitationContext } from '../contexts/invitation-input-context'

/**
 * @component InvitesFooter
 * @description Renders the footer section for the invitation input, including an "Add member" button if the maximum number of invites has not been reached.
 */
export const InvitesFooter = () => {
  const { invites, maxInvites, addInvite } = useInvitationContext()

  return (
    <footer className="flex border-t border-border p-4">
      {invites.fields.length < maxInvites && (
        <Button type="button" variant="link" onClick={addInvite}>
          <PlusSquareIcon />
          Add member
        </Button>
      )}
    </footer>
  )
}
