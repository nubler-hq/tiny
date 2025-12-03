import React from 'react'
import { ArticleJsonLdProps } from './types'
import { createJsonLdComponent } from './json-ld'

/**
 * Article JSON-LD Schema Component
 * Used for articles, blog posts, news articles, and help articles
 */
export const ArticleJsonLd: React.FC<ArticleJsonLdProps> = ({
  article,
  id = 'article-jsonld',
}) => {
  const ArticleComponent = createJsonLdComponent('Article')

  return <ArticleComponent data={article} id={id} />
}

/**
 * Helper function to create article schema data
 */
export function createArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  url,
  section,
  keywords = [],
  wordCount,
  timeRequired,
  breadcrumb,
}: {
  headline: string
  description: string
  image?: string[]
  datePublished: string
  dateModified?: string
  author: {
    name: string
    url?: string
    image?: string
    sameAs?: string[]
  }
  publisher: {
    name: string
    url: string
    logo?: string
  }
  url: string
  section?: string
  keywords?: string[]
  wordCount?: number
  timeRequired?: string
  breadcrumb?: any
}) {
  return {
    '@type': 'Article',
    headline,
    description,
    ...(image && { image }),
    datePublished,
    ...(dateModified && { dateModified }),
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
      ...(author.image && { image: author.image }),
      ...(author.sameAs && { sameAs: author.sameAs }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      url: publisher.url,
      ...(publisher.logo && { logo: publisher.logo }),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(section && { articleSection: section }),
    ...(keywords.length > 0 && { keywords }),
    ...(wordCount && { wordCount }),
    ...(timeRequired && { timeRequired }),
    ...(breadcrumb && { breadcrumb }),
  }
}

/**
 * Helper function to create breadcrumb for articles
 */
export function createArticleBreadcrumb({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
