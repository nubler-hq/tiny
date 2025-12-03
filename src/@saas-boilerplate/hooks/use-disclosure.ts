'use client'

import React from 'react'

/**
 * Represents the properties passed to a component that uses the useDisclosure hook.
 * @property {boolean} isOpen - Indicates if the component is currently open.
 * @property {() => void} onClose - Function to close the component.
 * @property {() => void} onOpen - Function to open the component.
 * @property {(state?: boolean) => void} onToggle - Function to toggle the component's open state.
 * @template T - The type of additional properties that can be passed to the component.
 */
export type ComponentWithDisclosureProps<T = unknown> = {
  isOpen?: boolean
  onClose?: () => void
  onOpen?: () => void
  onToggle?: (state?: boolean) => void
} & T

/**
 * A hook that manages the state of a disclosure component, such as a dropdown or modal.
 *
 * @returns {{ isOpen: boolean; onOpen: () => void; onClose: () => void; onToggle: (state?: boolean) => void }} - An object containing the state and methods to control the disclosure component.
 */
export const useDisclosure = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  /**
   * Opens the disclosure component.
   */
  const onOpen = () => setIsOpen(true)
  /**
   * Closes the disclosure component.
   */
  const onClose = () => setIsOpen(false)
  /**
   * Toggles the disclosure component's open state.
   * @param {boolean} [state] - Optional state to set the component to. If not provided, the state is toggled.
   */
  const onToggle = (state?: boolean) => setIsOpen((prev) => state ?? !prev)

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  }
}
