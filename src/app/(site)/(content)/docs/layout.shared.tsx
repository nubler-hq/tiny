import { AppConfig } from '@/config/boilerplate.config.client'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: AppConfig.name,
    },
  }
}
