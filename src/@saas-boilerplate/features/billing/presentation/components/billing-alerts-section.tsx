'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Annotated } from '@/components/ui/annotated'
import {
  XCircleIcon,
  BellIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { cn } from '@/utils/cn'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import { isPaymentEnabled } from '../utils/is-payment-enabled'

type AlertType = 'critical' | 'warning' | 'info' | 'success'

interface BillingAlert {
  id: string
  type: AlertType
  title: string
  message: string
  action?: {
    label: string
    onClick?: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary'
    component?: 'upgrade-modal' | 'button'
  }
  dismissible?: boolean
}

export function BillingAlertsSection() {
  const auth = useAuth()

  // Don't show alerts if payment is disabled
  if (!isPaymentEnabled()) {
    return null
  }

  const orgBilling = auth.session.organization?.billing
  if (!orgBilling) return null

  const subscription = orgBilling.subscription
  const usage = subscription?.usage || []

  // Gerar alertas baseados no estado atual
  const generateAlerts = (): BillingAlert[] => {
    const alerts: BillingAlert[] = []

    if (!subscription) {
      alerts.push({
        id: 'no-subscription',
        type: 'warning',
        title: 'No Active Subscription',
        message:
          "You don't have an active subscription. Consider choosing a plan to access all features.",
        action: {
          label: 'Choose Plan',
          onClick: () => console.log('Navigate to plans'),
          variant: 'default',
        },
      })
      return alerts
    }

    // Alertas de status da assinatura
    switch (subscription.status) {
      case 'past_due':
        alerts.push({
          id: 'payment-overdue',
          type: 'critical',
          title: 'Payment Overdue',
          message:
            'Your subscription payment is overdue. Update your payment method to avoid service suspension.',
          action: {
            label: 'Update Payment',
            onClick: () => console.log('Update payment method'),
            variant: 'destructive',
          },
        })
        break

      case 'canceled':
        alerts.push({
          id: 'subscription-canceled',
          type: 'critical',
          title: 'Subscription Canceled',
          message:
            'Your subscription has been canceled. You can reactivate it at any time.',
          action: {
            label: 'Reactivate Subscription',
            onClick: () => console.log('Reactivate subscription'),
            variant: 'default',
          },
        })
        break

      case 'incomplete':
        alerts.push({
          id: 'payment-incomplete',
          type: 'warning',
          title: 'Payment Incomplete',
          message:
            "There's an issue with your payment method. Please check and update your information.",
          action: {
            label: 'Check Payment',
            onClick: () => console.log('Check payment'),
            variant: 'outline',
          },
        })
        break

      case 'trialing':
        if (subscription.trialDays) {
          const trialEndDate = new Date()
          trialEndDate.setDate(trialEndDate.getDate() + subscription.trialDays)
          const daysLeft = Math.ceil(
            (trialEndDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          )

          if (daysLeft <= 3) {
            alerts.push({
              id: 'trial-ending',
              type: 'warning',
              title: 'Trial Period Ending',
              message: `Your trial period ends in ${daysLeft} day(s). Choose a plan to continue using all features.`,
              action: {
                label: 'Choose Plan',
                onClick: () => console.log('Choose plan'),
                variant: 'default',
              },
            })
          } else if (daysLeft <= 7) {
            alerts.push({
              id: 'trial-reminder',
              type: 'info',
              title: 'Trial Period Reminder',
              message: `You have ${daysLeft} days remaining in your free trial period.`,
              dismissible: true,
            })
          }
        }
        break
    }

    // Alertas de uso
    const criticalUsage = usage.filter(
      (item) => (item.usage / item.limit) * 100 >= 100,
    )
    const highUsage = usage.filter((item) => {
      const percentage = (item.usage / item.limit) * 100
      return percentage >= 90 && percentage < 100
    })

    if (criticalUsage.length > 0) {
      alerts.push({
        id: 'usage-limit-reached',
        type: 'critical',
        title: 'Usage Limit Reached',
        message: `${criticalUsage.length} resource(s) have reached the limit: ${criticalUsage.map((item) => item.name).join(', ')}. Consider upgrading your plan.`,
        action: {
          label: 'Upgrade Plan',
          variant: 'default',
          component: 'upgrade-modal',
        },
      })
    } else if (highUsage.length > 0) {
      alerts.push({
        id: 'usage-high',
        type: 'warning',
        title: 'High Usage Detected',
        message: `${highUsage.length} resource(s) are near the limit: ${highUsage.map((item) => item.name).join(', ')}.`,
        dismissible: true,
      })
    }

    // Success alert if everything is fine
    if (alerts.length === 0 && subscription.status === 'active') {
      alerts.push({
        id: 'all-good',
        type: 'success',
        title: 'Everything Working Perfectly',
        message:
          'Your subscription is active and all systems are running normally.',
        dismissible: true,
      })
    }

    return alerts
  }

  const alerts = generateAlerts()

  // Se não há alertas, não renderizar a seção
  if (alerts.length === 0) return null

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      case 'warning':
        return 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <BellIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Alerts and Notifications</Annotated.Title>
        <Annotated.Description>
          Important information about your subscription, payments and resource
          usage.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                className={cn('relative', getAlertStyles(alert.type))}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <AlertTitle className="text-sm font-semibold mb-1">
                      {alert.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>

                    {alert.action && (
                      <div className="mt-3">
                        {alert.action.component === 'upgrade-modal' ? (
                          <BillingUpgradeModal>
                            <Button
                              size="sm"
                              variant={alert.action.variant || 'default'}
                              className="text-xs"
                            >
                              {alert.action.label}
                              <ExternalLinkIcon className="ml-1 h-3 w-3" />
                            </Button>
                          </BillingUpgradeModal>
                        ) : (
                          <Button
                            size="sm"
                            variant={alert.action.variant || 'default'}
                            onClick={alert.action.onClick}
                            className="text-xs"
                          >
                            {alert.action.label}
                            <ExternalLinkIcon className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {alert.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={() => console.log('Dismiss alert', alert.id)}
                    >
                      <XCircleIcon className="h-4 w-4 opacity-50 hover:opacity-100" />
                    </Button>
                  )}
                </div>
              </Alert>
            ))}

            {/* Resumo de alertas */}
            {alerts.length > 1 && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <RefreshCwIcon className="h-3 w-3" />
                    <span>
                      Last check: {new Date().toLocaleTimeString('en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {alerts.filter((a) => a.type === 'critical').length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {alerts.filter((a) => a.type === 'critical').length}{' '}
                        critical
                      </Badge>
                    )}
                    {alerts.filter((a) => a.type === 'warning').length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-orange-100 text-orange-800"
                      >
                        {alerts.filter((a) => a.type === 'warning').length}{' '}
                        warning(s)
                      </Badge>
                    )}
                    {alerts.filter((a) => a.type === 'info').length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {alerts.filter((a) => a.type === 'info').length} info
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
