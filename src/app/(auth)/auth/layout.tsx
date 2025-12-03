import { Link } from 'next-view-transitions'

import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, LifeBuoyIcon } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { Logo } from '@/components/ui/logo'
import { api } from '@/igniter.client'
import { redirect } from 'next/navigation'
import { AppConfig } from '@/config/boilerplate.config.client'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default async function Layout({ children }: PropsWithChildren) {
  // Business Rule: Get the current session
  const session = await api.auth.getSession.query()

  // Business Rule: If the session is valid, redirect to the app
  if (session.data) redirect('/app')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-start space-x-4">
            <Button
              variant="secondary"
              className="rounded-full"
              size="icon"
              asChild
            >
              <Link href="/">
                <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
              </Link>
            </Button>

            <Logo size="full" />
          </div>

          <div className="flex justify-end">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              asChild
            >
              <Link href={AppConfig.links.support}>
                <LifeBuoyIcon className="w-4 h-4" />
                <span className="text-sm">Get Support</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] mx-auto space-y-6">{children}</div>
      </main>

      <footer className="container mx-auto py-6 px-4">
        <div className="flex justify-center">
          <small className="text-sm text-muted-foreground">
            © 2025 {AppConfig.name}
          </small>
        </div>
      </footer>
    </div>
  )
}
