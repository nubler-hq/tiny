import type { InferPageType, LoaderOutput } from 'fumadocs-core/source'

export async function getLLMFullText(source: LoaderOutput<any>) {
  const pages = source.getPages()
  const scan = await Promise.all(
    pages.map(async (page: InferPageType<typeof source>) => {
      const processed = await page.data.getText('processed')
      return `# ${page.data.title} (${page.url})\n\n${processed}`
    }),
  )
  return scan.join('\n\n')
}

export async function getLLMPageText(
  source: LoaderOutput<any>,
  slug: string[],
) {
  const page = source.getPage(slug)
  if (!page) return null
  const processed = await page.data.getText('processed')
  return `# ${page.data.title} (${page.url})\n\n${processed}`
}
