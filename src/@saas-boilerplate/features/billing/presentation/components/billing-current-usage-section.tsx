'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Annotated } from '@/components/ui/annotated'
import { RefreshCcwIcon, AlertTriangleIcon, TrendingUpIcon } from 'lucide-react'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { cn } from '@/utils/cn'

export function BillingCurrentUsageSection() {
  const auth = useAuth()

  const orgBilling = auth.session.organization?.billing
  if (!orgBilling) return null

  const currentPlan = orgBilling.subscription?.plan
  const usage = orgBilling.subscription?.usage || []

  // Calcular próxima data de reset (exemplo: próximo mês)
  const getNextResetDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
    })
  }

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <RefreshCcwIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Current Usage</Annotated.Title>
        <Annotated.Description>
          Monitor your current resource usage and plan limits for the{' '}
          <u>{currentPlan?.name}</u> plan. Resets on {getNextResetDate()}
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {usage.map((item) => {
                  const percentage = (item.usage / item.limit) * 100

                  return (
                    <div key={item.slug} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.usage.toLocaleString()} /{' '}
                            {item.limit.toLocaleString()}
                          </span>
                          <span className="text-xs font-medium">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={cn(
                            'h-2 transition-all duration-300',
                            percentage >= 100 && 'animate-pulse',
                          )}
                        />
                        {/* Indicadores visuais para 80% e 90% */}
                        <div className="absolute top-0 left-[80%] w-0.5 h-2 bg-yellow-400 opacity-60" />
                        <div className="absolute top-0 left-[90%] w-0.5 h-2 bg-orange-400 opacity-60" />
                      </div>

                      {/* Informações adicionais para uso elevado */}
                      {percentage >= 80 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {percentage >= 100 ? (
                            <>
                              <AlertTriangleIcon className="h-3 w-3 text-red-400" />
                              <span className="text-red-400">
                                Limit reached - consider upgrading
                              </span>
                            </>
                          ) : percentage >= 90 ? (
                            <>
                              <TrendingUpIcon className="h-3 w-3 text-orange-400" />
                              <span className="text-orange-600">
                                {item.limit - item.usage} units remaining until
                                limit
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingUpIcon className="h-3 w-3 text-yellow-400" />
                              <span className="text-yellow-600">
                                High usage - monitor consumption
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
