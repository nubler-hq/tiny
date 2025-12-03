'use client'

import * as React from 'react'
import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/utils/cn'

type ThemeToggleProps = React.HTMLAttributes<HTMLDivElement>

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn('flex items-center gap-1', className)} {...props}>
      {['light', 'dark', 'system'].map((t) => (
        <button
          key={t}
          className={cn(
            'size-6 flex items-center justify-center rounded-full transition-all hover:bg-accent/70',
            mounted && resolvedTheme === t
              ? 'bg-secondary'
              : 'hover:bg-accent/20',
          )}
          onClick={() => setTheme(t)}
          aria-label={`Set ${t} theme`}
          type="button"
        >
          {t === 'light' && <Sun className="size-3!" />}
          {t === 'dark' && <Moon className="size-3!" />}
          {t === 'system' && <Laptop className="size-3!" />}
        </button>
      ))}
    </div>
  )
}
