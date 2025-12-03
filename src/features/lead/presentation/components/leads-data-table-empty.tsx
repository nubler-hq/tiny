import { Link } from 'next-view-transitions'

import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
import { PlusIcon, Users2Icon } from 'lucide-react'
import { LeadUpsertSheet } from './lead-upsert-sheet'

export function LeadDataTableEmpty() {
  return (
    <AnimatedEmptyState className="border-none h-full grow">
      <AnimatedEmptyState.Carousel>
        <Users2Icon className="size-6" />
        <span className="bg-secondary h-3 w-[16rem] rounded-full"></span>
      </AnimatedEmptyState.Carousel>

      <AnimatedEmptyState.Content>
        <AnimatedEmptyState.Title>No leads found</AnimatedEmptyState.Title>
        <AnimatedEmptyState.Description>
          It looks like no one has interacted with your bot yet. Check back
          later!
        </AnimatedEmptyState.Description>
      </AnimatedEmptyState.Content>

      <AnimatedEmptyState.Actions>
        <LeadUpsertSheet
          triggerButton={
            <AnimatedEmptyState.Action variant="default" className="gap-2">
              <PlusIcon className="size-4" />
              Add your first lead
            </AnimatedEmptyState.Action>
          }
        />
        <AnimatedEmptyState.Action variant="outline" asChild>
          <Link href="/help/getting-started/">Learn more</Link>
        </AnimatedEmptyState.Action>
      </AnimatedEmptyState.Actions>
    </AnimatedEmptyState>
  )
}
