import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { ChevronRightIcon, RocketIcon } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import { isPaymentEnabled } from '../utils/is-payment-enabled'

export function BillingDashboardSidebarUpgradeCard() {
  const auth = useAuth()

  // Hide the upgrade card if payment is disabled
  if (!isPaymentEnabled()) {
    return null
  }

  const billing = auth.session.organization?.billing
  const subscription = billing?.subscription
  const isOnTrial = subscription?.status === 'trialing'

  if (!billing) return null

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <Link
          href="/app/settings/organization/billing"
          className="text-xs text-muted-foreground flex items-center"
        >
          Usage
          <ChevronRightIcon className="size-3" />
        </Link>
        {isOnTrial && subscription?.trialDays && (
          <span className="text-xs text-muted-foreground">
            Trial ends in <strong>{subscription.trialDays} days</strong>
          </span>
        )}
      </header>
      <main className="space-y-4">
        {auth.session.organization?.billing.subscription?.usage.map((item) => (
          <div key={item.slug} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>{item.name}</span>
              <span className="text-muted-foreground">
                {item.usage} / {item.limit} used
              </span>
            </div>
            <Progress value={(item.usage / item.limit) * 100} className="h-1" />
          </div>
        ))}

        <BillingUpgradeModal>
          <Button variant="outline" className="w-full justify-between">
            Upgrade plan
            <RocketIcon className="size-3" />
          </Button>
        </BillingUpgradeModal>
      </main>
    </section>
  )
}
