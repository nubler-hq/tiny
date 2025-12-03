import { AppConfig } from '@/config/boilerplate.config.client'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { api } from '@/igniter.client'
import { HelpCircleIcon, LogOutIcon } from 'lucide-react'
import { Link } from 'next-view-transitions'

interface LayoutProps {
  children: React.ReactNode
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default function Layout({ children }: LayoutProps) {
  async function signOut() {
    'use server'
    await api.auth.signOut.mutate()
  }

  return (
    <div className="grid overflow-hidden h-screen grid-rows-[auto_1fr] gap-4 p-8">
      <div className="grid grid-cols-[1fr_auto] items-center mb-3">
        <div className="flex items-center gap-2">
          <Logo className="h-5" />
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button
            variant="ghost"
            title="Acessar central de ajuda"
            aria-label="Acessar central de ajuda"
            className="hidden lg:inline-flex"
            asChild
          >
            <Link href={AppConfig.links.support}>
              <span className="text-sm">Get Support</span>
              <HelpCircleIcon className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Acessar central de ajuda"
            aria-label="Acessar central de ajuda"
            className="lg:hidden"
            asChild
          >
            <Link href={AppConfig.links.support}>
              <HelpCircleIcon className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            title="Sair da conta"
            aria-label="Sair da conta"
            className="hidden lg:inline-flex"
            onClick={signOut}
          >
            <span className="text-sm">Logout</span>
            <LogOutIcon className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            title="Sair da conta"
            aria-label="Sair da conta"
            className="lg:hidden"
            onClick={signOut}
          >
            <LogOutIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 lg:pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {children}
      </div>
    </div>
  )
}
