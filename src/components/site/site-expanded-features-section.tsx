import { AppConfig } from '@/config/boilerplate.config.client'
import { Card } from '@/components/ui/card'
import { WrenchIcon } from 'lucide-react'

export default function SiteExpandedFeaturesSection() {
  return (
    <section className="py-16 md:py-32 dark:bg-transparent">
      <div className="container mx-auto max-w-(--breakpoint-md)">
        <div className="flex gap-4 flex-col items-center text-center mb-16">
          <WrenchIcon
            className="size-10 mb-4 stroke-2 text-primary mx-auto"
            fill="currentColor"
            fillOpacity={0.15}
          />

          <h2 className="text-balance text-2xl font-semibold leading-[1.2]! tracking-tight sm:text-3xl md:text-4xl">
            Start Your Journey in <br /> Three Simple Steps
          </h2>
          <p className="text-balance text-muted-foreground text-sm leading-6 sm:text-base sm:leading-7 max-w-[85%]">
            Get started with {AppConfig.name} quickly and easily with our
            streamlined onboarding process
          </p>
        </div>
        <Card className="md:max-w-full md:grid-cols-3 md:divide-x md:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 md:mt-16">
          <div className="group shadow-zinc-950/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs font-medium">
                Step 01
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-medium">Create Account</h3>
              <p className="text-sm text-muted-foreground">
                Quick and secure sign-up process that takes less than 2 minutes
                to complete and get started.
              </p>
            </div>
          </div>

          <div className="group shadow-zinc-950/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs font-medium">
                Step 02
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-medium">Setup Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Customize your workspace preferences and integrate with your
                favorite tools in minutes.
              </p>
            </div>
          </div>

          <div className="group shadow-zinc-950/5 p-6 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary-foreground/10 text-primary-foreground rounded-full px-3 py-1 text-xs font-medium">
                Step 03
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-medium">Start Building</h3>
              <p className="text-sm text-primary-foreground/80">
                Launch your first project using our powerful features and watch
                your productivity soar.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
