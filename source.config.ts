import {
  defineDocs,
  defineConfig,
  frontmatterSchema,
} from 'fumadocs-mdx/config'
import { z } from 'zod'

/**
 * @constant docs
 * @description Configuration for the documentation section using Fumadocs.
 *
 * This constant defines the docs configuration for the SaaS Boilerplate documentation system.
 * It specifies the directory, schema extension, and post-processing options for markdown files.
 * Ensures all documentation files are processed and validated according to the defined schema.
 *
 * Key features:
 * - Directory-based organization for docs
 * - Extended frontmatter schema for additional metadata
 * - Automatic inclusion of processed markdown
 *
 * @returns {DocsConfig} The configuration object for documentation processing
 * @example
 * ```typescript
 * import { docs } from './source.config'
 * // Use docs in your documentation generation pipeline
 * ```
 */
export const docs = defineDocs({
  dir: 'src/content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

/**
 * @constant blog
 * @description Configuration for the blog section using Fumadocs.
 *
 * This constant defines the blog configuration for the SaaS Boilerplate, specifying directory,
 * schema extension for metadata (description, tags, date), and post-processing options.
 * Ensures all blog posts are validated and processed according to the defined schema.
 *
 * Key features:
 * - Directory-based organization for blog posts
 * - Extended frontmatter schema for description, tags, and date
 * - Automatic inclusion of processed markdown
 *
 * @returns {DocsConfig} The configuration object for blog processing
 * @example
 * ```typescript
 * import { blog } from './source.config'
 * // Use blog in your documentation generation pipeline
 * ```
 */
export const blog = defineDocs({
  dir: 'src/content/blog',
  docs: {
    schema: frontmatterSchema.extend({
      cover: z.string().url().optional(),
      tags: z.array(z.string()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

/**
 * @constant updates
 * @description Configuration for the updates section using Fumadocs.
 *
 * This constant defines the updates configuration for the SaaS Boilerplate, specifying directory,
 * schema extension for metadata (tags, date), and post-processing options.
 * Ensures all update entries are validated and processed according to the defined schema.
 *
 * Key features:
 * - Directory-based organization for updates
 * - Extended frontmatter schema for tags and date
 * - Automatic inclusion of processed markdown
 *
 * @returns {DocsConfig} The configuration object for updates processing
 * @example
 * ```typescript
 * import { updates } from './source.config'
 * // Use updates in your documentation generation pipeline
 * ```
 */
export const updates = defineDocs({
  dir: 'src/content/updates',
  docs: {
    schema: frontmatterSchema.extend({
      cover: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

/**
 * @constant pages
 * @description Configuration for the pages section using Fumadocs.
 *
 * This constant defines the pages configuration for the SaaS Boilerplate, specifying directory,
 * schema extension for metadata (description), and post-processing options.
 * Ensures all page entries are validated and processed according to the defined schema.
 *
 * Key features:
 * - Directory-based organization for pages
 * - Extended frontmatter schema for description
 * - Automatic inclusion of processed markdown
 *
 * @returns {DocsConfig} The configuration object for pages processing
 * @example
 * ```typescript
 * import { pages } from './source.config'
 * // Use pages in your documentation generation pipeline
 * ```
 */
export const pages = defineDocs({
  dir: 'src/content/pages',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

/**
 * @constant help
 * @description Configuration for the help section using Fumadocs.
 *
 * This constant defines the help configuration for the SaaS Boilerplate, specifying directory,
 * schema extension for metadata (date, tags), and post-processing options.
 * Ensures all help entries are validated and processed according to the defined schema.
 *
 * Key features:
 * - Directory-based organization for help entries
 * - Extended frontmatter schema for date and tags
 * - Automatic inclusion of processed markdown
 *
 * @returns {DocsConfig} The configuration object for help processing
 * @example
 * ```typescript
 * import { help } from './source.config'
 * // Use help in your documentation generation pipeline
 * ```
 */
export const help = defineDocs({
  dir: 'src/content/help',
  docs: {
    schema: frontmatterSchema.extend({
      tags: z.array(z.string()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

/**
 * @constant default
 * @description Default configuration export for Fumadocs.
 *
 * This export provides the default configuration for the documentation system,
 * ensuring all sections are registered and processed according to the defined schemas.
 *
 * Key features:
 * - Registers all documentation sections (docs, blog, updates, pages, help)
 * - Provides a single entry point for documentation configuration
 *
 * @returns {DocsConfig} The default configuration object for Fumadocs
 * @example
 * ```typescript
 * import config from './source.config'
 * // Use config in your documentation generation pipeline
 * ```
 */
export default defineConfig({
  lastModifiedTime: 'git',
})
