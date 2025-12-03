'use client'

import { Lists } from '@/components/ui/lists'
import { Button } from '@/components/ui/button'
import { Webhook, Trash, WebhookIcon, PlusSquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Annotated } from '@/components/ui/annotated'
import { UpsertWebhookModal } from './upsert-webhook-dialog'
import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
import { api } from '@/igniter.client'
import { useRouter } from 'next/navigation'

interface Webhook {
  id: string
  url: string
  secret: string
  events: string[]
}

interface WebhookListProps {
  webhooks: Webhook[]
  availableEvents: string[]
  onDelete?: (id: string) => Promise<void>
}
export function WebhookList({
  webhooks,
  availableEvents,
  onDelete,
}: WebhookListProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to remove this webhook?'))
        return
      await api.webhook.delete.mutate({ params: { id } })
      await onDelete?.(id)
      toast.success('Webhook removed successfully')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove the webhook')
    }
  }

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <Webhook className="h-4 w-4" />
        </Annotated.Icon>
        <Annotated.Title>Webhooks</Annotated.Title>
        <Annotated.Description>
          Configure webhooks to receive real-time updates about events in your
          workspace.
        </Annotated.Description>
      </Annotated.Sidebar>

      <Annotated.Content>
        <Annotated.Section>
          <Lists.Root data={webhooks} searchFields={['url']}>
            <Lists.SearchBar />
            <Lists.Content>
              {({ data }) =>
                data.length === 0 ? (
                  <AnimatedEmptyState>
                    <AnimatedEmptyState.Carousel>
                      <WebhookIcon className="size-6" />
                      <span className="bg-secondary h-3 w-[16rem] rounded-full"></span>
                    </AnimatedEmptyState.Carousel>

                    <AnimatedEmptyState.Content>
                      <AnimatedEmptyState.Title>
                        No webhooks found
                      </AnimatedEmptyState.Title>
                      <AnimatedEmptyState.Description>
                        You haven't created any webhooks yet.
                      </AnimatedEmptyState.Description>
                    </AnimatedEmptyState.Content>

                    <AnimatedEmptyState.Actions>
                      <UpsertWebhookModal availableEvents={availableEvents}>
                        <Button size="sm">
                          <PlusSquareIcon className="h-4 w-4 mr-2" />
                          Create Webhook
                        </Button>
                      </UpsertWebhookModal>
                    </AnimatedEmptyState.Actions>
                  </AnimatedEmptyState>
                ) : (
                  data.map((webhook: Webhook) => (
                    <Lists.Item key={webhook.id}>
                      <div className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{webhook.url}</p>
                          <p className="text-sm text-muted-foreground">
                            {webhook.events.length} events configured
                          </p>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(webhook.id)}
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
