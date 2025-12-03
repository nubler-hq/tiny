'use client'

import { useCallback, useState, useRef, useEffect } from 'react'

/**
 * A hook that manages the state of a value in the clipboard.
 *
 * @param {string} defaultVal - The default value to be stored in the clipboard.
 * @returns {{ isCopied: boolean; onCopy: () => void; setValue: (newValue: string) => void; value: string }} - An object containing the state of the clipboard value, a function to copy the value, a function to set a new value, and the current value.
 */
export const useClipboard = (defaultVal: string) => {
  const [value, setValue] = useState(defaultVal)
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  /**
   * Memoized setValue function to prevent unnecessary re-renders
   */
  const setValueMemoized = useCallback((newValue: string) => {
    setValue(newValue)
  }, [])

  /**
   * Copies the current value to the clipboard and sets a flag indicating the value has been copied.
   * The flag is reset after a short delay.
   */
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    setIsCopied(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }, [value])

  return {
    isCopied,
    onCopy,
    setValue: setValueMemoized,
    value,
  }
}
