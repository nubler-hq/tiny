'use client'

import { AppConfig } from '@/config/boilerplate.config.client'
import {
  ArrowUpRightIcon,
  Home,
  LogOut,
  MessageSquare,
  Newspaper,
  Palette,
  Rocket,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { api } from '@/igniter.client'
import { useRouter } from 'next/navigation'
import { useKeybind } from '@/@saas-boilerplate/hooks/use-keybind'
import { toast } from 'sonner'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { String } from '@/@saas-boilerplate/utils/string'

export function UserDashboardSidebarDropdown() {
  const auth = useAuth()
  const router = useRouter()

  const user = auth.session.user

  const handleNavigateToProfile = () => {
    // TODO: Implement profile page navigation
  }

  const handleNavigateToChangelog = () => {
    router.push(AppConfig.links.changelog)
  }

  const handleNavigateToBlog = () => {
    router.push(AppConfig.links.blog)
  }

  const handleSendFeedback = () => {
    window.open(`mailto:${AppConfig.links.mail}`)
  }

  const handleNavigateToHomepage = () => {
    router.push(AppConfig.links.site)
  }

  const handleSignOut = () => {
    api.auth.signOut.mutate()
    router.push('/auth')
    toast.success('You have signed out')
  }

  useKeybind('shift+cmd+p', handleNavigateToProfile)
  useKeybind('shift+cmd+h', handleNavigateToHomepage)
  useKeybind('shift+cmd+q', handleSignOut)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-6 rounded-md data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ">
          <AvatarImage src={user.image ?? ''} alt={user.name} />
          <AvatarFallback className="text-[10px]">
            {String.getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="grid flex-1 text-left text-xs leading-tight space-y-1">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleNavigateToProfile}>
            <User className="mr-2 size-3" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleNavigateToChangelog}>
            <Rocket className="mr-2 size-3" />
            <span>Changelog</span>
            <ArrowUpRightIcon className="size-3 ml-auto text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleNavigateToBlog}>
            <Newspaper className="mr-2 size-3" />
            <span>Blog</span>
            <ArrowUpRightIcon className="size-3 ml-auto text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendFeedback}>
            <MessageSquare className="mr-2 size-3" />
            <span>Send feedback</span>
            <ArrowUpRightIcon className="size-3 ml-auto text-muted-foreground" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="justify-between hover:bg-transparent cursor-default">
            <div className="flex items-center">
              <Palette className="mr-2 size-3" />
              <span>Theme</span>
            </div>
            <ThemeToggle />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleNavigateToHomepage}>
            <Home className="mr-2 size-3" />
            <span>Homepage</span>
            <DropdownMenuShortcut>⇧⌘H</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 size-3" />
            <span>Sign out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
