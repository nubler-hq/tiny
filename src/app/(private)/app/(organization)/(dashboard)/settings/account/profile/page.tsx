import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  PageWrapper,
  PageBody,
  PageHeader,
  PageMainBar,
} from '@/components/ui/page'
import { UserBaseInfoSettingsForm } from '@/@saas-boilerplate/features/user/presentation/components/user-base-info-settings-form'

export const metadata = {
  title: 'Profile',
  description:
    'Manage your profile information, personal details, and contact information',
}

export default function Page() {
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
                <BreadcrumbLink href="/app/settings/account">
                  Account
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
      </PageHeader>
      <PageBody>
        <div className="container max-w-(--breakpoint-md)">
          <UserBaseInfoSettingsForm />
        </div>
      </PageBody>
    </PageWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
