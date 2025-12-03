import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from './source'

interface DocsLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: DocsLayoutProps) {
  return (
    <DocsLayout
      githubUrl="https://github.com/vibe-dev/saas-boilerplate"
      tree={source.pageTree}
      nav={{
        enabled: false,
      }}
      sidebar={{
        collapsible: false,
      }}
    >
      {children}
    </DocsLayout>
  )
}
