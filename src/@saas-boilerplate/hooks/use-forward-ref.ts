import { ForwardedRef, useEffect, useRef } from 'react'

/**
 * A hook that combines a forwarded ref with a local ref
 * @param forwardedRef - The ref forwarded from a parent component
 * @returns A mutable ref object that syncs with the forwarded ref
 */
export function useForwardedRef<T>(forwardedRef: ForwardedRef<T>) {
  const innerRef = useRef<T>(null)

  useEffect(() => {
    if (!forwardedRef) {
      return
    }

    if (typeof forwardedRef === 'function') {
      forwardedRef(innerRef.current)
    } else {
      forwardedRef.current = innerRef.current
    }
  }, [forwardedRef])

  return innerRef
}
