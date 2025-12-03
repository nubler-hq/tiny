'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary border text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline !m-0 !p-0 !h-fit !w-fit',
      },
      size: {
        default: 'h-10 px-4 py-2 [&_svg]:size-3',
        sm: 'h-8 px-3 [&_svg]:size-3',
        lg: 'h-12 px-8 [&_svg]:size-3',
        icon: 'h-8 w-8 [&_svg]:size-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      disabled,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    const handleClick: React.MouseEventHandler<any> = (e) => {
      if (disabled) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      onClick?.(e)
    }

    const handleKeyDown: React.KeyboardEventHandler<any> = (e) => {
      if (disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      onKeyDown?.(e)
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          'focus-ring-minimal',
        )}
        ref={ref}
        disabled={asChild ? undefined : disabled}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
