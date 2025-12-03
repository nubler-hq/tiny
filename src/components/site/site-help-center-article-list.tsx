/**
 * Help Center Article List Component
 *
 * Server component that displays a list of articles for a help center category.
 * Shows article cards with metadata, tags, and navigation links.
 *
 * @module HelpCenterArticleList
 */

import { Link } from 'next-view-transitions'
import { ChevronRightIcon, CalendarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ContentTypeHelpCenterEntry } from '@/app/(site)/(content)/help/source'
import { DateUtils } from '@/@saas-boilerplate/utils/date'

/**
 * Props for the HelpCenterArticleList component
 */
export interface HelpCenterArticleListProps {
  /** Array of articles to display */
  articles: ContentTypeHelpCenterEntry[]
  /** Total number of articles in the category */
  totalArticles: number
  /** Optional CSS class name */
  className?: string
}

export function HelpCenterArticleList({
  articles,
  totalArticles,
  className = '',
}: HelpCenterArticleListProps) {
  // Empty state
  if (!articles || articles.length === 0) {
    return (
      <main
        className={`space-y-4 pb-8 min-h-[calc(100vh-10rem)] border-b ${className}`}
      >
        <div className="container mx-auto max-w-(--breakpoint-lg) space-y-4">
          <div className="border rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No articles found
            </h3>
            <p className="text-muted-foreground">
              There are no articles in this category yet.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className={`space-y-4 pb-8 min-h-[calc(100vh-10rem)] border-b ${className}`}
    >
      <div className="container mx-auto max-w-(--breakpoint-lg) space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Articles</h2>
          <Badge variant="secondary">{totalArticles} total</Badge>
        </div>

        <div className="border rounded-lg divide-y">
          {articles.map((post) => (
            <Link
              href={post.url}
              key={post.url}
              className="flex gap-4 p-6 text-sm w-full items-center justify-between hover:bg-secondary cursor-pointer transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium group-hover:text-primary transition-colors">
                  {post.data.title}
                </h3>
                {post.data.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {post.data.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    {DateUtils.formatDate(post.data.lastModified, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {post.data.tags && post.data.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Tags:</span>
                      <div className="flex gap-1">
                        {post.data.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {post.data.tags.length > 3 && (
                          <span className="text-xs">
                            +{post.data.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRightIcon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
