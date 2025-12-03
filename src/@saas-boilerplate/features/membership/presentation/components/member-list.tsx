'use client'

import { Lists } from '@/components/ui/lists'
import { Persona } from '@/components/ui/persona'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Trash, Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Annotated } from '@/components/ui/annotated'
import { InvitationDialog } from '@/@saas-boilerplate/features/invitation/presentation/components/invitation-dialog'
import { api } from '@/igniter.client'
import { useRouter } from 'next/navigation'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'

interface Membership {
  id: string
  createdAt: Date
  userId: string
  organizationId: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

interface MemberListProps {
  members: Membership[]
  onDelete?: (id: string) => Promise<void>
}

export function MemberList({ members, onDelete }: MemberListProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    await tryCatch(api.membership.delete.mutate({ params: { id } }))
    await onDelete?.(id)

    toast.success('Member removed successfully')
    router.refresh()
  }

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <Users className="h-4 w-4" />
        </Annotated.Icon>
        <Annotated.Title>Team Members</Annotated.Title>
        <Annotated.Description>
          Manage your team members and their access to your workspace.
        </Annotated.Description>
      </Annotated.Sidebar>

      <Annotated.Content>
        <Annotated.Section>
          <Lists.Root data={members} searchFields={['email', 'name']}>
            <Lists.SearchBar />
            <Lists.Content>
              {({ data }) =>
                data.length === 0 ? (
                  <EmptyState>
                    <EmptyState.Icon>
                      <Users className="h-12 w-12" />
                    </EmptyState.Icon>
                    <EmptyState.Title>No members found</EmptyState.Title>
                    <EmptyState.Description>
                      You haven't added any members to your workspace yet.
                    </EmptyState.Description>
                    <EmptyState.Actions>
                      <InvitationDialog>
                        <EmptyState.Action>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite members
                        </EmptyState.Action>
                      </InvitationDialog>
                    </EmptyState.Actions>
                  </EmptyState>
                ) : (
                  data.map((member: Membership) => (
                    <Lists.Item key={member.id}>
                      <div className="flex items-center justify-between p-4">
                        <Persona
                          src={member.user.image}
                          name={member.user.name}
                          secondaryLabel={member.user.email}
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </Lists.Item>
                  ))
                )
              }
            </Lists.Content>
          </Lists.Root>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
