'use client'

import * as React from 'react'
import { Link } from 'next-view-transitions'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { settingsSidebarMenu } from '@/content/menus/settings'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { cn } from '@/utils/cn'
import { usePathname } from 'next/navigation'

export function DashboardSettingsSidebar({
  className,
}: {
  className?: string
}) {
  const auth = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <Sidebar className={cn(className, 'py-3')}>
      <SidebarMenu>
        <SidebarHeader>
          <h2 className="text-sm font-semibold ml-2">Settings</h2>
        </SidebarHeader>

        <SidebarContent>
          {settingsSidebarMenu.groups.map((group, index) => (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
              <SidebarGroupContent>
                {group.menu.map((item) => {
                  if (
                    item.url === '/app/settings/organization/billing' &&
                    !auth.session.organization?.billing
                  )
                    return null

                  return (
                    <SidebarMenuItem
                      id={item.title}
                      active={isActive(item.url ?? '#')}
                      key={item.title}
                    >
                      <Link
                        href={item.url}
                        className="inline-flex items-center gap-2"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </SidebarMenu>
    </Sidebar>
  )
}
