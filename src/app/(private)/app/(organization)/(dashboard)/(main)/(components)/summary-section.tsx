'use client'

import {
  TabbedChart,
  TabbedChartHeader,
  TabbedChartHeaderTab,
  TabbedChartHeaderTabLabel,
  TabbedChartHeaderTabValue,
  TabbedChartContent,
  TabbedChartContentTab,
} from '@/components/ui/tabbed-chart'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  StatCard,
  StatCardHeader,
  StatCardTitle,
  StatCardMain,
  StatCardValue,
} from '@/components/ui/stat-card'
import { useMediaQuery } from '@/@saas-boilerplate/hooks/use-media-query'
import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
// Icons for Leads and Submissions

// Updated Props Interface - Removed totalMembers
interface SummarySectionProps {
  // totalMembers: number; // Removed
  totalLeads: number
  totalSubmissions: number
  chartData: {
    leads: Array<{
      date: string
      totalLeads: number
    }>
    submissions: Array<{
      date: string
      generatedSubmissions: number
    }>
  }
  comparison?: {
    leads?: number | null
    submissions?: number | null
  }
}

// Mock Data - Aligned with simplified props
const mockChartData = {
  leads: [
    { date: '01/01', totalLeads: 15 },
    { date: '02/01', totalLeads: 20 },
    { date: '03/01', totalLeads: 18 },
    { date: '04/01', totalLeads: 22 },
    { date: '05/01', totalLeads: 25 },
  ],
  submissions: [
    { date: '01/01', generatedSubmissions: 1 },
    { date: '02/01', generatedSubmissions: 5 },
    { date: '03/01', generatedSubmissions: 2 },
    { date: '04/01', generatedSubmissions: 8 },
    { date: '05/01', generatedSubmissions: 1 },
  ],
}

// Chart Configs remain simplified
const leadsChartConfig = {
  totalLeads: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

const submissionsChartConfig = {
  generatedSubmissions: {
    label: 'Submissions',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function SummarySection({
  // Removed totalMembers from props destructuring and defaults
  totalLeads = 100,
  totalSubmissions = 17,
  chartData = mockChartData,
  comparison,
}: SummarySectionProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const hasLeadsData =
    chartData && chartData.leads && chartData.leads.length > 0
  const hasSubmissionsData =
    chartData && chartData.submissions && chartData.submissions.length > 0

  return (
    <section className="space-y-4">
      <main>
        {isMobile ? (
          // Adjusted grid to 2 columns for mobile
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Removed Members Card */}
            {/* Leads Card (Mobile) */}
            <StatCard>
              <StatCardHeader>
                <StatCardTitle>Leads</StatCardTitle>
              </StatCardHeader>
              <StatCardMain>
                <div className="flex flex-col items-start">
                  <StatCardValue>{totalLeads}</StatCardValue>
                  {comparison?.leads != null ? (
                    <span
                      className={`text-sm h-4 ${
                        comparison.leads >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {comparison.leads >= 0 ? '+' : ''}
                      {comparison.leads.toFixed(1)}% vs período anterior
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground h-4"></span>
                  )}
                </div>
              </StatCardMain>
            </StatCard>
            {/* Submissions Card (Mobile) */}
            <StatCard>
              <StatCardHeader>
                <StatCardTitle>Submissions</StatCardTitle>
              </StatCardHeader>
              <StatCardMain>
                <div className="flex flex-col items-start">
                  <StatCardValue>{totalSubmissions}</StatCardValue>
                  {comparison?.submissions != null ? (
                    <span
                      className={`text-sm h-4 ${
                        comparison.submissions >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {comparison.submissions >= 0 ? '+' : ''}
                      {comparison.submissions.toFixed(1)}% vs período anterior
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground h-4"></span>
                  )}
                </div>
              </StatCardMain>
            </StatCard>
          </div>
        ) : (
          // Desktop View with Tabs
          <TabbedChart defaultTab="leads">
            <TabbedChartHeader>
              {/* Removed Members Tab */}
              {/* Leads Tab (Desktop) */}
              <TabbedChartHeaderTab tab="leads">
                <TabbedChartHeaderTabLabel>Leads</TabbedChartHeaderTabLabel>
                <TabbedChartHeaderTabValue>
                  {totalLeads}
                  {comparison?.leads != null && (
                    <span
                      className={
                        comparison.leads >= 0
                          ? 'text-green-500 text-xs ml-2'
                          : 'text-red-500 text-xs ml-2'
                      }
                    >
                      ({comparison.leads >= 0 ? '+' : ''}
                      {comparison.leads.toFixed(1)}%)
                    </span>
                  )}
                </TabbedChartHeaderTabValue>
              </TabbedChartHeaderTab>
              {/* Submissions Tab (Desktop) */}
              <TabbedChartHeaderTab tab="submissions">
                <TabbedChartHeaderTabLabel>
                  Submissions
                </TabbedChartHeaderTabLabel>
                <TabbedChartHeaderTabValue>
                  {totalSubmissions}
                  {comparison?.submissions != null && (
                    <span
                      className={
                        comparison.submissions >= 0
                          ? 'text-green-500 text-xs ml-2'
                          : 'text-red-500 text-xs ml-2'
                      }
                    >
                      ({comparison.submissions >= 0 ? '+' : ''}
                      {comparison.submissions.toFixed(1)}%)
                    </span>
                  )}
                </TabbedChartHeaderTabValue>
              </TabbedChartHeaderTab>
            </TabbedChartHeader>
            <TabbedChartContent>
              {/* Removed Members Content Tab */}
              {/* Leads Content (Desktop) */}
              <TabbedChartContentTab tab="leads">
                {!hasLeadsData ? (
                  <AnimatedEmptyState className="mx-6 bg-background h-[350px]">
                    <AnimatedEmptyState.Title>
                      Nenhum lead encontrado
                    </AnimatedEmptyState.Title>
                    <AnimatedEmptyState.Description>
                      Ainda não foram gerados leads neste período.
                    </AnimatedEmptyState.Description>
                  </AnimatedEmptyState>
                ) : (
                  <ChartContainer
                    config={leadsChartConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart accessibilityLayer data={chartData.leads}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        stroke="#888888"
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        stroke="#888888"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="totalLeads"
                        fill="var(--color-totalLeads)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </TabbedChartContentTab>
              {/* Submissions Content (Desktop) */}
              <TabbedChartContentTab tab="submissions">
                {!hasSubmissionsData ? (
                  <AnimatedEmptyState className="mx-6 bg-background h-[350px]">
                    <AnimatedEmptyState.Title>
                      Nenhuma submission encontrada
                    </AnimatedEmptyState.Title>
                    <AnimatedEmptyState.Description>
                      Ainda não foram recebidas submissions neste período.
                    </AnimatedEmptyState.Description>
                  </AnimatedEmptyState>
                ) : (
                  <ChartContainer
                    config={submissionsChartConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart accessibilityLayer data={chartData.submissions}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        stroke="#888888"
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        stroke="#888888"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="generatedSubmissions"
                        fill="var(--color-generatedSubmissions)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </TabbedChartContentTab>
            </TabbedChartContent>
          </TabbedChart>
        )}
      </main>
    </section>
  )
}
