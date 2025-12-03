'use client'

import { Lists } from '@/components/ui/lists'
import { Button } from '@/components/ui/button'
import {
  Copy,
  Mail,
  UserPlus,
  MailCheckIcon,
  Trash,
  PlusSquareIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Annotated } from '@/components/ui/annotated'
import { InvitationDialog } from './invitation-dialog'
import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
import { useRouter } from 'next/navigation'
import { api } from '@/igniter.client'
import type { Invitation } from '../../invitation.interface'
import { Url } from '@/@saas-boilerplate/utils/url'

interface InvitationListProps {
  invitations: Invitation[]
  onDelete?: (id: string) => Promise<void>
}

export function InvitationList({ invitations, onDelete }: InvitationListProps) {
  const router = useRouter()

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(Url.get(`/app/invites/${id}`))
    toast.success('Invitation link copied')
  }

  const handleDelete = async (id: string) => {
    await api.invitation.cancel.mutate({ params: { id } })
    await onDelete?.(id)

    toast.success('Invitation removed successfully')
    router.refresh()
  }

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <Mail className="h-4 w-4" />
        </Annotated.Icon>
        <Annotated.Title>Invitations</Annotated.Title>
        <Annotated.Description>
          Track and manage all pending invitations sent to potential team
          members.
        </Annotated.Description>
      </Annotated.Sidebar>

      <Annotated.Content>
        <Annotated.Section>
          <Lists.Root data={invitations} searchFields={['email']}>
            <Lists.SearchBar />
            <Lists.Content>
              {({ data }) =>
                data.length === 0 ? (
                  <AnimatedEmptyState>
                    <AnimatedEmptyState.Carousel>
                      <MailCheckIcon className="size-6" />
                      <span className="bg-secondary h-3 w-[16rem] rounded-full"></span>
                    </AnimatedEmptyState.Carousel>

                    <AnimatedEmptyState.Content>
                      <AnimatedEmptyState.Title>
                        No pending invitations
                      </AnimatedEmptyState.Title>
                      <AnimatedEmptyState.Description>
                        You don't have any pending invitations at the moment.
                      </AnimatedEmptyState.Description>
                    </AnimatedEmptyState.Content>

                    <AnimatedEmptyState.Actions>
                      <InvitationDialog>
                        <AnimatedEmptyState.Action>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite member
                        </AnimatedEmptyState.Action>
                      </InvitationDialog>
                    </AnimatedEmptyState.Actions>
                  </AnimatedEmptyState>
                ) : (
                  <div className="space-y-4">
                    {data.map((invitation: Invitation) => (
                      <Lists.Item key={invitation.id}>
                        <div className="flex items-center justify-between p-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">
                              {invitation.email}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              {invitation.status}
                            </span>
                          </div>

                          <div className="space-x-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopy(invitation.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(invitation.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Lists.Item>
                    ))}

                    <InvitationDialog>
                      <Button variant="link">
                        <PlusSquareIcon className="h-4 w-4 mr-2" />
                        Invite member
                      </Button>
                    </InvitationDialog>
                  </div>
                )
              }
            </Lists.Content>
          </Lists.Root>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
