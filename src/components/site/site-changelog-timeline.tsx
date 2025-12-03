import React from 'react'
import { cn } from '@/utils/cn'
import { Link } from 'next-view-transitions'
import { ContentTypeUpdateEntry } from '@/app/(site)/(content)/updates/source'
import { getMDXComponents } from '../../../mdx-components'
import { DateUtils } from '@/@saas-boilerplate/utils/date'

// Props for the ChangelogTimeline component
interface ChangelogTimelineProps {
  entries: ContentTypeUpdateEntry[]
  className?: string
  showReadMore?: boolean
  baseUrl?: string
}

export function ChangelogTimeline({
  entries,
  className,
}: ChangelogTimelineProps) {
  return (
    <div className={cn('relative py-16', className)}>
      {/* Vertical Timeline Line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/70" />

      {/* Changelog Entries */}
      <div className="space-y-16">
        {entries.map((entry, index) => {
          const MDX = entry.data.body

          return (
            <div key={entry.url} className="relative pl-8 group">
              {/* Timeline dot */}
              <div
                className={cn([
                  'absolute left-[-4px] top-4 size-[8px] rounded-full bg-primary ring-4 ring-background transition-all duration-300 group-hover:bg-primary/80',
                  index === 0 && 'bg-primary animation-pulse',
                ])}
              />

              {/* Entry content */}
              <div className="grid grid-cols-[14rem_1fr] items-start gap-10">
                {/* Entry metadata */}
                <div className="flex items-center whitespace-nowrap gap-2 text-xs text-muted-foreground py-3">
                  <span className="font-semibold text-foreground">Update</span>
                  <span>•</span>
                  <span>
                    {DateUtils.formatDate(entry.data.lastModified, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div>
                  <img
                    src={entry.data.cover}
                    alt={entry.data.title}
                    className="w-full h-auto aspect-video object-cover transition-transform duration-500 rounded-md border"
                  />

                  {/* Entry title */}
                  <main className="space-y-4 pt-6">
                    <h2 className="font-bold text-lg">{entry.data.title}</h2>

                    {/* Image and description container */}
                    <div className="prose prose-sm prose-neutral dark:prose-invert">
                      <MDX components={getMDXComponents()} />
                    </div>
                  </main>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
