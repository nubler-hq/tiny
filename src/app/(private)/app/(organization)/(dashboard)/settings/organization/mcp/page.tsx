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
import { McpSettingsForm } from '@/@saas-boilerplate/features/api-key/presentation/components/mcp-settings-form'

interface McpApiKey {
  id: string
  key: string
  description: string
  enabled: boolean
  createdAt: Date
}

export const metadata = {
  title: 'MCP Server',
  description:
    "Connect ChatGPT, Claude, and n8n via your organization's MCP endpoint",
}

export default async function Page() {
  const session = await api.auth.getSession.query()

  if (!session?.data?.organization) return null

  const mcpKeyResult = await api.apiKey.getMcpKey.query()

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
                <BreadcrumbPage>Model Context Protocol</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
      </PageHeader>

      <PageBody>
        <div className="container max-w-(--breakpoint-md)">
          <McpSettingsForm
            initialMcpKey={mcpKeyResult.data}
            organizationId={session.data.organization.id}
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

