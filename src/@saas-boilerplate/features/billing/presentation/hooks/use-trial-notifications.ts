'use client'

import { useState, useEffect } from 'react'

interface UseTrialNotificationsProps {
  organizationId: string
  trialDays: number
}

interface TrialNotificationState {
  isDismissed: boolean
  lastDismissedAt: string | null
  shouldShow: boolean
}

/**
 * Custom hook to manage trial expiration notifications
 * Handles dismissal state persistence and notification logic
 */
export function useTrialNotifications({
  organizationId,
  trialDays,
}: UseTrialNotificationsProps) {
  const [state, setState] = useState<TrialNotificationState>({
    isDismissed: false,
    lastDismissedAt: null,
    shouldShow: false,
  })

  const storageKey = `trial-notification-${organizationId}`

  useEffect(() => {
    // Load dismissal state from localStorage
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const lastDismissedAt = parsed.lastDismissedAt
        const isDismissed = parsed.isDismissed

        // Reset dismissal if it was dismissed more than 24 hours ago
        // This ensures users see the notification again as trial gets closer
        const shouldResetDismissal =
          lastDismissedAt &&
          Date.now() - new Date(lastDismissedAt).getTime() > 24 * 60 * 60 * 1000

        setState({
          isDismissed: shouldResetDismissal ? false : isDismissed,
          lastDismissedAt: shouldResetDismissal ? null : lastDismissedAt,
          shouldShow: shouldShowNotification(
            trialDays,
            shouldResetDismissal ? false : isDismissed,
          ),
        })
      } catch (error) {
        console.warn('Failed to parse trial notification state:', error)
      }
    } else {
      setState({
        isDismissed: false,
        lastDismissedAt: null,
        shouldShow: shouldShowNotification(trialDays, false),
      })
    }
  }, [organizationId, trialDays, storageKey])

  const dismiss = () => {
    const newState = {
      isDismissed: true,
      lastDismissedAt: new Date().toISOString(),
      shouldShow: false,
    }

    setState(newState)
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }

  const shouldShowNotification = (
    days: number,
    dismissed: boolean,
  ): boolean => {
    // Don't show if dismissed
    if (dismissed) return false

    // Show for last 7 days of trial
    if (days <= 7 && days >= 0) return true

    return false
  }

  const getNotificationUrgency = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (trialDays <= 0) return 'critical'
    if (trialDays <= 1) return 'critical'
    if (trialDays <= 3) return 'high'
    if (trialDays <= 7) return 'medium'
    return 'low'
  }

  const getNotificationMessage = (): string => {
    if (trialDays <= 0) {
      return 'Your trial has expired. Upgrade now to continue using all features.'
    }
    if (trialDays === 1) {
      return 'Your trial expires tomorrow. Upgrade now to avoid interruption.'
    }
    if (trialDays <= 3) {
      return `Your trial expires in ${trialDays} days. Upgrade to continue using all features.`
    }
    return `Your trial expires in ${trialDays} days. Consider upgrading to unlock all features.`
  }

  return {
    shouldShow: state.shouldShow,
    dismiss,
    urgency: getNotificationUrgency(),
    message: getNotificationMessage(),
    trialDays,
  }
}
