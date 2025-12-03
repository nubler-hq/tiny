import { Metadata } from 'next'
import { WebPageJsonLd, createWebPageSchema } from '@/components/seo'
import { AppConfig } from '@/config/boilerplate.config.client'
import { source } from './source'
import {
  SitePageHeaderSection,
  SitePageHeaderSectionContainer,
  SitePageHeaderSectionGradient,
  SitePageHeaderSectionContent,
  SitePageHeaderSectionBreadcrumb,
  SitePageHeaderSectionTitle,
  SitePageHeaderSectionDescription,
} from '@/components/site/site-page-header-section'
import {
  SitePage,
  SitePageHeader,
  SitePageContent,
  SitePageFooter,
} from '@/components/site/site-page'
import { SiteBlogPostGrid } from '@/components/site/site-blog-post-grid'

export const metadata: Metadata = {
  title: 'Blog',
  description: `Latest news and updates from ${AppConfig.name}`,
  openGraph: {
    title: 'Blog',
    description: `Latest news and updates from ${AppConfig.name}`,
    url: `${AppConfig.url}/blog`,
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
  const latest = source.getPages()

  return (
    <SitePage>
      {/* SEO Structured Data */}
      <WebPageJsonLd
        webpage={createWebPageSchema({
          name: 'Latest Articles',
          description: `Latest news and updates from ${AppConfig.name}`,
          url: '/blog',
          siteUrl: AppConfig.url,
        })}
      />

      <SitePageHeader>
        <SitePageHeaderSection>
          <SitePageHeaderSectionGradient />
          <SitePageHeaderSectionContainer>
            <SitePageHeaderSectionBreadcrumb
              items={[
                { label: AppConfig.name, href: '/', isActive: false },
                { label: 'Blog', href: '/blog', isActive: true },
              ]}
            />
            <SitePageHeaderSectionContent className="pb-26">
              <SitePageHeaderSectionTitle>Blog</SitePageHeaderSectionTitle>
              <SitePageHeaderSectionDescription>
                Latest news and updates from {AppConfig.name}
              </SitePageHeaderSectionDescription>
            </SitePageHeaderSectionContent>
          </SitePageHeaderSectionContainer>
        </SitePageHeaderSection>
      </SitePageHeader>

      <SitePageContent>
        {/* Featured Posts */}
        {latest.length > 0 && (
          <section className="relative min-h-[36vh] -mt-16">
            <div className="container mx-auto max-w-(--breakpoint-lg)">
              <SiteBlogPostGrid
                variant="featured"
                showExcerpt={true}
                showAuthor={true}
                showDate={true}
                showTags={false}
                columns={3}
                posts={latest}
              />
            </div>
          </section>
        )}
      </SitePageContent>

      <SitePageFooter />
    </SitePage>
  )
}
