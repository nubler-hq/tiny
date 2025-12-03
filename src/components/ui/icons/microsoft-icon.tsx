import { cn } from '@/utils/cn'

/**
 * Microsoft icon component that follows React best practices
 */
interface MicrosoftIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function MicrosoftIcon({ className, ...props }: MicrosoftIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} {...props}>
      <path
        fill="currentColor"
        d="M3 3h8v8H3V3m10 0h8v8h-8V3M3 13h8v8H3v-8m10 0h8v8h-8v-8Z"
      />
    </svg>
  )
}
