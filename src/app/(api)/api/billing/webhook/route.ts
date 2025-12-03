import { isPaymentEnabled } from '@/@saas-boilerplate/features/billing/presentation/utils/is-payment-enabled'
import { payment } from '@/services/payment'

/**
 * @description
 * Handles payment webhooks and syncs the database
 */
export const POST = async (request: Request) => {
  // If payment provider is not enabled, return 404
  if (!isPaymentEnabled() || !payment) {
    return new Response(JSON.stringify({ error: 'Payment provider not enabled' }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const event = await payment.handle(request)
  return new Response(JSON.stringify(event), { status: 200 })
}
