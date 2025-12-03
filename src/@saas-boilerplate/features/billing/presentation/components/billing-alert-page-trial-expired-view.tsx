'use client'

import { BillingAlertPage } from './billing-alert-page'
import { BillingAlertPageHeaderWithOrgSelector } from './billing-alert-page-header-with-org-selector'
import { Clock } from 'lucide-react'
import { AppConfig } from '@/config/boilerplate.config.client'
import { BillingUpgradeModal } from './billing-upgrade-modal'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingAlertPageTrialExpiredView() {
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
          <Clock className="w-6 h-6 text-warning" />
        </BillingAlertPage.Icon>
        <BillingAlertPage.Title>
          Welcome back, {user?.name?.split(' ')[0]}!
        </BillingAlertPage.Title>
        <BillingAlertPage.Description>
          Your trial period for {organization?.name} has ended. Ready to choose
          a plan and continue building amazing things?
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingUpgradeModal>
            <BillingAlertPage.PrimaryAction>
              Choose Your Plan
            </BillingAlertPage.PrimaryAction>
          </BillingUpgradeModal>
          <BillingAlertPage.SupportAction mail={AppConfig.links.mail} />
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
