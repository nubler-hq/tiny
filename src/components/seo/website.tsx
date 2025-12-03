import React from 'react'
import { WebSiteJsonLdProps } from './types'
import { createJsonLdComponent } from './json-ld'

/**
 * WebSite JSON-LD Schema Component
 * Used for website information and search functionality
 */
export const WebSiteJsonLd: React.FC<WebSiteJsonLdProps> = ({
  website,
  id = 'website-jsonld',
}) => {
  const WebSiteComponent = createJsonLdComponent('WebSite')

  return <WebSiteComponent data={website} id={id} />
}

/**
 * Helper function to create website schema data
 */
export function createWebSiteSchema({
  name,
  url,
  inLanguage = 'en',
  searchUrl,
  description,
}: {
  name: string
  url: string
  inLanguage?: string
  searchUrl?: string
  description?: string
}) {
  const schema: any = {
    '@type': 'WebSite',
    name,
    url,
    inLanguage,
    ...(description && { description }),
  }

  if (searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: `${searchUrl}{search_term_string}`,
      'query-input': 'required name=search_term_string',
    }
  }

  return schema
}
