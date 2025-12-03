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
import { ApiKeyList } from '@/@saas-boilerplate/features/api-key/presentation/components/api-key-list'
import { api } from '@/igniter.client'
import { CreateApiKeyModal } from '@/@saas-boilerplate/features/api-key/presentation/components/upsert-api-key-dialog'
import { Button } from '@/components/ui/button'
import { PlusSquareIcon } from 'lucide-react'

export const metadata = {
  title: 'API Keys',
  description:
    "Manage your organization's API keys for secure access to external services and integrations",
}

export default async function Page() {
  const apiKeys = await api.apiKey.findManyByOrganization.query()

  if (apiKeys.error) return null

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
                <BreadcrumbPage>API Keys</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
        <PageActionsBar>
          <CreateApiKeyModal>
            <Button size="sm" variant="ghost">
              <PlusSquareIcon className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </CreateApiKeyModal>
        </PageActionsBar>
      </PageHeader>

      <PageBody>
        <div className="container max-w-(--breakpoint-md) space-y-12">
          <ApiKeyList apiKeys={apiKeys.data || []} />
        </div>
      </PageBody>
    </PageWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
