'use client'

import { Annotated } from '@/components/ui/annotated'
import {
  Calendar1Icon,
  ArrowUpRightIcon,
  CrownIcon,
  HelpCircleIcon,
  RefreshCcwIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from 'lucide-react'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { format, addMonths, addYears } from 'date-fns'

type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'

interface StatusConfig {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const statusConfig: Record<SubscriptionStatus, StatusConfig> = {
  active: {
    label: 'Active',
    variant: 'default',
    icon: CheckCircleIcon,
    description: 'Your subscription is active and up to date',
  },
  trialing: {
    label: 'Trial Period',
    variant: 'secondary',
    icon: ClockIcon,
    description: 'You are in the free trial period',
  },
  past_due: {
    label: 'Payment Pending',
    variant: 'destructive',
    icon: AlertTriangleIcon,
    description: 'There is a pending payment that needs to be resolved',
  },
  unpaid: {
    label: 'Unpaid',
    variant: 'destructive',
    icon: XCircleIcon,
    description: 'Payment was not processed successfully',
  },
  canceled: {
    label: 'Canceled',
    variant: 'outline',
    icon: XCircleIcon,
    description: 'Your subscription has been canceled',
  },
  incomplete: {
    label: 'Incomplete',
    variant: 'destructive',
    icon: AlertTriangleIcon,
    description: 'Subscription requires additional action to be activated',
  },
  incomplete_expired: {
    label: 'Expired',
    variant: 'destructive',
    icon: XCircleIcon,
    description: 'Incomplete subscription expired and needs to be recreated',
  },
}

export function CurrentTierSection() {
  const auth = useAuth()

  const orgBilling = auth.session.organization?.billing
  if (!orgBilling) return null

  const subscription = orgBilling.subscription
  const currentPlan = subscription?.plan
  const currentPrice = subscription?.plan.price
  const status = subscription?.status as SubscriptionStatus
  const config = status ? statusConfig[status] : null

  // Helper functions
  const formatBillingInterval = (interval: string) => {
    if (interval === 'month') {
      return 'Monthly'
    } else if (interval === 'year') {
      return 'Annually'
    }
    return interval
  }

  const getNextBillingDate = (createdAt: string, interval: string) => {
    const createdDate = new Date(createdAt)
    let nextDate: Date

    if (interval === 'month') {
      nextDate = addMonths(createdDate, 1)
    } else if (interval === 'year') {
      nextDate = addYears(createdDate, 1)
    } else {
      return 'N/A'
    }

    return format(nextDate, 'MMMM dd, yyyy')
  }

  // Date formatting
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMMM dd, yyyy')
  }

  const formatDateTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, "MM/dd/yyyy 'at' HH:mm")
  }

  // Calculate billing cycle dates
  const calculateBillingCycleDates = (createdAt: Date) => {
    const startDate = new Date(createdAt)
    const endDate = new Date(createdAt)

    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(endDate.getDate() - 1)

    return {
      start: startDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      }),
      end: endDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      }),
      nextBilling: endDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      }),
    }
  }

  const billingDates = subscription?.createdAt
    ? calculateBillingCycleDates(new Date(subscription.createdAt))
    : null

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <CrownIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Current Plan & Status</Annotated.Title>
        <Annotated.Description>
          You are currently on the <u>{currentPlan?.name}</u> plan with{' '}
          {config?.label.toLowerCase()} status.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Plan {currentPlan?.name}
                  </CardTitle>
                  <CardDescription>
                    {currentPrice?.amount === 0
                      ? 'Free'
                      : `$${currentPrice?.amount ? (currentPrice.amount / 100).toFixed(2) : '0.00'} / ${formatBillingInterval(currentPrice?.interval || 'month')}`}
                  </CardDescription>
                </div>
                {config && (
                  <Badge variant={config.variant}>{config.label}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Subscription Details */}
                {subscription && (
                  <div className="space-y-4">
                    {/* Date Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {subscription.createdAt && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Creation Date</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(subscription.createdAt.toString())}
                          </p>
                        </div>
                      )}

                      {subscription.updatedAt && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Last Updated</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(subscription.updatedAt.toString())}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Billing Information */}
                    {status === 'active' && billingDates && (
                      <div className="pt-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Billing</p>
                          <div className="merge-form-section">
                            <div className="px-3! py-2 text-sm flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <RefreshCcwIcon className="size-3 mr-1" />
                                <span>
                                  Current cycle {billingDates.start} -{' '}
                                  {billingDates.end}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="ml-2! size-6! rounded-full"
                              >
                                <HelpCircleIcon />
                              </Button>
                            </div>
                            <div className="px-3! py-2 text-sm flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Calendar1Icon className="size-3 mr-1" />
                                <span>
                                  Next charge on{' '}
                                  {subscription.createdAt
                                    ? getNextBillingDate(
                                        subscription.createdAt.toString(),
                                        currentPrice?.interval || 'month',
                                      )
                                    : 'N/A'}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="ml-2! size-6! rounded-full"
                              >
                                <HelpCircleIcon />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Alerts for problematic statuses */}
                    {(status === 'past_due' ||
                      status === 'unpaid' ||
                      status === 'incomplete' ||
                      status === 'incomplete_expired') && (
                      <div className="border-t pt-4">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                            <AlertTriangleIcon className="w-4 h-4" />
                            Action Required
                          </div>
                          <p className="text-sm text-destructive/80 mt-1">
                            {status === 'past_due' &&
                              'Update your payment method to maintain access to features.'}
                            {status === 'unpaid' &&
                              'Resolve the payment issue to reactivate your subscription.'}
                            {(status === 'incomplete' ||
                              status === 'incomplete_expired') &&
                              'Complete the subscription process to activate all features.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <BillingUpgradeModal>
                <Button size="sm">
                  Upgrade Plan
                  <ArrowUpRightIcon />
                </Button>
              </BillingUpgradeModal>
            </CardFooter>
          </Card>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
