import { cn } from '@/utils/cn'
import { ArrowRight } from 'lucide-react'

interface HeroBadgeRootProps {
  children: React.ReactNode
  className?: string
}

export function HeroBadgeRoot({ children, className }: HeroBadgeRootProps) {
  return (
    <div
      className={cn(
        'group flex w-fit items-center text-xs transition-colors border rounded-full py-2 px-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface HeroBadgeLabelProps {
  children: React.ReactNode
  className?: string
}

export function HeroBadgeLabel({ children, className }: HeroBadgeLabelProps) {
  return <span className={cn('mr-1 font-semibold', className)}>{children}</span>
}

interface HeroBadgeDividerProps {
  className?: string
}

export function HeroBadgeDivider({ className }: HeroBadgeDividerProps) {
  return (
    <div className={cn('mx-2 h-3.5 w-px bg-muted-foreground/70', className)} />
  )
}

interface HeroBadgeIconProps {
  className?: string
}

export function HeroBadgeIcon({ className }: HeroBadgeIconProps) {
  return (
    <ArrowRight
      className={cn(
        'ml-2 inline size-4 transition-transform group-hover:translate-x-0.5',
        className,
      )}
    />
  )
}
