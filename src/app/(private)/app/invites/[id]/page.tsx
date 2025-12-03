import { api } from '@/igniter.client'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { String } from '@/@saas-boilerplate/utils/string'
import { AppConfig } from '@/config/boilerplate.config.client'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { InvitationRequestPage } from '@/@saas-boilerplate/features/invitation/presentation/components/invitation-request-page'

export default async function InvitePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const invitation = await api.invitation.findOne.query({
    params: { id },
  })

  if (!invitation.data || invitation.error) return redirect('/app')

  return (
    <InvitationRequestPage invitation={invitation.data} />
  )
}
