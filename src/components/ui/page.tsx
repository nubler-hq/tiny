'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

// Variantes de animação
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
}

const bodyVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
    },
  },
}

interface PageContextValue {
  className?: string
}

const PageContext = React.createContext<PageContextValue | null>(null)

function usePage() {
  const context = React.useContext(PageContext)
  if (!context) {
    throw new Error('usePage must be used within a <Page />')
  }
  return context
}

const PageWrapper = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  return (
    <PageContext.Provider value={{ className }}>
      <motion.div
        ref={ref}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'relative overflow-hidden dark:bg-secondary/30 flex flex-col w-full rounded-md border min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-2rem)] max-w-screen!',
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    </PageContext.Provider>
  )
})
PageWrapper.displayName = 'PageWrapper'

const PageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // @ts-expect-error - TODO: Fix this
  <motion.div
    ref={ref}
    variants={headerVariants}
    initial="hidden"
    animate="visible"
    className={cn(
      'flex h-10 items-center gap-4 border-b px-6 sticky top-0 bg-secondary/50 backdrop-blur-sm z-10',
      className,
    )}
    {...props}
  />
))
PageHeader.displayName = 'PageHeader'

const PageMainBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex w-full items-center gap-2', className)}
    {...props}
  />
))
PageMainBar.displayName = 'PageMainBar'

const PageActionsBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2', className)}
    {...props}
  />
))
PageActionsBar.displayName = 'PageActionsBar'

const PageSecondaryHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // @ts-expect-error - TODO: Fix this
  <motion.div
    ref={ref}
    variants={headerVariants}
    initial="hidden"
    animate="visible"
    className={cn('flex items-center gap-2 px-6 py-2 border-b', className)}
    {...props}
  />
))
PageSecondaryHeader.displayName = 'PageSecondaryHeader'

const PageBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // @ts-expect-error - TODO: Fix this
  <motion.div
    ref={ref}
    variants={bodyVariants}
    initial="hidden"
    animate="visible"
    className={cn('flex-1 p-6 h-full flex flex-col grow', className)}
    {...props}
  />
))
PageBody.displayName = 'PageBody'

const PageActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // @ts-expect-error - TODO: Fix this
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.3,
      },
    }}
    className={cn(
      'flex h-14 items-center justify-end gap-4 border-t px-6',
      className,
    )}
    {...props}
  />
))
PageActions.displayName = 'PageActions'

export {
  PageWrapper,
  PageHeader,
  PageMainBar,
  PageActionsBar,
  PageSecondaryHeader,
  PageBody,
  PageActions,
  usePage,
}
