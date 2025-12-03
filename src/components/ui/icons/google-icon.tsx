import { cn } from '@/utils/cn'

interface GoogleIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * Google icon component that can be reused across the application
 */
export function GoogleIcon({ className, ...props }: GoogleIconProps) {
  return (
    <svg className={cn('h-4 w-4', className)} viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M22.54 12.27c0-.77-.07-1.51-.18-2.23H12v4.23h5.93c-.26 1.4-1.04 2.58-2.22 3.37v2.8h3.58c2.1-1.93 3.25-4.77 3.25-8.17z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.04 0 5.58-1 7.44-2.7l-3.58-2.8c-1 .67-2.28 1.07-3.86 1.07-2.97 0-5.48-2-6.38-4.68H2.02v2.94C3.87 20.98 7.61 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.62 14.89c-.23-.67-.36-1.38-.36-2.12s.13-1.45.36-2.12V7.71H2.02C1.37 9.06 1 10.5 1 12s.37 2.94 1.02 4.29l3.6-2.94z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.58 1.98 14.96 1 12 1 7.61 1 3.87 3.02 2.02 5.71l3.6 2.94C6.52 6.8 9.03 4.8 12 4.8z"
      />
    </svg>
  )
}
