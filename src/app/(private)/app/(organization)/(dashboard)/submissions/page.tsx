import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  PageActionsBar,
  PageBody,
  PageHeader,
  PageMainBar,
  PageSecondaryHeader,
  PageWrapper,
} from '@/components/ui/page'
import { SubmissionsDataTable } from '@/features/submission/presentation/components/submissions-data-table/submissions-data-table'
import { SubmissionsDataTableProvider } from '@/features/submission/presentation/components/submissions-data-table/submissions-data-table-provider'
import { SubmissionsDataTableToolbar } from '@/features/submission/presentation/components/submissions-data-table/submissions-data-table-toolbar'
import { api } from '@/igniter.client'
import { AppConfig } from '@/config/boilerplate.config.client'

export const metadata = {
  title: 'Submissions',
}

export default async function ContactsPage() {
  const submission = await api.submission.findMany.query()

  return (
    <SubmissionsDataTableProvider initialData={submission.data ?? []}>
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
                  <BreadcrumbPage>Submissions</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </PageMainBar>

          <PageActionsBar></PageActionsBar>
        </PageHeader>

        <PageSecondaryHeader className="bg-secondary/50">
          <SubmissionsDataTableToolbar />
        </PageSecondaryHeader>

        <PageBody className="p-0 flex flex-col">
          <SubmissionsDataTable />
        </PageBody>
      </PageWrapper>
    </SubmissionsDataTableProvider>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
