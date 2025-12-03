import { api } from '@/igniter.client'
import { BillingAlertPageNoSubscription } from '@/@saas-boilerplate/features/billing/presentation/components/billing-alert-page-no-subscription'
import { BillingAlertPagePaymentOverdue } from '@/@saas-boilerplate/features/billing/presentation/components/billing-alert-page-payment-overdue'
import { BillingAlertPageSubscriptionCanceledView } from '@/@saas-boilerplate/features/billing/presentation/components/billing-alert-page-subscription-canceled'
import { BillingAlertPageTrialExpiredView } from '@/@saas-boilerplate/features/billing/presentation/components/billing-alert-page-trial-expired-view'
import { BillingAlertPageSubscriptionIncomplete } from '@/@saas-boilerplate/features/billing/presentation/components/billing-alert-page-subscription-incomplete'
import { BillingAlertPageSubscriptionIncompleteExpired } from '@/@saas-boilerplate/features/billing/presentation/components/billing-alert-page-subscription-incomplete-expired'
import { validateSubscriptionAccess } from '@/@saas-boilerplate/features/billing/presentation/utils/subscription-guard'
import { redirect } from 'next/navigation'

export default async function UpgradePage() {
  const session = await api.auth.getSession.query()

  if (!session.data) redirect('/auth')

  if (!session.data.organization) redirect('/app')

  const subscription = session.data.organization.billing?.subscription

  // Use centralized validation to determine the appropriate component
  const validationResult = validateSubscriptionAccess(subscription)

  // If subscription is valid, redirect to dashboard
  if (validationResult.isValid) {
    redirect('/app')
  }

  // Render appropriate alert component based on validation reason
  switch (validationResult.reason) {
    case 'trial_expired':
      return <BillingAlertPageTrialExpiredView />
    case 'payment_overdue':
      return <BillingAlertPagePaymentOverdue />
    case 'payment_incomplete':
      return <BillingAlertPageSubscriptionIncomplete />
    case 'payment_incomplete_expired':
      return <BillingAlertPageSubscriptionIncompleteExpired />
    case 'subscription_canceled':
    case 'no_subscription':
    default:
      return <BillingAlertPageNoSubscription />
  }
}
