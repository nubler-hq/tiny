import { source } from '@/app/(site)/(content)/docs/source'
import { getLLMFullText } from '../../llm-utils'

export const revalidate = false

export async function GET() {
  const text = await getLLMFullText(source)
  return new Response(text)
}
