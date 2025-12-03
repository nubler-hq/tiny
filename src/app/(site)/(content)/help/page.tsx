import { Metadata } from 'next'
import { WebPageJsonLd, createWebPageSchema } from '@/components/seo'
import { AppConfig } from '@/config/boilerplate.config.client'
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
import { listArticlesWithCategory, source } from './source'
import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'
import { SiteHelpCenterCategoryCard } from '@/components/site/site-help-center-category-card'
import { SiteHelpCenterSearch } from '@/components/site/site-help-center-search'
import { String } from '@/@saas-boilerplate/utils/string'

export const metadata: Metadata = {
  title: 'Help Center',
  description: `Get help with ${AppConfig.name}. Find answers to common questions and get support for your SaaS application.`,
  openGraph: {
    title: 'Help Center',
    description: `Get help with ${AppConfig.name}. Find answers to common questions and get support for your SaaS application.`,
    url: `${AppConfig.url}/help`,
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

export default function Page() {
  // Fetch popular articles using API
  let featuredPosts = listArticlesWithCategory()

  // Fetch categories using API
  const categories = source.getPageTree()

  // Slice the array to limit the number of articles
  featuredPosts = featuredPosts.slice(0, 8)

  return (
    <SitePage>
      {/* SEO Structured Data */}
      <WebPageJsonLd
        webpage={createWebPageSchema({
          name: 'Help Center',
          description: `Get help with ${AppConfig.name}. Find answers to common questions and get support for your SaaS application.`,
          url: `${AppConfig.url}/help`,
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
                { label: 'Help Center', href: '/help', isActive: true },
              ]}
            />
            <SitePageHeaderSectionContent className="pb-26">
              <SitePageHeaderSectionTitle>
                Help Center
              </SitePageHeaderSectionTitle>
              <SitePageHeaderSectionDescription>
                Get help with {AppConfig.name}. Find answers to common questions
                and get support.
              </SitePageHeaderSectionDescription>
              <SitePageHeaderSectionActions>
                <SiteHelpCenterSearch />
              </SitePageHeaderSectionActions>
            </SitePageHeaderSectionContent>
          </SitePageHeaderSectionContainer>
        </SitePageHeaderSection>
      </SitePageHeader>

      <SitePageContent>
        {/* Page Content */}
        <div className="relative border-b pb-16 -mt-16 space-y-24 z-10">
          <section>
            <div className="container mx-auto max-w-(--breakpoint-lg)">
              <div className="border border-border rounded-md p-6 bg-background">
                <h2 className="text-sm text-muted-foreground mb-6">
                  Featured Posts
                </h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-0">
                  {featuredPosts.map((post) => (
                    <Link
                      href={post.url}
                      key={post.url}
                      className="group flex w-full items-center justify-between p-3 rounded-md hover:bg-primary/10 transition-colors"
                    >
                      {post.name}
                      <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="container mx-auto max-w-(--breakpoint-lg)">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.children.map((category) => (
                  <SiteHelpCenterCategoryCard
                    key={category.$id as string}
                    category={{
                      slug: String.toSlug(category.$id as string),
                      title: category.name as string,
                      // @ts-expect-error - Expected description to be a string
                      description: category.description as string,
                      // @ts-expect-error - Expected has children
                      articleCount: category.children.length,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </SitePageContent>

      <SitePageFooter />
    </SitePage>
  )
}
