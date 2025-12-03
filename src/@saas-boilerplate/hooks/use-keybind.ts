import { useEffect } from 'react'

type Keybind = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

function parseKeybind(keybind: string): Keybind {
  const parts = keybind.toLowerCase().split('+')
  const key = parts.pop() || ''

  return {
    key,
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd'),
  }
}

export function useKeybind(
  keybind: string,
  callback: (event: KeyboardEvent) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    const target = parseKeybind(keybind)

    function handleKeyDown(event: KeyboardEvent) {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = event

      if (
        key.toLowerCase() === target.key &&
        ctrlKey === !!target.ctrl &&
        shiftKey === !!target.shift &&
        altKey === !!target.alt &&
        metaKey === !!target.meta
      ) {
        event.preventDefault()
        callback(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [keybind, callback, ...deps])
}
