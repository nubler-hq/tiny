/**
 * Grace period utilities for handling past_due subscriptions
 * Provides a grace period before completely blocking access
 */

export interface GracePeriodConfig {
  /** Number of days to allow access after subscription becomes past_due */
  gracePeriodDays: number
  /** Whether to show warnings during grace period */
  showWarnings: boolean
}

export interface GracePeriodStatus {
  /** Whether the subscription is currently in grace period */
  isInGracePeriod: boolean
  /** Number of days remaining in grace period (0 if expired) */
  daysRemaining: number
  /** Whether grace period has expired */
  isExpired: boolean
  /** Urgency level based on remaining days */
  urgency: 'low' | 'medium' | 'high' | 'critical'
  /** User-friendly message about grace period status */
  message: string
}

// Default grace period configuration
const DEFAULT_GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  gracePeriodDays: 7, // 7 days grace period
  showWarnings: true,
}

/**
 * Calculate grace period status for a past_due subscription
 */
export function calculateGracePeriodStatus(
  pastDueDate: Date,
  config: Partial<GracePeriodConfig> = {},
): GracePeriodStatus {
  const { gracePeriodDays } = {
    ...DEFAULT_GRACE_PERIOD_CONFIG,
    ...config,
  }

  const now = new Date()
  const gracePeriodEndDate = new Date(pastDueDate)
  gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + gracePeriodDays)

  const timeDiff = gracePeriodEndDate.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

  const isInGracePeriod = daysRemaining > 0
  const isExpired = !isInGracePeriod

  // Determine urgency based on remaining days
  let urgency: 'low' | 'medium' | 'high' | 'critical'
  if (isExpired) {
    urgency = 'critical'
  } else if (daysRemaining <= 1) {
    urgency = 'critical'
  } else if (daysRemaining <= 2) {
    urgency = 'high'
  } else if (daysRemaining <= 4) {
    urgency = 'medium'
  } else {
    urgency = 'low'
  }

  // Generate user-friendly message
  let message: string
  if (isExpired) {
    message =
      'Your payment is overdue and grace period has expired. Please update your payment method immediately to restore access.'
  } else if (daysRemaining === 1) {
    message =
      'Your payment is overdue. You have 1 day remaining before access is restricted. Please update your payment method.'
  } else {
    message = `Your payment is overdue. You have ${daysRemaining} days remaining before access is restricted. Please update your payment method.`
  }

  return {
    isInGracePeriod,
    daysRemaining,
    isExpired,
    urgency,
    message,
  }
}

/**
 * Check if a subscription should have access based on grace period
 */
export function shouldAllowAccessDuringGracePeriod(
  subscriptionStatus: string,
  pastDueDate?: Date,
  config: Partial<GracePeriodConfig> = {},
): boolean {
  // Only apply grace period to past_due subscriptions
  if (subscriptionStatus !== 'past_due' || !pastDueDate) {
    return false
  }

  const gracePeriodStatus = calculateGracePeriodStatus(pastDueDate, config)
  return gracePeriodStatus.isInGracePeriod
}

/**
 * Get grace period configuration for different subscription tiers
 */
export function getGracePeriodConfig(
  subscriptionTier?: string,
): GracePeriodConfig {
  switch (subscriptionTier?.toLowerCase()) {
    case 'enterprise':
      return {
        gracePeriodDays: 14, // Longer grace period for enterprise
        showWarnings: true,
      }
    case 'pro':
    case 'premium':
      return {
        gracePeriodDays: 10, // Extended grace period for paid tiers
        showWarnings: true,
      }
    case 'basic':
    case 'starter':
    default:
      return DEFAULT_GRACE_PERIOD_CONFIG
  }
}

/**
 * Format grace period end date for display
 */
export function formatGracePeriodEndDate(
  pastDueDate: Date,
  config: Partial<GracePeriodConfig> = {},
): string {
  const { gracePeriodDays } = {
    ...DEFAULT_GRACE_PERIOD_CONFIG,
    ...config,
  }

  const endDate = new Date(pastDueDate)
  endDate.setDate(endDate.getDate() + gracePeriodDays)

  return endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
