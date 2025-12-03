'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { api } from '@/igniter.client'
import { toast } from 'sonner'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { String } from '@/@saas-boilerplate/utils/string'
import { ArrowUpRightIcon, LogOutIcon } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { useDisclosure } from '@/@saas-boilerplate/hooks/use-disclosure'

export function UserDashboardMobileDrawer() {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const ref = useRef<HTMLButtonElement>(null)
  const disclosure = useDisclosure()

  useEffect(() => {
    disclosure.onClose()
  }, [pathname, disclosure])

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" className="space-x-4" ref={ref}>
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarImage
              src={auth.session.user.image ?? ''}
              alt={`@${auth.session.user.name}`}
            />
            <AvatarFallback>
              {String.getInitials(auth.session.user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm pb-8">
          <DrawerHeader className="flex flex-col items-start px-3">
            <DrawerTitle>{auth.session.user.name}</DrawerTitle>
            <DrawerDescription>{auth.session.user.email}</DrawerDescription>
          </DrawerHeader>

          <div className="grid gap-4">
            <Button variant="ghost" asChild>
              <Link href="/app/settings">
                <span>My profile</span>
                <ArrowUpRightIcon className="size-2 ml-auto text-muted-foreground" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push(AppConfig.links.changelog)
              }}
            >
              <span>Changelog</span>
              <ArrowUpRightIcon className="size-2 ml-auto text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push(AppConfig.links.blog)
              }}
            >
              <span>Blog</span>
              <ArrowUpRightIcon className="size-2 ml-auto text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.open(`mailto:${AppConfig.links.mail}`)}
            >
              <span>Send feedback</span>
              <ArrowUpRightIcon className="size-2 ml-auto text-muted-foreground" />
            </Button>

            <Separator />

            <Button variant="ghost" className="justify-between cursor-default">
              <span>Theme</span>
              <ThemeToggle />
            </Button>

            <Separator />

            <Button
              variant="ghost"
              onClick={() => {
                router.push(AppConfig.links.site)
              }}
            >
              <span>View homepage</span>
              <ArrowUpRightIcon className="size-2 ml-auto text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              className="justify-between"
              onClick={() => {
                api.auth.signOut.mutate()
                router.push('/auth')
                toast.success('You have signed out')
              }}
            >
              <span>Sign out</span>
              <LogOutIcon />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
