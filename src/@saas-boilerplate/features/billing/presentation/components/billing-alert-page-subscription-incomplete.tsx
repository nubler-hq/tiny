'use client'

import { BillingAlertPage } from './billing-alert-page'
import { BillingAlertPageHeaderWithOrgSelector } from './billing-alert-page-header-with-org-selector'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { AppConfig } from '@/config/boilerplate.config.client'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingAlertPageSubscriptionIncomplete() {
  const auth = useAuth()
  const user = auth.session.user
  const organization = auth.session.organization

  const onClick = async () => {
    const toastId = toast.loading('Redirecting to complete payment...')

    try {
      const response = await api.billing.createSessionManager.mutate({
        body: { returnUrl: window.location.href },
      })

      if (response.data) {
        toast.success('Redirecting...', { id: toastId })
        window.location.href = response.data
        return
      }

      throw new Error('Error opening payment portal')
    } catch (error) {
      toast.error('Error opening payment portal. Please try again.', {
        id: toastId,
      })
    }
  }

  return (
    <BillingAlertPage>
      <BillingAlertPage.Header>
        <BillingAlertPageHeaderWithOrgSelector />
      </BillingAlertPage.Header>
      <BillingAlertPage.Content>
        <BillingAlertPage.Icon>
          <AlertCircle className="w-6 h-6 text-warning" />
        </BillingAlertPage.Icon>
        <BillingAlertPage.Title>
          Almost there, {user?.name?.split(' ')[0]}!
        </BillingAlertPage.Title>
        <BillingAlertPage.Description>
          Your payment for {organization?.name} is almost complete. Just finish
          the payment process to activate your subscription and unlock all
          features.
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingAlertPage.PrimaryAction onClick={onClick}>
            Complete Payment
          </BillingAlertPage.PrimaryAction>
          <BillingAlertPage.SupportAction mail={AppConfig.links.mail} />
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
