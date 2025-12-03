import React from 'react'
import { CollectionPageJsonLdProps } from './types'
import { createJsonLdComponent } from './json-ld'

/**
 * CollectionPage JSON-LD Schema Component
 * Used for pages that contain collections of items (category pages, article lists)
 */
export const CollectionPageJsonLd: React.FC<CollectionPageJsonLdProps> = ({
  collectionPage,
  id = 'collectionpage-jsonld',
}) => {
  const CollectionPageComponent = createJsonLdComponent('CollectionPage')

  return <CollectionPageComponent data={collectionPage} id={id} />
}

/**
 * Helper function to create collection page schema data
 */
export function createCollectionPageSchema({
  name,
  description,
  url,
  siteUrl,
  items,
  datePublished,
  dateModified,
  breadcrumb,
}: {
  name: string
  description: string
  url: string
  siteUrl: string
  items: Array<{
    name: string
    description: string
    url: string
    image?: string
    datePublished?: string
  }>
  datePublished?: string
  dateModified?: string
  breadcrumb?: any
}) {
  const schema: any = {
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': siteUrl,
    },
    datePublished,
    ...(dateModified && { dateModified }),
    ...(breadcrumb && { breadcrumb }),
    mainEntity: {
      '@type': 'ItemList',
      name: `${name} Articles`,
      description: `Collection of articles in ${name}`,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'WebPage',
        position: index + 1,
        name: item.name,
        description: item.description,
        url: item.url,
        ...(item.image && {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: item.image,
          },
        }),
        ...(item.datePublished && { datePublished: item.datePublished }),
      })),
    },
  }

  return schema
}
