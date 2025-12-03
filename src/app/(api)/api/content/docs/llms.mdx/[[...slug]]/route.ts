import { source } from '@/app/(site)/(content)/docs/source'
import { notFound } from 'next/navigation'
import { getLLMPageText } from '../../../llm-utils'

export const revalidate = false

export async function GET(
  _req: Request,
  { params }: RouteContext<'/api/content/docs/llms.mdx/[[...slug]]'>,
) {
  const { slug } = await params
  if (!slug) return notFound()
  const text = await getLLMPageText(source, slug)
  if (!text) notFound()

  return new Response(text, {
    headers: {
      'Content-Type': 'text/markdown',
    },
  })
}

export function generateStaticParams() {
  return source.generateParams()
}
