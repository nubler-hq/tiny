import { Link } from 'next-view-transitions'
import { ArrowUpRightIcon } from 'lucide-react'
import { ContentTypeHelpCenterEntry, type Article } from '@/app/(site)/(content)/help/source'
import { DateUtils } from '@/@saas-boilerplate/utils/date'

/**
 * Props for the SiteHelpCenterArticleItem component
 */
export interface SiteHelpCenterArticleItemProps {
  /** Article data to display */
  article: Article
  /** Optional CSS class name */
  className?: string
  /** Show category information */
  showCategory?: boolean
  /** Show date information */
  showDate?: boolean
}

export function SiteHelpCenterArticleItem({
  article,
  className = '',
  showCategory = false,
  showDate = false,
}: SiteHelpCenterArticleItemProps) {
  return (
    <Link
      href={article.url}
      className={`group flex w-full items-center justify-between p-6 border hover:bg-secondary rounded-md transition-colors ${className}`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
          {article.name}
        </h3>

        {article.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {article.description}
          </p>
        )}
      </div>

      <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100 shrink-0 ml-2" />
    </Link>
  )
}
