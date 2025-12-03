import React from 'react'
import { OrganizationJsonLdProps } from './types'
import { createJsonLdComponent } from './json-ld'

/**
 * Organization JSON-LD Schema Component
 * Used for company/organization information
 */
export const OrganizationJsonLd: React.FC<OrganizationJsonLdProps> = ({
  organization,
  id = 'organization-jsonld',
}) => {
  const OrganizationComponent = createJsonLdComponent('Organization')

  return <OrganizationComponent data={organization} id={id} />
}

/**
 * Helper function to create organization schema data
 */
export function createOrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs = [],
  email,
  availableLanguages = ['en'],
}: {
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[]
  email?: string
  availableLanguages?: string[]
}): OrganizationJsonLdProps['organization'] {
  return {
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(sameAs.length > 0 && { sameAs: sameAs.filter(Boolean) }),
    ...(email && {
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email,
          contactType: 'customer support',
          availableLanguage: availableLanguages,
        },
      ],
    }),
  }
}
