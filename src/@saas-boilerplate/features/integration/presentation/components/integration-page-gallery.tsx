'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavBar,
  CarouselThumbnail,
  CarouselThumbnails,
} from '@/components/ui/carousel'
import { cn } from '@/utils/cn'
import { BlurImage } from '@/components/ui/blur-image'
import { useTheme } from 'next-themes'
import { useIsMobile } from '@/@saas-boilerplate/hooks/use-mobile'
import type { Integration } from '../../integration.interface'

export type IntegrationDetailsGalleryProps = {
  integration: Integration
}

export function IntegrationPageGallery({
  integration,
}: IntegrationDetailsGalleryProps) {
  const isMobile = useIsMobile()
  const themeManager = useTheme()

  return (
    <div>
      {integration.metadata.screenshots &&
      integration.metadata.screenshots.length > 0 ? (
        <Carousel>
          <div className="relative rounded-t-lg bg-background p-4">
            <CarouselContent>
              {integration.metadata.screenshots.map((src, index) => (
                <CarouselItem key={index}>
                  <BlurImage
                    src={`${src}?theme=${themeManager.resolvedTheme}`}
                    alt={`Screenshot ${index + 1} of ${integration.name}`}
                    width={900}
                    height={580}
                    className="aspect-900/580 w-[5/6] overflow-hidden rounded-md border border-border object-cover object-top"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNavBar
              variant="simple"
              className="absolute bottom-6 left-1/2 -translate-x-1/2"
            />
          </div>
          {!isMobile && (
            <div className="relative">
              <CarouselThumbnails className="py-0.5">
                {integration.metadata.screenshots.map((src, idx) => (
                  <CarouselThumbnail
                    key={idx}
                    index={idx}
                    className={({ active }) =>
                      cn(
                        'aspect-900/580 h-[100px] shrink-0 select-none overflow-hidden rounded-[6px] border',
                        'border-border ring-2 ring-transparent transition-all duration-100',
                        active
                          ? 'border-transparent ring-primary/10'
                          : 'hover:ring-primary/5',
                      )
                    }
                  >
                    <BlurImage
                      src={`${src}?theme=${themeManager.resolvedTheme}`}
                      alt={`Screenshot ${idx + 1} thumbnail`}
                      width={900}
                      height={580}
                      className="overflow-hidden rounded-[5px] object-cover object-top"
                    />
                  </CarouselThumbnail>
                ))}
              </CarouselThumbnails>

              <div className="absolute inset-y-0 left-0 w-4 bg-linear-to-r from-background" />
              <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-l from-background" />
            </div>
          )}
        </Carousel>
      ) : null}
    </div>
  )
}
