'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const personaVariants = cva('flex items-center gap-3 text-sm', {
  variants: {
    size: {
      sm: 'min-h-8',
      md: 'min-h-10',
      lg: 'min-h-12',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const avatarSizeVariants = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const labelVariants = cva('flex flex-col justify-center overflow-hidden', {
  variants: {
    size: {
      sm: 'gap-0',
      md: 'gap-0.5',
      lg: 'gap-1',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface PersonaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof personaVariants> {
  src?: string | null
  name?: string | null
  secondaryLabel?: string | React.ReactNode | null
  fallback?: string
}

const Persona = React.forwardRef<HTMLDivElement, PersonaProps>(
  (
    {
      className,
      size,
      disabled,
      src,
      name,
      secondaryLabel,
      fallback,
      ...props
    },
    ref,
  ) => {
    // Generate fallback from name or use provided fallback
    const avatarFallback = React.useMemo(() => {
      if (fallback) return fallback
      if (!name) return '?'
      return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    }, [name, fallback])

    return (
      <div
        ref={ref}
        className={cn(personaVariants({ size, disabled, className }))}
        {...props}
      >
        <Avatar className={cn(avatarSizeVariants[size || 'md'])}>
          <AvatarImage src={src || undefined} alt={name || 'Avatar'} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>

        {(name || secondaryLabel) && (
          <div className={labelVariants({ size })}>
            {name && (
              <p className="truncate font-medium leading-none">{name}</p>
            )}

            {secondaryLabel && (
              <p className="truncate text-sm text-muted-foreground">
                {secondaryLabel}
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
)
Persona.displayName = 'Persona'

export { Persona }
