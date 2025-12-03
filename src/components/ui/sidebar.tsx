'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'
import { cn } from '@/utils/cn'
import { Skeleton } from './skeleton'
import { Badge } from './badge'
import { Input } from './input'
import { Separator } from './separator'
import { ChevronDown } from 'lucide-react'

// Context
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isRailMode: boolean
  setRailMode: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  setIsOpen: () => {},
  isRailMode: false,
  setRailMode: () => {},
})

// Animation variants
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

const menuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

const groupVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

// Adicione este contexto para gerenciar os estados dos submenus
const MenuContext = createContext<{
  openItems: Record<string, boolean>
  toggleItem: (id: string) => void
}>({
  openItems: {},
  toggleItem: () => {},
})

function MenuProvider({ children }: { children: React.ReactNode }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  return (
    <MenuContext.Provider value={{ openItems, toggleItem }}>
      {children}
    </MenuContext.Provider>
  )
}

// Hook
export function useSidebar() {
  return useContext(SidebarContext)
}

// Root component
function Sidebar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'hidden md:flex h-screen bg-transparent overflow-hidden',
        className,
      )}
    >
      {children}
    </motion.aside>
  )
}

// Content components
function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={menuVariants}
      className={cn('flex-1 overflow-y-auto py-4 space-y-4', className)}
    >
      {children}
    </motion.div>
  )
}

function SidebarRail({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isRailMode } = useSidebar()
  return (
    <motion.div
      variants={menuVariants}
      className={cn(
        'w-16 border-r border-border flex flex-col items-center py-4',
        isRailMode ? 'flex' : 'hidden',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={cn('px-4', className)}>
      {children}
    </motion.div>
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={cn('h-9', className)} {...props} />
}

function SidebarSeparator({ className }: { className?: string }) {
  return <Separator className={cn('my-4 w-[120%]', className)} />
}

function SidebarTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { setIsOpen } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      // @ts-expect-error - TODO: Fix this
      onClick={() => setIsOpen((prev: boolean) => !prev)}
      className={cn('', className)}
    >
      {children}
    </Button>
  )
}

// Menu components
function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <MenuProvider>
      <motion.nav
        variants={menuVariants}
        className={cn(
          'w-64 z-0 page-transition',
          'flex flex-col justify-between',
          className,
        )}
      >
        {children}
      </motion.nav>
    </MenuProvider>
  )
}
const SidebarMenuSubButton = React.memo(
  ({
    children,
    className,
    id,
  }: {
    children: React.ReactNode
    className?: string
    id: string
  }) => {
    const { openItems, toggleItem } = useContext(MenuContext)

    const isOpen = openItems[id]

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleItem(id)}
        className={cn(
          'w-full justify-between items-center text-sm',
          'hover:bg-accent/50 active:bg-accent',
          isOpen && 'bg-accent',
          className,
        )}
      >
        <span className="flex items-center gap-3">{children}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          )}
        />
      </Button>
    )
  },
)

SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

function SidebarMenuSub({
  children,
  className,
  id,
}: {
  children: React.ReactNode
  className?: string
  id: string
}) {
  const { openItems } = useContext(MenuContext)
  const isOpen = openItems[id]

  return (
    <motion.div
      variants={{
        hidden: {
          height: 0,
          opacity: 0,
          transition: { duration: 0.2 },
        },
        visible: {
          height: 'auto',
          opacity: 1,
          transition: { duration: 0.2 },
        },
      }}
      initial="hidden"
      animate={isOpen ? 'visible' : 'hidden'}
      className={cn('w-full overflow-hidden', className)}
    >
      <div className="pl-6">{children}</div>
    </motion.div>
  )
}

function SidebarMenuSubItem({
  children,
  className,
  active,
}: {
  children: React.ReactNode
  className?: string
  active?: boolean
}) {
  return (
    <motion.div variants={itemVariants} whileHover={{ x: 2 }}>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start gap-3 text-sm',
          'hover:bg-accent/50 active:bg-accent',
          active && 'bg-accent',
          className,
        )}
      >
        {children}
      </Button>
    </motion.div>
  )
}

function SidebarMenuAction({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn('w-full gap-2', className)}
    >
      {children}
    </Button>
  )
}

function SidebarMenuBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge variant="secondary" className={cn('ml-auto', className)}>
      {children}
    </Badge>
  )
}

function SidebarMenuButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'w-full justify-start gap-3 flex items-center text-sm',
        'hover:bg-accent/50 active:bg-accent',
        className,
      )}
    >
      {children}
    </Button>
  )
}

function SidebarMenuItem({
  children,
  className,
  active,
  id,
}: {
  children: React.ReactNode
  className?: string
  active?: boolean
  id?: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      id={id}
    >
      <Button
        asChild
        className={cn(
          'w-full justify-start gap-3 flex items-center text-sm',
          'hover:bg-accent/50 active:bg-accent transition-all duration-200',
          active && 'bg-accent',
          className,
        )}
        size="sm"
        variant="ghost"
      >
        {/* Expecting Link as child with icon and text */}
        {children}
      </Button>
    </motion.div>
  )
}

function SidebarMenuSkeleton() {
  return (
    <div className="space-y-2 px-4">
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[70%]" />
    </div>
  )
}

// Group components
function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.section
      variants={groupVariants}
      className={cn('space-y-1 px-4', className)}
    >
      {children}
    </motion.section>
  )
}

function SidebarGroupAction({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn('w-full gap-2 flex items-center', className)}
    >
      {children}
    </Button>
  )
}

function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.h2
      variants={itemVariants}
      className={cn(
        'text-[10px] font-semibold ml-1 text-muted-foreground pl-2',
        className,
      )}
    >
      {children}
    </motion.h2>
  )
}

function SidebarGroupContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={groupVariants} className={cn('space-y-1', className)}>
      {children}
    </motion.div>
  )
}

// Header & Footer components
function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.header
      variants={itemVariants}
      className={cn(
        'flex items-center justify-between min-h-[3.45rem] px-4',
        className,
      )}
    >
      {children}
    </motion.header>
  )
}

function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.footer
      variants={itemVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.3,
          duration: 0.4,
        },
      }}
      className={cn('p-4 h-[4.44rem]', className)}
    >
      {children}
    </motion.footer>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarTrigger,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarGroupAction,
}
