'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Logo } from '@/components/ui/logo'
import { HelpCircle } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { AppConfig } from '@/config/boilerplate.config.client'
import { cn } from '@/utils/cn'

// Root props
export type BillingAlertPageRootProps = HTMLMotionProps<'div'>

const BillingAlertPageRoot = React.forwardRef<
  HTMLDivElement,
  BillingAlertPageRootProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn('h-screen flex flex-col bg-background p-6', className)}
      {...props}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
})
BillingAlertPageRoot.displayName = 'BillingAlertPageRoot'

// Header
export type BillingAlertPageHeaderProps = HTMLMotionProps<'header'> & {
  children?: React.ReactNode
}
const BillingAlertPageHeader = React.forwardRef<
  HTMLElement,
  BillingAlertPageHeaderProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.header
      ref={ref}
      className={cn('', className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children || <Logo className="h-8 mx-auto" />}
    </motion.header>
  )
})
BillingAlertPageHeader.displayName = 'BillingAlertPageHeader'

// Icon block
export type BillingAlertPageIconProps = HTMLMotionProps<'div'>
const BillingAlertPageIcon = React.forwardRef<
  HTMLDivElement,
  BillingAlertPageIconProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        'h-12 w-12 flex items-center justify-center rounded-full bg-secondary mx-auto',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
BillingAlertPageIcon.displayName = 'BillingAlertPageIcon'

// Content wrapper (main area)
export type BillingAlertPageContentProps = HTMLMotionProps<'main'>
const BillingAlertPageContent = React.forwardRef<
  HTMLElement,
  BillingAlertPageContentProps
>(({ className, ...props }, ref) => {
  return (
    <motion.main
      ref={ref}
      className={cn(
        'flex-1 flex flex-col items-center justify-center px-4 text-center max-w-[480px] mx-auto w-full',
        className,
      )}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      {...props}
    />
  )
})
BillingAlertPageContent.displayName = 'BillingAlertPageContent'

// Title
export type BillingAlertPageTitleProps = HTMLMotionProps<'h1'>
const BillingAlertPageTitle = React.forwardRef<
  HTMLHeadingElement,
  BillingAlertPageTitleProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.h1
      ref={ref}
      className={cn('text-2xl mt-6 mb-2 lg:max-w-[60%] font-semibold tracking-tight', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      {...props}
    >
      {children}
    </motion.h1>
  )
})
BillingAlertPageTitle.displayName = 'BillingAlertPageTitle'

// Description
export type BillingAlertPageDescriptionProps = HTMLMotionProps<'p'>
const BillingAlertPageDescription = React.forwardRef<
  HTMLParagraphElement,
  BillingAlertPageDescriptionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.p
      ref={ref}
      className={cn('text-muted-foreground mb-6', className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28 }}
      {...props}
    >
      {children}
    </motion.p>
  )
})
BillingAlertPageDescription.displayName = 'BillingAlertPageDescription'

// Actions container
export type BillingAlertPageActionsProps = HTMLMotionProps<'div'>
const BillingAlertPageActions = React.forwardRef<
  HTMLDivElement,
  BillingAlertPageActionsProps
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn('flex flex-col gap-2 items-center w-full', className)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      {...props}
    />
  )
})
BillingAlertPageActions.displayName = 'BillingAlertPageActions'

// PrimaryAction button
export type BillingAlertPagePrimaryActionProps = ButtonProps
const BillingAlertPagePrimaryAction = React.forwardRef<
  HTMLButtonElement,
  BillingAlertPagePrimaryActionProps
>(({ children, ...props }, ref) => {
  return (
    <motion.div>
      <Button ref={ref} {...props}>
        {children}
      </Button>
    </motion.div>
  )
})
BillingAlertPagePrimaryAction.displayName = 'BillingAlertPagePrimaryAction'

// SupportAction button (secondary link)
export type BillingAlertPageSupportActionProps = Omit<
  ButtonProps,
  'asChild'
> & { mail?: string }
const BillingAlertPageSupportAction = React.forwardRef<
  HTMLAnchorElement,
  BillingAlertPageSupportActionProps
>(({ children, mail = AppConfig.links.mail, className }, ref) => {
  return (
    <motion.div>
      <Button
        variant="link"
        className={cn('text-muted-foreground w-fit', className)}
        asChild
      >
        <a href={`mailto:${mail}`} ref={ref}>
          <HelpCircle className="w-4 h-4 mr-2" />
          {children || 'Need help? Contact support'}
        </a>
      </Button>
    </motion.div>
  )
})
BillingAlertPageSupportAction.displayName = 'BillingAlertPageSupportAction'

// Footer
export type BillingAlertPageFooterProps = HTMLMotionProps<'footer'>
const BillingAlertPageFooter = React.forwardRef<
  HTMLElement,
  BillingAlertPageFooterProps
>(({ className, ...props }, ref) => {
  return (
    <motion.footer
      ref={ref}
      className={cn(
        'py-6 text-center text-sm text-muted-foreground',
        className,
      )}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      {...props}
    >
      <p>© 2025 {AppConfig.name}.</p>
    </motion.footer>
  )
})
BillingAlertPageFooter.displayName = 'BillingAlertPageFooter'

// Composição final do objeto componível
export const BillingAlertPage = Object.assign(BillingAlertPageRoot, {
  Header: BillingAlertPageHeader,
  Icon: BillingAlertPageIcon,
  Content: BillingAlertPageContent,
  Title: BillingAlertPageTitle,
  Description: BillingAlertPageDescription,
  Actions: BillingAlertPageActions,
  PrimaryAction: BillingAlertPagePrimaryAction,
  SupportAction: BillingAlertPageSupportAction,
  Footer: BillingAlertPageFooter,
})
