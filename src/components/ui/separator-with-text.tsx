import * as React from 'react'

import { cn } from '@/utils/cn'
import { Separator } from './separator'

/**
 * Props for the SeparatorWithText component
 * @interface
 * @property {React.ReactNode} children - The text content to display in the separator
 * @property {string} [className] - Optional CSS class names
 */
interface SeparatorWithTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * A separator component that displays text in the middle
 * @component
 * @param {SeparatorWithTextProps} props - Component props
 * @returns {JSX.Element} Rendered separator with text
 */
export function SeparatorWithText({
  children,
  className,
  ...props
}: SeparatorWithTextProps) {
  return (
    <div className={cn('relative', className)} {...props}>
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          {children}
        </span>
      </div>
    </div>
  )
}
