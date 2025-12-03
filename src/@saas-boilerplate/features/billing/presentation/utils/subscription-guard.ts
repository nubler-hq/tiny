import type { SubscriptionStatus } from '../../billing.interface'
import {
  calculateGracePeriodStatus,
  shouldAllowAccessDuringGracePeriod,
  getGracePeriodConfig,
  type GracePeriodStatus,
} from './grace-period'
import { isPaymentEnabled } from './is-payment-enabled'

/**
 * Subscription data interface for validation
 */
export interface SubscriptionData {
  status: SubscriptionStatus
  trialDays?: number | null
  pastDueDate?: Date | null
  subscriptionTier?: string
}

/**
 * Validation result interface
 */
export interface SubscriptionValidationResult {
  isValid: boolean
  requiresUpgrade: boolean
  redirectPath?: string
  reason?: string
  gracePeriodStatus?: GracePeriodStatus
}

/**
 * Centralized subscription validation logic
 * This function determines if a subscription allows access to protected routes
 */
export function validateSubscriptionAccess(
  subscription?: SubscriptionData | null,
): SubscriptionValidationResult {
  // If payment provider is disabled, allow full access without subscription
  if (!isPaymentEnabled()) {
    return {
      isValid: true,
      requiresUpgrade: false,
    }
  }

  // No subscription - requires upgrade
  if (!subscription) {
    return {
      isValid: false,
      requiresUpgrade: true,
      redirectPath: '/app/upgrade',
      reason: 'no_subscription',
    }
  }

  const { status, trialDays, pastDueDate, subscriptionTier } = subscription

  switch (status) {
    case 'active':
      // Active subscription - full access
      return {
        isValid: true,
        requiresUpgrade: false,
      }

    case 'trialing':
      // Trial subscription - check if not expired
      if (trialDays && trialDays > 0) {
        return {
          isValid: true,
          requiresUpgrade: false,
        }
      }
      // Trial expired
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'trial_expired',
      }

    case 'past_due': {
      // Check if still in grace period with enhanced logic
      const gracePeriodConfig = getGracePeriodConfig(subscriptionTier)
      const inGracePeriod = shouldAllowAccessDuringGracePeriod(
        status,
        pastDueDate || undefined,
        gracePeriodConfig,
      )

      if (inGracePeriod && pastDueDate) {
        const gracePeriodStatus = calculateGracePeriodStatus(
          pastDueDate,
          gracePeriodConfig,
        )
        return {
          isValid: true,
          requiresUpgrade: false,
          reason: 'grace_period',
          gracePeriodStatus,
        }
      }
      // Grace period expired
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'payment_overdue',
        gracePeriodStatus: pastDueDate
          ? calculateGracePeriodStatus(pastDueDate, gracePeriodConfig)
          : undefined,
      }
    }

    case 'unpaid':
      // Payment issues - requires upgrade
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'payment_overdue',
      }

    case 'incomplete':
      // Incomplete payment - requires upgrade
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'payment_incomplete',
      }

    case 'incomplete_expired':
      // Incomplete payment expired - requires upgrade
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'payment_incomplete_expired',
      }

    case 'canceled':
      // Canceled subscription - requires upgrade
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'subscription_canceled',
      }

    default:
      // Unknown status - deny access for safety
      return {
        isValid: false,
        requiresUpgrade: true,
        redirectPath: '/app/upgrade',
        reason: 'unknown_status',
      }
  }
}

/**
 * Helper function to check if subscription is in a grace period
 * @deprecated Use shouldAllowAccessDuringGracePeriod from grace-period.ts instead
 */
export function isInGracePeriod(
  subscription?: SubscriptionData | null,
): boolean {
  if (!subscription) return false

  return shouldAllowAccessDuringGracePeriod(
    subscription.status,
    subscription.pastDueDate || undefined,
    getGracePeriodConfig(subscription.subscriptionTier),
  )
}

/**
 * Helper function to get user-friendly status messages
 */
export function getSubscriptionStatusMessage(
  status: SubscriptionStatus,
): string {
  switch (status) {
    case 'active':
      return 'Your subscription is active'
    case 'trialing':
      return 'You are in a trial period'
    case 'past_due':
      return 'Your payment is overdue'
    case 'unpaid':
      return 'Your subscription has unpaid invoices'
    case 'incomplete':
      return 'Your payment is incomplete'
    case 'incomplete_expired':
      return 'Your payment has expired'
    case 'canceled':
      return 'Your subscription has been canceled'
    default:
      return 'Unknown subscription status'
  }
}
