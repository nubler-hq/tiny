import { tryCatch } from '@igniter-js/core'
import { payment } from './services/payment'
import { isPaymentEnabled } from './@saas-boilerplate/features/billing/presentation/utils/is-payment-enabled'

export async function register() {
  // Only sync payment provider if it's enabled
  if (isPaymentEnabled() && payment) {
    await tryCatch(payment.sync())
  }
}
