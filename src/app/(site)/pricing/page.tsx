import type { Metadata } from 'next/types'
import { SiteFaqSection } from '../../../components/site/site-faq-section'
import { SitePricingSection } from '../../../components/site/site-pricing-section'
import { api } from '@/igniter.client'
import {
  SitePage,
  SitePageContent,
  SitePageFooter,
} from '@/components/site/site-page'
import { isPaymentEnabled } from '@/@saas-boilerplate/features/billing/presentation/utils/is-payment-enabled'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Choose the perfect plan for your needs. Explore our pricing options and find the best fit for your business.',
}

export const dynamic = 'force-dynamic'

export default async function Page() {
  if (!isPaymentEnabled()) redirect('/')

  // If payment is disabled, don't fetch plans
  const plansResponse = isPaymentEnabled() 
    ? await api.plan.findMany.query()
    : { data: [] }

  return (
    <SitePage>
      <SitePageContent>
        {isPaymentEnabled() && plansResponse.data && plansResponse.data.length > 0 ? (
          <>
            <SitePricingSection plans={plansResponse.data} />
            <SiteFaqSection />
          </>
        ) : (
          <div className="container max-w-(--breakpoint-lg) py-16">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Pricing</h1>
              <p className="text-muted-foreground text-lg">
                Pricing information is not currently available. Please contact us for more details.
              </p>
            </div>
          </div>
        )}
      </SitePageContent>
      <SitePageFooter />
    </SitePage>
  )
}
