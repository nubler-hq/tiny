'use client'

import { useEffect, useState } from 'react'

/**
 * useDebounce hook
 * This hook allows you to debounce any fast changing value. The debounced value will only
 * reflect the latest value when the useDebounce hook has not been called for the specified delay period.
 *
 * This hook is particularly useful for handling rapid changes in values, such as text input, to prevent
 * unnecessary computations or API calls. It ensures that the debounced value is updated only after a
 * specified delay period has passed without any new changes to the value.
 *
 * @param value - The value to be debounced. This can be of any type, including primitive types, objects, or arrays.
 * @param delay - The delay in milliseconds for the debounce. This specifies how long the hook should wait
 * before updating the debounced value after the last change to the value.
 * @returns An object containing the debounced value. The debounced value is the value that has been
 * delayed by the specified delay period. This value is updated only after the delay period has passed
 * without any new changes to the value.
 */
function useDebounce<T>(value: T, delay: number): { debouncedValue: T } {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // If the value is a string and it's empty after trimming, update the debounced value immediately
    if (typeof value === 'string' && value.trim().length === 0) {
      setDebouncedValue(value)
      return
    }

    // Update debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed within the delay period
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Only re-call effect if value or delay changes

  return { debouncedValue }
}

export default useDebounce
