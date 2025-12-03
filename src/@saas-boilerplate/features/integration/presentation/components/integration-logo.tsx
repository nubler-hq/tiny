import { BlurImage } from '@/components/ui/blur-image'
import { cn } from '@/utils/cn'
import { memo } from 'react'

export const IntegrationLogo = memo(
  ({
    src,
    alt,
    className,
  }: {
    src: string | null
    alt: string
    className?: string
  }) => (
    <div className={cn('relative size-8 shrink-0 rounded-md', className)}>
      {src ? (
        <>
          <BlurImage
            src={src}
            alt={alt}
            className="relative size-full rounded-[inherit]"
            width={32}
            height={32}
          />
          <div className="pointer-events-none absolute inset-0 size-full rounded-[inherit] border border-black/7.5" />
        </>
      ) : (
        <div className="relative size-full rounded-[inherit]" />
      )}
    </div>
  ),
)

IntegrationLogo.displayName = 'IntegrationLogo'
