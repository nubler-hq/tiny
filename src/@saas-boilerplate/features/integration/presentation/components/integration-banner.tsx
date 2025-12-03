'use client'

import { Link } from 'next-view-transitions'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { BlurImage } from '@/components/ui/blur-image'
import { IntegrationLogo } from './integration-logo'
import { type Integration } from '../../integration.interface'

export function IntegrationBanner({
  integrations,
  featured,
}: {
  integrations: Integration[]
  featured: string[]
}) {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const featuredIntegrations = integrations.filter(
    (i) => featured.includes(i.slug) && Array.isArray(i.metadata.screenshots),
  )

  return (
    <AnimatePresence initial={false}>
      {!search && (
        <motion.div
          key="featured-integrations"
          initial={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 10 }}
          transition={{ duration: 0.1 }}
        >
          <Carousel
            autoplay={{ delay: 5000 }}
            opts={{ loop: true }}
            className="bg-transparent"
          >
            <div className="mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
              <CarouselContent>
                {featuredIntegrations.map((integration, idx) => (
                  <CarouselItem key={idx} className="basis-2/3">
                    <Link
                      href={`/app/integrations/${integration.slug}`}
                      className="group relative block"
                    >
                      {/* Image */}
                      <div className="overflow-hidden rounded-md border border-border bg-transparent">
                        <BlurImage
                          src={integration.metadata.screenshots![0]}
                          alt={`Screenshot of ${integration.name}`}
                          width={900}
                          height={580}
                          className="aspect-900/580 w-full overflow-hidden rounded-md object-cover object-top"
                        />
                      </div>

                      {/* Category badge */}
                      <div className="absolute left-4 top-4 rounded bg-primary text-primary-foreground px-2 py-1 text-[0.625rem] font-semibold uppercase shadow-[0_2px_2px_0_#00000014]">
                        {integration.metadata.category}
                      </div>

                      {/* Bottom card */}
                      <div className="absolute inset-x-4 bottom-4 hidden items-center gap-3 rounded-lg bg-background p-3 transition-all duration-100 group-hover:drop-shadow-sm sm:flex">
                        <div className="shrink-0">
                          <IntegrationLogo
                            src={integration.metadata.logo as string}
                            alt={`Logo for ${integration.name}`}
                            className="size-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">
                            {integration.name}
                          </span>
                          <p className="line-clamp-2 text-sm font-medium text-muted-foreground">
                            {integration.metadata.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
          </Carousel>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FeaturedIntegrationsLoader() {
  return (
    <div>
      <div className="overflow-hidden">
        <div className="-ml-4 flex -translate-x-1/2">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="min-w-0 shrink-0 grow-0 basis-2/3 pl-4">
              <div className="border border-transparent">
                <div className="aspect-900/580 animate-pulse rounded-lg bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4 pb-1">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="size-8 animate-pulse rounded-lg bg-secondary"
          />
        ))}
      </div>
    </div>
  )
}
