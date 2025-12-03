import type { PropsWithChildren } from 'react'
import { api } from '@/igniter.client'
import { redirect } from 'next/navigation'
import { Onborda, OnbordaProvider } from 'onborda'
import { TourCard } from '@/components/ui/tour-card'
import { DashboardMainSidebar } from '@/components/dashboard/dashboard-main-sidebar'
import { WELCOME_TOUR } from '@/content/guides/welcome.tour'
import { DashboardMobileNavMenu } from '@/components/dashboard/dashboard-mobile-nav-menu'
import { validateSubscriptionAccess } from '@/@saas-boilerplate/features/billing/presentation/utils/subscription-guard'
import { TrialExpirationBanner } from '@/@saas-boilerplate/features/billing/presentation/components/trial-expiration-banner'
import { GracePeriodBanner } from '@/@saas-boilerplate/features/billing/presentation/components/grace-period-banner'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default async function Layout({ children }: PropsWithChildren) {
  // Business Rule: Get the current session
  const session = await api.auth.getSession.query()

  // Business Rule: If the user is not authenticated, redirect to the login page
  if (session.error || !session.data) redirect('/auth')

  // Business Rule: If the user has not completed the onboarding process, redirect to the get started page
  if (!session.data.organization) redirect('/app/get-started')

  const subscription = session.data.organization.billing?.subscription

  // Use centralized subscription validation
  const validationResult = validateSubscriptionAccess(subscription)

  if (!validationResult.isValid && validationResult.redirectPath) {
    redirect(validationResult.redirectPath)
  }

  return (
    <OnbordaProvider>
      <Onborda
        steps={[WELCOME_TOUR]}
        showOnborda={true}
        cardComponent={TourCard}
        cardTransition={{ duration: 0.6, type: 'tween' }}
      >
        <div className="grid md:grid-cols-[auto_1fr] relative dark:bg-background">
          <DashboardMainSidebar className="sticky top-0" />
          <main className="md:p-4 md:pl-0">
            {/* Show trial expiration banner for trial subscriptions (only if payment is enabled) */}
            {subscription?.status === 'trialing' &&
              subscription.trialDays !== null && (
                <TrialExpirationBanner
                  organizationId={session.data.organization.id}
                  trialDays={subscription.trialDays}
                />
              )}
            {validationResult?.gracePeriodStatus && (
              <GracePeriodBanner
                gracePeriodStatus={validationResult.gracePeriodStatus}
                className="mx-4 mt-4"
              />
            )}
            {children}
          </main>
        </div>
        <DashboardMobileNavMenu />
      </Onborda>
    </OnbordaProvider>
  )
}
