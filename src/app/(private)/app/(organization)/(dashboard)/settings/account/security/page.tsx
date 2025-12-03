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
import { UserAccountsSettingsForm } from '@/@saas-boilerplate/features/user/presentation/components/user-accounts-settings-form'
import { UserSessionsSettingsForm } from '@/@saas-boilerplate/features/user/presentation/components/user-sessions-settings-form'
import { UserTwoFactorSettingsForm } from '@/@saas-boilerplate/features/user/presentation/components/user-two-factor-settings-form'

export const metadata = {
  title: 'Security',
  description:
    'Manage your account security settings, two-factor authentication, and connected accounts',
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
                <BreadcrumbPage>Security</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
      </PageHeader>
      <PageBody>
        <div className="container max-w-(--breakpoint-md) space-y-12">
          <UserAccountsSettingsForm />
          <UserTwoFactorSettingsForm />
          <UserSessionsSettingsForm />
        </div>
      </PageBody>
    </PageWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
