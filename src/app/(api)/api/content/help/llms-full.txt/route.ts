import { source } from '@/app/(site)/(content)/help/source'
import { getLLMFullText } from '../../llm-utils'

export const revalidate = false

export async function GET() {
  const text = await getLLMFullText(source)
  return new Response(text)
}
