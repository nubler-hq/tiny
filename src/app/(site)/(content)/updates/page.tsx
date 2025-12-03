import type { Metadata } from 'next/types'
import { ChangelogTimeline } from '@/components/site/site-changelog-timeline'
import React from 'react'
import { source } from './source'
import {
  SitePageHeaderSection,
  SitePageHeaderSectionContainer,
  SitePageHeaderSectionGradient,
  SitePageHeaderSectionContent,
  SitePageHeaderSectionBreadcrumb,
  SitePageHeaderSectionTitle,
  SitePageHeaderSectionDescription,
  SitePageHeaderSectionActions,
} from '@/components/site/site-page-header-section'
import {
  SitePage,
  SitePageHeader,
  SitePageContent,
  SitePageFooter,
} from '@/components/site/site-page'
import { XIcon } from '@/components/ui/icons/x-icon'
import { Button } from '@/components/ui/button'
import { RssIcon } from 'lucide-react'
import { AppConfig } from '@/config/boilerplate.config.client'
import { createWebPageSchema, WebPageJsonLd } from '@/components/seo/webpage'

export const metadata: Metadata = {
  title: 'Updates',
  description: `All the latest updates, improvements, and fixes to ${AppConfig.name}`,
  openGraph: {
    title: 'Updates',
    description: `All the latest updates, improvements, and fixes to ${AppConfig.name}`,
    url: `${AppConfig.url}/updates`,
    siteName: AppConfig.name,
    images: [
      {
        url: `${AppConfig.url}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: AppConfig.name,
      },
    ],
  },
}

export default async function Page() {
  const updates = source.getPages()

  return (
    <SitePage>
      {/* SEO Structured Data */}
      <WebPageJsonLd
        webpage={createWebPageSchema({
          name: 'Updates',
          description: `All the latest updates, improvements, and fixes to ${AppConfig.name}`,
          url: '/updates',
          siteUrl: AppConfig.url,
        })}
      />

      <SitePageHeader>
        <SitePageHeaderSection>
          <SitePageHeaderSectionGradient />
          <SitePageHeaderSectionContainer>
            <SitePageHeaderSectionBreadcrumb
              items={[
                { label: AppConfig.name, href: '/', isActive: true },
                { label: 'Updates', href: '/updates', isActive: false },
              ]}
            />
            <SitePageHeaderSectionContent>
              <SitePageHeaderSectionTitle>Updates</SitePageHeaderSectionTitle>
              <SitePageHeaderSectionDescription>
                All the latest updates, improvements, and fixes to{' '}
                {AppConfig.name}
              </SitePageHeaderSectionDescription>
              <SitePageHeaderSectionActions>
                <Button className="bg-background" asChild variant="outline">
                  <a
                    href={AppConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <XIcon />
                    Follow
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="bg-background"
                  aria-label="RSS Feed"
                >
                  <a href="/rss" target="_blank" rel="noopener noreferrer">
                    <RssIcon />
                  </a>
                </Button>
              </SitePageHeaderSectionActions>
            </SitePageHeaderSectionContent>
          </SitePageHeaderSectionContainer>
        </SitePageHeaderSection>
      </SitePageHeader>

      <SitePageContent>
        {/* Timeline Section */}
        <section className="border-b">
          <div className="container mx-auto max-w-(--breakpoint-lg)">
            <ChangelogTimeline entries={updates} />
          </div>
        </section>
      </SitePageContent>

      <SitePageFooter />
    </SitePage>
  )
}
