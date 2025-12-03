import { cn } from '@/utils/cn'

/**
 * Apple icon component that follows React best practices
 */
interface AppleIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function AppleIcon({ className, ...props }: AppleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-4 w-4', className)}
      fill="currentColor"
      {...props}
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.09.4c-1.09-.5-2.08-.52-3.23 0c-1.44.66-2.2.53-3.05-.38C4.12 16.53 3.97 11.31 7.14 9.09c1.62-1.14 3.12-.91 4.17-.41c1.08.52 1.93.52 3.01 0c1.27-.6 2.91-.95 4.34.05c1.62 1.13 2.27 2.82 1.84 4.51c-1.78.04-3.06 1.2-3.58 2.78c-.47 1.45.02 2.89 1.13 3.26M16.23 2c.14 1.6-.49 2.96-1.49 3.89c-1.11 1.02-2.55 1.23-3.32 1.29c-.16-1.45.43-2.74 1.34-3.69C13.82 2.41 15.29 2.1 16.23 2" />
    </svg>
  )
}
