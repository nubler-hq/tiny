import React from 'react'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  className?: string
  children?: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ className, children }) => {
  return (
    <Card
      className={cn(
        'rounded-md-none first:rounded-md-l-lg last:rounded-md-r-lg',
        className,
      )}
    >
      {children}
    </Card>
  )
}

interface StatCardHeaderProps {
  className?: string
  children?: React.ReactNode
}

const StatCardHeader: React.FC<StatCardHeaderProps> = ({
  className,
  children,
}) => {
  return <CardHeader className={cn('', className)}>{children}</CardHeader>
}

interface StatCardTitleProps {
  className?: string
  children?: React.ReactNode
}

const StatCardTitle: React.FC<StatCardTitleProps> = ({
  className,
  children,
}) => {
  return (
    <CardTitle className={cn('line-clamp-1', className)}>{children}</CardTitle>
  )
}

interface StatCardIconProps {
  className?: string
  children?: React.ReactNode
}

const StatCardIcon: React.FC<StatCardIconProps> = ({ className, children }) => {
  return <span className={cn('', className)}>{children}</span>
}

interface StatCardMainProps {
  className?: string
  children?: React.ReactNode
}

const StatCardMain: React.FC<StatCardMainProps> = ({ className, children }) => {
  return (
    <CardContent className={cn('flex items-center space-x-2', className)}>
      {children}
    </CardContent>
  )
}

interface StatCardValueProps {
  className?: string
  children?: React.ReactNode
}

const StatCardValue: React.FC<StatCardValueProps> = ({
  className,
  children,
}) => {
  return <span className={cn('text-xl font-bold', className)}>{children}</span>
}

interface StatCardBadgeProps {
  className?: string
  children?: React.ReactNode
}

const StatCardBadge: React.FC<StatCardBadgeProps> = ({
  className,
  children,
}) => {
  return (
    <Badge variant="outline" className={cn('', className)}>
      {children}
    </Badge>
  )
}

export {
  StatCard,
  StatCardBadge,
  StatCardHeader,
  StatCardIcon,
  StatCardMain,
  StatCardTitle,
  StatCardValue,
}
