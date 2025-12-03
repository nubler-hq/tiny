import React from 'react'
import { WebPageJsonLdProps } from './types'
import { createJsonLdComponent } from './json-ld'

/**
 * WebPage JSON-LD Schema Component
 * Used for web pages and category pages
 */
export const WebPageJsonLd: React.FC<WebPageJsonLdProps> = ({
  webpage,
  id = 'webpage-jsonld',
}) => {
  const WebPageComponent = createJsonLdComponent('WebPage')

  return <WebPageComponent data={webpage} id={id} />
}

/**
 * Helper function to create webpage schema data
 */
export function createWebPageSchema({
  name,
  description,
  url,
  siteUrl,
  image,
  datePublished,
  dateModified,
  breadcrumb,
}: {
  name: string
  description: string
  url: string
  siteUrl: string
  image?: string
  datePublished?: string
  dateModified?: string
  breadcrumb?: any
}) {
  const schema: any = {
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': siteUrl,
    },
  }

  if (image) {
    schema.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: image,
    }
  }

  if (datePublished) schema.datePublished = datePublished
  if (dateModified) schema.dateModified = dateModified
  if (breadcrumb) schema.breadcrumb = breadcrumb

  return schema
}

/**
 * Helper function to create breadcrumb for web pages
 */
export function createWebPageBreadcrumb({
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
