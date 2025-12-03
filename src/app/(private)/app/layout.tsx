import { SessionProvider } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { api } from '@/igniter.client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import type { PropsWithChildren } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default async function Layout({ children }: PropsWithChildren) {
  const nextHeaders = await headers()
  const pathname = nextHeaders.get('x-pathname') || '/'

  // Business Rule: Get the current session
  const session = await api.auth.getSession.query()

  // Business Rule: If the user is not authenticated, redirect to the login page
  if (session.error || !session.data)
    redirect('/auth?redirect=' + encodeURIComponent(pathname))

  return (
    <SessionProvider initialSession={session.data}>{children}</SessionProvider>
  )
}
