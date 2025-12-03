'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Types for the share function parameters.
 *
 * @property {string} [title] - The title of the content to be shared.
 * @property {string} [text] - The text to be shared.
 * @property {string} [url] - The URL to be shared.
 */
interface ShareParams {
  title?: string
  text?: string
  url?: string
}

/**
 * Types for the useShare hook parameters.
 *
 * @property {Function} [onShare] - Callback function to execute when the share action is initiated.
 * @property {Function} [onSuccess] - Callback function to execute when the share action is successful.
 * @property {Function} [onError] - Callback function to execute when the share action fails.
 * @property {Function} [fallback] - Function to execute as a fallback when the Web Share API is not supported.
 * @property {number} [successTimeout] - Timeout in milliseconds to reset the isShared state after a successful share.
 */
interface UseShareParams {
  onShare?: (content: ShareParams) => void
  onSuccess?: (content: ShareParams) => void
  onError?: (error: any) => void
  fallback?: () => void
  successTimeout?: number
}

/**
 * Hook to handle sharing content using the Web Share API or a fallback.
 *
 * @param {UseShareParams} params - Parameters for the useShare hook.
 * @returns {{ share: Function; isSupported: boolean; isReady: boolean; isShared: boolean }} - An object containing the share function and state variables.
 */
const useShare = ({
  onShare,
  onSuccess,
  onError,
  fallback,
  successTimeout = 3000,
}: UseShareParams) => {
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isShared, setIsShared] = useState<boolean>(false)

  // Check for Web Share API support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      setIsSupported('share' in navigator)
      setIsReady(true)
    }
  }, [])

  // Function to handle the reset of isShared state
  const resetIsShared = (timeout: number) => {
    const timer = setTimeout(() => setIsShared(false), timeout)
    return () => clearTimeout(timer)
  }

  // Function to handle sharing or fallback
  const share = useCallback(
    async (content: ShareParams) => {
      if (isSupported) {
        // Execute onShare callback if provided
        onShare?.(content)

        try {
          // Attempt to use the Web Share API
          await navigator.share(content)
          setIsShared(true)

          // Execute onSuccess callback if provided
          onSuccess?.(content)

          // Reset isShared after the user-defined or default period of time
          return resetIsShared(successTimeout)
        } catch (error) {
          // Execute onError callback if provided
          onError?.(error)
        }
      } else {
        // Execute fallback function if provided
        fallback?.()
        setIsShared(true)

        // Reset isShared after the user-defined or default period of time
        return resetIsShared(successTimeout)
      }
    },
    [fallback, isSupported, onError, onShare, onSuccess, successTimeout],
  )

  return { share, isSupported, isReady, isShared }
}

export default useShare
