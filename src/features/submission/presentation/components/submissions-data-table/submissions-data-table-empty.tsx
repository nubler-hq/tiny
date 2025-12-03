'use client'

import { Link } from 'next-view-transitions'

import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
import { SendIcon } from 'lucide-react'

export function SubmissionsDataTableEmpty() {
  return (
    <AnimatedEmptyState className="border-none h-full grow">
      <AnimatedEmptyState.Carousel>
        <SendIcon className="size-6" />
        <span className="bg-secondary h-3 w-[16rem] rounded-full"></span>
      </AnimatedEmptyState.Carousel>

      <AnimatedEmptyState.Content>
        <AnimatedEmptyState.Title>
          No submissions found
        </AnimatedEmptyState.Title>
        <AnimatedEmptyState.Description>
          You don't have any form submissions yet. When forms are submitted,
          they will appear here.
        </AnimatedEmptyState.Description>
      </AnimatedEmptyState.Content>

      <AnimatedEmptyState.Actions>
        <AnimatedEmptyState.Action variant="outline" asChild>
          <Link href="/app/leads">View leads</Link>
        </AnimatedEmptyState.Action>
      </AnimatedEmptyState.Actions>
    </AnimatedEmptyState>
  )
}
