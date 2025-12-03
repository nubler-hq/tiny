'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  HeroBadgeDivider,
  HeroBadgeIcon,
  HeroBadgeLabel,
  HeroBadgeRoot,
} from '@/components/ui/hero-badge'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SiteLogoShowcase } from './site-logo-showcase'
import Image from 'next/image'

export function SiteMainHeroSection() {
  const [open, setOpen] = useState(false)

  return (
    <section
      className="overflow-hidden py-12 flex min-h-[80vh] items-center justify-center"
      aria-label="Platform introduction hero section"
    >
      <div className="container mx-auto max-w-(--breakpoint-lg) flex flex-col items-center text-center">
        {/* Header / Badge */}
        <Link href="/features" className="mb-4">
          <HeroBadgeRoot className="mb-2">
            <HeroBadgeLabel>🚀 SaaS Boilerplate Demo</HeroBadgeLabel>
            <HeroBadgeDivider />
            Replace with your badge text
            <HeroBadgeIcon />
          </HeroBadgeRoot>
        </Link>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold leading-[1.15]! max-w-[820px] mx-auto mb-4 sm:mb-2 px-4 sm:px-0">
          Welcome to Your SaaS Demo.
          <span className="text-muted-foreground block sm:inline sm:ml-2 mt-2 sm:mt-0">
            Customize this headline for your specific SaaS solution.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-[720px] text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0 mb-8 sm:mb-6">
          This is a demo of the SaaS Boilerplate. Replace this text with your
          value proposition, key benefits, and what makes your SaaS unique.
          Focus on the problem you solve.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 my-8 sm:my-12 px-4 sm:px-0">
          <Button className="w-fit" asChild>
            <a href="/auth" className="gap-2">
              Getting Started
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3">
            {/* User Avatars */}
            <div className="flex -space-x-2">
              <Avatar className="w-8 h-8 border-2">
                <AvatarImage
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="User Michael"
                />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2">
                <AvatarImage
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="User Anna"
                />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2">
                <AvatarImage
                  src="https://randomuser.me/api/portraits/men/65.jpg"
                  alt="User Chris"
                />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
            </div>

            {/* Stars and Text */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 fill-zinc-600 text-zinc-600"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                Add your own social proof here
              </span>
            </div>
          </div>
        </div>

        {/* Logo Showcase */}
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-xl cursor-pointer px-4 sm:px-0 mb-4">
          <SiteLogoShowcase />
        </div>

        {/* Hero Image with overlay play button */}
        <div className="relative mx-auto w-full max-w-[1360px] border overflow-hidden rounded-xl cursor-pointer px-4 sm:px-0">
          <Image
            alt="SaaS Boilerplate Dashboard"
            loading="lazy"
            width="1360"
            height="725"
            decoding="async"
            className="w-full h-full object-cover"
            style={{ color: 'transparent' }}
            src="/screenshots/screenshot-01-light.jpeg"
          />

          {/* Gradient / dark overlay for better contrast */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 to-transparent" />

          {/* Centered Play Button */}
          <button
            type="button"
            aria-label="Play intro video"
            onClick={() => setOpen(true)}
            className="absolute inset-0 grid place-items-center"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-background/70 text-foreground shadow-lg ring-1 ring-border backdrop-blur px-4 sm:px-6 py-3 sm:py-4 gap-2 sm:gap-3 text-sm sm:text-base">
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              Replace with your demo video
            </span>
          </button>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[960px] p-0">
          <div className="relative w-full aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full rounded-md"
              src="https://www.youtube.com/embed/ysz5S6PUM-U?autoplay=1&rel=0"
              title="SaaS Boilerplate Introduction Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
