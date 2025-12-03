'use client'

import { X, Clock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import { useTrialNotifications } from '../hooks/use-trial-notifications'

interface TrialExpirationBannerProps {
  organizationId: string
  trialDays: number
}

export function TrialExpirationBanner({
  organizationId,
  trialDays,
}: TrialExpirationBannerProps) {
  const { shouldShow, dismiss, urgency, message } = useTrialNotifications({
    organizationId,
    trialDays,
  })

  // Don't render if shouldn't show
  if (!shouldShow) {
    return null
  }

  const getVariant = () => {
    if (urgency === 'critical') return 'destructive'
    if (urgency === 'high') return 'default'
    return 'default'
  }

  return (
    <Alert variant={getVariant()} className="mb-4 relative">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-2">
          <span>{message}</span>
        </div>
        <div className="flex items-center gap-2">
          <BillingUpgradeModal>
            <Button
              size="sm"
              variant={urgency === 'critical' ? 'default' : 'outline'}
              className="flex items-center gap-1"
            >
              <CreditCard className="h-3 w-3" />
              Upgrade Now
            </Button>
          </BillingUpgradeModal>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={dismiss}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  )
}
