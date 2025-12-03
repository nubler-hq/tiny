import React from 'react'

/**
 * Base component for rendering JSON-LD structured data
 */
interface JsonLdProps {
  data: Record<string, any>
  id?: string
}

export function JsonLd({ data, id }: JsonLdProps) {
  // Add @context if not present
  const structuredData = {
    '@context': 'https://schema.org',
    ...data,
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0), // Minified JSON
      }}
    />
  )
}

/**
 * Higher-order component for creating type-safe JSON-LD components
 */
export function createJsonLdComponent<T extends Record<string, any>>(
  componentName: string,
) {
  const Component = React.forwardRef<
    HTMLScriptElement,
    { data: T; id?: string }
  >(({ data, id }, ref) => (
    <script
      ref={ref}
      id={id || componentName.toLowerCase()}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          {
            '@context': 'https://schema.org',
            ...data,
          },
          null,
          0,
        ),
      }}
    />
  ))

  Component.displayName = componentName

  return Component
}
