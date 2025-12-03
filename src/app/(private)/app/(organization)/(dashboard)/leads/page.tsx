import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  PageBody,
  PageHeader,
  PageMainBar,
  PageSecondaryHeader,
  PageWrapper,
} from '@/components/ui/page'
import { LeadDataTable } from '@/features/lead/presentation/components/leads-data-table'
import { LeadDataTableProvider } from '@/features/lead/presentation/components/leads-data-table-provider'
import { LeadDataTableToolbar } from '@/features/lead/presentation/components/leads-data-table-toolbar'
import { api } from '@/igniter.client'
import { LeadUpsertSheet } from '@/features/lead/presentation/components/lead-upsert-sheet'
import { AppConfig } from '@/config/boilerplate.config.client'

export const metadata = {
  title: 'Leads',
}

export default async function ContactsPage() {
  const contacts = await api.lead.list.query()

  return (
    <LeadDataTableProvider initialData={contacts.data ?? []}>
      <PageWrapper>
        <PageHeader>
          <PageMainBar>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/app">{AppConfig.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Leads</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </PageMainBar>
        </PageHeader>

        <PageSecondaryHeader className="bg-secondary/50">
          <LeadDataTableToolbar />
          <LeadUpsertSheet />
        </PageSecondaryHeader>

        <PageBody className="p-0 flex flex-col">
          <LeadDataTable />
        </PageBody>
      </PageWrapper>
    </LeadDataTableProvider>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
