'use client'

import { Annotated } from '@/components/ui/annotated'
import {
  InfoIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

export function BillingSubscriptionStatus() {
  const auth = useAuth()

  const orgBilling = auth.session.organization?.billing
  if (!orgBilling?.subscription) return null

  const subscription = orgBilling.subscription
  const status = subscription.status as SubscriptionStatus
  const config = statusConfig[status]
  const IconComponent = config.icon

  // Helper functions
  const formatBillingInterval = (
    interval: string,
    intervalCount: number = 1,
  ) => {
    if (interval === 'month') {
      return intervalCount === 1 ? 'Monthly' : `Every ${intervalCount} months`
    } else if (interval === 'year') {
      return intervalCount === 1 ? 'Annually' : `Every ${intervalCount} years`
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
    return format(new Date(date), 'MMMM dd, yyyy')
  }

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), "MM/dd/yyyy 'at' HH:mm")
  }

  // Calculate next billing cycle
  const calculateNextBilling = () => {
    if (!subscription.createdAt) return null

    const createdDate = new Date(subscription.createdAt)
    const interval = subscription.plan.price.interval

    if (interval === 'month') {
      return addMonths(createdDate, 1)
    } else if (interval === 'year') {
      return addYears(createdDate, 1)
    }

    return null
  }

  const nextBillingDate = calculateNextBilling()

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <InfoIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Subscription Status</Annotated.Title>
        <Annotated.Description>
          Detailed information about your current subscription, including
          status, dates and billing cycle.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    Subscription Status
                  </CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Date Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subscription.createdAt && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Creation Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscription.createdAt)}
                      </p>
                    </div>
                  )}

                  {subscription.updatedAt && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Last Updated</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(subscription.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Billing Information */}
                {nextBillingDate && status === 'active' && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Current Plan</h4>
                        <p className="text-sm text-muted-foreground font-medium">
                          ${(subscription.plan.price.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBillingInterval(
                            subscription.plan.price.interval,
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          Next Billing Date
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {subscription.createdAt
                            ? getNextBillingDate(
                                subscription.createdAt.toString(),
                                subscription.plan.price.interval,
                              )
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trial Information */}
                {status === 'trialing' && subscription.trialDays && (
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Trial Period</h4>
                      <p className="text-sm text-muted-foreground">
                        {subscription.trialDays} days remaining
                      </p>
                      {nextBillingDate && (
                        <p className="text-xs text-muted-foreground">
                          First payment on: {formatDate(nextBillingDate)}
                        </p>
                      )}
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
            </CardContent>
          </Card>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
