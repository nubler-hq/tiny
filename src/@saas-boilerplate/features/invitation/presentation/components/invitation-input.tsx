'use client'

import { InvitesFooter } from './invitation-input-footer'
import { InvitesList } from './invitation-input-list'
import { InvitationInputProvider } from '../contexts/invitation-input-context'

/**
 * @interface InvitationInputProps
 * @description Props for the InvitationInput component.
 */
interface InvitationInputProps {
  /** The maximum number of invitations allowed. */
  maxInvites: number
  /** The initial number of empty invitation rows to display. */
  initialInvites?: number
}

/**
 * @component InvitationInput
 * @description Main component for managing and displaying invitation inputs.
 * It provides context for managing multiple invitation entries,
 * including adding/removing members and handling form validation.
 */
export function InvitationInput({ maxInvites }: InvitationInputProps) {
  return (
    <InvitationInputProvider maxInvites={maxInvites}>
      <main className="flex flex-col gap-4">
        <InvitesList />
      </main>

      <InvitesFooter />
    </InvitationInputProvider>
  )
}
