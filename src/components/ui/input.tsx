import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
  'flex w-full text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default:
          'border-none bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0',
        ghost:
          'border-none bg-transparent hover:bg-accent/20 focus-visible:bg-accent/0',
        invisible:
          'border-none px-0! bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0',
        outline:
          'border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        secondary: 'border-none bg-secondary',
      },
      size: {
        default: 'h-10 px-3 py-2 rounded-md',
        sm: 'h-8 px-2 py-1 rounded-md text-sm',
        lg: 'h-12 px-4 py-3 rounded-md text-lg',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'default',
    },
  },
)

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant = 'invisible',
      size = 'default',
      error,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ size, variant }),
            error && 'border-destructive focus-visible:border-destructive',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input, type InputProps, inputVariants }
