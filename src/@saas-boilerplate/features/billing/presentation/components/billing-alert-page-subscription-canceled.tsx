'use client'

import { BillingAlertPage } from './billing-alert-page'
import { BillingAlertPageHeaderWithOrgSelector } from './billing-alert-page-header-with-org-selector'
import { Ban } from 'lucide-react'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingAlertPageSubscriptionCanceledView() {
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
          {organization?.name} subscription was canceled
        </BillingAlertPage.Title>
        <BillingAlertPage.Description>
          Hi {user?.name?.split(' ')[0]}, the subscription for{' '}
          {organization?.name} has been canceled. Get in touch with us to
          reactivate or choose a new plan.
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingAlertPage.SupportAction />
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
