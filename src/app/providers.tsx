'use client'

import { IgniterProvider } from '@igniter-js/core/client'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <IgniterProvider>{children}</IgniterProvider>
}
