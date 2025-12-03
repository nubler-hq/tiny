import { PropsWithChildren } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/utils/cn'

type MobileMenuDefaultProps = PropsWithChildren<{
  className?: string
}>

export const MobileMenu = ({ children, className }: MobileMenuDefaultProps) => {
  return (
    <header
      className={cn(
        'md:hidden fixed bottom-0 left-0 bg-card z-10 w-full px-12 border-t border-border',
        className,
      )}
    >
      {children}
    </header>
  )
}

export const MobileMenuContent = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-center justify-between w-full h-20">
      {children}
    </div>
  )
}

export const MobileMenuButton = ({
  children,
  isActive,
}: PropsWithChildren<{
  isActive?: boolean
}>) => {
  return (
    <Slot className={cn('flex', isActive ? 'opacity-100' : 'opacity-60')}>
      {children}
    </Slot>
  )
}
