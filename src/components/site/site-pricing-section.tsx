'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Currency } from '@/@saas-boilerplate/utils/currency'
import Link from 'next/link'

// Using a flexible interface since API returns different structure than static types
interface PlanFromAPI {
  id: string
  slug: string
  name: string
  description?: string
  metadata?: {
    features?: Array<{
      name: string
      slug: string
      description: string
      enabled: boolean
      limit?: number
      cycle?: string
      table?: string
    }>
  }
  prices: Array<{
    id: string
    amount: number
    currency: string
    interval: string
    intervalCount: number
  }>
}

type PlanInterval = 'month' | 'year'

// Local function to get price for a plan in the specified interval
const getPrice = (prices: any[], interval: PlanInterval) => {
  for (const price of prices) {
    if (price.interval === interval) {
      return price
    }
  }
  return null
}

// Sub-component for the Monthly/Annually toggle switch
const PlanToggle: React.FC<{
  period: PlanInterval
  onPeriodChange: (period: PlanInterval) => void
}> = ({ period, onPeriodChange }) => (
  <div className="my-12">
    <div
      data-period={period}
      className="bg-muted relative grid w-fit grid-cols-2 rounded-md p-1 *:block *:h-8 *:w-24 *:rounded-md *:text-sm *:hover:opacity-75"
      role="group"
      aria-label="Billing period"
    >
      <div
        aria-hidden="true"
        className="bg-card ring-foreground/5 pointer-events-none absolute inset-1 w-1/2 rounded-full border border-transparent shadow ring-1 transition-transform duration-500 ease-in-out"
        style={{
          transform: period === 'month' ? 'translateX(0%)' : 'translateX(100%)',
        }}
      />
      <button
        className={cn(
          'relative',
          period === 'month' && 'font-medium text-foreground',
        )}
        onClick={() => onPeriodChange('month')}
        aria-pressed={period === 'month'}
      >
        Monthly
      </button>
      <button
        className={cn(
          'relative',
          period === 'year' && 'font-medium text-foreground',
        )}
        onClick={() => onPeriodChange('year')}
        aria-pressed={period === 'year'}
      >
        Annually
      </button>
    </div>
    <div className="mt-3 text-left text-xs">
      <span className="text-muted-foreground font-medium">Save 15%</span> On
      Annual Billing
    </div>
  </div>
)

// Sub-component for a single plan card
const PlanCard: React.FC<{
  plan: PlanFromAPI
  period: PlanInterval
  isFeatured?: boolean
}> = ({ plan, period, isFeatured = false }) => {
  const price = getPrice(plan.prices, period)
  if (!price) return null

  const isFree = price.amount === 0

  return (
    <article
      className={cn(
        'row-span-4 grid grid-rows-subgrid gap-8 p-8 border-x border-secondary/5',
        isFeatured &&
          'ring-primary/10 rounded-md bg-background @4xl:my-2 @max-4xl:mx-1 -m-px border border-secondary/15 shadow-xl ring-1 backdrop-blur',
      )}
      aria-label={`${plan.name} plan`}
    >
      <div className="self-end">
        <h3 className="tracking-tight text-lg font-medium">{plan.name}</h3>
        <p className="text-muted-foreground mt-1 text-balance text-sm">
          {plan.description}
        </p>
      </div>
      <div>
        <span className="text-3xl font-semibold">
          {Currency.formatCurrency(price.amount, { currency: price.currency })}
        </span>
        <div className="text-muted-foreground text-sm">/{price.interval}</div>
      </div>
      <Button
        asChild
        className={cn(
          'w-full',
          isFeatured
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border text-foreground border-input bg-background hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <Link href="/auth">{isFree ? 'Start for free' : 'Get Started'}</Link>
      </Button>
      <ul role="list" className="space-y-3 text-sm">
        {plan.metadata?.features && plan.metadata.features.length > 0 ? (
          plan.metadata.features.map((feature: any, i: number) => (
            <li
              key={feature.slug || i}
              className={cn(
                'flex items-center gap-2',
                !feature.enabled && 'text-muted-foreground line-through',
              )}
            >
              <CheckIcon
                className={cn(
                  'size-3',
                  feature.enabled ? 'text-white' : 'text-muted-foreground',
                )}
                aria-hidden="true"
              />
              <span>{feature.description || feature.name}</span>
            </li>
          ))
        ) : (
          <li className="flex items-center gap-2">
            <CheckIcon className="size-3 text-white" aria-hidden="true" />
            <span>Basic features included</span>
          </li>
        )}
      </ul>
    </article>
  )
}

const enterpriseFeatures: string[] = [
  'Everything in Pro, plus:',
  'Custom Invoicing & Contracts',
  'Dedicated Account Manager',
  'Advanced Security & Compliance',
  'Custom User Roles & Permissions',
  '24/7 Priority Support',
  'Onboarding & Training',
  'Enhanced Reporting & Analytics',
  'API Access with Higher Limits',
]

// Sub-component for the Enterprise plan card
const EnterprisePlanCard: React.FC = () => (
  <div className="rounded-lg bg-card mx-auto mt-8 grid border overflow-hidden max-w-7xl grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
    <div className="space-y-6 p-6 sm:p-8">
      <div className="self-end">
        <h3 className="tracking-tight text-lg font-medium">
          Enterprise Custom
        </h3>
        <p className="text-muted-foreground mt-1 text-balance text-sm">
          For large organizations with complex workflows and advanced
          requirements.
        </p>
      </div>
      <Button
        asChild
        className="w-full sm:w-auto text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <Link href="/contact">Contact Sales</Link>
      </Button>
    </div>
    <div className="col-span-1 lg:col-span-2 p-6 sm:p-8">
      <ul
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm"
      >
        {(enterpriseFeatures as any[]).map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2 min-w-0">
            <CheckIcon
              className="text-muted-foreground size-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="break-words">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

export function SitePricingSection({ plans }: { plans: PlanFromAPI[] }) {
  const [period, setPeriod] = React.useState<PlanInterval>('month')

  const sortedPlans = React.useMemo(() => {
    const withPrices: any[] = []
    for (const p of plans as any[]) {
      const price = getPrice(p.prices, period)
      if (price) {
        withPrices.push({ plan: p, price })
      }
    }

    withPrices.sort(
      (a: any, b: any) => (a.price?.amount || 0) - (b.price?.amount || 0),
    )

    const result: any[] = []
    for (const pp of withPrices) {
      result.push(pp.plan)
    }
    return result
  }, [plans, period])

  // If no plans available, don't render the section
  if (!plans || plans.length === 0) {
    return null
  }

  return (
    <section
      className="relative py-16 border-t px-4 sm:px-0"
      aria-labelledby="pricing-heading"
    >
      <div className="container max-w-(--breakpoint-lg)">
        {/* Header - Adjusted for left alignment and font sizes */}
        <div className="mb-12">
          <h2
            id="pricing-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-balance max-w-lg"
          >
            Pricing that scales with your business
          </h2>
        </div>
        {/* PlanToggle retains its internal centering due to its component implementation */}
        <PlanToggle period={period} onPeriodChange={setPeriod} />
        <div className="@container">
          {/* Plan Cards Container - Adjusted for left alignment */}
          <div className="rounded-lg bg-secondary border overflow-hidden max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
              {(sortedPlans as any[]).map((plan: PlanFromAPI, idx: number) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  period={period}
                  isFeatured={idx === 1}
                />
              ))}
            </div>
          </div>
          {/* EnterprisePlanCard retains its internal centering due to its component implementation */}
          <EnterprisePlanCard />
        </div>
      </div>
    </section>
  )
}
