'use client'

import { useCallback, useState } from 'react'
import { InviteMemberSchema } from '../../invitation.interface'
import { useInvitationContext } from '../contexts/invitation-input-context'

/**
 * @hook useValidateInviteEntry
 * @description Custom hook to validate a single invitation entry (email and role) using Zod.
 * @param {number} index - The index of the invitation entry in the form array.
 * @returns {object} An object containing the current error message and a validation function.
 * @returns {string | null} .error - The error message if validation fails, otherwise null.
 * @returns {() => boolean} .validate - A function that triggers validation for the specific entry and returns true if valid, false otherwise.
 */
export const useValidateInviteEntry = (index: number) => {
  const [error, setError] = useState<string | null>(null)
  const { form } = useInvitationContext()

  const validate = useCallback(() => {
    const email = form.getValues(`invites.${index}.email`)
    const role = form.getValues(`invites.${index}.role`)

    const result = InviteMemberSchema.safeParse({ email, role })

    if (!result.success) {
      setError(result.error.issues[0].message)
      return false
    }

    setError(null)
    return true
  }, [form, index])

  return { error, validate }
}
