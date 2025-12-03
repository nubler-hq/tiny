'use client'

import Link from 'next/link'

import { HomeIcon, SendIcon, Users2Icon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
  MobileMenu,
  MobileMenuButton,
  MobileMenuContent,
} from '@/components/ui/mobile-menu'
import { UserDashboardMobileDrawer } from '@/@saas-boilerplate/features/user/presentation/components/user-dashboard-mobile-drawer'

export function DashboardMobileNavMenu() {
  const pathname = usePathname()

  const isActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path)
  }

  return (
    <MobileMenu>
      <MobileMenuContent>
        <MobileMenuButton isActive={isActive('/app', true)}>
          <Link href="/app">
            <HomeIcon className="size-5" />
          </Link>
        </MobileMenuButton>
        <MobileMenuButton isActive={isActive('/app/leads')}>
          <Link href="/app/leads">
            <Users2Icon className="size-5" />
          </Link>
        </MobileMenuButton>
        <MobileMenuButton isActive={isActive('/app/submissions')}>
          <Link href="/app/submissions">
            <SendIcon className="size-5" />
          </Link>
        </MobileMenuButton>
        <MobileMenuButton>
          <UserDashboardMobileDrawer />
        </MobileMenuButton>
      </MobileMenuContent>
    </MobileMenu>
  )
}
