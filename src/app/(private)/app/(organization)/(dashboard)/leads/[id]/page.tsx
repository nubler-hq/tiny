import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
  PageWrapper,
} from '@/components/ui/page'
import { api } from '@/igniter.client'
import { LeadDetailsPageInfo } from '@/features/lead/presentation/components/lead-defails-info'
import { SubmissionDetailsList } from '@/features/lead/presentation/components/lead-details-submissions-list'
import { AppConfig } from '@/config/boilerplate.config.client'

type PageProps = {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { id } = await params
  const lead = await api.lead.retrieve.query({ params: { id } })

  if (lead.error || !lead.data) notFound()

  return {
    title: `Lead - ${lead.data.name || lead.data.email}`,
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const lead = await api.lead.retrieve.query({ params: { id } })

  if (lead.error || !lead.data) return notFound()

  const submissions = await api.submission.findMany.query()

  return (
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
                <BreadcrumbLink href="/app/leads">Leads</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {lead.data.name || lead.data.email}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
        <PageActionsBar></PageActionsBar>
      </PageHeader>
      <PageBody className="flex flex-col flex-1 p-0">
        <LeadDetailsPageInfo lead={lead.data} />
        <div className="flex-1 grid grid-rows-[auto_1fr]">
          <SubmissionDetailsList
            leadId={id}
            initialData={submissions.data || []}
          />
        </div>
      </PageBody>
    </PageWrapper>
  )
}
