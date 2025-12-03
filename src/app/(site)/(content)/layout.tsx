import { RootProvider } from 'fumadocs-ui/provider/next'
import type { PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative overflow-hidden flex flex-col h-full">
      <RootProvider
        theme={{
          enabled: true,
        }}
        search={{
          options: {
            api: '/api/content/docs/search',
          },
        }}
      >
        {children}
      </RootProvider>
    </div>
  )
}
