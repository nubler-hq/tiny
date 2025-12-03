'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Card } from './site-card'
import { Ripple } from './site-riple'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

export function SiteCopilotFeaturesSection() {
  return (
    <section id="features">
      <div className="py-24 container mx-auto max-w-(--breakpoint-lg)">
        <div className="mx-auto w-full flex flex-col items-center max-w-(--breakpoint-lg)">
          <Card
            variant="default"
            className="w-full pt-0 flex flex-col items-center text-center pb-32 bg-zinc-900 text-white border-none"
          >
            <div className="relative flex h-[250px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-transparent">
              <div className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
                <Logo
                  size="icon"
                  className="size-24 p-4 shadow-md rounded-full bg-background"
                />
              </div>
              <Ripple />
            </div>

            <h3 className="mt-5 text-2xl lg:text-5xl mb-6 font-semibold">
              Built for developers, <br /> by developers.
            </h3>
            <p className="mt-1 text-balance text-white/80 md:max-w-[62%]">
              We've built the foundation so you don't have to. The SaaS
              Boilerplate is a production-ready, scalable, and fully-featured
              Next.js template that lets you focus on what truly matters: your
              product.
            </p>

            <Button className="mt-8 mb-16 bg-secondary/20" asChild>
              <a href="/auth">
                <span>Start Building Now</span>
                <ArrowRight className="size-4" />
              </a>
            </Button>

            <div className="border shadow-xl overflow-hidden mx-8 md:mx-0 rounded-[1.8rem]">
              <Image
                src="/heros/main.png"
                alt="SaaS Boilerplate Dashboard Interface"
                width={1360}
                height={725}
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
