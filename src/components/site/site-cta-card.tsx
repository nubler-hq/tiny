import * as React from 'react'
import { cn } from '@/utils/cn'
import { AppConfig } from '@/config/boilerplate.config.client'

interface SiteCTACardProps {
  href?: string
  title?: string
  description?: string
  image?: string
  className?: string
}

const SiteCTACard = React.forwardRef<HTMLAnchorElement, SiteCTACardProps>(
  (
    {
      href = '/auth',
      title = `Try ${AppConfig.name} for free`,
      description = AppConfig.description,
      image = AppConfig.brand.og.image,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group relative block rounded-md border bg-background p-4',
          className,
        )}
        href={href}
        {...props}
      >
        <div className="absolute right-2 top-2 z-10 rounded-full border border-neutral-200 bg-gradient-to-b from-white/50 to-transparent p-2.5 opacity-0 backdrop-blur-lg transition-opacity hover:bg-neutral-50 group-hover:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-right size-4 -rotate-45"
            aria-hidden="true"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
        <img
          alt={AppConfig.name}
          loading="lazy"
          width={1800}
          height={944}
          decoding="async"
          data-nimg="1"
          className="blur-0 rounded-md border"
          src={image}
          style={{ color: 'transparent' }}
        />
        <p className="mt-4 font-display font-bold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground underline-offset-4 group-hover:underline">
          {description}
        </p>
      </a>
    )
  },
)
SiteCTACard.displayName = 'SiteCTACard'

export { SiteCTACard }
