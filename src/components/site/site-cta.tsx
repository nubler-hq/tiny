import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

import { Link } from 'next-view-transitions'

export const SiteCTA = ({ className }: { className?: string }) => (
  <div className={cn('w-full py-16 border-b px-4 sm:px-0', className)}>
    <div className="container max-w-(--breakpoint-lg) mx-auto flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-center">
      <h3 className="text-balance text-xl sm:text-2xl font-semibold leading-[1.2]! tracking-tight text-center sm:text-left">
        Replace with your compelling call-to-action
      </h3>
      <div className="flex items-end h-full">
        <Button className="gap-4 w-full sm:w-auto" asChild>
          <Link href="/auth">Demo CTA Button (Replace with your action)</Link>
        </Button>
      </div>
    </div>
  </div>
)
