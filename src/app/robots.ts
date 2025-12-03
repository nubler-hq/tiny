import type { MetadataRoute } from 'next'
import { AppConfig } from '@/config/boilerplate.config.client'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback/'],
    },
    sitemap: `${AppConfig.url}/sitemap.xml`,
    host: AppConfig.url,
  }
}
