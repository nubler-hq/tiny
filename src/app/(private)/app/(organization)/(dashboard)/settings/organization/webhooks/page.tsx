import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  PageWrapper,
  PageHeader,
  PageMainBar,
  PageActionsBar,
  PageBody,
} from '@/components/ui/page'
import { api } from '@/igniter.client'
import { WebhookList } from '@/@saas-boilerplate/features/webhook/presentation'
import { UpsertWebhookModal } from '@/@saas-boilerplate/features/webhook/presentation/components/upsert-webhook-dialog'
import { Button } from '@/components/ui/button'
import { PlusSquareIcon } from 'lucide-react'

export const metadata = {
  title: 'Webhooks',
  description:
    'Configure and manage webhooks to receive real-time notifications about organization events',
}

export default async function Page() {
  const webhooks = await api.webhook.findMany.query()
  const availableEvents = await api.webhook.listEvents.query()

  if (webhooks.error) return null

  return (
    <PageWrapper>
      <PageHeader>
        <PageMainBar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/app/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/app/settings/organization">
                  Organization
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Webhooks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
        <PageActionsBar>
          <UpsertWebhookModal
            availableEvents={
              availableEvents?.data?.map((event) => event.value) || []
            }
          >
            <Button size="sm" variant="ghost">
              <PlusSquareIcon className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </UpsertWebhookModal>
        </PageActionsBar>
      </PageHeader>

      <PageBody>
        <div className="container max-w-(--breakpoint-md) space-y-12">
          <WebhookList
            webhooks={webhooks.data || []}
            availableEvents={
              availableEvents?.data?.map((event) => event.value) || []
            }
          />
        </div>
      </PageBody>
    </PageWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
