'use client'

import { Link } from 'next-view-transitions'

/**
 * Props for the SiteHelpCenterCategoryCardProps component
 */
export interface SiteHelpCenterCategoryCardProps {
  /** Category data to display */
  category: {
    slug: string
    title: string
    description?: string
    icon?: string
    articleCount: number
  }
  /** Optional CSS class name */
  className?: string
}

export function SiteHelpCenterCategoryCard({
  category,
  className = '',
}: SiteHelpCenterCategoryCardProps) {
  const { slug, title, description, articleCount = 0 } = category

  return (
    <Link
      href={`/help/${slug}`}
      className={`group flex flex-col items-start justify-end rounded-md border p-6 bg-background hover:bg-secondary/60 transition-colors ${className}`}
    >
      {/* Category Content */}
      <div className="flex h-64 flex-col justify-between">
        {articleCount > 0 && (
          <span className="w-fit text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {articleCount} article{articleCount !== 1 ? 's' : ''}
          </span>
        )}
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
