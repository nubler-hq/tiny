import React from 'react'

// Custom hook to manage URL query state
export const useQueryState = <T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] => {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue

    const params = new URLSearchParams(window.location.search)
    const queryValue = params.get(key)

    if (!queryValue) return defaultValue

    try {
      return JSON.parse(queryValue) as T
    } catch {
      return defaultValue
    }
  })

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (state === defaultValue) {
      params.delete(key)
    } else {
      params.set(key, JSON.stringify(state))
    }

    const newSearch = params.toString()
    const newUrl = newSearch
      ? `${window.location.pathname}?${newSearch}`
      : window.location.pathname

    window.history.replaceState({}, '', newUrl)
  }, [state, key, defaultValue])

  return [state, setState]
}
