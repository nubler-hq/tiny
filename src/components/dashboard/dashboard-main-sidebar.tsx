'use client'

import * as React from 'react'

import { Link } from 'next-view-transitions'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/ui/logo'
import { OrganizationDashboardSidebarSelector } from '@/@saas-boilerplate/features/organization/presentation/components/organization-dashboard-sidebar-selector'
import { BillingDashboardSidebarUpgradeCard } from '@/@saas-boilerplate/features/billing/presentation/components/billing-dashboard-sidebar-upgrade-card'
import { dashboardSidebarMenu } from '@/content/menus/dashboard'
import { UserDashboardSidebarDropdown } from '@/@saas-boilerplate/features/user/presentation/components/user-dashboard-sidebar-dropdown'
import { usePathname } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommandDialog } from '@/components/ui/command-dialog'
import { useKeybind } from '@/@saas-boilerplate/hooks/use-keybind'
import { NotificationMenu } from '@/@saas-boilerplate/features/notification/presentation/components/notification-menu'

export function DashboardMainSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [commandDialogOpen, setCommandDialogOpen] = React.useState(false)

  const isActive = (path: string) => pathname === path

  // Handle command+k shortcut
  useKeybind(
    'cmd+k',
    () => {
      setCommandDialogOpen(true)
    },
    [],
  )

  return (
    <Sidebar className={className}>
      <SidebarMenu>
        <SidebarHeader className="pl-6 pt-6 flex items-center justify-between">
          <span
            id="welcome_tour-presentation"
            className="flex items-center w-full justify-between"
          >
            <Logo size="full" />
            <div className="space-x-2 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => setCommandDialogOpen(true)}
                title="Search (⌘K)"
              >
                <SearchIcon className="size-3" />
              </Button>
              <NotificationMenu />
              <UserDashboardSidebarDropdown />
            </div>
          </span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup key="sidebar-toolbar" className="w-full">
            <SidebarGroupContent className="w-full">
              <OrganizationDashboardSidebarSelector />
            </SidebarGroupContent>
          </SidebarGroup>

          {dashboardSidebarMenu.groups.map(
            (group: {
              id: string
              name: string
              menu: Array<{
                id: string
                title: string
                url: string
                icon: React.ElementType
                items?: Array<{
                  id: string
                  title: string
                  href?: string
                  url?: string
                  icon?: React.ElementType
                }>
              }>
            }) => (
              <SidebarGroup key={group.id}>
                <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {group.menu.map((item) =>
                    item.items ? (
                      <div id={item.id} key={item.id}>
                        <SidebarMenuSubButton id={`trigger_${item.id}`}>
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </SidebarMenuSubButton>
                        <SidebarMenuSub id={`sub_${item.id}`}>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem
                              active={isActive(subItem.href ?? '#')}
                              key={subItem.id}
                            >
                              <Link href={subItem.href || subItem.url || '#'}>
                                {subItem.icon && (
                                  <subItem.icon className="w-4 h-4" />
                                )}
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </div>
                    ) : (
                      <SidebarMenuItem
                        id={item.id}
                        active={isActive(item.url || '#')}
                        key={item.id}
                      >
                        <Link href={item.url || '#'} className="w-full">
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </Link>
                      </SidebarMenuItem>
                    ),
                  )}
                </SidebarGroupContent>
              </SidebarGroup>
            ),
          )}
        </SidebarContent>

        <SidebarFooter className="flex flex-col pt-0 h-auto space-y-4">
          <BillingDashboardSidebarUpgradeCard />
        </SidebarFooter>
      </SidebarMenu>

      <CommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
    </Sidebar>
  )
}
