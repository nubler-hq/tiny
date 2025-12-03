'use client'

import React from 'react'

import { type ProgressProps, Progress } from '@radix-ui/react-progress'
import { ChevronRightIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card'
import { cn } from '@/utils/cn'
import { Button } from './button'

const GettingStartedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      'bg-card text-card-foreground rounded-md overflow-hidden',
      className,
    )}
    {...props}
  />
))
GettingStartedCard.displayName = 'GettingStartedCard'

const GettingStartedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn(
      'grid grid-cols-[3fr_1fr] gap-4 items-center p-6 mb-6',
      className,
    )}
    {...props}
  />
))
GettingStartedCardHeader.displayName = 'GettingStartedCardHeader'

const GettingStartedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn('text-sm font-semibold text-foreground', className)}
    {...props}
  />
))
GettingStartedCardTitle.displayName = 'GettingStartedCardTitle'

const GettingStartedProgressBar = React.forwardRef<
  HTMLDivElement,
  ProgressProps
>(({ className, ...props }, ref) => (
  <Progress
    ref={ref}
    className={cn('h-2 rounded-full bg-secondary', className)}
    {...props}
  />
))
GettingStartedProgressBar.displayName = 'GettingStartedProgressBar'

const GettingStartedMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn('p-6', className)} {...props} />
))
GettingStartedMain.displayName = 'GettingStartedMain'

const GettingStartedStep = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { finished?: boolean }
>(({ className, finished, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex items-center justify-between w-full transition-all',
      finished && 'opacity-50 pointer-events-none',
      className,
    )}
    {...props}
  />
))
GettingStartedStep.displayName = 'GettingStartedStep'

const GettingStartedStepIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'flex items-center justify-center h-10 w-10 bg-primary/10 text-primary rounded-full mr-4',
      className,
    )}
    {...props}
  />
))
GettingStartedStepIcon.displayName = 'GettingStartedStepIcon'

const GettingStartedStepContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 flex flex-col items-start', className)}
    {...props}
  />
))
GettingStartedStepContent.displayName = 'GettingStartedStepContent'

const GettingStartedStepTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <strong
    ref={ref}
    className={cn(
      'text-sm leading-none font-medium text-foreground text-left',
      className,
    )}
    {...props}
  />
))
GettingStartedStepTitle.displayName = 'GettingStartedStepTitle'

const GettingStartedStepDescription = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <small
    ref={ref}
    className={cn('text-sm text-muted-foreground mt-1 text-left', className)}
    {...props}
  />
))
GettingStartedStepDescription.displayName = 'GettingStartedStepDescription'

const GettingStartedStepArrow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props}>
    <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
  </div>
))
GettingStartedStepArrow.displayName = 'GettingStartedStepArrow'

const GettingStartedFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn('flex items-center justify-between px-6 py-1.5', className)}
    {...props}
  />
))
GettingStartedFooter.displayName = 'GettingStartedFooter'

const GettingStartedFooterMessage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
GettingStartedFooterMessage.displayName = 'GettingStartedFooterMessage'

const GettingStartedFooterButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      'text-primary hover:text-primary/80 hover:bg-primary/10',
      className,
    )}
    {...props}
  />
))
GettingStartedFooterButton.displayName = 'GettingStartedFooterButton'

export {
  GettingStartedCard,
  GettingStartedCardHeader,
  GettingStartedCardTitle,
  GettingStartedFooter,
  GettingStartedFooterButton,
  GettingStartedFooterMessage,
  GettingStartedMain,
  GettingStartedProgressBar,
  GettingStartedStep,
  GettingStartedStepArrow,
  GettingStartedStepContent,
  GettingStartedStepDescription,
  GettingStartedStepIcon,
  GettingStartedStepTitle,
}
