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
import {
  IntegrationBanner,
  IntegrationFeed,
} from '@/@saas-boilerplate/features/integration/presentation/components'
import { AppConfig } from '@/config/boilerplate.config.client'

export const metadata = {
  title: 'Integrations',
}
export default async function Page() {
  const integrations = await api.integration.findMany.query()

  return (
    <PageWrapper>
      <PageHeader className="border-0">
        <PageMainBar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/app">{AppConfig.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Integrations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>

        <PageActionsBar></PageActionsBar>
      </PageHeader>

      <PageBody className="pflex flex-col">
        <section className="container max-w-(--breakpoint-lg) mx-auto space-y-8">
          <header>
            <h1 className="text-xl font-bold tracking-tight">Integrations</h1>
            <p className="text-md text-muted-foreground">
              Use {AppConfig.name} with your favorite tools
            </p>
          </header>
          <main className="space-y-8">
            <IntegrationBanner
              integrations={integrations.data ?? []}
              featured={['telegram', 'zapier', 'make']}
            />
            <IntegrationFeed integrations={integrations.data ?? []} />
          </main>
        </section>
      </PageBody>
    </PageWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
