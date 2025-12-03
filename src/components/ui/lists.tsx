'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Search } from 'lucide-react'
import { Input } from './input'

// Animations
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
}

// Types
interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string
  onSearch?: (term: string) => void
  searchFields?: string[]
  data?: any[]
}

interface ListContextValue {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredData: any[]
}

// Context
const ListContext = React.createContext<ListContextValue | null>(null)

function useList() {
  const context = React.useContext(ListContext)
  if (!context) {
    throw new Error('useList must be used within a List component')
  }
  return context
}

// Components
const Root = React.forwardRef<HTMLDivElement, ListProps>(
  (
    {
      className,
      children,
      onSearch,
      searchFields = ['email', 'name'],
      data = [],
      ...props
    },
    ref,
  ) => {
    const [searchTerm, setSearchTerm] = React.useState('')

    const filteredData = React.useMemo(() => {
      if (!searchTerm) return data

      return data.filter((item) =>
        searchFields.some((field) =>
          item[field]?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    }, [data, searchTerm, searchFields])

    React.useEffect(() => {
      onSearch?.(searchTerm)
    }, [searchTerm, onSearch])

    return (
      <ListContext.Provider value={{ searchTerm, setSearchTerm, filteredData }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </ListContext.Provider>
    )
  },
)
Root.displayName = 'ListRoot'

const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - Error expected should fix
  <motion.div
    ref={ref}
    variants={itemVariants}
    className={cn('flex items-center justify-between space-x-4', className)}
    {...props}
  >
    {children}
  </motion.div>
))
Header.displayName = 'ListHeader'

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - Error expected
  <motion.h3
    ref={ref}
    variants={itemVariants}
    className={cn('text-lg font-semibold', className)}
    {...props}
  >
    {children}
  </motion.h3>
))
Title.displayName = 'ListTitle'

const Action = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - Error expected
  <motion.div
    ref={ref}
    variants={itemVariants}
    className={cn('flex items-center space-x-2', className)}
    {...props}
  >
    {children}
  </motion.div>
))
Action.displayName = 'ListAction'

const SearchBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { placeholder?: string }
>(({ className, placeholder = 'Search...', ...props }, ref) => {
  const { setSearchTerm } = useList()

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-6!"
        placeholder={placeholder}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
})
SearchBar.displayName = 'ListSearchBar'

// @ts-expect-error - Error expected
interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: (props: { data: any[] }) => React.ReactNode
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, children, ...props }, ref) => {
    const { filteredData } = useList()

    return (
      // @ts-expect-error - Error expected
      <motion.div
        ref={ref}
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className={cn('space-y-2', className)}
        {...props}
      >
        <AnimatePresence mode="wait">
          {children({ data: filteredData })}
        </AnimatePresence>
      </motion.div>
    )
  },
)
Content.displayName = 'ListContent'

const Item = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - Error expected
  <motion.div
    ref={ref}
    variants={itemVariants}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className,
    )}
    {...props}
  >
    {children}
  </motion.div>
))
Item.displayName = 'ListItem'

const Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - Error expected
  <motion.div
    ref={ref}
    variants={itemVariants}
    className={cn('mt-4 flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </motion.div>
))
Footer.displayName = 'ListFooter'

// Exports
const Lists = {
  Root,
  Header,
  Title,
  Action,
  SearchBar,
  Content,
  Item,
  Footer,
}

export { Lists, useList }
