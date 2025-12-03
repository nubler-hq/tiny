import { InferPageType, loader } from 'fumadocs-core/source'
import { pages } from '../../../../../.source'

/**
 * @constant source
 * @description Loader for the pages, using configuration from source.config.ts.
 */
export const source = loader({
  baseUrl: '/pages',
  source: pages.toFumadocsSource(),
})

/**
 * @constant ContentTypePageEntry
 * @description Type for the Pages contents
 */
export type ContentTypePageEntry = InferPageType<typeof source>
