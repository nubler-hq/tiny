import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
} from '@/components/site/site-page-header-section'
import {
  SitePage,
  SitePageHeader,
  SitePageContent,
  SitePageFooter,
} from '@/components/site/site-page'
import { listArticlesByCategory, source } from '../source'
import { SiteHelpCenterArticleItem } from '@/components/site/site-help-center-article-item'
import { String } from '@/@saas-boilerplate/utils/string'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface PageProps {
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params

  // Normalize the category slug
  const normalizedCategory = String.toSlug(category)

  // Find the category in the page tree
  const pageTree = source.getPageTree()
  const categoryNode = pageTree.children.find((node) => {
    if (node.type === 'folder') {
      const slug = String.toSlug((node.$id || node.name) as string)
      return slug === normalizedCategory
    }
    return false
  })

  if (!categoryNode || categoryNode.type !== 'folder') {
    return {
      title: 'Category Not Found',
    }
  }

  const categoryName = categoryNode.name as string

  return {
    title: `${categoryName} - Help Center`,
    description: `Find help articles in the ${categoryName} category for ${AppConfig.name}.`,
    openGraph: {
      title: `${categoryName} - Help Center`,
      description: `Find help articles in the ${categoryName} category for ${AppConfig.name}.`,
      url: `${AppConfig.url}/help/${category}`,
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
}

export default async function HelpCategoryPage({ params }: PageProps) {
  const { category } = await params

  // Normalize the category slug
  const normalizedCategory = String.toSlug(category)

  // Get the page tree
  const pageTree = source.getPageTree()

  // Find the category folder
  const categoryNode = pageTree.children.find((node) => {
    if (node.type === 'folder') {
      const slug = String.toSlug((node.$id || node.name) as string)
      return slug === normalizedCategory
    }
    return false
  })

  if (!categoryNode || categoryNode.type !== 'folder') {
    notFound()
  }

  // Get the category name
  const categoryName = categoryNode.name as string
  
  // Fetch articles in the category
  const articles = listArticlesByCategory(normalizedCategory)

  return (
    <SitePage>
      {/* SEO Structured Data */}
      <WebPageJsonLd
        webpage={createWebPageSchema({
          name: `${categoryName} - Help Center`,
          description: `Find help articles in the ${categoryName} category for ${AppConfig.name}.`,
          url: `${AppConfig.url}/help/${category}`,
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
                { label: 'Help Center', href: '/help', isActive: false },
                {
                  label: categoryName,
                  href: `/help/${category}`,
                  isActive: true,
                },
              ]}
            />
            <SitePageHeaderSectionContent>
              <SitePageHeaderSectionTitle>
                {categoryName}
              </SitePageHeaderSectionTitle>
              <SitePageHeaderSectionDescription>
                Browse articles in the {categoryName} category.
              </SitePageHeaderSectionDescription>
            </SitePageHeaderSectionContent>
          </SitePageHeaderSectionContainer>
        </SitePageHeaderSection>
      </SitePageHeader>

      <SitePageContent>
        <div className="container mx-auto max-w-(--breakpoint-lg) py-8">
          <div className="space-y-4">
            {articles.map((article) => {
              if (!article) return null
              article.url = `/help/${normalizedCategory}/${article.url.split('/').pop()}`
              return (
                <SiteHelpCenterArticleItem
                  key={article.url}
                  article={article}
                  showDate
                />
              )
            })}
          </div>
        </div>
      </SitePageContent>

      <SitePageFooter />
    </SitePage>
  )
}
