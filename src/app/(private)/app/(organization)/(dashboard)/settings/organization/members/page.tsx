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
  PageBody,
} from '@/components/ui/page'
import { InvitationList } from '@/@saas-boilerplate/features/invitation/presentation/components/invitation-list'
import { api } from '@/igniter.client'
import { MemberList } from '@/@saas-boilerplate/features/membership/presentation/components/member-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = {
  title: 'Members',
  description:
    'Manage your organization members, send invitations, and set member permissions',
}

export default async function Page() {
  const session = await api.auth.getSession.query()
  if (session.error || !session.data) return null

  const organization = session.data.organization

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
                <BreadcrumbPage>Members</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
      </PageHeader>
      <PageBody>
        <div className="container max-w-(--breakpoint-md) space-y-12">
          <Tabs defaultValue="members">
            <TabsList className="grid w-fit grid-cols-2 mb-6">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invitations">Invitations</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <MemberList members={organization?.members ?? []} />
            </TabsContent>
            <TabsContent value="invitations">
              <InvitationList invitations={organization?.invitations ?? []} />
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>
    </PageWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
