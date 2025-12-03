import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'
import { ArticleJsonLd, createArticleSchema } from '@/components/seo/article'
import {
  OrganizationJsonLd,
  createOrganizationSchema,
} from '@/components/seo/organization'
import { AppConfig } from '@/config/boilerplate.config.client'
import { source } from '../source'
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
  SitePageArticleAuthor,
  SitePageArticleAuthorTitle,
  SitePageArticleAuthorLink,
  SitePageArticleAuthorAvatar,
  SitePageArticleAuthorInfo,
  SitePageArticleAuthorName,
  SitePageArticleAuthorRole,
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

export async function generateMetadata({
  params,
}: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params

  const post = source.getPage([slug])
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog article you are looking for could not be found.',
    }
  }

  return {
    title: post.data.title as string,
    description: post.data.description as string,
  }
}

export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params

  // Data: Get post by slug
  const post = source.getPage([slug])

  // Business logic: Check if post exists
  if (!post) return notFound()

  // Data: Prepare post body component
  const MDX = post.data.body

  // Data: Prepare related posts component
  const related = source.getPages().splice(0, 3)

  return (
    <SitePage>
      {/* SEO - Structured Data For Article */}
      <ArticleJsonLd
        article={createArticleSchema({
          headline: post.data.title,
          description: post.data.description as string,
          datePublished: DateUtils.toISOStringSafe(post.data.lastModified),
          url: `/blog/${slug}`,
          section: 'Blog',
          keywords: post.data.tags || [],
          author: {
            name: AppConfig.creator.name,
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
                { label: 'Blog', href: '/blog', isActive: false },
                {
                  label: post.data.title,
                  href: `/blog/${slug}`,
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
          {/* Render Blog Post Article */}
          <SitePageArticle>
            <SitePageArticleContainer>
              <SitePageArticleContent>
                {/* Render Blog Post Content */}
                <MDX components={getMDXComponents()} />

                {/* Render Blog Post Related */}
                <SitePageArticleRelated>
                  <SitePageArticleRelatedHeader />
                  <SitePageArticleRelatedList>
                    {related?.map((item) => (
                      <SitePageArticleRelatedItem
                        key={item.slugs[0]}
                        href={item.slugs[0]}
                      >
                        {item.data.title}
                      </SitePageArticleRelatedItem>
                    ))}
                  </SitePageArticleRelatedList>
                </SitePageArticleRelated>
              </SitePageArticleContent>

              {/* Render Blog Post Sidebar */}
              <SitePageArticleSidebar>
                {/* Render Blog Post Author */}
                <SitePageArticleAuthor>
                  <SitePageArticleAuthorTitle>
                    Written by
                  </SitePageArticleAuthorTitle>
                  <SitePageArticleAuthorLink href={AppConfig.creator.url}>
                    <SitePageArticleAuthorAvatar
                      src={AppConfig.creator.image}
                      alt={AppConfig.creator.name}
                      fallback={AppConfig.creator.name[0]}
                    />
                    <SitePageArticleAuthorInfo>
                      <SitePageArticleAuthorName>
                        {AppConfig.creator.name}
                      </SitePageArticleAuthorName>
                      <SitePageArticleAuthorRole>
                        {AppConfig.creator.role}
                      </SitePageArticleAuthorRole>
                    </SitePageArticleAuthorInfo>
                  </SitePageArticleAuthorLink>
                </SitePageArticleAuthor>

                {/* Render Blog Post Table of Contents */}
                <SitePageArticleTOC items={post.data.toc} />

                {/* Render Blog Post Tags */}
                <SiteCTACard />
              </SitePageArticleSidebar>
            </SitePageArticleContainer>
          </SitePageArticle>
        </SitePageContent>
      </SitePageArticleProvider>
    </SitePage>
  )
}
