'use client'

import { useEffect, useState } from 'react'

/**
 * Represents the properties for the useBoolean hook.
 * @property {boolean} defaultValue - The default value of the boolean state.
 * @property {number} [timeout] - Optional timeout in milliseconds to reset the value to defaultValue.
 */
type UseBooleanProps = { defaultValue: boolean; timeout?: number }

/**
 * A hook that manages a boolean state with optional timeout reset.
 *
 * @param {{ defaultValue: boolean; timeout?: number }} props - The properties for the hook.
 * @returns {{ onToggle: () => void; onChange: (newValue: boolean) => void; value: boolean }} - An object containing the state value and methods to toggle and change the value.
 */
export function useBoolean({ defaultValue, timeout }: UseBooleanProps) {
  const [value, setValue] = useState(defaultValue)

  /**
   * Toggles the boolean state.
   */
  const onToggle = () => setValue(!value)
  /**
   * Changes the boolean state to a new value.
   * @param {boolean} newValue - The new value for the state.
   */
  const onChange = (newValue: boolean) => setValue(newValue)

  useEffect(() => {
    if (timeout && value !== defaultValue) {
      const timer = setTimeout(() => {
        setValue(defaultValue)
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [defaultValue, timeout, value])

  return { onToggle, onChange, value }
}
