'use client'

import { useInvitationContext } from '../contexts/invitation-input-context'
import { InviteRow } from './invitation-input-row'

/**
 * @component InvitesList
 * @description Renders a list of invitation rows, iterating over the `invites` array from the InvitationContext.
 */
export const InvitesList = () => {
  const { invites } = useInvitationContext()

  return (
    <main>
      {invites.fields.map((field, index) => (
        <InviteRow key={field.id} index={index} />
      ))}
    </main>
  )
}
