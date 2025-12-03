'use client'

import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
} from 'react'
import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TabbedChartProps<t = any> = {
  children: React.ReactNode
  className?: string
} & t

// Criação do contexto de Tabs
const TabContext = createContext<{
  activeTab: string
  setActiveTab: (tab: string) => void
}>({
  activeTab: '',
  setActiveTab: () => {},
})

// Hook personalizado para usar o contexto de Tabs
function useTabs() {
  return useContext(TabContext)
}

// Provedor do contexto
export const TabProvider = ({
  children,
  defaultTab = '',
}: {
  children: React.ReactNode
  defaultTab?: string
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function TabbedChart({
  children,
  className,
  defaultTab,
}: TabbedChartProps & { defaultTab?: string }) {
  const findFirstTab = () => {
    return Children.toArray(children).find(
      (child): child is React.ReactElement<{ tab: string }> =>
        // @ts-expect-error - Error
        isValidElement(child) && 'tab' in child.props,
    )?.props.tab
  }

  const initialTab = defaultTab || findFirstTab()

  return (
    <Card className={cn('overflow-hidden', className)}>
      <TabProvider defaultTab={initialTab}>{children}</TabProvider>
    </Card>
  )
}

export function TabbedChartHeader({ children, className }: TabbedChartProps) {
  return (
    <CardHeader
      className={cn(
        'flex flex-row items-center justify-start p-0 border-b border-border space-y-0 bg-transparent dark:bg-muted/10',
        className,
      )}
    >
      {children}
    </CardHeader>
  )
}

export function TabbedChartHeaderTab({
  children,
  className,
  tab,
}: TabbedChartProps<{
  tab: string
}>) {
  const { setActiveTab, activeTab } = useTabs()

  return (
    <button
      className={cn([
        'w-52 flex flex-col items-start justify-start border-r border-border p-6 hover:bg-secondary/30 dark:hover:bg-secondary/30 space-y-1',
        activeTab === tab && 'hover:bg-card dark:hover:bg-card/80',
        className,
      ])}
      onClick={() => setActiveTab(tab)}
    >
      {children}

      <div
        className={cn(
          'w-full h-2 rounded-full mt-8!',
          activeTab === tab && 'bg-background border border-border shadow-sm',
        )}
      ></div>
    </button>
  )
}

export function TabbedChartHeaderTabLabel({
  children,
  className,
}: TabbedChartProps) {
  return (
    <header
      className={cn('text-xs text-muted-foreground uppercase', className)}
    >
      {children}
    </header>
  )
}

export function TabbedChartHeaderTabValue({
  children,
  className,
}: TabbedChartProps) {
  return (
    <main className={cn('text-md font-bold mb-6', className)}>{children}</main>
  )
}

export function TabbedChartContent({ children, className }: TabbedChartProps) {
  return (
    <CardContent className={cn('bg-transparent p-6', className)}>
      {children}
    </CardContent>
  )
}
export function TabbedChartContentTab({
  children,
  className,
  tab,
}: TabbedChartProps<{
  tab: string
}>) {
  const { activeTab } = useTabs()

  // Renderiza apenas se a aba estiver ativa
  if (tab !== activeTab) return null

  return (
    <div
      className={cn(
        'animate-fade-up animate-delay-300 animate-once animate-ease-in-out -ml-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
