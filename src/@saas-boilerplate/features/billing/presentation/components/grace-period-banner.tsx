'use client'

import { AlertTriangle, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import type { GracePeriodStatus } from '../utils/grace-period'

interface GracePeriodBannerProps {
  gracePeriodStatus: GracePeriodStatus
  className?: string
}

export function GracePeriodBanner({
  gracePeriodStatus,
  className,
}: GracePeriodBannerProps) {
  const { isInGracePeriod, urgency, message } = gracePeriodStatus

  // Don't show if not in grace period
  if (!isInGracePeriod) {
    return null
  }

  const getVariant = () => {
    switch (urgency) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      default:
        return 'default'
    }
  }

  const getIcon = () => {
    switch (urgency) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getButtonVariant = () => {
    return urgency === 'critical' || urgency === 'high' ? 'default' : 'outline'
  }

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <AlertDescription className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-2">
          <span>{message}</span>
        </div>
        <div className="flex items-center gap-2">
          <BillingUpgradeModal>
            <Button
              size="sm"
              variant={getButtonVariant()}
              className="flex items-center gap-1"
            >
              <CreditCard className="h-3 w-3" />
              Update Payment
            </Button>
          </BillingUpgradeModal>
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Compact version of the grace period banner for smaller spaces
 */
export function GracePeriodBannerCompact({
  gracePeriodStatus,
  className,
}: GracePeriodBannerProps) {
  const { isInGracePeriod, daysRemaining, urgency } = gracePeriodStatus

  if (!isInGracePeriod) {
    return null
  }

  const getVariant = () => {
    return urgency === 'critical' || urgency === 'high'
      ? 'destructive'
      : 'default'
  }

  return (
    <Alert variant={getVariant()} className={`py-2 ${className}`}>
      <AlertTriangle className="h-3 w-3" />
      <AlertDescription className="flex items-center justify-between text-sm">
        <span>
          Payment overdue - {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}{' '}
          remaining
        </span>
        <BillingUpgradeModal>
          <Button size="sm" variant="outline" className="ml-2">
            Fix Now
          </Button>
        </BillingUpgradeModal>
      </AlertDescription>
    </Alert>
  )
}
