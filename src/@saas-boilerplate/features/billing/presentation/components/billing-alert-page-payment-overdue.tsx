import { BillingAlertPage } from './billing-alert-page'
import { BillingAlertPageHeaderWithOrgSelector } from './billing-alert-page-header-with-org-selector'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/igniter.client'
import { AppConfig } from '@/config/boilerplate.config.client'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingAlertPagePaymentOverdue() {
  const auth = useAuth()
  const user = auth.session.user
  const organization = auth.session.organization

  const onClick = async () => {
    const toastId = toast.loading('Redirecting to payment portal...')

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
          <Clock className="w-6 h-6 text-warning" />
        </BillingAlertPage.Icon>
        <BillingAlertPage.Title>
          {user?.name?.split(' ')[0]}, {organization?.name} needs your attention
        </BillingAlertPage.Title>
        <BillingAlertPage.Description>
          Your payment for {organization?.name} is overdue. Please update your
          payment method to keep everything running smoothly.
        </BillingAlertPage.Description>
        <BillingAlertPage.Actions>
          <BillingAlertPage.PrimaryAction onClick={onClick}>
            Update Payment
          </BillingAlertPage.PrimaryAction>
          <BillingAlertPage.SupportAction mail={AppConfig.links.mail} />
        </BillingAlertPage.Actions>
      </BillingAlertPage.Content>
      <BillingAlertPage.Footer />
    </BillingAlertPage>
  )
}
