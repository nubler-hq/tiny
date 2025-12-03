'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Users,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Code,
  Mail,
  Component,
  Database,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utils/cn'
import useEmblaCarousel from 'embla-carousel-react'
import { TextLoop } from '@/components/ui/text-loop'
import { Button } from '@/components/ui/button'

const technicalFeatures = [
  {
    id: 'authentication',
    title: 'Robust Authentication',
    description:
      'Secure, ready-to-use authentication with email/password, Google, and GitHub providers. Easily extensible for more.',
    highlights: [
      'Credentials Provider',
      'Google & GitHub OAuth',
      'Secure Sessions',
    ],
    icon: KeyRound,
  },
  {
    id: 'multi-tenancy',
    title: 'Multi-Tenancy Architecture',
    description:
      'Built-in support for organizations and teams. Isolate data and manage permissions effortlessly.',
    highlights: [
      'Organization-based access',
      'Role-based permissions',
      'Team invitations',
    ],
    icon: Users,
  },
  {
    id: 'subscriptions',
    title: 'Stripe Subscriptions',
    description:
      'Complete Stripe integration for handling recurring payments, pricing tiers, and billing management.',
    highlights: [
      'Stripe webhooks integrated',
      'Customer portal',
      'Multiple pricing plans',
    ],
    icon: CreditCard,
  },
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    description:
      'A beautiful, responsive dashboard with pre-built components for managing users, organizations, and subscriptions.',
    highlights: [
      'Data tables and forms',
      'Shadcn UI components',
      'Fully customizable',
    ],
    icon: LayoutDashboard,
  },
  {
    id: 'api-layer',
    title: 'Type-Safe API with Igniter.js',
    description:
      'Build scalable and maintainable backend services with a type-safe API layer powered by Igniter.js.',
    highlights: [
      'End-to-end type safety',
      'Easy to create new endpoints',
      'Clean and organized structure',
    ],
    icon: Code,
  },
  {
    id: 'database',
    title: 'Database ORM with Prisma',
    description:
      'Powerful and type-safe database access with Prisma ORM, including migrations and seeding.',
    highlights: ['PostgreSQL ready', 'Type-safe queries', 'Easy migrations'],
    icon: Database,
  },
  {
    id: 'transactional-emails',
    title: 'Transactional Emails',
    description:
      'Send beautiful, responsive emails for key events like welcome messages, password resets, and invoices using React Email.',
    highlights: [
      'Customizable templates',
      'Integrated with your logic',
      'Professional look and feel',
    ],
    icon: Mail,
  },
  {
    id: 'ui-components',
    title: 'UI Components Library',
    description:
      'Leverage a comprehensive set of UI components from Shadcn UI to build your interface quickly and consistently.',
    highlights: [
      'Themeable with CSS variables',
      'Accessible components',
      'Easy to use and extend',
    ],
    icon: Component,
  },
]

export function SiteTechnicalFeatures() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  })

  const nextSlide = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const prevSlide = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentSlide(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section>
      <div className="py-24">
        <div className="mx-auto w-full max-w-(--breakpoint-lg) px-6">
          <div className="md:col-span-2">
            <h2 className="text-foreground text-balance text-4xl font-semibold max-w-xl">
              The only boilerplate you'll ever need
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-lg">
              Focus on your unique features, not on the repetitive setup. Our
              boilerplate provides a production-ready foundation with all the
              essential SaaS components built-in.
            </p>
            <Button className="mt-8 pr-2" variant="outline" asChild>
              <Link href="/auth">
                Start Building
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel Section */}
        <div>
          <div className="mt-16 relative overflow-hidden space-y-4">
            <header className="flex gap-4 items-center ps-[calc(50%-495px)]">
              {/* Navigation Arrows - Top Right */}
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="size-8 rounded-full bg-muted hover:bg-accent transition-all duration-200 flex items-center justify-center hover:scale-105"
                >
                  <ChevronLeft className="size-3.5" />
                </button>

                <button
                  onClick={nextSlide}
                  className="size-8 rounded-full bg-muted hover:bg-accent transition-all duration-200 flex items-center justify-center hover:scale-105"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2">
                {technicalFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={cn(
                      'size-2 rounded-full transition-all duration-200',
                      currentSlide === index
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                    )}
                  />
                ))}
              </div>
            </header>

            {/* Carousel Container with overflow */}
            <div ref={emblaRef} className="embla">
              <div className="embla__container flex ps-[calc(50%-475px)] pr-16 gap-[30px] -mx-6">
                {technicalFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="embla__slide"
                    style={{ flex: '0 0 380px' }}
                  >
                    <div
                      className={cn(
                        'flex flex-col h-[460px] relative bg-card rounded-2xl p-8',
                        'bg-muted text-foreground',
                      )}
                    >
                      <feature.icon className="size-10 text-primary" />
                      <div className="flex flex-col justify-end h-full space-y-2">
                        <TextLoop className="text-sm font-light opacity-60">
                          {feature.highlights.map((highlight) => (
                            <span key={highlight}>{highlight}</span>
                          ))}
                        </TextLoop>
                        <h3 className="text-3xl pr-8 mb-2">{feature.title}</h3>
                        <p className="opacity-60 text-sm text-balance leading-relaxed">
                          {feature.description}
                        </p>
                        <Button
                          className="mt-8 bg-black/10 shadow-sm text-secondary-foreground w-fit"
                          asChild
                        >
                          <Link href="/features">
                            Learn More
                            <ChevronRight className="size-4 opacity-50" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
