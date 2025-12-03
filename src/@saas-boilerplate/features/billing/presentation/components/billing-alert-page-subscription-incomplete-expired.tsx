'use client'

import { BillingAlertPage } from './billing-alert-page'
import { BillingAlertPageHeaderWithOrgSelector } from './billing-alert-page-header-with-org-selector'
import { XCircle } from 'lucide-react'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import { AppConfig } from '@/config/boilerplate.config.client'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingAlertPageSubscriptionIncompleteExpired() {
  const auth = useAuth()
  const user = auth.session.user
  const organization = auth.session.organization

  return (
    <BillingAlertPage>
      <BillingAlertPage.Header>
        <BillingAlertPageHeaderWithOrgSelector />
      </BillingAlertPage.Header>
      <BillingAlertPage.Content>
        <BillingAlertPage.Icon>
          <XCircle className="w-6 h-6 text-destructive" />
        </BillingAlertPage.Icon>
        <BillingAlertPage.Title>
          {organization?.name} payment window expired
        </BillingAlertPage.Title>
        <BillingAlertPage.Description>
          Hey {user?.name?.split(' ')[0]}, the payment window for{' '}
          {organization?.name} has expired. Let's get you set up with a fresh
          subscription to keep everything running.
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingUpgradeModal>
            <BillingAlertPage.PrimaryAction>
              Start New Subscription
            </BillingAlertPage.PrimaryAction>
          </BillingUpgradeModal>
          <BillingAlertPage.SupportAction mail={AppConfig.links.mail} />
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
