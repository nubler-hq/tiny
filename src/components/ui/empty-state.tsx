'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button, type ButtonProps } from './button'
import { cn } from '@/utils/cn'

// Variantes de animação
const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

interface EmptyStateProps {
  className?: string
  children?: React.ReactNode
}

interface EmptyStateActionProps extends ButtonProps {
  children: React.ReactNode
}

// Root component
function EmptyState({ className, children, ...props }: EmptyStateProps) {
  return (
    <motion.div
      variants={emptyStateVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 border-dashed border-2 border-muted rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function Icon({ className, children }: EmptyStateProps) {
  return (
    <motion.div
      variants={contentVariants}
      className={cn('text-muted-foreground mb-6', className)}
    >
      {children}
    </motion.div>
  )
}

function Title({ className, children }: EmptyStateProps) {
  return (
    <motion.h3
      variants={contentVariants}
      className={cn('text-md font-semibold text-center', className)}
    >
      {children}
    </motion.h3>
  )
}

function Description({ className, children }: EmptyStateProps) {
  return (
    <motion.p
      variants={contentVariants}
      className={cn('text-muted-foreground text-center mb-6', className)}
    >
      {children}
    </motion.p>
  )
}

function Actions({ className, children }: EmptyStateProps) {
  return (
    <motion.div
      variants={contentVariants}
      className={cn('flex flex-col sm:flex-row gap-2', className)}
    >
      {children}
    </motion.div>
  )
}

function Action({ className, children, ...props }: EmptyStateActionProps) {
  return (
    <motion.div variants={contentVariants}>
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  )
}

// Compose pattern
EmptyState.Icon = Icon
EmptyState.Title = Title
EmptyState.Description = Description
EmptyState.Actions = Actions
EmptyState.Action = Action

export { EmptyState }
