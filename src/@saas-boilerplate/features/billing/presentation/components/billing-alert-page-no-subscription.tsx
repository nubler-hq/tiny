'use client'

import { BillingAlertPage } from './billing-alert-page'
import { BillingAlertPageHeaderWithOrgSelector } from './billing-alert-page-header-with-org-selector'
import { Ban } from 'lucide-react'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import { AppConfig } from '@/config/boilerplate.config.client'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingAlertPageNoSubscription() {
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
          <Ban className="w-6 h-6 text-destructive" />
        </BillingAlertPage.Icon>
        <BillingAlertPage.Title>
          Hey {user?.name?.split(' ')[0]}! Let's get {organization?.name}{' '}
          started
        </BillingAlertPage.Title>
        <BillingAlertPage.Description>
          {organization?.name} doesn't have an active subscription yet. Choose a
          plan to unlock all features.
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingUpgradeModal>
            <BillingAlertPage.PrimaryAction>
              Choose Plan
            </BillingAlertPage.PrimaryAction>
          </BillingUpgradeModal>
          <BillingAlertPage.SupportAction mail={AppConfig.links.mail} />
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
