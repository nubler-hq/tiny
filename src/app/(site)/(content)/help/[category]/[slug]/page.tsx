import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'
import { ArticleJsonLd, createArticleSchema } from '@/components/seo/article'
import {
  OrganizationJsonLd,
  createOrganizationSchema,
} from '@/components/seo/organization'
import { AppConfig } from '@/config/boilerplate.config.client'
import { source } from '@/app/(site)/(content)/help/source'
import { DateUtils } from '@/@saas-boilerplate/utils/date'
import {
  SitePage,
  SitePageHeader,
  SitePageContent,
} from '@/components/site/site-page'
import {
  SitePageHeaderSection,
  SitePageHeaderSectionGradient,
  SitePageHeaderSectionContainer,
  SitePageHeaderSectionBreadcrumb,
  SitePageHeaderSectionContent,
  SitePageHeaderSectionTitle,
  SitePageHeaderSectionDescription,
} from '@/components/site/site-page-header-section'
import {
  SitePageArticle,
  SitePageArticleContent,
  SitePageArticleSidebar,
  SitePageArticleTOC,
  SitePageArticleRelated,
  SitePageArticleRelatedHeader,
  SitePageArticleRelatedList,
  SitePageArticleRelatedItem,
  SitePageArticleProvider,
  SitePageArticleContainer,
} from '@/components/site/site-page-article'
import { SiteCTACard } from '@/components/site/site-cta-card'
import { getMDXComponents } from 'mdx-components'
import { String } from '@/@saas-boilerplate/utils/string'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const post = source.getPage([slug])
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The help article you are looking for could not be found.',
    }
  }

  return {
    title: post.data.title as string,
    description: post.data.description as string,
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params

  // Data: Get post by slug
  const post = source.getPage([slug])

  // Business logic: Check if post exists
  if (!post) return notFound()

  // Find the category
  const pageTree = source.getPageTree()
  let categoryName = ''
  let categorySlug = ''
  for (const node of pageTree.children) {
    if (node.type === 'folder') {
      const hasPage = node.children.some(
        (child) => child.type === 'page' && child.url === post.url,
      )
      if (hasPage) {
        categoryName = node.name as string
        categorySlug = String.toSlug(node.$id as string)
        break
      }
    }
  }

  // Data: Prepare post body component
  const MDX = post.data.body

  // Data: Prepare related posts component (simple: first 3, excluding current)
  const related = source
    .getPages()
    .filter((p: any) => p.slugs.join('/') !== slug)
    .splice(0, 3)

  return (
    <SitePage>
      {/* SEO - Structured Data For Article */}
      <ArticleJsonLd
        article={createArticleSchema({
          headline: post.data.title,
          description: post.data.description as string,
          datePublished: DateUtils.toISOStringSafe(post.data.lastModified),
          url: `/help/${slug}`,
          section: categoryName,
          keywords: post.data.tags || [],
          author: {
            name: 'Help Center',
          },
          publisher: {
            name: AppConfig.name,
            url: AppConfig.url,
            logo: AppConfig.brand.logo.light,
          },
        })}
      />

      {/* SEO - Structured Data For Organization */}
      <OrganizationJsonLd
        organization={createOrganizationSchema({
          name: AppConfig.name,
          url: AppConfig.url,
          logo: AppConfig.brand.logo.light,
          description: AppConfig.description,
          email: AppConfig.links.mail,
          sameAs: [
            AppConfig.links.twitter,
            AppConfig.links.linkedin,
            AppConfig.links.facebook,
            AppConfig.links.instagram,
          ].filter(Boolean),
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
                  href: `/help/${categorySlug}`,
                  isActive: false,
                },
                {
                  label: post.data.title,
                  href: `/help/${slug}`,
                  isActive: true,
                },
              ]}
            />
            <SitePageHeaderSectionContent className="lg:max-w-[60%]">
              {post.data.lastModified && (
                <p className="text-muted-foreground mb-1 text-sm">
                  {DateUtils.formatDate(post.data.lastModified, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              <SitePageHeaderSectionTitle className="text-3xl">
                {post.data.title}
              </SitePageHeaderSectionTitle>
              <SitePageHeaderSectionDescription>
                {post.data.description}
              </SitePageHeaderSectionDescription>
            </SitePageHeaderSectionContent>
          </SitePageHeaderSectionContainer>
        </SitePageHeaderSection>
      </SitePageHeader>

      <SitePageArticleProvider toc={post.data.toc}>
        <SitePageContent>
          {/* Render Help Article */}
          <SitePageArticle>
            <SitePageArticleContainer>
              <SitePageArticleContent>
                {/* Render Help Article Content */}
                <MDX components={getMDXComponents()} />

                {/* Render Related Articles */}
                <SitePageArticleRelated>
                  <SitePageArticleRelatedHeader />
                  <SitePageArticleRelatedList>
                    {related?.map((item: any) => (
                      <SitePageArticleRelatedItem
                        key={item.slugs.join('/')}
                        href={`/help/${item.slugs.join('/')}`}
                      >
                        {item.data.title}
                      </SitePageArticleRelatedItem>
                    ))}
                  </SitePageArticleRelatedList>
                </SitePageArticleRelated>
              </SitePageArticleContent>

              {/* Render Help Article Sidebar */}
              <SitePageArticleSidebar>
                {/* Render Article Table of Contents */}
                <SitePageArticleTOC items={post.data.toc} />

                {/* Render Article Tags or CTA */}
                <SiteCTACard />
              </SitePageArticleSidebar>
            </SitePageArticleContainer>
          </SitePageArticle>
        </SitePageContent>
      </SitePageArticleProvider>
    </SitePage>
  )
}
