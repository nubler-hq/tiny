import type { Metadata } from 'next'
import { SiteFaqSection } from '@/components/site/site-faq-section'
import { SiteTestimonialsSection } from '@/components/site/site-testimonials-section'
import { SiteMainHeroSection } from '@/components/site/site-main-hero-section'
import { SitePricingSection } from '@/components/site/site-pricing-section'
import { SiteInteractiveFeaturesSection } from '@/components/site/site-interactive-features-section'
import { SiteUseCasesCarousel } from '@/components/site/site-use-cases-carousel'
import { api } from '@/igniter.client'
import { AppConfig } from '@/config/boilerplate.config.client'
import { SITE_FAQ_ITEMS } from '@/content/site/site-faq-items'
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  FAQPageJsonLd,
  createOrganizationSchema,
  createWebSiteSchema,
  createFAQPageSchema,
} from '@/components/seo'
import {
  SitePage,
  SitePageContent,
  SitePageFooter,
} from '@/components/site/site-page'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export const metadata: Metadata = {
  title: 'Your Next Startup, Starts Here',
  description: AppConfig.description,
  keywords: AppConfig.keywords,
}

export default async function Page() {
  const plans = await api.plan.findMany.query()

  return (
    <SitePage>
      <OrganizationJsonLd
        organization={createOrganizationSchema({
          name: `${AppConfig.name} Demo`,
          url: AppConfig.url,
          logo: `${AppConfig.url}${AppConfig.brand.logo.light}`,
          sameAs: [
            AppConfig.links.twitter,
            AppConfig.links.linkedin,
            AppConfig.links.facebook,
            AppConfig.links.instagram,
            AppConfig.creator.links.github,
          ].filter(Boolean),
          email: AppConfig.links.mail,
          availableLanguages: ['en', 'pt-BR'],
        })}
      />

      <WebSiteJsonLd
        website={createWebSiteSchema({
          name: `${AppConfig.name} Demo`,
          url: AppConfig.url,
          inLanguage: 'pt-BR',
          searchUrl: `${AppConfig.url}/search?q=`,
        })}
      />

      <FAQPageJsonLd
        faqPage={createFAQPageSchema({
          faqs: SITE_FAQ_ITEMS,
        })}
      />

      <SitePageContent>
        <SiteMainHeroSection />
        <SiteInteractiveFeaturesSection />
        <SiteUseCasesCarousel />
        <SitePricingSection plans={plans.data ?? []} />
        <SiteTestimonialsSection />
        <SiteFaqSection />
      </SitePageContent>
      <SitePageFooter />
    </SitePage>
  )
}
