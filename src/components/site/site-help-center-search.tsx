/**
 * Help Center Search Component
 *
 * Client component that provides search functionality with real-time filtering
 * of server-provided articles. Based on the original help-search component.
 */

'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon, XIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/cn'
import { useDocsSearch } from 'fumadocs-core/search/client'

export interface SiteHelpCenterSearchProps {
  placeholder?: string
  className?: string
}

export function SiteHelpCenterSearch({
  placeholder = 'Search for articles...',
  className,
}: SiteHelpCenterSearchProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { search, setSearch, query } = useDocsSearch({
    type: 'fetch',
    api: '/api/content/help/search',
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /**
   * Clears all filters and search
   */
  const clearFilters = () => {
    setSearch('')
    setIsOpen(false)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn('relative z-30 w-full', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          variant="outline"
          className="pr-20"
          leftIcon={<SearchIcon className="size-5 text-muted-foreground" />}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg overflow-hidden shadow-lg z-50 max-h-96"
        >
          {/* Filters */}
          <div className="px-6 py-4 border-b bg-secondary">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Filters
              </span>
              {!!search.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  <XIcon className="size-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <ScrollArea className="max-h-64 overflow-y-auto">
            {query.data && query.data !== 'empty' && query.data.length > 0 ? (
              <div className="px-6 py-4 flex flex-col gap-3">
                {query.data
                  .filter((article) => article.type === 'heading')
                  .map((article) => (
                    <Link
                      className="p-4 rounded-md flex border hover:bg-secondary cursor-pointer transition-colors font-medium text-sm truncate"
                      key={article.url}
                      href={article.url}
                    >
                      {article.content}
                      <ExternalLink className="size-3 ml-auto" />
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <p className="text-sm">No articles found</p>
                {!!search.trim() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
