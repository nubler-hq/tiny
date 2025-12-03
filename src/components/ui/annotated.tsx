'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface AnnotatedProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

// Simplified animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

function AnnotatedRoot({ className, children, ...props }: AnnotatedProps) {
  return (
    // @ts-expect-error Framer Motion types are not compatible with React.HTMLAttributes xl:grid-cols-[22rem_1fr]
    <motion.section
      className={cn(
        'grid gap-x-16 gap-y-4 items-start relative',
        'grid-cols-1',
        className,
      )}
      {...props}
    >
      {children}
    </motion.section>
  )
}

function AnnotatedContent({ className, children }: AnnotatedProps) {
  return (
    <motion.main {...fadeIn} className={cn('flex flex-col gap-4', className)}>
      {children}
    </motion.main>
  )
}

function AnnotatedSidebar({ className, children }: AnnotatedProps) {
  return (
    <motion.aside
      {...fadeIn}
      className={cn('grid grid-cols-[auto_1fr] grid-rows-2 gap-x-4', className)}
    >
      {children}
    </motion.aside>
  )
}

function AnnotatedIcon({ className, children }: AnnotatedProps) {
  return (
    <div
      className={cn(
        'flex items-center row-span-2 justify-center w-10 h-10 rounded-md bg-card border',
        className,
      )}
    >
      {children}
    </div>
  )
}

function AnnotatedTitle({ className, children }: AnnotatedProps) {
  return (
    <h2
      className={cn(
        'text-sm font-semibold tracking-tight flex items-start',
        className,
      )}
    >
      {children}
    </h2>
  )
}

function AnnotatedDescription({ className, children }: AnnotatedProps) {
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground h-fit flex items-start line-clamp-1',
        className,
      )}
    >
      {children}
    </p>
  )
}

function AnnotatedSection({ className, children }: AnnotatedProps) {
  return (
    <motion.div {...fadeIn} className={cn('overflow-hidden', className)}>
      {children}
    </motion.div>
  )
}

function AnnotatedSectionHeader({ className, children }: AnnotatedProps) {
  return <header className={cn('space-y-1.5', className)}>{children}</header>
}

function AnnotatedSectionTitle({ className, children }: AnnotatedProps) {
  return <h3 className={cn('text-base font-medium', className)}>{children}</h3>
}

function AnnotatedSectionDescription({ className, children }: AnnotatedProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  )
}

function AnnotatedFooter({ className, children }: AnnotatedProps) {
  return (
    <footer className={cn('flex items-center justify-start pt-4', className)}>
      {children}
    </footer>
  )
}

const Annotated = Object.assign(AnnotatedRoot, {
  Sidebar: AnnotatedSidebar,
  Content: AnnotatedContent,
  Icon: AnnotatedIcon,
  Title: AnnotatedTitle,
  Description: AnnotatedDescription,
  Section: AnnotatedSection,
  SectionHeader: AnnotatedSectionHeader,
  SectionTitle: AnnotatedSectionTitle,
  SectionDescription: AnnotatedSectionDescription,
  Footer: AnnotatedFooter,
})

export {
  Annotated,
  AnnotatedRoot,
  AnnotatedSidebar,
  AnnotatedContent,
  AnnotatedIcon,
  AnnotatedTitle,
  AnnotatedDescription,
  AnnotatedSection,
  AnnotatedSectionHeader,
  AnnotatedSectionTitle,
  AnnotatedSectionDescription,
  AnnotatedFooter,
}
