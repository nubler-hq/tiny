import React from 'react'
import { FAQPageJsonLdProps, FAQItem } from './types'
import { createJsonLdComponent } from './json-ld'

/**
 * FAQ Page JSON-LD Schema Component
 * Used for FAQ pages with multiple questions and answers
 */
export const FAQPageJsonLd: React.FC<FAQPageJsonLdProps> = ({
  faqPage,
  id = 'faqpage-jsonld',
}) => {
  const FAQPageComponent = createJsonLdComponent('FAQPage')

  return <FAQPageComponent data={faqPage} id={id} />
}

/**
 * Helper function to create FAQ page schema data
 */
export function createFAQPageSchema({
  faqs,
  headline,
  description,
}: {
  faqs: Array<{ question: string; answer: string }>
  headline?: string
  description?: string
}) {
  const schema: any = {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  if (headline) schema.headline = headline
  if (description) schema.description = description

  return schema
}

/**
 * Helper function to create FAQ items from simple array
 */
export function createFAQItems(
  faqs: Array<{ question: string; answer: string }>,
): FAQItem[] {
  return faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }))
}
